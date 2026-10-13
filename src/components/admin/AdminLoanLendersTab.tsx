"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { LenderType, LoanLender } from "@/types";
import { getAuthHeaders } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { formatDateOnly } from "@/lib/deadlines";
import {
  LENDER_TYPES,
  formatRateRange,
  lenderTypeLabel,
} from "@/lib/loanLenders";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";
const hintClass = "mt-1 text-[10px] text-slate-500";

// Form fields as typed; empty string = not set
interface LenderForm {
  name: string;
  lenderType: LenderType;
  currency: string;
  rateMin: string;
  rateMax: string;
  rateNote: string;
  maxAmountINR: string;
  maxUnsecuredINR: string;
  moratoriumNote: string;
  processingFeeNote: string;
  websiteUrl: string;
  lastVerifiedOn: string;
  notes: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm = (): LenderForm => ({
  name: "",
  lenderType: "public_bank",
  currency: "INR",
  rateMin: "",
  rateMax: "",
  rateNote: "",
  maxAmountINR: "",
  maxUnsecuredINR: "",
  moratoriumNote: "",
  processingFeeNote: "",
  websiteUrl: "",
  lastVerifiedOn: "",
  notes: "",
  sortOrder: "0",
  isActive: true,
});

const str = (v: number | string | null) => (v === null ? "" : String(v));

const toForm = (l: LoanLender): LenderForm => ({
  name: l.name,
  lenderType: l.lenderType,
  currency: l.currency,
  rateMin: str(l.rateMin),
  rateMax: str(l.rateMax),
  rateNote: l.rateNote ?? "",
  maxAmountINR: str(l.maxAmountINR),
  maxUnsecuredINR: str(l.maxUnsecuredINR),
  moratoriumNote: l.moratoriumNote ?? "",
  processingFeeNote: l.processingFeeNote ?? "",
  websiteUrl: l.websiteUrl ?? "",
  lastVerifiedOn: l.lastVerifiedOn ?? "",
  notes: l.notes ?? "",
  sortOrder: String(l.sortOrder),
  isActive: l.isActive,
});

const num = (v: string) => (v.trim() === "" ? null : Number(v));

const toBody = (f: LenderForm) => ({
  name: f.name,
  lenderType: f.lenderType,
  currency: f.currency,
  rateMin: num(f.rateMin),
  rateMax: num(f.rateMax),
  rateNote: f.rateNote || null,
  maxAmountINR: num(f.maxAmountINR),
  maxUnsecuredINR: num(f.maxUnsecuredINR),
  moratoriumNote: f.moratoriumNote || null,
  processingFeeNote: f.processingFeeNote || null,
  websiteUrl: f.websiteUrl || null,
  lastVerifiedOn: f.lastVerifiedOn || null,
  notes: f.notes || null,
  sortOrder: Number(f.sortOrder) || 0,
  isActive: f.isActive,
});

const sortLenders = (list: LoanLender[]) =>
  [...list].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );

// "₹50 Lakh" preview under an INR amount field
const amountPreview = (v: string) =>
  v.trim() !== "" && !Number.isNaN(Number(v))
    ? formatCurrency(Number(v))
    : null;

