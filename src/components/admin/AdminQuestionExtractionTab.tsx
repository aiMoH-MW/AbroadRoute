"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Wand2,
  X,
  XCircle,
} from "lucide-react";
import { Program, Specialisation, TestPrepExam } from "@/types";
import { fetchLiveSpecialisations, fetchTestPrepExams } from "@/lib/supabase/dataFetchers";
import type { Material } from "@/lib/studyMaterials/types";
import {
  DEFAULT_PROMPTS,
  DIFFICULTIES,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  type MaterialQuestion,
  type ExtractionMode,
  type ExtractionRun,
  type QuestionStatus,
} from "@/lib/studyMaterials/questionTypes";
import { adminFetch } from "@/lib/adminFetch";

interface Props {
  programsList: Program[];
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#102C57] focus:outline-none focus:ring-1 focus:ring-[#102C57]";
const labelClass = "block text-xs font-bold text-slate-700 mb-1";

const STATUS_STYLES: Record<QuestionStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-700",
};

const RUN_STATUS_STYLES: Record<ExtractionRun["status"], string> = {
  running: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-700",
};

interface Filters {
  /** test_prep_exams.id */
  exam: string;
  program: string;
  specialisation: string;
  subject: string;
}

const EMPTY_FILTERS: Filters = { exam: "", program: "", specialisation: "", subject: "" };

function matchesFilters(
  item: { exam_id: string | null; program_slug: string | null; specialisation_slug: string | null; subject: string | null },
  f: Filters,
) {
  return (
    (!f.exam || item.exam_id === f.exam) &&
    (!f.program || item.program_slug === f.program) &&
    (!f.specialisation || item.specialisation_slug === f.specialisation) &&
    (!f.subject || item.subject === f.subject)
  );
}

