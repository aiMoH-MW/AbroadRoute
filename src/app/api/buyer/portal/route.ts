import { NextResponse } from "next/server";
import { requireBuyer } from "@/lib/buyerAuth";
import { loadBuyerPortal } from "@/lib/buyerPortal";

export const dynamic = "force-dynamic";

/** Everything the buyer portal shows, for the signed-in buyer. */
export async function GET(request: Request) {
  try {
    const auth = await requireBuyer(request);
    if ("response" in auth) return auth.response;
    return NextResponse.json({
      success: true,
      data: await loadBuyerPortal(auth.buyer),
    });
  } catch (error: any) {
    console.error("GET /api/buyer/portal error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load portal" },
      { status: 500 },
    );
  }
}
