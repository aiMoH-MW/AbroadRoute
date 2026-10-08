import { supabaseAdmin } from "@/lib/supabase/server";

// Lead engine totals for the admin Overview and Lead Engine tabs.
// Server-only: reads with the service-role client.

export interface LeadStats {
  totalLeads: number;
  phoneVerified: number;
  deliveries: number;
  deliveryRevenueINR: number;
  walletBalanceINR: number; // prepaid balance across buyer wallets
  walletCount: number;
}

const sum = (rows: any[] | null, column: string) =>
  (rows ?? []).reduce((total, r) => total + (Number(r[column]) || 0), 0);

export async function getLeadStats(): Promise<LeadStats> {
  const [totalRes, verifiedRes, deliveriesRes, walletsRes] = await Promise.all([
    supabaseAdmin.from("leads").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("is_phone_verified", true),
    supabaseAdmin.from("lead_deliveries").select("price_charged_inr"),
    supabaseAdmin.from("wallet_accounts").select("balance_inr"),
  ]);
  const failed = [totalRes, verifiedRes, deliveriesRes, walletsRes].find(
    (r) => r.error,
  );
  if (failed?.error) throw failed.error;

  return {
    totalLeads: totalRes.count ?? 0,
    phoneVerified: verifiedRes.count ?? 0,
    deliveries: deliveriesRes.data?.length ?? 0,
    deliveryRevenueINR: sum(deliveriesRes.data, "price_charged_inr"),
    walletBalanceINR: sum(walletsRes.data, "balance_inr"),
    walletCount: walletsRes.data?.length ?? 0,
  };
}