export function AdminQuestionExtractionTab({ programsList }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [specialisations, setSpecialisations] = useState<Specialisation[]>([]);
  const [exams, setExams] = useState<TestPrepExam[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- Extraction setup ---
  const [sourceFilters, setSourceFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<ExtractionMode>("extract");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPTS.extract);
  const [pageFrom, setPageFrom] = useState("");
  const [pageTo, setPageTo] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  // --- Runs ---
  const [runs, setRuns] = useState<ExtractionRun[]>([]);
  const [activeRunIds, setActiveRunIds] = useState<Set<string>>(new Set());
  const activeRunsRef = useRef<Set<string>>(new Set());

  // --- Review ---
  const [reviewFilters, setReviewFilters] = useState<
    Filters & { section: string; material: string; status: string; type: string }
  >({
    ...EMPTY_FILTERS,
    section: "",
    material: "",
    status: "draft",
    type: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [questions, setQuestions] = useState<MaterialQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<MaterialQuestion | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const examNames = useMemo(() => Object.fromEntries(exams.map((e) => [e.id, e.shortName])), [exams]);
  const reviewExamSections = exams.find((e) => e.id === reviewFilters.exam)?.sections ?? [];
  const editingExamSections = exams.find((e) => e.id === editing?.exam_id)?.sections ?? [];
  const programNames = useMemo(() => Object.fromEntries(programsList.map((p) => [p.slug, p.name])), [programsList]);
  const specialisationNames = useMemo(
    () => Object.fromEntries(specialisations.map((s) => [s.slug, s.name])),
    [specialisations],
  );

  const materialsWithText = materials.filter((b) => b.pages_processed > 0);
  const subjects = useMemo(
    () => Array.from(new Set(materials.map((b) => b.subject).filter((s): s is string => Boolean(s)))).sort(),
    [materials],
  );
  const candidateMaterials = materialsWithText.filter((b) => matchesFilters(b, sourceFilters));
  const selectedMaterials = candidateMaterials.filter((b) => selectedMaterialIds.has(b.id));

  // ---------- Data loading ----------
  const fetchMaterials = useCallback(async () => {
    const res = await adminFetch("/api/admin/study-materials");
    const data = await res.json();
    if (data.success) setMaterials(data.items);
  }, []);

  const fetchRuns = useCallback(async () => {
    const res = await adminFetch("/api/admin/question-extraction/runs");
    const data = await res.json();
    if (data.success) setRuns(data.items);
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      Object.entries(reviewFilters).forEach(([key, value]) => value && params.set(key, value));
      if (debouncedQuery) params.set("q", debouncedQuery);
      const res = await adminFetch(`/api/admin/question-bank?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setQuestions(data.items);
      setTotal(data.total);
      setPageSize(data.pageSize);
      setSelectedIds(new Set());
    } catch (err) {
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to load questions" });
    } finally {
      setLoadingQuestions(false);
    }
  }, [page, reviewFilters, debouncedQuery]);

  useEffect(() => {
    fetchMaterials().catch(() => setStatusMessage({ type: "error", text: "Failed to load materials." }));
    fetchRuns().catch(() => undefined);
    fetchLiveSpecialisations().then(setSpecialisations);
    fetchTestPrepExams().then(setExams);
  }, [fetchMaterials, fetchRuns]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to the first page whenever the review filters change.
  useEffect(() => {
    setPage(1);
  }, [reviewFilters, debouncedQuery]);

  // ---------- Extraction ----------
  const setRunActive = (id: string, active: boolean) => {
    const next = new Set(activeRunsRef.current);
    if (active) next.add(id);
    else next.delete(id);
    activeRunsRef.current = next;
    setActiveRunIds(next);
  };

  const updateRun = (id: string, patch: Partial<ExtractionRun>) =>
    setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  /** Processes one run chunk by chunk. Returns false if it stopped on an error. */
  const processRun = async (run: ExtractionRun): Promise<boolean> => {
    if (activeRunsRef.current.has(run.id)) return true;
    setRunActive(run.id, true);
    updateRun(run.id, { status: "running", error_message: null });
    try {
      while (activeRunsRef.current.has(run.id)) {
        const res = await adminFetch(`/api/admin/question-extraction/runs/${run.id}/process`, { method: "POST" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Extraction failed");
        updateRun(run.id, {
          status: data.status,
          next_page: data.nextPage,
          questions_found: data.questionsFound,
        });
        if (data.done) break;
      }
      return true;
    } catch (err) {
      updateRun(run.id, { status: "failed", error_message: err instanceof Error ? err.message : "Extraction failed" });
      return false;
    } finally {
      setRunActive(run.id, false);
    }
  };

  const processRunsSequentially = async (list: ExtractionRun[]) => {
    for (const run of list) {
      await processRun(run);
    }
    fetchQuestions();
  };

  const handleModeChange = (next: ExtractionMode) => {
    // Only swap the prompt if the admin hasn't customised the current one.
    if (prompt.trim() === DEFAULT_PROMPTS[mode].trim()) setPrompt(DEFAULT_PROMPTS[next]);
    setMode(next);
  };

  const startExtraction = async () => {
    if (selectedMaterials.length === 0) {
      setStatusMessage({ type: "error", text: "Select at least one material." });
      return;
    }
    setIsStarting(true);
    setStatusMessage(null);
    try {
      const single = selectedMaterials.length === 1;
      const res = await adminFetch("/api/admin/question-extraction/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialIds: selectedMaterials.map((b) => b.id),
          mode,
          prompt,
          pageFrom: single && pageFrom ? Number(pageFrom) : undefined,
          pageTo: single && pageTo ? Number(pageTo) : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to start extraction");

      const created: ExtractionRun[] = data.runs;
      setRuns((prev) => [...created, ...prev]);
      setStatusMessage({
        type: "success",
        text: `Started ${created.length} extraction run${created.length > 1 ? "s" : ""}. Keep this tab open until they finish.`,
      });
      setSelectedMaterialIds(new Set());
      processRunsSequentially(created);
    } catch (err) {
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to start extraction" });
    } finally {
      setIsStarting(false);
    }
  };

  // ---------- Review ----------
  const bulkAction = async (action: QuestionStatus | "delete", ids: string[]) => {
    if (ids.length === 0) return;
    if (action === "delete" && !window.confirm(`Delete ${ids.length} question(s)? This cannot be undone.`)) return;
    const res = await adminFetch("/api/admin/question-bank", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });
    const data = await res.json();
    if (data.success) {
      fetchQuestions();
    } else {
      setStatusMessage({ type: "error", text: data.error || "Update failed" });
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      const res = await adminFetch(`/api/admin/question-bank/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editing.question,
          question_type: editing.question_type,
          options: editing.options.map((o) => o.trim()).filter(Boolean),
          answer: editing.answer,
          explanation: editing.explanation,
          topic: editing.topic,
          difficulty: editing.difficulty,
          section_id: editing.section_id,
          status: editing.status,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save question");
      setQuestions((prev) => prev.map((q) => (q.id === editing.id ? data.item : q)));
      setEditing(null);
    } catch (err) {
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save question" });
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filterSelects = (
    value: Filters,
    onChange: (patch: Partial<Filters>) => void,
  ) => (
    <>
      <select value={value.exam} onChange={(e) => onChange({ exam: e.target.value })} className={inputClass}>
        <option value="">All exams</option>
        {exams.map((exam) => (
          <option key={exam.id} value={exam.id}>
            {exam.shortName}
          </option>
        ))}
      </select>
      <select
        value={value.program}
        onChange={(e) => onChange({ program: e.target.value, specialisation: "" })}
        className={inputClass}
      >
        <option value="">All programs</option>
        {programsList.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        value={value.specialisation}
        onChange={(e) => onChange({ specialisation: e.target.value })}
        className={inputClass}
      >
        <option value="">All specialisations</option>
        {specialisations
          .filter((s) => !value.program || s.programSlug === value.program)
          .map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
      </select>
      <select value={value.subject} onChange={(e) => onChange({ subject: e.target.value })} className={inputClass}>
        <option value="">All subjects</option>
        {subjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </>
  );

  const materialTags = (b: Material) =>
    [
      b.exam_id && (examNames[b.exam_id] || "Unknown exam"),
      b.program_slug && (programNames[b.program_slug] || b.program_slug),
      b.specialisation_slug && (specialisationNames[b.specialisation_slug] || b.specialisation_slug),
      b.subject,
    ].filter(Boolean) as string[];

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Extraction setup */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Extract Q&amp;A from Materials with AI</h3>
              <p className="text-[11px] text-slate-500">
                Choose source materials, adjust the prompt, and the AI saves questions with answers as drafts for review.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>1. Filter source materials</label>
              <div className="grid grid-cols-2 gap-2">
                {filterSelects(sourceFilters, (patch) => {
                  setSourceFilters((f) => ({ ...f, ...patch }));
                  setSelectedMaterialIds(new Set());
                })}
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  2. Select materials ({selectedMaterials.length}/{candidateMaterials.length})
                </label>
                {candidateMaterials.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMaterialIds(
                        selectedMaterials.length === candidateMaterials.length
                          ? new Set()
                          : new Set(candidateMaterials.map((b) => b.id)),
                      )
                    }
                    className="text-[11px] font-bold text-[#102C57] hover:underline"
                  >
                    {selectedMaterials.length === candidateMaterials.length ? "Clear" : "Select all"}
                  </button>
                )}
              </div>
              <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-2xl border border-slate-200 p-2">
                {candidateMaterials.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-slate-500">
                    No materials with extracted text match these filters. Upload materials in the Study Data tab.
                  </p>
                ) : (
                  candidateMaterials.map((b) => (
                    <label
                      key={b.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2 ${
                        selectedMaterialIds.has(b.id) ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMaterialIds.has(b.id)}
                        onChange={() =>
                          setSelectedMaterialIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(b.id)) next.delete(b.id);
                            else next.add(b.id);
                            return next;
                          })
                        }
                        className="mt-0.5 accent-[#102C57]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">{b.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {b.pages_processed}
                          {b.page_count && b.page_count !== b.pages_processed ? ` of ${b.page_count}` : ""} pages
                          extracted
                          {materialTags(b).length > 0 && ` · ${materialTags(b).join(" · ")}`}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>3. Mode</label>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                  {(["extract", "generate"] as ExtractionMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleModeChange(m)}
                      className={`rounded-lg py-1.5 text-[11px] font-bold ${
                        mode === m ? "bg-white text-[#102C57] shadow-xs" : "text-slate-500"
                      }`}
                    >
                      {m === "extract" ? "Extract existing" : "Generate new"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Page range {selectedMaterials.length !== 1 && "(single material only)"}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={pageFrom}
                    onChange={(e) => setPageFrom(e.target.value)}
                    disabled={selectedMaterials.length !== 1}
                    placeholder="From"
                    className={`${inputClass} disabled:bg-slate-50`}
                  />
                  <span className="text-xs text-slate-400">–</span>
                  <input
                    type="number"
                    min={1}
                    value={pageTo}
                    onChange={(e) => setPageTo(e.target.value)}
                    disabled={selectedMaterials.length !== 1}
                    placeholder="To"
                    className={`${inputClass} disabled:bg-slate-50`}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">4. Prompt</label>
                {prompt.trim() !== DEFAULT_PROMPTS[mode].trim() && (
                  <button
                    type="button"
                    onClick={() => setPrompt(DEFAULT_PROMPTS[mode])}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#102C57] hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset to default
                  </button>
                )}
              </div>
              <textarea
                rows={7}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`${inputClass} font-mono leading-relaxed`}
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Material details (title, exam, subject) and the required output format are added automatically. Text is sent
                10 pages per request.
              </p>
            </div>

            <button
              type="button"
              onClick={startExtraction}
              disabled={isStarting || selectedMaterials.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#102C57] py-3 text-xs font-bold text-white hover:bg-[#0b1f3f] transition disabled:opacity-50"
            >
              {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {mode === "extract" ? "Extract Questions & Answers" : "Generate Questions & Answers"}
            </button>
          </div>
        </div>

        {/* Runs */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Extraction Runs</h3>
            <button
              onClick={() => fetchRuns()}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
          {runs.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-500">No extraction runs yet.</p>
          ) : (
            <ul className="max-h-[560px] space-y-2.5 overflow-y-auto">
              {runs.map((run) => {
                const totalPagesInRun = run.page_to - run.page_from + 1;
                const done = Math.min(totalPagesInRun, run.next_page - run.page_from);
                const percent = Math.round((done / totalPagesInRun) * 100);
                const running = activeRunIds.has(run.id);
                return (
                  <li key={run.id} className="rounded-2xl border border-slate-200 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">{run.material?.title ?? "Deleted material"}</p>
                        <p className="text-[10px] text-slate-500">
                          {run.mode === "extract" ? "Extract" : "Generate"} · pages {run.page_from}–{run.page_to} ·{" "}
                          {run.questions_found} questions
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${RUN_STATUS_STYLES[run.status]}`}
                      >
                        {running ? "working" : run.status}
                      </span>
                    </div>
                    {run.status !== "completed" && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-[#102C57] transition-all" style={{ width: `${percent}%` }} />
                      </div>
                    )}
                    {run.status === "failed" && run.error_message && (
                      <p className="mt-1.5 text-[10px] font-semibold text-rose-600">{run.error_message}</p>
                    )}
                    {run.status !== "completed" && (
                      <div className="mt-2 flex justify-end">
                        {running ? (
                          <button
                            onClick={() => setRunActive(run.id, false)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-700"
                          >
                            <Loader2 className="h-3 w-3 animate-spin" /> Pause
                          </button>
                        ) : (
                          <button
                            onClick={() => processRun(run).then(() => fetchQuestions())}
                            className="flex items-center gap-1 rounded-lg bg-[#102C57] px-2.5 py-1 text-[10px] font-bold text-white"
                          >
                            <Play className="h-3 w-3" /> {run.status === "failed" ? "Retry" : "Resume"}
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Review */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Question &amp; Answer Knowledge Base ({total})</h3>
            <p className="text-[11px] text-slate-500">
              Review AI output. Only <strong>approved</strong> questions should be used by other modules.
            </p>
          </div>
          <button
            onClick={fetchQuestions}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingQuestions ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {(["draft", "approved", "rejected", ""] as const).map((s) => (
            <button
              key={s || "all"}
              onClick={() => setReviewFilters((f) => ({ ...f, status: s }))}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold capitalize ${
                reviewFilters.status === s ? "bg-[#102C57] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 mb-4">
          <div className="relative col-span-2 md:col-span-4 xl:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className={`${inputClass} pl-8`}
            />
          </div>
          {filterSelects(reviewFilters, (patch) =>
            // Sections belong to one exam, so changing the exam clears the section.
            setReviewFilters((f) => ({ ...f, ...patch, ...(patch.exam !== undefined && { section: "" }) })),
          )}
          <select
            value={reviewFilters.section}
            onChange={(e) => setReviewFilters((f) => ({ ...f, section: e.target.value }))}
            disabled={!reviewFilters.exam}
            className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`}
          >
            <option value="">{reviewFilters.exam ? "All sections" : "Pick an exam for sections"}</option>
            {reviewExamSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={reviewFilters.material}
            onChange={(e) => setReviewFilters((f) => ({ ...f, material: e.target.value }))}
            className={inputClass}
          >
            <option value="">All materials</option>
            {materials
              .filter((b) => matchesFilters(b, reviewFilters))
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
          </select>
          <select
            value={reviewFilters.type}
            onChange={(e) => setReviewFilters((f) => ({ ...f, type: e.target.value }))}
            className={inputClass}
          >
            <option value="">All types</option>
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {QUESTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {questions.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
              <input
                type="checkbox"
                checked={selectedIds.size === questions.length}
                onChange={() =>
                  setSelectedIds(selectedIds.size === questions.length ? new Set() : new Set(questions.map((q) => q.id)))
                }
                className="accent-[#102C57]"
              />
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select page"}
            </label>
            {selectedIds.size > 0 && (
              <div className="ml-auto flex flex-wrap gap-1.5">
                <button
                  onClick={() => bulkAction("approved", Array.from(selectedIds))}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white"
                >
                  <Check className="h-3 w-3" /> Approve
                </button>
                <button
                  onClick={() => bulkAction("rejected", Array.from(selectedIds))}
                  className="flex items-center gap-1 rounded-lg bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700"
                >
                  <XCircle className="h-3 w-3" /> Reject
                </button>
                <button
                  onClick={() => bulkAction("delete", Array.from(selectedIds))}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        {loadingQuestions && questions.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading questions…
          </div>
        ) : questions.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-500">No questions match these filters.</p>
        ) : (
          <ul className="space-y-3">
            {questions.map((q) => (
              <li
                key={q.id}
                className={`rounded-2xl border p-4 ${selectedIds.has(q.id) ? "border-indigo-300 bg-indigo-50/40" : "border-slate-200"}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(q.id)}
                    onChange={() => toggleSelected(q.id)}
                    className="mt-1 accent-[#102C57]"
                    aria-label="Select question"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                      <span className={`rounded-full px-2 py-0.5 uppercase ${STATUS_STYLES[q.status]}`}>{q.status}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                        {QUESTION_TYPE_LABELS[q.question_type]}
                      </span>
                      {q.difficulty && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 capitalize text-slate-600">{q.difficulty}</span>
                      )}
                      {q.exam && (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-700">
                          {q.exam.short_name}
                          {q.section && ` · ${q.section.name}`}
                        </span>
                      )}
                      {q.topic && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">{q.topic}</span>}
                      <span className="text-slate-400">
                        {q.material?.title ?? "Unknown material"}
                        {q.source_page ? ` · p. ${q.source_page}` : ""} · {q.origin === "extract" ? "from material" : "AI-generated"}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-line text-sm font-bold text-slate-900">{q.question}</p>

                    {q.options.length > 0 && (
                      <ol className="mt-2 grid gap-1 sm:grid-cols-2">
                        {q.options.map((opt, i) => (
                          <li
                            key={i}
                            className={`rounded-lg px-2.5 py-1.5 text-xs ${
                              opt === q.answer ? "bg-emerald-50 font-semibold text-emerald-800" : "bg-slate-50 text-slate-700"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </li>
                        ))}
                      </ol>
                    )}

                    <p className="mt-2 text-xs text-slate-700">
                      <span className="font-bold">Answer: </span>
                      {q.answer ?? <span className="font-semibold text-amber-600">Not found in material — add before approving</span>}
                    </p>
                    {q.explanation && <p className="mt-1 text-xs text-slate-500">{q.explanation}</p>}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {q.status !== "approved" && (
                        <button
                          onClick={() => bulkAction("approved", [q.id])}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                      )}
                      {q.status !== "rejected" && (
                        <button
                          onClick={() => bulkAction("rejected", [q.id])}
                          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700"
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      )}
                      <button
                        onClick={() => setEditing({ ...q, options: [...q.options] })}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700"
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => bulkAction("delete", [q.id])}
                        className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {total > pageSize && (
          <div className="mt-4 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="text-[11px] text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onClick={() => setEditing(null)}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Edit Question</h3>
              <button onClick={() => setEditing(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelClass}>Question</label>
                <textarea
                  rows={3}
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  className={inputClass}
                />
              </div>

              {editing.exam_id && (
                <div>
                  <label className={labelClass}>Exam section ({examNames[editing.exam_id] || "exam"})</label>
                  <select
                    value={editing.section_id ?? ""}
                    onChange={(e) => setEditing({ ...editing, section_id: e.target.value || null })}
                    className={inputClass}
                  >
                    <option value="">No section</option>
                    {editingExamSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    value={editing.question_type}
                    onChange={(e) =>
                      setEditing({ ...editing, question_type: e.target.value as MaterialQuestion["question_type"] })
                    }
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
                  <label className={labelClass}>Difficulty</label>
                  <select
                    value={editing.difficulty ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, difficulty: (e.target.value || null) as MaterialQuestion["difficulty"] })
                    }
                    className={inputClass}
                  >
                    <option value="">—</option>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as QuestionStatus })}
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {editing.question_type === "mcq" && (
                <div>
                  <label className={labelClass}>Options (select the correct one)</label>
                  <div className="space-y-1.5">
                    {editing.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={opt !== "" && opt === editing.answer}
                          onChange={() => setEditing({ ...editing, answer: opt })}
                          className="accent-emerald-600"
                          aria-label={`Mark option ${i + 1} correct`}
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const options = [...editing.options];
                            const wasAnswer = options[i] === editing.answer;
                            options[i] = e.target.value;
                            setEditing({ ...editing, options, answer: wasAnswer ? e.target.value : editing.answer });
                          }}
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() => setEditing({ ...editing, options: editing.options.filter((_, j) => j !== i) })}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                          aria-label="Remove option"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {editing.options.length < 10 && (
                      <button
                        type="button"
                        onClick={() => setEditing({ ...editing, options: [...editing.options, ""] })}
                        className="text-[11px] font-bold text-[#102C57] hover:underline"
                      >
                        + Add option
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className={labelClass}>Answer</label>
                <textarea
                  rows={2}
                  value={editing.answer ?? ""}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Explanation</label>
                <textarea
                  rows={2}
                  value={editing.explanation ?? ""}
                  onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Topic</label>
                <input
                  type="text"
                  value={editing.topic ?? ""}
                  onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="flex items-center gap-1.5 rounded-xl bg-[#102C57] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b1f3f] disabled:opacity-60"
              >
                {savingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
