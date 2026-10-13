"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { PaperBlueprintGroup, TestModuleSettings } from "@/lib/testPrep/types";
import { PaperBlueprintEditor } from "@/components/admin/PaperBlueprintEditor";
import { adminFetch } from "@/lib/adminFetch";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
        checked ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function AdminTestSettingsTab() {
  const [items, setItems] = useState<TestModuleSettings[]>([]);
  const [drafts, setDrafts] = useState<Record<string, TestModuleSettings>>({});
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [editingFormatSlug, setEditingFormatSlug] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/test-settings");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setItems(data.items);
      setDrafts(Object.fromEntries(data.items.map((i: TestModuleSettings) => [i.examSlug, i])));
    } catch {
      setStatusMessage({ type: "error", text: "Failed to load test module settings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateDraft = (slug: string, patch: Partial<TestModuleSettings>) =>
    setDrafts((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));

  const isDirty = (slug: string) => {
    const saved = items.find((i) => i.examSlug === slug);
    const draft = drafts[slug];
    if (!saved || !draft) return false;
    return (
      saved.enabled !== draft.enabled ||
      saved.durationMinutes !== draft.durationMinutes ||
      saved.questionsPerPaper !== draft.questionsPerPaper ||
      saved.showAnswerReview !== draft.showAnswerReview ||
      (saved.instructions ?? "") !== (draft.instructions ?? "") ||
      JSON.stringify(saved.blueprint) !== JSON.stringify(draft.blueprint)
    );
  };

  /** Saves the exam's draft; `blueprint` overrides the draft's paper format (used by the format editor). */
  const save = async (slug: string, blueprint?: PaperBlueprintGroup[]) => {
    const draft = { ...drafts[slug], ...(blueprint && { blueprint }) };
    setSavingSlug(slug);
    setStatusMessage(null);
    try {
      const res = await adminFetch("/api/admin/test-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examSlug: slug,
          enabled: draft.enabled,
          durationMinutes: draft.durationMinutes,
          questionsPerPaper: draft.questionsPerPaper,
          showAnswerReview: draft.showAnswerReview,
          instructions: draft.instructions,
          blueprint: draft.blueprint,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save settings");

      setItems((prev) => prev.map((i) => (i.examSlug === slug ? data.item : i)));
      setDrafts((prev) => ({ ...prev, [slug]: data.item }));
      setStatusMessage({ type: "success", text: `${data.item.examName} settings saved.` });
      setEditingFormatSlug(null);
    } catch (err) {
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save settings" });
    } finally {
      setSavingSlug(null);
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
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Online Test Module Settings</h3>
              <p className="text-[11px] text-slate-500">
                Control availability, timing and paper size for each exam&apos;s mock test.
              </p>
            </div>
          </div>
          <button
            onClick={fetchSettings}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading settings…
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {items.map(({ examSlug, examName, bankSize, updatedAt }) => {
              const draft = drafts[examSlug];
              if (!draft) return null;
              const dirty = isDirty(examSlug);
              const formatQuestions = draft.blueprint.reduce((sum, g) => sum + g.items.length, 0);
              const formatMarks =
                Math.round(
                  draft.blueprint.reduce((sum, g) => sum + g.items.reduce((m, i) => m + i.marks, 0), 0) * 100,
                ) / 100;
              const approvedCount = draft.questionPool.reduce((sum, p) => sum + p.count, 0);
              return (
                <div
                  key={examSlug}
                  className={`rounded-2xl border p-5 ${draft.enabled ? "border-slate-200" : "border-slate-200 bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{examName}</p>
                      <p className="text-[11px] text-slate-500">
                        {approvedCount} approved Q&amp;A · {bankSize} in built-in bank ·{" "}
                        {updatedAt ? `Saved ${new Date(updatedAt).toLocaleString()}` : "Using defaults"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase ${draft.enabled ? "text-emerald-700" : "text-slate-500"}`}>
                        {draft.enabled ? "Live" : "Off"}
                      </span>
                      <Toggle
                        checked={draft.enabled}
                        onChange={(enabled) => updateDraft(examSlug, { enabled })}
                        label={`Enable ${examSlug} online test`}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor={`${examSlug}-duration`}>
                        Duration (minutes)
                      </label>
                      <input
                        id={`${examSlug}-duration`}
                        type="number"
                        min={1}
                        max={300}
                        value={draft.durationMinutes}
                        onChange={(e) => updateDraft(examSlug, { durationMinutes: Number(e.target.value) })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${examSlug}-questions`}>
                        {draft.blueprint.length ? "Questions per paper (from format)" : `Questions per paper (max ${bankSize})`}
                      </label>
                      <input
                        id={`${examSlug}-questions`}
                        type="number"
                        min={1}
                        max={bankSize}
                        value={draft.blueprint.length ? formatQuestions : draft.questionsPerPaper}
                        disabled={draft.blueprint.length > 0}
                        onChange={(e) => updateDraft(examSlug, { questionsPerPaper: Number(e.target.value) })}
                        className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-500`}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 px-3.5 py-2.5">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Paper format</p>
                      <p className="text-[10px] text-slate-500">
                        {draft.blueprint.length
                          ? `${draft.blueprint.length} questions · ${formatQuestions} sub-questions · ${formatMarks} marks`
                          : "Not set — random questions from the bank"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingFormatSlug(examSlug)}
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {draft.blueprint.length ? "Edit format" : "Set up format"}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-2.5">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Show answer review</p>
                      <p className="text-[10px] text-slate-500">Correct answers and explanations after submitting</p>
                    </div>
                    <Toggle
                      checked={draft.showAnswerReview}
                      onChange={(showAnswerReview) => updateDraft(examSlug, { showAnswerReview })}
                      label={`Show answer review for ${examSlug}`}
                    />
                  </div>

                  <div className="mt-3">
                    <label className={labelClass} htmlFor={`${examSlug}-instructions`}>
                      Instructions for students (optional)
                    </label>
                    <textarea
                      id={`${examSlug}-instructions`}
                      rows={2}
                      value={draft.instructions ?? ""}
                      onChange={(e) => updateDraft(examSlug, { instructions: e.target.value })}
                      placeholder="Shown on the registration screen before the test starts."
                      className={inputClass}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <a
                      href={`/test-prep/${examSlug}/online-test`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Preview test page
                    </a>
                    <div className="flex items-center gap-2">
                      {dirty && (
                        <button
                          type="button"
                          onClick={() => setDrafts((prev) => ({ ...prev, [examSlug]: items.find((i) => i.examSlug === examSlug)! }))}
                          className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100"
                        >
                          Discard
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => save(examSlug)}
                        disabled={!dirty || savingSlug === examSlug}
                        className="flex items-center gap-1.5 rounded-lg bg-[#102C57] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#0b1f3f] disabled:opacity-40"
                      >
                        {savingSlug === examSlug ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingFormatSlug && drafts[editingFormatSlug] && (
        <PaperBlueprintEditor
          settings={drafts[editingFormatSlug]}
          saving={savingSlug === editingFormatSlug}
          onCancel={() => setEditingFormatSlug(null)}
          onSave={(blueprint) => save(editingFormatSlug, blueprint)}
        />
      )}
    </div>
  );
}
