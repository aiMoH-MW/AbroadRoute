import "server-only";
import { QUESTION_BANK, BankQuestion } from "./questionBank";
import type { GeneratedPaper, SectionScore, TestResult } from "./types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks a random set of questions from the exam's bank, then restores bank order
 * so questions stay grouped by section and passage. Answer keys are stripped.
 */
export function generatePaper(examSlug: string): GeneratedPaper | null {
  const bank = QUESTION_BANK[examSlug];
  if (!bank) return null;

  const order = new Map(bank.questions.map((q, i) => [q.id, i]));
  const picked = shuffle(bank.questions)
    .slice(0, bank.questionsPerPaper)
    .sort((a, b) => order.get(a.id)! - order.get(b.id)!);

  return {
    examSlug,
    durationMinutes: bank.durationMinutes,
    questions: picked.map(({ id, section, passage, prompt, options }) => ({
      id,
      section,
      passage,
      prompt,
      options,
    })),
  };
}

/**
 * Scores submitted answers. Returns null if the exam is unknown, or if any
 * question id is repeated or does not belong to that exam's bank.
 */
export function gradePaper(
  examSlug: string,
  answers: { questionId: string; selectedIndex: number | null }[],
): TestResult | null {
  const bank = QUESTION_BANK[examSlug];
  if (!bank) return null;

  const byId = new Map<string, BankQuestion>(bank.questions.map((q) => [q.id, q]));
  const ids = answers.map((a) => a.questionId);
  if (ids.some((id) => !byId.has(id)) || new Set(ids).size !== ids.length) return null;

  const sectionMap = new Map<string, SectionScore>();
  const review = answers.map(({ questionId, selectedIndex }) => {
    const q = byId.get(questionId)!;
    const isCorrect = selectedIndex === q.answerIndex;

    const score = sectionMap.get(q.section) ?? { section: q.section, correct: 0, total: 0 };
    score.total += 1;
    if (isCorrect) score.correct += 1;
    sectionMap.set(q.section, score);

    return {
      id: q.id,
      section: q.section,
      prompt: q.prompt,
      options: q.options,
      selectedIndex,
      answerIndex: q.answerIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const correct = review.filter((r) => r.isCorrect).length;
  const total = review.length;

  return {
    correct,
    total,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
    sections: Array.from(sectionMap.values()),
    review,
  };
}
