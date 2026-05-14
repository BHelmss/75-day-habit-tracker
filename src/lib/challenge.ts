import type { DayLog, Habit, HabitValue } from "@/types";

/** UTC midnight for calendar YYYY-MM-DD (avoids DST drift in day diffs). */
export function parseYMDUtc(ymd: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return NaN;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const t = Date.UTC(y, mo, day);
  const d = new Date(t);
  if (d.getUTCFullYear() !== y || d.getUTCMonth() !== mo || d.getUTCDate() !== day) return NaN;
  return t;
}

export function diffCalendarDaysUtc(ymdA: string, ymdB: string): number {
  const a = parseYMDUtc(ymdA);
  const b = parseYMDUtc(ymdB);
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.round((b - a) / 86_400_000);
}

export type ChallengePhase =
  | { phase: "invalid_start" }
  | { phase: "upcoming"; startsInDays: number }
  | { phase: "active"; dayNumber: number; daysRemaining: number }
  | { phase: "completed"; lastDayYmd: string };

const TOTAL_DAYS = 75;

export function getChallengePhase(
  startDate: string,
  todayYmd: string,
): ChallengePhase {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(todayYmd)) {
    return { phase: "invalid_start" };
  }
  const diff = diffCalendarDaysUtc(startDate, todayYmd);
  if (Number.isNaN(diff)) return { phase: "invalid_start" };
  if (diff < 0) {
    return { phase: "upcoming", startsInDays: -diff };
  }
  const dayNumber = diff + 1;
  if (dayNumber > TOTAL_DAYS) {
    const last = addDaysUtc(startDate, TOTAL_DAYS - 1);
    return { phase: "completed", lastDayYmd: last };
  }
  return {
    phase: "active",
    dayNumber,
    daysRemaining: TOTAL_DAYS - dayNumber,
  };
}

export function addDaysUtc(startYmd: string, daysToAdd: number): string {
  const t = parseYMDUtc(startYmd);
  if (Number.isNaN(t)) return startYmd;
  const d = new Date(t + daysToAdd * 86_400_000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getYmdForChallengeDay(startDate: string, dayNumber: number): string {
  if (dayNumber < 1 || dayNumber > TOTAL_DAYS) return startDate;
  return addDaysUtc(startDate, dayNumber - 1);
}

export function habitSatisfied(habit: Habit, value: HabitValue | undefined): boolean {
  if (value === undefined) return false;
  if (habit.kind === "checkbox") {
    return value === true;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return false;
  const target = habit.target;
  if (target === undefined || target <= 0) return value > 0;
  return value >= target;
}

export function fractionComplete(habits: Habit[], log: DayLog | undefined): number {
  if (!habits.length) return 0;
  let done = 0;
  for (const h of habits) {
    if (habitSatisfied(h, log?.[h.id])) done += 1;
  }
  return done / habits.length;
}

export function isDayComplete(habits: Habit[], log: DayLog | undefined): boolean {
  if (!habits.length) return false;
  return habits.every((h) => habitSatisfied(h, log?.[h.id]));
}

export function listChallengeDates(startDate: string): string[] {
  if (Number.isNaN(parseYMDUtc(startDate))) return [];
  const out: string[] = [];
  for (let i = 0; i < TOTAL_DAYS; i += 1) {
    out.push(addDaysUtc(startDate, i));
  }
  return out;
}
