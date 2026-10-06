/**
 * Client-safe types for the online mock test flow.
 * Answer keys live only in the server-side question bank (see questionBank.ts).
 */

import type { Difficulty, QuestionType } from "@/lib/studyMaterials/questionTypes";

/** Difficulty wanted for one sub-question; "any" accepts any approved question. */
export type BlueprintDifficulty = Difficulty | "any";

export interface PaperBlueprintItem {
  marks: number;
  difficulty: BlueprintDifficulty;
}

/** One numbered question on the paper (e.g. "Q1. Answer the following") with its sub-questions. */
export interface PaperBlueprintGroup {
  /** Client-generated id, stable while editing. */
  id: string;
  title: string;
  instructions: string | null;
  /** test_prep_sections.id to draw from, or null for any section of the exam. */
  sectionId: string | null;
  questionType: QuestionType;
  items: PaperBlueprintItem[];
}

/** Number of approved Q&A-bank questions for one section / type / difficulty combination. */
export interface QuestionPoolCount {
  sectionId: string | null;
  questionType: QuestionType;
  difficulty: Difficulty | null;
  count: number;
}

export interface TestModuleSettings {
  examSlug: string;
  /** Display name from test_prep_exams. */
  examName: string;
  /** test_prep_exams.id */
  examId: string;
  sections: { id: string; name: string }[];
  /** Paper format; empty means "pick questionsPerPaper random questions" (legacy behaviour). */
  blueprint: PaperBlueprintGroup[];
  /** Approved questions available for this exam, used to check the blueprint can be filled. */
  questionPool: QuestionPoolCount[];
  enabled: boolean;
  durationMinutes: number;
  questionsPerPaper: number;
  showAnswerReview: boolean;
  instructions: string | null;
  /** Number of questions available in the bank (read-only). */
  bankSize: number;
  updatedAt: string | null;
}

export interface PaperQuestion {
  id: string;
  section: string;
  passage?: string;
  prompt: string;
  options: string[];
}

export interface GeneratedPaper {
  examSlug: string;
  durationMinutes: number;
  questions: PaperQuestion[];
}

export interface QuestionReview {
  id: string;
  section: string;
  prompt: string;
  options: string[];
  selectedIndex: number | null;
  answerIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface SectionScore {
  section: string;
  correct: number;
  total: number;
}

export interface TestResult {
  correct: number;
  total: number;
  percentage: number;
  sections: SectionScore[];
  /** Omitted when the admin has turned off the answer review for this exam. */
  review?: QuestionReview[];
}
