import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { jsonError, requireBuyer } from "@/lib/buyerAuth";
import { mapBuyer } from "@/lib/buyerPortal";
import {
  buyerCompanySchema,
  buyerTargetingSchema,
  toBuyerCompanyRow,
  toBuyerTargetingRow,
} from "@/lib/buyerSchemas";

export const dynamic = "force-dynamic";

/** Saves the buyer's targeting rules, and company details when sent. */
export async function PATCH(request: Request) {
  try {
    const auth = await requireBuyer(request);
    if ("response" in auth) return auth.response;
    const body = await request.json();

    const targeting = buyerTargetingSchema.safeParse(body);
    if (!targeting.success) {
      return jsonError(targeting.error.issues[0]?.message ?? "Invalid targeting", 400);
    }
    let updates: Record<string, unknown> = toBuyerTargetingRow(targeting.data);

    if (body.companyName !== undefined) {
      const company = buyerCompanySchema.safeParse(body);
      if (!company.success) {
        return jsonError(company.error.issues[0]?.message ?? "Invalid details", 400);
      }
      updates = { ...updates, ...toBuyerCompanyRow(company.data) };
    }

    const { data, error } = await supabaseAdmin
      .from("buyers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", auth.buyer.id)
      .select("*")
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, buyer: mapBuyer(data) });
  } catch (error: any) {
    console.error("PATCH /api/buyer/profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save" },
      { status: 500 },
    );
  }
}
