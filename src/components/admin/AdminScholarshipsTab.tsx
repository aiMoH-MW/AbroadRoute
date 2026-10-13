"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  Country,
  Scholarship,
  ScholarshipCoverage,
  ScholarshipFundingType,
  SocialCategory,
  StudyLevel,
  University,
} from "@/types";
import { getAuthHeaders } from "@/lib/supabase/client";
import { formatDateOnly } from "@/lib/deadlines";
import {
  COVERAGES,
  FUNDING_TYPES,
  SOCIAL_CATEGORIES,
  STUDY_LEVELS,
  fundingTypeLabel,
  scholarshipDestination,
  scholarshipStatus,
} from "@/lib/scholarships";

interface AdminScholarshipsTabProps {
  countriesList: Country[];
  universitiesList: University[];
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";
const hintClass = "mt-1 text-[10px] text-slate-500";
const sectionClass =
  "sm:col-span-2 border-t border-slate-100 pt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_STYLES = {
  open: "bg-emerald-100 text-emerald-800",
  opens_soon: "bg-sky-100 text-sky-800",
  closed: "bg-slate-100 text-slate-500",
  unknown: "bg-amber-50 text-amber-800",
};

// Form fields as typed; empty string = not set
interface ScholarshipForm {
  name: string;
  provider: string;
  countryId: string;
  destinationLabel: string;
  universityId: string;
  fundingType: ScholarshipFundingType;
  coverage: ScholarshipCoverage;
  awardSummary: string;
  awardValue: string;
  awardCurrency: string;
  awardPeriod: "" | "month" | "year" | "total";
  studyLevels: StudyLevel[];
  fields: string;
  minWorkExperienceMonths: string;
  womenOnly: boolean;
  socialCategories: SocialCategory[];
  needBased: boolean;
  eligibilityNote: string;
  overview: string;
  opensOn: string;
  deadline: string;
  deadlineNote: string;
  websiteUrl: string;
  lastVerifiedOn: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm = (): ScholarshipForm => ({
  name: "",
  provider: "",
  countryId: "",
  destinationLabel: "",
  universityId: "",
  fundingType: "scholarship",
  coverage: "partial",
  awardSummary: "",
  awardValue: "",
  awardCurrency: "",
  awardPeriod: "",
  studyLevels: [],
  fields: "",
  minWorkExperienceMonths: "",
  womenOnly: false,
  socialCategories: [],
  needBased: false,
  eligibilityNote: "",
  overview: "",
  opensOn: "",
  deadline: "",
  deadlineNote: "",
  websiteUrl: "",
  lastVerifiedOn: "",
  sortOrder: "0",
  isActive: false,
});

const str = (v: number | string | null) => (v === null ? "" : String(v));

const toForm = (s: Scholarship): ScholarshipForm => ({
  name: s.name,
  provider: s.provider ?? "",
  countryId: s.countryId ?? "",
  destinationLabel: s.destinationLabel ?? "",
  universityId: s.universityId ?? "",
  fundingType: s.fundingType,
  coverage: s.coverage,
  awardSummary: s.awardSummary ?? "",
  awardValue: str(s.awardValue),
  awardCurrency: s.awardCurrency ?? "",
  awardPeriod: s.awardPeriod ?? "",
  studyLevels: s.studyLevels,
  fields: s.fields ?? "",
  minWorkExperienceMonths: str(s.minWorkExperienceMonths),
  womenOnly: s.womenOnly,
  socialCategories: s.socialCategories,
  needBased: s.needBased,
  eligibilityNote: s.eligibilityNote ?? "",
  overview: s.overview ?? "",
  opensOn: s.opensOn ?? "",
  deadline: s.deadline ?? "",
  deadlineNote: s.deadlineNote ?? "",
  websiteUrl: s.websiteUrl ?? "",
  lastVerifiedOn: s.lastVerifiedOn ?? "",
  sortOrder: String(s.sortOrder),
  isActive: s.isActive,
});

const num = (v: string) => (v.trim() === "" ? null : Number(v));

const toBody = (f: ScholarshipForm) => ({
  name: f.name,
  provider: f.provider || null,
  countryId: f.countryId || null,
  destinationLabel: f.destinationLabel || null,
  universityId: f.universityId || null,
  fundingType: f.fundingType,
  coverage: f.coverage,
  awardSummary: f.awardSummary || null,
  awardValue: num(f.awardValue),
  awardCurrency: f.awardCurrency || null,
  awardPeriod: f.awardPeriod || null,
  studyLevels: f.studyLevels,
  fields: f.fields || null,
  minWorkExperienceMonths: num(f.minWorkExperienceMonths),
  womenOnly: f.womenOnly,
  socialCategories: f.socialCategories,
  needBased: f.needBased,
  eligibilityNote: f.eligibilityNote || null,
  overview: f.overview || null,
  opensOn: f.opensOn || null,
  deadline: f.deadline || null,
  deadlineNote: f.deadlineNote || null,
  websiteUrl: f.websiteUrl || null,
  lastVerifiedOn: f.lastVerifiedOn || null,
  sortOrder: Number(f.sortOrder) || 0,
  isActive: f.isActive,
});

const sortScholarships = (list: Scholarship[]) =>
  [...list].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function AdminScholarshipsTab({
  countriesList,
  universitiesList,
}: AdminScholarshipsTabProps) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  // null = closed; editingId null with a form open = adding
  const [form, setForm] = useState<ScholarshipForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scholarships", {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setScholarships(data.scholarships);
      else setStatusMessage({ type: "error", text: data.error });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to load scholarships" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // Universities in the form's country that exist in the database
  const formUniversities = useMemo(() => {
    if (!form?.countryId) return [];
    const country = countriesList.find((c) => c.id === form.countryId);
    return universitiesList
      .filter(
        (u) =>
          UUID_RE.test(u.id) &&
          (u.countrySlug === form.countryId || u.countrySlug === country?.slug),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [form?.countryId, countriesList, universitiesList]);

  const updateForm = <K extends keyof ScholarshipForm>(
    key: K,
    value: ScholarshipForm[K],
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
          ? `/api/admin/scholarships/${editingId}`
          : "/api/admin/scholarships",
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
      const saved: Scholarship = data.scholarship;
      setScholarships((prev) =>
        sortScholarships(
          editingId
            ? prev.map((s) => (s.id === editingId ? saved : s))
            : [...prev, saved],
        ),
      );
      setStatusMessage({
        type: "success",
        text: editingId ? "Scholarship updated." : "Scholarship added.",
      });
      closeForm();
    } catch {
      setStatusMessage({ type: "error", text: "Failed to save scholarship" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: Scholarship) => {
    if (
      !window.confirm(
        `Delete the scholarship "${s.name}"? This cannot be undone.`,
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/scholarships/${s.id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setScholarships((prev) => prev.filter((x) => x.id !== s.id));
        setStatusMessage({ type: "success", text: "Scholarship deleted." });
      } else {
        setStatusMessage({ type: "error", text: data.error });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to delete scholarship" });
    }
  };

  const hiddenCount = scholarships.filter((s) => !s.isActive).length;

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
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scholarships</h3>
              <p className="text-[11px] text-slate-500">
                Shown on the public Scholarship Finder. Check each against its
                official page, record the date, then tick &ldquo;Show on the
                public finder&rdquo;.
                {hiddenCount > 0 && (
                  <strong className="text-amber-700">
                    {" "}
                    {hiddenCount} hidden (draft or unpublished).
                  </strong>
                )}
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
            Add Scholarship
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading scholarships…
          </div>
        ) : scholarships.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-xs text-slate-500">
            No scholarships added yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3.5 py-2.5 text-left font-bold">
                    Scholarship
                  </th>
                  <th className="px-3.5 py-2.5 text-left font-bold">Where</th>
                  <th className="px-3.5 py-2.5 text-left font-bold">Status</th>
                  <th className="px-3.5 py-2.5 text-left font-bold">
                    Last Checked
                  </th>
                  <th className="px-3.5 py-2.5 text-right font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholarships.map((s) => {
                  const status = scholarshipStatus(s);
                  return (
                    <tr
                      key={s.id}
                      className={s.isActive ? "" : "bg-amber-50/40"}
                    >
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-slate-900">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {fundingTypeLabel(s.fundingType)}
                          {s.provider ? ` · ${s.provider}` : ""}
                        </div>
                        {!s.isActive && (
                          <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-slate-700">
                        {scholarshipDestination(s)}
                        {s.universityName && (
                          <div className="text-[11px] text-slate-500">
                            {s.universityName}
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status.status]}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-slate-700">
                        {s.lastVerifiedOn
                          ? formatDateOnly(s.lastVerifiedOn)
                          : "—"}
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.websiteUrl && (
                            <a
                              href={s.websiteUrl}
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
                              setEditingId(s.id);
                              setForm(toForm(s));
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#102C57] cursor-pointer"
                            aria-label="Edit scholarship"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            aria-label="Delete scholarship"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                {editingId ? "Edit Scholarship" : "Add Scholarship"}
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
              {/* Basics */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  maxLength={255}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Provider</label>
                <input
                  value={form.provider}
                  onChange={(e) => updateForm("provider", e.target.value)}
                  placeholder="e.g. British Council"
                  maxLength={255}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={form.fundingType}
                  onChange={(e) =>
                    updateForm(
                      "fundingType",
                      e.target.value as ScholarshipFundingType,
                    )
                  }
                  className={inputClass}
                >
                  {FUNDING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <p className={hintClass}>
                  Loan scholarship = repayable, e.g. J.N. Tata, K.C. Mahindra.
                </p>
              </div>

              {/* Where */}
              <p className={sectionClass}>Where</p>
              <div>
                <label className={labelClass}>Country</label>
                <select
                  value={form.countryId}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            countryId: e.target.value,
                            universityId: "",
                          }
                        : prev,
                    )
                  }
                  className={inputClass}
                >
                  <option value="">Several countries</option>
                  {countriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Destination Label</label>
                <input
                  value={form.destinationLabel}
                  onChange={(e) =>
                    updateForm("destinationLabel", e.target.value)
                  }
                  placeholder="e.g. European Union, Any country"
                  maxLength={64}
                  className={inputClass}
                />
                <p className={hintClass}>
                  Needed when no single country is chosen.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>University</label>
                <select
                  value={form.universityId}
                  onChange={(e) => updateForm("universityId", e.target.value)}
                  disabled={!form.countryId}
                  className={inputClass}
                >
                  <option value="">Not specific to one university</option>
                  {formUniversities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Award */}
              <p className={sectionClass}>Award</p>
              <div>
                <label className={labelClass}>Coverage</label>
                <select
                  value={form.coverage}
                  onChange={(e) =>
                    updateForm(
                      "coverage",
                      e.target.value as ScholarshipCoverage,
                    )
                  }
                  className={inputClass}
                >
                  {COVERAGES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Award Summary</label>
                <input
                  value={form.awardSummary}
                  onChange={(e) => updateForm("awardSummary", e.target.value)}
                  placeholder="e.g. Full tuition + £1,300/month"
                  maxLength={255}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Amount</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form.awardValue}
                    onChange={(e) => updateForm("awardValue", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Currency</label>
                  <input
                    value={form.awardCurrency}
                    onChange={(e) =>
                      updateForm("awardCurrency", e.target.value.toUpperCase())
                    }
                    placeholder="EUR"
                    maxLength={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Per</label>
                  <select
                    value={form.awardPeriod}
                    onChange={(e) =>
                      updateForm(
                        "awardPeriod",
                        e.target.value as ScholarshipForm["awardPeriod"],
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">—</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                    <option value="total">Total</option>
                  </select>
                </div>
                <p className={`col-span-3 -mt-2 ${hintClass}`}>
                  Optional; used to show the award in rupees.
                </p>
              </div>

              {/* Eligibility */}
              <p className={sectionClass}>Eligibility</p>
              <div className="sm:col-span-2">
                <label className={labelClass}>Study Levels</label>
                <div className="flex flex-wrap gap-3">
                  {STUDY_LEVELS.map((l) => (
                    <label
                      key={l.value}
                      className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.studyLevels.includes(l.value)}
                        onChange={() =>
                          updateForm(
                            "studyLevels",
                            toggle(form.studyLevels, l.value),
                          )
                        }
                        className="h-3.5 w-3.5 accent-[#102C57]"
                      />
                      {l.label}
                    </label>
                  ))}
                </div>
                <p className={hintClass}>None ticked = any level.</p>
              </div>
              <div>
                <label className={labelClass}>Fields</label>
                <input
                  value={form.fields}
                  onChange={(e) => updateForm("fields", e.target.value)}
                  placeholder="e.g. STEM, Public Policy"
                  maxLength={255}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Min. Work Experience (months)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.minWorkExperienceMonths}
                  onChange={(e) =>
                    updateForm("minWorkExperienceMonths", e.target.value)
                  }
                  placeholder="e.g. 24"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Only for Categories</label>
                <div className="flex flex-wrap gap-3">
                  {SOCIAL_CATEGORIES.map((c) => (
                    <label
                      key={c.value}
                      className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.socialCategories.includes(c.value)}
                        onChange={() =>
                          updateForm(
                            "socialCategories",
                            toggle(form.socialCategories, c.value),
                          )
                        }
                        className="h-3.5 w-3.5 accent-[#102C57]"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
                <p className={hintClass}>None ticked = open to everyone.</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.womenOnly}
                  onChange={(e) => updateForm("womenOnly", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#102C57]"
                />
                Women only
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.needBased}
                  onChange={(e) => updateForm("needBased", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#102C57]"
                />
                Need-based (family income limit)
              </label>
              <div className="sm:col-span-2">
                <label className={labelClass}>Eligibility Details</label>
                <textarea
                  value={form.eligibilityNote}
                  onChange={(e) =>
                    updateForm("eligibilityNote", e.target.value)
                  }
                  placeholder="e.g. Must return to India for 2 years after the award"
                  maxLength={2000}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Overview</label>
                <textarea
                  value={form.overview}
                  onChange={(e) => updateForm("overview", e.target.value)}
                  maxLength={2000}
                  rows={2}
                  className={inputClass}
                />
              </div>

              {/* Dates & source */}
              <p className={sectionClass}>Dates & Source</p>
              <div>
                <label className={labelClass}>Applications Open</label>
                <input
                  type="date"
                  value={form.opensOn}
                  onChange={(e) => updateForm("opensOn", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => updateForm("deadline", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Deadline Note</label>
                <input
                  value={form.deadlineNote}
                  onChange={(e) => updateForm("deadlineNote", e.target.value)}
                  placeholder="e.g. Varies by programme (shown when there is no date)"
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
                Show on the public finder
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
                {editingId ? "Save Changes" : "Add Scholarship"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
