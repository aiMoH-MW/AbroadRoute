"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Briefcase, Check, Loader2, X } from "lucide-react";
import { getAuthHeaders } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface BuyerRow {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
  balanceINR: number;
}

interface TopupRow {
  id: string;
  companyName: string | null;
  email: string | null;
  amountINR: number;
  paymentReference: string | null;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
}

interface DisputeRow {
  id: string;
  companyName: string | null;
  leadName: string | null;
  leadPhone: string | null;
  leadEmail: string | null;
  priceINR: number;
  reason: string | null;
  status: "under_review" | "approved" | "rejected";
  disputedAt: string | null;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

/**
 * B2B buyers: wallet balances, top-up requests (approve once the payment is
 * received; there is no payment gateway) and lead disputes (approve = refund).
 */
export function AdminBuyersTab() {
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);
  const [topups, setTopups] = useState<TopupRow[]>([]);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/buyers", { headers: await getAuthHeaders() });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load");
      setBuyers(json.buyers);
      setTopups(json.topups);
      setDisputes(json.disputes);
    } catch (err: any) {
      setError(
        `${err.message || "Failed to load"}. If tables are missing, run migration 0022.`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (
    kind: "topups" | "disputes",
    id: string,
    action: "approve" | "reject",
  ) => {
    let note: string | undefined;
    if (kind === "topups") {
      const input = window.prompt(
        action === "approve"
          ? "Confirm the payment was received. Optional note for the buyer:"
          : "Reason for rejecting (shown to the buyer):",
      );
      if (input === null) return;
      note = input;
    } else if (!window.confirm(action === "approve" ? "Approve and refund this lead?" : "Reject this dispute?")) {
      return;
    }

    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/buyers/${kind}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
        body: JSON.stringify({ action, note }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setBusyId(null);
    }
  };

  const pendingTopups = topups.filter((t) => t.status === "pending");
  const openDisputes = disputes.filter((d) => d.status === "under_review");

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      {/* Pending top-ups */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-extrabold text-[#102C57]">
          Wallet Top-up Requests ({pendingTopups.length} pending)
        </h3>
        <p className="text-[11px] text-slate-500">
          Approve only after the payment has reached the company account.
        </p>
        {topups.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No requests yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {topups.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                <div>
                  <p className="font-bold text-slate-900">
                    {t.companyName ?? "—"} · {formatCurrency(t.amountINR)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ref: {t.paymentReference ?? "not given"} · {formatDate(t.createdAt)}
                    {t.adminNote && ` · Note: ${t.adminNote}`}
                  </p>
                </div>
                {t.status === "pending" ? (
                  <div className="flex gap-1.5">
                    <button
                      disabled={busyId === t.id}
                      onClick={() => review("topups", t.id, "approve")}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Credit wallet
                    </button>
                    <button
                      disabled={busyId === t.id}
                      onClick={() => review("topups", t.id, "reject")}
                      className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                ) : (
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLES[t.status]}`}>
                    {t.status}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Disputes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-extrabold text-[#102C57]">
          Lead Disputes ({openDisputes.length} under review)
        </h3>
        <p className="text-[11px] text-slate-500">
          Approving refunds the price the buyer paid for the lead to their wallet.
        </p>
        {disputes.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No disputes.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {disputes.map((d) => (
              <li key={d.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {d.companyName ?? "—"} · {d.leadName ?? "—"} ({d.leadPhone ?? "—"}) ·{" "}
                    {formatCurrency(d.priceINR)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {d.reason ?? "No reason given"} · {formatDate(d.disputedAt)}
                  </p>
                </div>
                {d.status === "under_review" ? (
                  <div className="flex gap-1.5">
                    <button
                      disabled={busyId === d.id}
                      onClick={() => review("disputes", d.id, "approve")}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Refund
                    </button>
                    <button
                      disabled={busyId === d.id}
                      onClick={() => review("disputes", d.id, "reject")}
                      className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                ) : (
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[d.status]}`}>
                    {d.status === "approved" ? "Refunded" : "Rejected"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Buyers */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#102C57]">
          <Briefcase className="h-4 w-4 text-[#EA5C2B]" /> Partner Buyers ({buyers.length})
        </h3>
        {buyers.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No buyers yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Contact</th>
                  <th className="py-2 pr-3">Joined</th>
                  <th className="py-2 text-right">Wallet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {buyers.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2.5 pr-3 font-bold text-slate-900">{b.companyName}</td>
                    <td className="py-2.5 pr-3 text-slate-600">
                      {b.contactPerson} · {b.email} · {b.phone}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-500">{formatDate(b.createdAt)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#102C57]">
                      {formatCurrency(b.balanceINR)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
