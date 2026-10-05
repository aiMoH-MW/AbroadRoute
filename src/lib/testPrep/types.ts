/**
 * Client-safe types for the online mock test flow.
 * Answer keys live only in the server-side question bank (see questionBank.ts).
 */

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
  review: QuestionReview[];
}
