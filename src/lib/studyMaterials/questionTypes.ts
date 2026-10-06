/** Client-safe types and default prompts for AI question extraction. */

export type ExtractionMode = "extract" | "generate";
export type QuestionType = "mcq" | "true_false" | "fill_blank" | "short_answer" | "long_answer";
export type QuestionStatus = "draft" | "approved" | "rejected";
export type Difficulty = "easy" | "medium" | "hard";

export const QUESTION_TYPES: QuestionType[] = ["mcq", "true_false", "fill_blank", "short_answer", "long_answer"];
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: "Multiple choice",
  true_false: "True / False",
  fill_blank: "Fill in the blank",
  short_answer: "Short answer",
  long_answer: "Long answer",
};
export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export interface MaterialQuestion {
  id: string;
  material_id: string;
  run_id: string | null;
  exam_slug: string | null;
  program_slug: string | null;
  specialisation_slug: string | null;
  subject: string | null;
  topic: string | null;
  question_type: QuestionType;
  question: string;
  options: string[];
  answer: string | null;
  explanation: string | null;
  difficulty: Difficulty | null;
  source_page: number | null;
  origin: ExtractionMode;
  status: QuestionStatus;
  created_at: string;
  updated_at: string;
  material?: { title: string } | null;
}

export interface ExtractionRun {
  id: string;
  material_id: string;
  mode: ExtractionMode;
  prompt: string;
  page_from: number;
  page_to: number;
  next_page: number;
  status: "running" | "completed" | "failed";
  questions_found: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  material?: { title: string } | null;
}

/** Pages of material text sent to the LLM per request. */
export const EXTRACTION_PAGES_PER_CHUNK = 10;

export const DEFAULT_PROMPTS: Record<ExtractionMode, string> = {
  extract:
    "You are building a question bank from a study material. Extract every practice, exercise or exam-style question that appears in the text, exactly as written, together with its answer options (for multiple choice) and the correct answer.\n\n- If the answer or an answer key appears in the text, use it.\n- If the answer is not in the text, leave the answer empty — do not guess.\n- Include the material's explanation or worked solution when one is given.\n- Do not invent new questions.",
  generate:
    "You are an expert tutor building an exam-preparation question bank. Using ONLY facts stated in the text, write high-quality exam-style questions with correct answers and a one-line explanation.\n\n- Prefer multiple-choice questions with 4 options and exactly one correct answer.\n- Cover the key concepts, definitions, rules and numbers in the text.\n- Mix easy, medium and hard questions.\n- Avoid trivial, duplicate or ambiguous questions.\n- Do not use information that is not in the text.",
};
