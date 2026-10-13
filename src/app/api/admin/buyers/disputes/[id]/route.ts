import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ action: z.enum(["approve", "reject"]) });

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status });

/** Approves a lead dispute (refunds the price paid) or rejects it. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isAdminUser(await getRequestUser(request))) {
      return fail("Admin access required", 403);
    }
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return fail("Invalid id", 400);
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return fail("Invalid request", 400);
    const approve = parsed.data.action === "approve";

    // Only disputes still under review can be decided, and only once
    const { data: delivery, error } = await supabaseAdmin
      .from("lead_deliveries")
      .update({
        dispute_status: approve ? "approved" : "rejected",
        dispute_reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("dispute_status", "under_review")
      .select("id, buyer_id, lead_id, price_charged_inr")
      .maybeSingle();
    if (error) throw error;
    if (!delivery) return fail("Dispute not found or already reviewed", 409);

    if (approve) {
      const { error: creditError } = await supabaseAdmin.rpc("credit_wallet", {
        p_buyer_id: delivery.buyer_id,
        p_amount_inr: delivery.price_charged_inr,
        p_type: "lead_refund",
        p_description: `Dispute refund for lead ${delivery.lead_id}`,
        p_reference: null,
      });
      if (creditError) {
        await supabaseAdmin
          .from("lead_deliveries")
          .update({ dispute_status: "under_review", dispute_reviewed_at: null })
          .eq("id", id);
        throw creditError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/admin/buyers/disputes error:", error);
    return fail(error.message || "Failed to review dispute", 500);
  }
}
