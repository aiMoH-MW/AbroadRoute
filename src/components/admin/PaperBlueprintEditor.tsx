"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  DIFFICULTIES,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  type QuestionType,
} from "@/lib/studyMaterials/questionTypes";
import type {
  BlueprintDifficulty,
  PaperBlueprintGroup,
  PaperBlueprintItem,
  QuestionPoolCount,
  TestModuleSettings,
} from "@/lib/testPrep/types";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-[11px] font-bold text-slate-600 mb-1";

const DIFFICULTY_OPTIONS: { value: BlueprintDifficulty; label: string }[] = [
  { value: "any", label: "Any" },
  ...DIFFICULTIES.map((d) => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
];

const DEFAULT_TITLES: Record<QuestionType, string> = {
  mcq: "Choose the correct option",
  true_false: "State whether True or False",
  fill_blank: "Fill in the blanks",
  short_answer: "Answer the following",
  long_answer: "Answer the following in detail",
};

const MAX_ITEMS = 100;

const subLabel = (i: number) => (i < 26 ? `(${String.fromCharCode(97 + i)})` : `(${i + 1})`);
const round = (n: number) => Math.round(n * 100) / 100;
const groupMarks = (g: PaperBlueprintGroup) => round(g.items.reduce((sum, item) => sum + item.marks, 0));

function newGroup(questionType: QuestionType = "short_answer"): PaperBlueprintGroup {
  return {
    id: crypto.randomUUID(),
    title: DEFAULT_TITLES[questionType],
    instructions: null,
    sectionId: null,
    questionType,
    items: Array.from({ length: 5 }, () => ({ marks: 1, difficulty: "any" as BlueprintDifficulty })),
  };
}

/** Checks a group's sub-questions against the approved questions available for its section/type. */
function checkAvailability(group: PaperBlueprintGroup, pool: QuestionPoolCount[]) {
  const matching = pool.filter(
    (p) => p.questionType === group.questionType && (!group.sectionId || p.sectionId === group.sectionId),
  );
  const available = (d: BlueprintDifficulty) =>
    matching.filter((p) => d === "any" || p.difficulty === d).reduce((sum, p) => sum + p.count, 0);

  const shortfalls: string[] = [];
  for (const d of DIFFICULTIES) {
    const need = group.items.filter((i) => i.difficulty === d).length;
    const have = available(d);
    if (need > have) shortfalls.push(`${need} ${d} needed, ${have} approved`);
  }
  const totalHave = available("any");
  if (group.items.length > totalHave) {
    shortfalls.push(`${group.items.length} needed in total, ${totalHave} approved`);
  }
  return { totalHave, shortfalls };
}

interface Props {
  settings: TestModuleSettings;
  saving: boolean;
  onCancel: () => void;
  onSave: (blueprint: PaperBlueprintGroup[]) => void;
}

export function PaperBlueprintEditor({ settings, saving, onCancel, onSave }: Props) {
  const [groups, setGroups] = useState<PaperBlueprintGroup[]>(() =>
    settings.blueprint.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i })) })),
  );

  const sectionNames = useMemo(
    () => Object.fromEntries(settings.sections.map((s) => [s.id, s.name])),
    [settings.sections],
  );

  const totals = useMemo(
    () => ({
      questions: groups.reduce((sum, g) => sum + g.items.length, 0),
      marks: round(groups.reduce((sum, g) => sum + groupMarks(g), 0)),
    }),
    [groups],
  );
  const problems = groups
    .map((g, i) => ({ index: i, ...checkAvailability(g, settings.questionPool) }))
    .filter((r) => r.shortfalls.length > 0);
  const invalid = groups.some((g) => !g.title.trim() || g.items.length === 0 || g.items.some((i) => !(i.marks > 0)));

  const updateGroup = (id: string, patch: Partial<PaperBlueprintGroup>) =>
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const updateItem = (groupId: string, index: number, patch: Partial<PaperBlueprintItem>) =>
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, items: g.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) } : g,
      ),
    );

  /** Grows (copying the last sub-question) or shrinks the sub-question list. */
  const setItemCount = (group: PaperBlueprintGroup, count: number) => {
    const n = Math.max(1, Math.min(MAX_ITEMS, Math.floor(count) || 1));
    const template = group.items[group.items.length - 1] ?? { marks: 1, difficulty: "any" as BlueprintDifficulty };
    updateGroup(group.id, {
      items:
        n <= group.items.length
          ? group.items.slice(0, n)
          : [...group.items, ...Array.from({ length: n - group.items.length }, () => ({ ...template }))],
    });
  };

  const applyToAll = (group: PaperBlueprintGroup, patch: Partial<PaperBlueprintItem>) =>
    updateGroup(group.id, { items: group.items.map((item) => ({ ...item, ...patch })) });

  const moveGroup = (index: number, delta: number) =>
    setGroups((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(index + delta, 0, moved);
      return next;
    });

  const changeType = (group: PaperBlueprintGroup, questionType: QuestionType) =>
    updateGroup(group.id, {
      questionType,
      // Keep a custom title; only swap the default wording.
      title: group.title === DEFAULT_TITLES[group.questionType] ? DEFAULT_TITLES[questionType] : group.title,
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={onCancel}>
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Paper Format · {settings.examName}</h3>
            <p className="text-[11px] text-slate-500">
              Define each question, its sub-questions, marks and difficulty. Questions are drawn from approved
              Q&amp;A matching the section and type.
            </p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Groups */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {groups.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
              <p className="text-xs font-bold text-slate-700">No paper format yet</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Without a format, the test picks {settings.questionsPerPaper} random questions. Add a question to
                define the paper.
              </p>
            </div>
          )}

          {groups.map((group, index) => {
            const { totalHave, shortfalls } = checkAvailability(group, settings.questionPool);
            const uniformMarks = group.items.every((i) => i.marks === group.items[0]?.marks);
            const uniformDifficulty = group.items.every((i) => i.difficulty === group.items[0]?.difficulty);
            return (
              <div key={group.id} className="rounded-2xl border border-slate-200 p-4">
                {/* Group header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-[#102C57] px-2.5 py-1 text-[11px] font-bold text-white">
                    Q{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-700">
                      {group.items.length} × sub-questions · {groupMarks(group)} marks
                    </span>
                    <button
                      onClick={() => moveGroup(index, -1)}
                      disabled={index === 0}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveGroup(index, 1)}
                      disabled={index === groups.length - 1}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setGroups((prev) => [
                          ...prev.slice(0, index + 1),
                          { ...group, id: crypto.randomUUID(), items: group.items.map((i) => ({ ...i })) },
                          ...prev.slice(index + 1),
                        ])
                      }
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                      aria-label="Duplicate question"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setGroups((prev) => prev.filter((g) => g.id !== group.id))}
                      className="rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                      aria-label="Remove question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Group settings */}
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Question heading</label>
                    <input
                      type="text"
                      value={group.title}
                      onChange={(e) => updateGroup(group.id, { title: e.target.value })}
                      placeholder="e.g., Answer the following"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Question type</label>
                    <select
                      value={group.questionType}
                      onChange={(e) => changeType(group, e.target.value as QuestionType)}
                      className={inputClass}
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {QUESTION_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Exam section</label>
                    <select
                      value={group.sectionId ?? ""}
                      onChange={(e) => updateGroup(group.id, { sectionId: e.target.value || null })}
                      className={inputClass}
                    >
                      <option value="">Any section</option>
                      {settings.sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Instructions (optional)</label>
                    <input
                      type="text"
                      value={group.instructions ?? ""}
                      onChange={(e) => updateGroup(group.id, { instructions: e.target.value || null })}
                      placeholder="e.g., Attempt any 4. Each answer in 2–3 sentences."
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Bulk controls */}
                <div className="mt-3 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3">
                  <div>
                    <label className={labelClass}>Number of sub-questions</label>
                    <input
                      type="number"
                      min={1}
                      max={MAX_ITEMS}
                      value={group.items.length}
                      onChange={(e) => setItemCount(group, Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Marks for all</label>
                    <input
                      type="number"
                      min={0.25}
                      step={0.25}
                      value={uniformMarks ? group.items[0]?.marks ?? "" : ""}
                      placeholder="Mixed"
                      onChange={(e) => applyToAll(group, { marks: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Difficulty for all</label>
                    <select
                      value={uniformDifficulty ? group.items[0]?.difficulty : ""}
                      onChange={(e) => applyToAll(group, { difficulty: e.target.value as BlueprintDifficulty })}
                      className={inputClass}
                    >
                      {!uniformDifficulty && <option value="">Mixed</option>}
                      {DIFFICULTY_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-questions */}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-100 px-2.5 py-1.5">
                      <span className="w-8 text-[11px] font-bold text-slate-500">{subLabel(i)}</span>
                      <input
                        type="number"
                        min={0.25}
                        step={0.25}
                        value={item.marks}
                        onChange={(e) => updateItem(group.id, i, { marks: Number(e.target.value) })}
                        className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-[#102C57] focus:outline-none"
                        aria-label={`Marks for ${subLabel(i)}`}
                      />
                      <span className="text-[10px] text-slate-400">marks</span>
                      <select
                        value={item.difficulty}
                        onChange={(e) =>
                          updateItem(group.id, i, { difficulty: e.target.value as BlueprintDifficulty })
                        }
                        className="ml-auto rounded-lg border border-slate-200 px-1.5 py-1 text-[11px] focus:border-[#102C57] focus:outline-none"
                        aria-label={`Difficulty for ${subLabel(i)}`}
                      >
                        {DIFFICULTY_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Availability */}
                <div
                  className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${
                    shortfalls.length ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {shortfalls.length ? (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>
                    {totalHave} approved {QUESTION_TYPE_LABELS[group.questionType].toLowerCase()} question
                    {totalHave === 1 ? "" : "s"} in{" "}
                    {group.sectionId ? sectionNames[group.sectionId] ?? "this section" : "any section"}
                    {shortfalls.length ? ` — not enough: ${shortfalls.join("; ")}.` : " — enough to fill this question."}
                  </span>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setGroups((prev) => [...prev, newGroup(prev[prev.length - 1]?.questionType)])}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 py-3 text-xs font-bold text-slate-600 hover:border-[#102C57]/40 hover:text-[#102C57]"
          >
            <Plus className="h-4 w-4" /> Add question
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-5">
          <div className="text-[11px] text-slate-600">
            <span className="font-bold text-slate-900">{groups.length}</span> questions ·{" "}
            <span className="font-bold text-slate-900">{totals.questions}</span> sub-questions ·{" "}
            <span className="font-bold text-slate-900">{totals.marks}</span> total marks
            {problems.length > 0 && (
              <span className="ml-2 font-semibold text-amber-700">
                · {problems.map((p) => `Q${p.index + 1}`).join(", ")} can&apos;t be filled yet
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onSave(groups.map((g) => ({ ...g, title: g.title.trim(), instructions: g.instructions?.trim() || null })))
              }
              disabled={saving || invalid}
              className="flex items-center gap-1.5 rounded-lg bg-[#102C57] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#0b1f3f] disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save paper format
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
