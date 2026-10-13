import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { jsonError, requireBuyer } from "@/lib/buyerAuth";
import { getB2BSettings } from "@/lib/buyerPortal";

export const dynamic = "force-dynamic";

// Messages raised by the purchase_lead SQL function that the buyer can act on
const BUYER_ERRORS = [
  "Insufficient wallet balance",
  "Lead already purchased",
  "Lead is no longer available",
  "Lead not found",
  "Wallet not found",
  "Lead price is not set",
];

/** Buys a lead at the current cost per lead (debits the wallet). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireBuyer(request);
    if ("response" in auth) return auth.response;
    const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return jsonError("Invalid lead", 400);

    const { costPerLeadINR, maxBuyersPerLead } = await getB2BSettings();
    if (costPerLeadINR === null) {
      return jsonError("Lead pricing is not set yet. Please contact support.", 409);
    }

    const { data, error } = await supabaseAdmin.rpc("purchase_lead", {
      p_buyer_id: auth.buyer.id,
      p_lead_id: id,
      p_price_inr: costPerLeadINR,
      p_max_buyers: maxBuyersPerLead,
    });
    if (error) {
      const known = BUYER_ERRORS.find((m) => error.message.includes(m));
      if (known) return jsonError(known, 409);
      throw error;
    }

    return NextResponse.json({ success: true, deliveryId: data });
  } catch (error: any) {
    console.error("POST /api/buyer/leads/purchase error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Purchase failed" },
      { status: 500 },
    );
  }
}