export function AdminLoanLendersTab() {
  const [lenders, setLenders] = useState<LoanLender[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  // null = closed; editingId null with a form open = adding
  const [form, setForm] = useState<LenderForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchLenders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/loan-lenders", {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setLenders(data.lenders);
      else setStatusMessage({ type: "error", text: data.error });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to load lenders" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLenders();
  }, [fetchLenders]);

  const updateForm = <K extends keyof LenderForm>(
    key: K,
    value: LenderForm[K],
  ) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const closeForm = () => {
    setForm(null);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(
        editingId
          ? `/api/admin/loan-lenders/${editingId}`
          : "/api/admin/loan-lenders",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(await getAuthHeaders()),
          },
          body: JSON.stringify(toBody(form)),
        },
      );
      const data = await res.json();
      if (!data.success) {
        setStatusMessage({ type: "error", text: data.error });
        return;
      }
      const saved: LoanLender = data.lender;
      setLenders((prev) =>
        sortLenders(
          editingId
            ? prev.map((l) => (l.id === editingId ? saved : l))
            : [...prev, saved],
        ),
      );
      setStatusMessage({
        type: "success",
        text: editingId ? "Lender updated." : "Lender added.",
      });
      closeForm();
    } catch {
      setStatusMessage({ type: "error", text: "Failed to save lender" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (l: LoanLender) => {
    if (
      !window.confirm(`Delete the lender "${l.name}"? This cannot be undone.`)
    )
      return;
    try {
      const res = await fetch(`/api/admin/loan-lenders/${l.id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setLenders((prev) => prev.filter((x) => x.id !== l.id));
        setStatusMessage({ type: "success", text: "Lender deleted." });
      } else {
        setStatusMessage({ type: "error", text: data.error });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to delete lender" });
    }
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <div className="flex items-start gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Banknote className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Education Loan Lenders
              </h3>
              <p className="text-[11px] text-slate-500">
                Shown on the public Loan Calculator. Rates change often: check
                each lender&apos;s official page and record the date you did.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm());
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#102C57] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c2244] cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Lender
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading lenders…
          </div>
        ) : lenders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-xs text-slate-500">
            No lenders added yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3.5 py-2.5 text-left font-bold">Lender</th>
                  <th className="px-3.5 py-2.5 text-left font-bold">Rate</th>
                  <th className="px-3.5 py-2.5 text-left font-bold">
                    Max / Without Collateral
                  </th>
                  <th className="px-3.5 py-2.5 text-left font-bold">
                    Last Checked
                  </th>
                  <th className="px-3.5 py-2.5 text-right font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lenders.map((l) => (
                  <tr key={l.id} className={l.isActive ? "" : "opacity-50"}>
                    <td className="px-3.5 py-3">
                      <div className="font-semibold text-slate-900">
                        {l.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lenderTypeLabel(l.lenderType)}
                        {l.currency !== "INR" ? ` · ${l.currency} loan` : ""}
                        {l.isActive ? "" : " · Hidden"}
                      </div>
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {formatRateRange(l) ?? "—"}
                      </div>
                      {l.rateNote && (
                        <div className="text-[11px] text-slate-500">
                          {l.rateNote}
                        </div>
                      )}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-slate-700">
                      {l.maxAmountINR !== null
                        ? formatCurrency(l.maxAmountINR)
                        : "—"}
                      {" / "}
                      {l.maxUnsecuredINR === null
                        ? "—"
                        : l.maxUnsecuredINR === 0
                          ? "Needs collateral"
                          : formatCurrency(l.maxUnsecuredINR)}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-slate-700">
                      {l.lastVerifiedOn
                        ? formatDateOnly(l.lastVerifiedOn)
                        : "—"}
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {l.websiteUrl && (
                          <a
                            href={l.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Open official page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setEditingId(l.id);
                            setForm(toForm(l));
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#102C57] cursor-pointer"
                          aria-label="Edit lender"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(l)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          aria-label="Delete lender"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? "Edit Lender" : "Add Lender"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. State Bank of India – Global Ed-Vantage"
                  maxLength={128}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Lender Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.lenderType}
                  onChange={(e) =>
                    updateForm("lenderType", e.target.value as LenderType)
                  }
                  className={inputClass}
                >
                  {LENDER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Loan Currency</label>
                <input
                  value={form.currency}
                  onChange={(e) =>
                    updateForm("currency", e.target.value.toUpperCase())
                  }
                  placeholder="INR"
                  maxLength={3}
                  className={inputClass}
                />
                <p className={hintClass}>
                  Currency the loan is given in, e.g. USD for Prodigy.
                </p>
              </div>
              <div>
                <label className={labelClass}>Rate From (% p.a.)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.rateMin}
                  onChange={(e) => updateForm("rateMin", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Rate Up To (% p.a.)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={form.rateMax}
                  onChange={(e) => updateForm("rateMax", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Rate Note</label>
                <input
                  value={form.rateNote}
                  onChange={(e) => updateForm("rateNote", e.target.value)}
                  placeholder="e.g. Repo-linked floating; 0.5% off for women"
                  maxLength={128}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Maximum Loan (₹)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.maxAmountINR}
                  onChange={(e) => updateForm("maxAmountINR", e.target.value)}
                  placeholder="e.g. 30000000"
                  className={inputClass}
                />
                {amountPreview(form.maxAmountINR) && (
                  <p className={hintClass}>
                    = {amountPreview(form.maxAmountINR)}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  Without Collateral Up To (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.maxUnsecuredINR}
                  onChange={(e) =>
                    updateForm("maxUnsecuredINR", e.target.value)
                  }
                  placeholder="0 = always needs collateral"
                  className={inputClass}
                />
                <p className={hintClass}>
                  {amountPreview(form.maxUnsecuredINR)
                    ? `= ${amountPreview(form.maxUnsecuredINR)}`
                    : "Empty = not stated; 0 = always needs collateral."}
                </p>
              </div>
              <div>
                <label className={labelClass}>Moratorium</label>
                <input
                  value={form.moratoriumNote}
                  onChange={(e) => updateForm("moratoriumNote", e.target.value)}
                  placeholder="e.g. Course + 6 months"
                  maxLength={128}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Processing Fee</label>
                <input
                  value={form.processingFeeNote}
                  onChange={(e) =>
                    updateForm("processingFeeNote", e.target.value)
                  }
                  placeholder="e.g. ₹10,000 + GST"
                  maxLength={128}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Official Page URL</label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => updateForm("websiteUrl", e.target.value)}
                  placeholder="https://…"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Checked On</label>
                <input
                  type="date"
                  value={form.lastVerifiedOn}
                  onChange={(e) => updateForm("lastVerifiedOn", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="e.g. Collateral-free only for listed top universities"
                  maxLength={1000}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Display Order</label>
                <input
                  type="number"
                  step={1}
                  value={form.sortOrder}
                  onChange={(e) => updateForm("sortOrder", e.target.value)}
                  className={inputClass}
                />
                <p className={hintClass}>Lower numbers show first.</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer self-center">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateForm("isActive", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#102C57]"
                />
                Show on the public calculator
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c2244] disabled:opacity-60 cursor-pointer"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editingId ? "Save Changes" : "Add Lender"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
