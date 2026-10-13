import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { jsonError, requireBuyer } from "@/lib/buyerAuth";

export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    // Disputes go through the dispute endpoint, not a plain status change
    status: z.enum(["unread", "contacted", "converted"]).optional(),
    note: z.string().trim().min(1).max(2000).optional(),
  })
  .refine((b) => b.status || b.note, { message: "Nothing to update" });

/** Updates the buyer's status of a purchased lead, or adds a note. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireBuyer(request);
    if ("response" in auth) return auth.response;
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return jsonError("Invalid lead", 400);

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const { data: delivery } = await supabaseAdmin
      .from("lead_deliveries")
      .select("id, status, notes")
      .eq("id", id)
      .eq("buyer_id", auth.buyer.id)
      .maybeSingle();
    if (!delivery) return jsonError("Lead not found", 404);
    if (delivery.status === "disputed" && parsed.data.status) {
      return jsonError("This lead is under dispute", 409);
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.status) updates.status = parsed.data.status;
    if (parsed.data.note) {
      updates.notes = [
        ...(Array.isArray(delivery.notes) ? delivery.notes : []),
        {
          text: parsed.data.note,
          author: auth.buyer.contact_person || auth.user.email,
          at: new Date().toISOString(),
        },
      ];
    }

    const { error } = await supabaseAdmin
      .from("lead_deliveries")
      .update(updates)
      .eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/buyer/deliveries error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Update failed" },
      { status: 500 },
    );
  }
}
