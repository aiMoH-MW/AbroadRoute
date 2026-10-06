import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { QUESTION_BANK } from "./questionBank";
import type { PaperBlueprintGroup, QuestionPoolCount, TestModuleSettings } from "./types";

interface SettingsRow {
  exam_slug: string;
  enabled: boolean;
  duration_minutes: number;
  questions_per_paper: number;
  show_answer_review: boolean;
  instructions: string | null;
  paper_blueprint?: PaperBlueprintGroup[] | null;
  updated_at: string | null;
}

interface ExamRow {
  id: string;
  slug: string;
  name: string;
  test_prep_sections: { id: string; name: string; display_order: number | null }[] | null;
}

const EXAM_SELECT = "id, slug, name, test_prep_sections(id, name, display_order)";

function defaultsFor(exam: ExamRow): TestModuleSettings | null {
  const bank = QUESTION_BANK[exam.slug];
  if (!bank) return null;
  return {
    examSlug: exam.slug,
    examName: exam.name,
    examId: exam.id,
    sections: (exam.test_prep_sections ?? [])
      .slice()
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map(({ id, name }) => ({ id, name })),
    blueprint: [],
    questionPool: [],
    enabled: true,
    durationMinutes: bank.durationMinutes,
    questionsPerPaper: bank.questionsPerPaper,
    showAnswerReview: true,
    instructions: null,
    bankSize: bank.questions.length,
    updatedAt: null,
  };
}

function merge(defaults: TestModuleSettings, row?: SettingsRow): TestModuleSettings {
  if (!row) return defaults;
  const blueprint = Array.isArray(row.paper_blueprint) ? row.paper_blueprint : [];
  return {
    ...defaults,
    enabled: row.enabled,
    durationMinutes: row.duration_minutes,
    // Papers are still drawn from the built-in bank, so never promise more than it holds.
    questionsPerPaper: Math.min(row.questions_per_paper, defaults.bankSize),
    showAnswerReview: row.show_answer_review,
    instructions: row.instructions,
    blueprint,
    updatedAt: row.updated_at,
  };
}

/** Approved Q&A-bank questions grouped by exam, then by section / type / difficulty. */
async function getQuestionPools(examIds: string[]): Promise<Map<string, QuestionPoolCount[]>> {
  const pools = new Map<string, QuestionPoolCount[]>();
  if (examIds.length === 0) return pools;

  const { data, error } = await supabaseAdmin
    .from("study_questions")
    .select("exam_id, section_id, question_type, difficulty")
    .eq("status", "approved")
    .in("exam_id", examIds);
  if (error) {
    console.warn("study_questions pool fetch error:", error.message);
    return pools;
  }

  const counts = new Map<string, QuestionPoolCount & { examId: string }>();
  for (const row of data ?? []) {
    const key = [row.exam_id, row.section_id, row.question_type, row.difficulty].join("|");
    const entry = counts.get(key) ?? {
      examId: row.exam_id,
      sectionId: row.section_id,
      questionType: row.question_type,
      difficulty: row.difficulty,
      count: 0,
    };
    entry.count += 1;
    counts.set(key, entry);
  }
  for (const { examId, ...pool } of counts.values()) {
    pools.set(examId, [...(pools.get(examId) ?? []), pool]);
  }
  return pools;
}

/** Settings for one exam, or null if the exam is not in test_prep_exams or has no question bank. */
export async function getTestSettings(examSlug: string): Promise<TestModuleSettings | null> {
  if (!QUESTION_BANK[examSlug]) return null;

  const [{ data: exam }, { data, error }] = await Promise.all([
    supabaseAdmin.from("test_prep_exams").select(EXAM_SELECT).eq("slug", examSlug).maybeSingle(),
    supabaseAdmin.from("test_module_settings").select("*").eq("exam_slug", examSlug).maybeSingle(),
  ]);
  if (!exam) return null;
  if (error) console.warn("test_module_settings fetch error:", error.message);

  const settings = merge(defaultsFor(exam as ExamRow)!, (data as SettingsRow | null) ?? undefined);
  settings.questionPool = (await getQuestionPools([settings.examId])).get(settings.examId) ?? [];
  return settings;
}

/** Settings for every exam in test_prep_exams that has a question bank. */
export async function getAllTestSettings(): Promise<TestModuleSettings[]> {
  const [{ data, error }, { data: exams, error: examsError }] = await Promise.all([
    supabaseAdmin.from("test_module_settings").select("*"),
    supabaseAdmin.from("test_prep_exams").select(EXAM_SELECT).order("display_order"),
  ]);
  if (error) console.warn("test_module_settings fetch error:", error.message);
  if (examsError) console.warn("test_prep_exams fetch error:", examsError.message);

  const rows = new Map(((data as SettingsRow[] | null) ?? []).map((r) => [r.exam_slug, r]));
  const settings = ((exams as ExamRow[] | null) ?? [])
    .filter((e) => QUESTION_BANK[e.slug])
    .map((e) => merge(defaultsFor(e)!, rows.get(e.slug)));

  const pools = await getQuestionPools(settings.map((s) => s.examId));
  return settings.map((s) => ({ ...s, questionPool: pools.get(s.examId) ?? [] }));
}

export async function saveTestSettings(
  settings: Pick<
    TestModuleSettings,
    | "examSlug"
    | "enabled"
    | "durationMinutes"
    | "questionsPerPaper"
    | "showAnswerReview"
    | "instructions"
    | "blueprint"
  >,
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin.from("test_module_settings").upsert(
    {
      exam_slug: settings.examSlug,
      enabled: settings.enabled,
      duration_minutes: settings.durationMinutes,
      questions_per_paper: settings.questionsPerPaper,
      show_answer_review: settings.showAnswerReview,
      instructions: settings.instructions,
      paper_blueprint: settings.blueprint,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "exam_slug" },
  );
  return { error: error?.message ?? null };
}
