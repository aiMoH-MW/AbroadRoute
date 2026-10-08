"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  ApplicationDeadline,
  Country,
  DeadlineType,
  Program,
  University,
} from "@/types";
import { getAuthHeaders } from "@/lib/supabase/client";
import {
  DEADLINE_TYPES,
  daysUntil,
  deadlineTypeLabel,
  formatDateOnly,
} from "@/lib/deadlines";
import { AdminMilestonesSection } from "@/components/admin/AdminMilestonesSection";

interface AdminDeadlinesTabProps {
  countriesList: Country[];
  universitiesList: University[];
  programsList: Program[];
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Form fields as typed; empty string = not set
interface DeadlineForm {
  countryId: string;
  universityId: string;
  programId: string;
  intakeTerm: string;
  intakeYear: string;
  intakeStartDate: string;
  deadlineType: DeadlineType;
  roundName: string;
  applicationsOpenDate: string;
  deadlineDate: string;
  isRolling: boolean;
  sourceUrl: string;
  notes: string;
  isActive: boolean;
}

const emptyForm = (countryId = ""): DeadlineForm => ({
  countryId,
  universityId: "",
  programId: "",
  intakeTerm: "",
  intakeYear: String(new Date().getFullYear() + 1),
  intakeStartDate: "",
  deadlineType: "application",
  roundName: "",
  applicationsOpenDate: "",
  deadlineDate: "",
  isRolling: false,
  sourceUrl: "",
  notes: "",
  isActive: true,
});

const toForm = (d: ApplicationDeadline): DeadlineForm => ({
  countryId: d.countryId,
  universityId: d.universityId ?? "",
  programId: d.programId ?? "",
  intakeTerm: d.intakeTerm,
  intakeYear: String(d.intakeYear),
  intakeStartDate: d.intakeStartDate ?? "",
  deadlineType: d.deadlineType,
  roundName: d.roundName ?? "",
  applicationsOpenDate: d.applicationsOpenDate ?? "",
  deadlineDate: d.deadlineDate,
  isRolling: d.isRolling,
  sourceUrl: d.sourceUrl ?? "",
  notes: d.notes ?? "",
  isActive: d.isActive,
});

const toBody = (f: DeadlineForm) => ({
  countryId: f.countryId,
  universityId: f.universityId || null,
  programId: f.programId || null,
  intakeTerm: f.intakeTerm,
  intakeYear: Number(f.intakeYear),
  intakeStartDate: f.intakeStartDate || null,
  deadlineType: f.deadlineType,
  roundName: f.roundName || null,
  applicationsOpenDate: f.applicationsOpenDate || null,
  deadlineDate: f.deadlineDate,
  isRolling: f.isRolling,
  sourceUrl: f.sourceUrl || null,
  notes: f.notes || null,
  isActive: f.isActive,
});

export function AdminDeadlinesTab({
  countriesList,
  universitiesList,
  programsList,
}: AdminDeadlinesTabProps) {
  const [deadlines, setDeadlines] = useState<ApplicationDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  // null = closed; editingId null with a form open = adding
  const [form, setForm] = useState<DeadlineForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDeadlines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/application-deadlines", {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setDeadlines(data.deadlines);
      else setStatusMessage({ type: "error", text: data.error });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to load deadlines" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  const visibleDeadlines = useMemo(
    () =>
      deadlines.filter(
        (d) =>
          (!countryFilter || d.countryId === countryFilter) &&
          (showPast || daysUntil(d.deadlineDate) >= 0),
      ),
    [deadlines, countryFilter, showPast],
  );

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

