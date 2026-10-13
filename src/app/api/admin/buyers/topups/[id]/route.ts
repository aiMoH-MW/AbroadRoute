import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().trim().max(1000).optional(),
});

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status });

/** Approves a top-up (credits the wallet) or rejects it. */
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
    const { action, note } = parsed.data;

    // Claim the pending request first so it can only be processed once
    const { data: topup, error } = await supabaseAdmin
      .from("wallet_topup_requests")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        admin_note: note || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!topup) return fail("Request not found or already reviewed", 409);

    if (action === "approve") {
      const { error: creditError } = await supabaseAdmin.rpc("credit_wallet", {
        p_buyer_id: topup.buyer_id,
        p_amount_inr: topup.amount_inr,
        p_type: "wallet_topup",
        p_description: "Wallet top-up (approved by admin)",
        p_reference: topup.payment_reference,
      });
      if (creditError) {
        // Put the request back so it can be approved again
        await supabaseAdmin
          .from("wallet_topup_requests")
          .update({ status: "pending", reviewed_at: null })
          .eq("id", id);
        throw creditError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/admin/buyers/topups error:", error);
    return fail(error.message || "Failed to review top-up", 500);
  }
}
