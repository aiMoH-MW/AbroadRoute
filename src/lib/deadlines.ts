import { ApplicationDeadline, DeadlineMilestone, DeadlineType } from "@/types";

export const DEADLINE_TYPES: { value: DeadlineType; label: string }[] = [
  { value: "application", label: "Application" },
  { value: "scholarship", label: "Scholarship" },
  { value: "documents", label: "Documents" },
  { value: "deposit", label: "Deposit" },
  { value: "visa", label: "Visa" },
];

export const deadlineTypeLabel = (type: DeadlineType) =>
  DEADLINE_TYPES.find((t) => t.value === type)?.label ?? type;

// A YYYY-MM-DD column value as a local date (no timezone shift)
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateOnly(value: string): string {
  return parseDateOnly(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Whole days from today to the date; negative once it has passed
export function daysUntil(value: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (parseDateOnly(value).getTime() - today.getTime()) / 86_400_000,
  );
}

// The date `days` before a YYYY-MM-DD date, as YYYY-MM-DD
export function shiftDateOnly(value: string, days: number): string {
  const date = parseDateOnly(value);
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "T-90 Days", "T-1 Day", "Deadline Day"
export const milestoneOffsetLabel = (daysBefore: number) =>
  daysBefore === 0
    ? "Deadline Day"
    : `T-${daysBefore} ${daysBefore === 1 ? "Day" : "Days"}`;

// Milestones for a deadline, furthest first: the most specific matching set
// (country + type, then country, then type, then the general one).
export function milestonesFor(
  milestones: DeadlineMilestone[],
  deadline: ApplicationDeadline,
): DeadlineMilestone[] {
  const matching = milestones.filter(
    (m) =>
      (m.countryId === null || m.countryId === deadline.countryId) &&
      (m.deadlineType === null || m.deadlineType === deadline.deadlineType),
  );
  const specificity = (m: DeadlineMilestone) =>
    (m.countryId ? 2 : 0) + (m.deadlineType ? 1 : 0);
  const best = Math.max(-1, ...matching.map(specificity));
  return matching
    .filter((m) => specificity(m) === best)
    .sort((a, b) => b.daysBefore - a.daysBefore);
}