  const updateForm = <K extends keyof DeadlineForm>(
    key: K,
    value: DeadlineForm[K],
  ) => setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm(countryFilter));
  };

  const openEdit = (d: ApplicationDeadline) => {
    setEditingId(d.id);
    setForm(toForm(d));
  };

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
          ? `/api/admin/application-deadlines/${editingId}`
          : "/api/admin/application-deadlines",
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
      const saved: ApplicationDeadline = data.deadline;
      setDeadlines((prev) =>
        (editingId
          ? prev.map((d) => (d.id === editingId ? saved : d))
          : [...prev, saved]
        ).sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate)),
      );
      setStatusMessage({
        type: "success",
        text: editingId ? "Deadline updated." : "Deadline added.",
      });
      closeForm();
    } catch {
      setStatusMessage({ type: "error", text: "Failed to save deadline" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d: ApplicationDeadline) => {
    const title = `${d.universityName ?? d.countryName ?? d.countryId} · ${d.intakeTerm} ${d.intakeYear}`;
    if (
      !window.confirm(`Delete the deadline "${title}"? This cannot be undone.`)
    )
      return;
    try {
      const res = await fetch(`/api/admin/application-deadlines/${d.id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setDeadlines((prev) => prev.filter((x) => x.id !== d.id));
        setStatusMessage({ type: "success", text: "Deadline deleted." });
      } else {
        setStatusMessage({ type: "error", text: data.error });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to delete deadline" });
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
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Application Deadlines
              </h3>
              <p className="text-[11px] text-slate-500">
                Shown on the public Deadline Tracker. Leave university or
                program empty for a country-wide or all-program deadline.
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#102C57] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c2244] cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Deadline
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className={`${inputClass} sm:w-60`}
            aria-label="Filter by country"
          >
            <option value="">All countries</option>
            {countriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#102C57]"
            />
            Show past deadlines
          </label>
          <span className="text-[11px] text-slate-500 sm:ml-auto">
            {visibleDeadlines.length} of {deadlines.length} deadlines
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading deadlines…
          </div>
        ) : visibleDeadlines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-xs text-slate-500">
            No deadlines added yet{countryFilter ? " for this country" : ""}.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3.5 py-2.5 text-left font-bold">
                    Deadline
                  </th>
                  <th className="px-3.5 py-2.5 text-left font-bold">
                    Applies to
                  </th>
                  <th className="px-3.5 py-2.5 text-left font-bold">Intake</th>
                  <th className="px-3.5 py-2.5 text-left font-bold">Type</th>
                  <th className="px-3.5 py-2.5 text-right font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleDeadlines.map((d) => {
                  const days = daysUntil(d.deadlineDate);
                  return (
                    <tr key={d.id} className={d.isActive ? "" : "opacity-50"}>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {formatDateOnly(d.deadlineDate)}
                        </div>
                        <div
                          className={`text-[11px] ${days < 0 ? "text-slate-400" : days <= 30 ? "text-rose-600 font-semibold" : "text-slate-500"}`}
                        >
                          {days < 0
                            ? "Closed"
                            : days === 0
                              ? "Today"
                              : `${days} days left`}
                          {d.isRolling ? " · Rolling" : ""}
                          {d.isActive ? "" : " · Hidden"}
                        </div>
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="font-semibold text-slate-900">
                          {d.universityName ?? "All universities"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {d.countryName ?? d.countryId} ·{" "}
                          {d.programName ?? "All programs"}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {d.intakeTerm} {d.intakeYear}
                        </div>
                        {d.roundName && (
                          <div className="text-[11px] text-slate-500">
                            {d.roundName}
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {deadlineTypeLabel(d.deadlineType)}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {d.sourceUrl && (
                            <a
                              href={d.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              aria-label="Open source page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => openEdit(d)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#102C57] cursor-pointer"
                            aria-label="Edit deadline"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(d)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            aria-label="Delete deadline"
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

      <AdminMilestonesSection countriesList={countriesList} />

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
                {editingId ? "Edit Deadline" : "Add Deadline"}
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
              <div>
                <label className={labelClass}>
                  Country <span className="text-rose-500">*</span>
                </label>
                <select
                  required
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
                  <option value="">Select country</option>
                  {countriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>University</label>
                <select
                  value={form.universityId}
                  onChange={(e) => updateForm("universityId", e.target.value)}
                  disabled={!form.countryId}
                  className={inputClass}
                >
                  <option value="">All universities in the country</option>
                  {formUniversities.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Program</label>
                <select
                  value={form.programId}
                  onChange={(e) => updateForm("programId", e.target.value)}
                  className={inputClass}
                >
                  <option value="">All programs</option>
                  {programsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Deadline Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.deadlineType}
                  onChange={(e) =>
                    updateForm("deadlineType", e.target.value as DeadlineType)
                  }
                  className={inputClass}
                >
                  {DEADLINE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Intake Term <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={form.intakeTerm}
                  onChange={(e) => updateForm("intakeTerm", e.target.value)}
                  placeholder="e.g. Fall, Spring, Winter, February"
                  maxLength={32}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Intake Year <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min={2000}
                  max={2100}
                  value={form.intakeYear}
                  onChange={(e) => updateForm("intakeYear", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Round</label>
                <input
                  value={form.roundName}
                  onChange={(e) => updateForm("roundName", e.target.value)}
                  placeholder="e.g. Round 1, Priority, Early Decision"
                  maxLength={64}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Classes Start</label>
                <input
                  type="date"
                  value={form.intakeStartDate}
                  onChange={(e) =>
                    updateForm("intakeStartDate", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Applications Open</label>
                <input
                  type="date"
                  value={form.applicationsOpenDate}
                  onChange={(e) =>
                    updateForm("applicationsOpenDate", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={form.deadlineDate}
                  onChange={(e) => updateForm("deadlineDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Official Source URL</label>
                <input
                  type="url"
                  value={form.sourceUrl}
                  onChange={(e) => updateForm("sourceUrl", e.target.value)}
                  placeholder="https://… page the date was taken from"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="e.g. Closes 18:00 UK time; via UCAS"
                  maxLength={500}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isRolling}
                  onChange={(e) => updateForm("isRolling", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#102C57]"
                />
                Rolling admission (apply early)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateForm("isActive", e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#102C57]"
                />
                Show on the public tracker
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
                {editingId ? "Save Changes" : "Add Deadline"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
