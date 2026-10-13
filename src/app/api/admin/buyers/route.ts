import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getRequestUser, isAdminUser } from "@/lib/supabase/requestAuth";

export const dynamic = "force-dynamic";

/** Buyers with wallet balances, pending top-ups and open disputes. */
export async function GET(request: Request) {
  try {
    if (!isAdminUser(await getRequestUser(request))) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    const [buyersRes, topupsRes, disputesRes] = await Promise.all([
      supabaseAdmin
        .from("buyers")
        .select("id, company_name, contact_person, email, phone, created_at, wallet_accounts(balance_inr)")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("wallet_topup_requests")
        .select("*, buyers(company_name, email)")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin
        .from("lead_deliveries")
        .select("id, price_charged_inr, dispute_reason, dispute_status, disputed_at, buyers(company_name), leads(full_name, phone, email)")
        .not("dispute_status", "is", null)
        .order("disputed_at", { ascending: false })
        .limit(200),
    ]);
    for (const res of [buyersRes, topupsRes, disputesRes]) {
      if (res.error) throw res.error;
    }

    return NextResponse.json({
      success: true,
      buyers: (buyersRes.data ?? []).map((b: any) => ({
        id: b.id,
        companyName: b.company_name,
        contactPerson: b.contact_person,
        email: b.email,
        phone: b.phone,
        createdAt: b.created_at,
        balanceINR: Number(
          (Array.isArray(b.wallet_accounts) ? b.wallet_accounts[0] : b.wallet_accounts)
            ?.balance_inr ?? 0,
        ),
      })),
      topups: (topupsRes.data ?? []).map((t: any) => ({
        id: t.id,
        companyName: t.buyers?.company_name ?? null,
        email: t.buyers?.email ?? null,
        amountINR: Number(t.amount_inr),
        paymentReference: t.payment_reference ?? null,
        status: t.status,
        adminNote: t.admin_note ?? null,
        createdAt: t.created_at,
      })),
      disputes: (disputesRes.data ?? []).map((d: any) => ({
        id: d.id,
        companyName: d.buyers?.company_name ?? null,
        leadName: d.leads?.full_name ?? null,
        leadPhone: d.leads?.phone ?? null,
        leadEmail: d.leads?.email ?? null,
        priceINR: Number(d.price_charged_inr),
        reason: d.dispute_reason ?? null,
        status: d.dispute_status,
        disputedAt: d.disputed_at,
      })),
    });
  } catch (error: any) {
    console.error("GET /api/admin/buyers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load buyers" },
      { status: 500 },
    );
  }
}
