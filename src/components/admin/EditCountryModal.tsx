"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Country } from "@/types";
import { getAuthHeaders } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";

// Form field → database column; empty = not provided
const FIELDS: {
  key: keyof Country;
  column: string;
  label: string;
  multiline?: boolean;
  hint?: string;
}[] = [
  { key: "heroTagline", column: "hero_tagline", label: "Card tagline" },
  { key: "heroSubtitle", column: "hero_subtitle", label: "Guide hero subtitle" },
  { key: "avgTuitionINR", column: "avg_tuition_inr", label: "Average tuition (INR)" },
  { key: "avgLivingCostINR", column: "avg_living_cost_inr", label: "Average living cost (INR)" },
  { key: "postStudyWorkVisa", column: "post_study_work_visa", label: "Post-study work visa" },
  { key: "overview", column: "overview", label: "Short overview", multiline: true },
  { key: "overviewHeading", column: "overview_heading", label: "Guide overview heading" },
  {
    key: "overviewBody",
    column: "overview_body",
    label: "Guide overview",
    multiline: true,
    hint: "Separate paragraphs with a blank line.",
  },
  { key: "programsOfferedNotes", column: "programs_offered_notes", label: "Programs note", multiline: true },
  { key: "visaType", column: "visa_type", label: "Student visa type" },
  { key: "visaProcessingTime", column: "visa_processing_time", label: "Visa processing time" },
  { key: "workHoursDuringTerm", column: "work_hours_during_term", label: "Part-time work limit" },
  { key: "financialProofRequired", column: "financial_proof_required", label: "Financial proof required", multiline: true },
  { key: "prPathwaySummary", column: "pr_pathway_summary", label: "PR pathway", multiline: true },
];

export function EditCountryModal({
  country,
  onClose,
  onSaved,
}: {
  country: Country;
  onClose: () => void;
  onSaved: (country: Country) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      FIELDS.map((f) => [f.column, (country[f.key] as string | null) ?? ""]),
    ),
  );
  const [topIntakes, setTopIntakes] = useState(country.topIntakes.join(", "));
  const [safetyRating, setSafetyRating] = useState(
    country.safetyRating === null ? "" : String(country.safetyRating),
  );
  const [isAnchor, setIsAnchor] = useState(country.isAnchor);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/countries/${country.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify({
          ...values,
          top_intakes: topIntakes,
          safety_rating: safetyRating,
          is_anchor: isAnchor,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      onSaved(json.country);
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[#102C57]">
            Edit {country.name}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-[11px] text-slate-500">
          Empty fields show as &ldquo;Not provided&rdquo; on the site. Highlights,
          costs and FAQs are edited under Site Content.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.column} className={f.multiline ? "sm:col-span-2" : ""}>
              <label className={labelClass}>{f.label}</label>
              {f.multiline ? (
                <textarea
                  rows={f.column === "overview_body" ? 6 : 3}
                  value={values[f.column]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.column]: e.target.value }))
                  }
                  className={inputClass}
                />
              ) : (
                <input
                  value={values[f.column]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.column]: e.target.value }))
                  }
                  className={inputClass}
                />
              )}
              {f.hint && <p className="mt-1 text-[10px] text-slate-500">{f.hint}</p>}
            </div>
          ))}
          <div>
            <label className={labelClass}>Top intakes</label>
            <input
              value={topIntakes}
              onChange={(e) => setTopIntakes(e.target.value)}
              placeholder="Comma separated, e.g. Fall (Sep), Spring (Jan)"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Safety rating (0 - 5)</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={safetyRating}
              onChange={(e) => setSafetyRating(e.target.value)}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={isAnchor}
              onChange={(e) => setIsAnchor(e.target.checked)}
              className="h-4 w-4 accent-[#102C57]"
            />
            Anchor destination (featured in menus and the home page)
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-5 py-2 text-xs font-bold text-white hover:bg-[#0c2242] disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Country
          </button>
        </div>
      </div>
    </div>
  );
}
