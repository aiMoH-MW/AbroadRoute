import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { jsonError, requireBuyer } from "@/lib/buyerAuth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reason: z.string().trim().min(3, "Please describe the problem").max(2000),
});

/** Files a dispute on a purchased lead; an admin reviews it and refunds if approved. */
export async function POST(
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

    const { data, error } = await supabaseAdmin
      .from("lead_deliveries")
      .update({
        status: "disputed",
        dispute_reason: parsed.data.reason,
        dispute_status: "under_review",
        disputed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("buyer_id", auth.buyer.id)
      .is("dispute_status", null)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return jsonError("Lead not found or already disputed", 409);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/buyer/deliveries/dispute error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Dispute failed" },
      { status: 500 },
    );
  }
}
