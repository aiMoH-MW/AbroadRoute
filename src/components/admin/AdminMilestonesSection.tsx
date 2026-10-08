"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Country, DeadlineMilestone, DeadlineType } from "@/types";
import { getAuthHeaders } from "@/lib/supabase/client";
import {
  DEADLINE_TYPES,
  deadlineTypeLabel,
  milestoneOffsetLabel,
} from "@/lib/deadlines";

interface AdminMilestonesSectionProps {
  countriesList: Country[];
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";

// Form fields as typed; empty string = not set / all
interface MilestoneForm {
  countryId: string;
  deadlineType: DeadlineType | "";
  daysBefore: string;
  title: string;
  description: string;
  actionLabel: string;
  isActive: boolean;
}

const emptyForm = (): MilestoneForm => ({
  countryId: "",
  deadlineType: "",
  daysBefore: "",
  title: "",
  description: "",
  actionLabel: "",
  isActive: true,
});

const toForm = (m: DeadlineMilestone): MilestoneForm => ({
  countryId: m.countryId ?? "",
  deadlineType: m.deadlineType ?? "",
  daysBefore: String(m.daysBefore),
  title: m.title,
  description: m.description ?? "",
  actionLabel: m.actionLabel ?? "",
  isActive: m.isActive,
});

const toBody = (f: MilestoneForm) => ({
  countryId: f.countryId || null,
  deadlineType: f.deadlineType || null,
  daysBefore: Number(f.daysBefore),
  title: f.title,
  description: f.description || null,
  actionLabel: f.actionLabel || null,
  isActive: f.isActive,
});

// Which set a milestone belongs to, e.g. "Germany · Application"
const scopeLabel = (m: DeadlineMilestone) =>
  [
    m.countryName ?? (m.countryId ? m.countryId : "All countries"),
    m.deadlineType ? deadlineTypeLabel(m.deadlineType) : "All types",
  ].join(" · ");

const sortMilestones = (list: DeadlineMilestone[]) =>
  [...list].sort(
    (a, b) =>
      scopeLabel(a).localeCompare(scopeLabel(b)) || b.daysBefore - a.daysBefore,
  );

export function AdminMilestonesSection({
  countriesList,
}: AdminMilestonesSectionProps) {
  const [milestones, setMilestones] = useState<DeadlineMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  // null = closed; editingId null with a form open = adding
  const [form, setForm] = useState<MilestoneForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/deadline-milestones", {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) setMilestones(sortMilestones(data.milestones));
      else setStatusMessage({ type: "error", text: data.error });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to load milestones" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const updateForm = <K extends keyof MilestoneForm>(
    key: K,
    value: MilestoneForm[K],
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
          ? `/api/admin/deadline-milestones/${editingId}`
          : "/api/admin/deadline-milestones",
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
      const saved: DeadlineMilestone = data.milestone;
      setMilestones((prev) =>
        sortMilestones(
          editingId
            ? prev.map((m) => (m.id === editingId ? saved : m))
            : [...prev, saved],
        ),
      );
      setStatusMessage({
        type: "success",
        text: editingId ? "Milestone updated." : "Milestone added.",
      });
      closeForm();
    } catch {
      setStatusMessage({ type: "error", text: "Failed to save milestone" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: DeadlineMilestone) => {
    if (
      !window.confirm(
        `Delete the milestone "${milestoneOffsetLabel(m.daysBefore)}: ${m.title}"? This cannot be undone.`,
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/deadline-milestones/${m.id}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setMilestones((prev) => prev.filter((x) => x.id !== m.id));
        setStatusMessage({ type: "success", text: "Milestone deleted." });
      } else {
        setStatusMessage({ type: "error", text: data.error });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Failed to delete milestone" });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Countdown Milestones
            </h3>
            <p className="text-[11px] text-slate-500">
              Steps shown under each deadline, dated N days before it. A
              deadline uses the most specific matching set: country + type, then
              country, then type, then &ldquo;All countries · All types&rdquo;.
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
          Add Milestone
        </button>
      </div>

      {statusMessage && (
        <div
          className={`mb-4 flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs font-semibold ${
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

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading milestones…
        </div>
      ) : milestones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-xs text-slate-500">
          No milestones added yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3.5 py-2.5 text-left font-bold">
                  Applies to
                </th>
                <th className="px-3.5 py-2.5 text-left font-bold">When</th>
                <th className="px-3.5 py-2.5 text-left font-bold">Milestone</th>
                <th className="px-3.5 py-2.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {milestones.map((m) => (
                <tr key={m.id} className={m.isActive ? "" : "opacity-50"}>
                  <td className="px-3.5 py-3 whitespace-nowrap text-slate-600">
                    {scopeLabel(m)}
                    {m.isActive ? "" : " · Hidden"}
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap font-bold text-slate-900">
                    {milestoneOffsetLabel(m.daysBefore)}
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="font-semibold text-slate-900">
                      {m.title}
                    </div>
                    {m.actionLabel && (
                      <div className="text-[11px] text-slate-500">
                        {m.actionLabel}
                      </div>
                    )}
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingId(m.id);
                          setForm(toForm(m));
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#102C57] cursor-pointer"
                        aria-label="Edit milestone"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        aria-label="Delete milestone"
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

      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-sm font-bold text-slate-900">
                {editingId ? "Edit Milestone" : "Add Milestone"}
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
                <label className={labelClass}>Country</label>
                <select
                  value={form.countryId}
                  onChange={(e) => updateForm("countryId", e.target.value)}
                  className={inputClass}
                >
                  <option value="">All countries</option>
                  {countriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Deadline Type</label>
                <select
                  value={form.deadlineType}
                  onChange={(e) =>
                    updateForm(
                      "deadlineType",
                      e.target.value as DeadlineType | "",
                    )
                  }
                  className={inputClass}
                >
                  <option value="">All types</option>
                  {DEADLINE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Days Before Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  max={730}
                  value={form.daysBefore}
                  onChange={(e) => updateForm("daysBefore", e.target.value)}
                  placeholder="e.g. 90 (0 = deadline day)"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Action Tag</label>
                <input
                  value={form.actionLabel}
                  onChange={(e) => updateForm("actionLabel", e.target.value)}
                  placeholder="e.g. University Shortlisting"
                  maxLength={64}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="e.g. Finalize Shortlist & Standardized Exams"
                  maxLength={128}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  maxLength={2000}
                  rows={3}
                  className={inputClass}
                />
              </div>
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
                {editingId ? "Save Changes" : "Add Milestone"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
