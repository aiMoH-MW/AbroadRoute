import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, hasConfirmedEmail } from "@/lib/supabase/requestAuth";
import { getBuyerForUser } from "@/lib/buyerPortal";
import {
  buyerRegisterSchema,
  toBuyerCompanyRow,
  toBuyerTargetingRow,
} from "@/lib/buyerSchemas";
import { jsonError } from "@/lib/buyerAuth";

export const dynamic = "force-dynamic";

/**
 * Partner onboarding: creates the signed-in user's buyer profile and an
 * empty wallet. An initial deposit becomes a top-up request that an admin
 * approves once the payment is received.
 */
export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request);
    if (!user?.email) return jsonError("Please sign in to complete onboarding", 401);
    if (!hasConfirmedEmail(user)) {
      return jsonError("Please confirm your email address first", 403);
    }
    if (await getBuyerForUser(user)) {
      return jsonError("This account already has a partner profile", 409);
    }

    const parsed = buyerRegisterSchema.safeParse(await request.json());
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid details", 400);
    }
    const body = parsed.data;

    const { data: buyer, error } = await supabaseAdmin
      .from("buyers")
      .insert({
        ...toBuyerCompanyRow(body),
        ...toBuyerTargetingRow(body),
        email: user.email,
        user_id: user.id,
      })
      .select("*")
      .single();
    if (error) throw error;

    const { error: walletError } = await supabaseAdmin
      .from("wallet_accounts")
      .insert({ buyer_id: buyer.id, balance_inr: 0 });
    if (walletError) throw walletError;

    if (body.initialDepositINR > 0) {
      const { error: topupError } = await supabaseAdmin
        .from("wallet_topup_requests")
        .insert({
          buyer_id: buyer.id,
          amount_inr: body.initialDepositINR,
          payment_reference: body.paymentReference,
        });
      if (topupError) throw topupError;
    }

    return NextResponse.json({ success: true, buyerId: buyer.id });
  } catch (error: any) {
    console.error("POST /api/buyer/register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Onboarding failed" },
      { status: 500 },
    );
  }
}
