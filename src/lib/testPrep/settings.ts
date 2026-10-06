import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { QUESTION_BANK } from "./questionBank";
import type { TestModuleSettings } from "./types";

interface SettingsRow {
  exam_slug: string;
  enabled: boolean;
  duration_minutes: number;
  questions_per_paper: number;
  show_answer_review: boolean;
  instructions: string | null;
  updated_at: string | null;
}

function defaultsFor(examSlug: string): TestModuleSettings | null {
  const bank = QUESTION_BANK[examSlug];
  if (!bank) return null;
  return {
    examSlug,
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
  return {
    ...defaults,
    enabled: row.enabled,
    durationMinutes: row.duration_minutes,
    // Never ask for more questions than the bank holds.
    questionsPerPaper: Math.min(row.questions_per_paper, defaults.bankSize),
    showAnswerReview: row.show_answer_review,
    instructions: row.instructions,
    updatedAt: row.updated_at,
  };
}

/** Settings for one exam, or null if the exam has no question bank. Falls back to defaults if the DB is unavailable. */
export async function getTestSettings(examSlug: string): Promise<TestModuleSettings | null> {
  const defaults = defaultsFor(examSlug);
  if (!defaults) return null;

  const { data, error } = await supabaseAdmin
    .from("test_module_settings")
    .select("*")
    .eq("exam_slug", examSlug)
    .maybeSingle();

  if (error) console.warn("test_module_settings fetch error:", error.message);
  return merge(defaults, (data as SettingsRow | null) ?? undefined);
}

/** Settings for every exam that has a question bank. */
export async function getAllTestSettings(): Promise<TestModuleSettings[]> {
  const { data, error } = await supabaseAdmin.from("test_module_settings").select("*");
  if (error) console.warn("test_module_settings fetch error:", error.message);

  const rows = new Map(((data as SettingsRow[] | null) ?? []).map((r) => [r.exam_slug, r]));
  return Object.keys(QUESTION_BANK).map((slug) => merge(defaultsFor(slug)!, rows.get(slug)));
}

export async function saveTestSettings(
  settings: Omit<TestModuleSettings, "bankSize" | "updatedAt">,
): Promise<{ error: string | null }> {
  const { error } = await supabaseAdmin.from("test_module_settings").upsert(
    {
      exam_slug: settings.examSlug,
      enabled: settings.enabled,
      duration_minutes: settings.durationMinutes,
      questions_per_paper: settings.questionsPerPaper,
      show_answer_review: settings.showAnswerReview,
      instructions: settings.instructions,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "exam_slug" },
  );
  return { error: error?.message ?? null };
}
