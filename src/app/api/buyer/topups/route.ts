import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { jsonError, requireBuyer } from "@/lib/buyerAuth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  amountINR: z.number().positive("Enter an amount").max(10000000),
  paymentReference: z
    .string()
    .trim()
    .max(128)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
});

/**
 * Requests a wallet top-up. There is no payment gateway: the buyer pays by
 * transfer and an admin credits the wallet after confirming the payment.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireBuyer(request);
    if ("response" in auth) return auth.response;

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const { error } = await supabaseAdmin.from("wallet_topup_requests").insert({
      buyer_id: auth.buyer.id,
      amount_inr: parsed.data.amountINR,
      payment_reference: parsed.data.paymentReference,
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/buyer/topups error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Request failed" },
      { status: 500 },
    );
  }
}
