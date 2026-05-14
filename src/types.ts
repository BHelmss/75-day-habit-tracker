export const SCHEMA_VERSION = 1 as const;

export type HabitKind = "checkbox" | "number" | "duration";

export type Habit = {
  id: string;
  name: string;
  kind: HabitKind;
  /** For `number`: daily target value. For `duration`: target minutes. */
  target?: number;
};

/** Stored value per habit for a day: checkbox uses boolean; number/duration use number. */
export type HabitValue = boolean | number;

export type DayLog = Record<string, HabitValue>;

export type ChallengeConfig = {
  title: string;
  /** Local calendar date YYYY-MM-DD */
  startDate: string;
};

export type PersistedState = {
  schemaVersion: typeof SCHEMA_VERSION;
  challenge: ChallengeConfig;
  habits: Habit[];
  dailyLog: Record<string, DayLog>;
};

export function createDefaultState(): PersistedState {
  const startDate = toYMD(new Date());
  return {
    schemaVersion: SCHEMA_VERSION,
    challenge: {
      title: "My 75-day challenge",
      startDate,
    },
    habits: [],
    dailyLog: {},
  };
}

export function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function migrateState(raw: unknown): PersistedState {
  if (!raw || typeof raw !== "object") return createDefaultState();
  const o = raw as Record<string, unknown>;
  const version = typeof o.schemaVersion === "number" ? o.schemaVersion : 1;
  if (version !== SCHEMA_VERSION) {
    return createDefaultState();
  }
  const challenge = o.challenge as ChallengeConfig | undefined;
  const habits = o.habits as Habit[] | undefined;
  const dailyLog = o.dailyLog as Record<string, DayLog> | undefined;
  if (
    !challenge ||
    typeof challenge.title !== "string" ||
    typeof challenge.startDate !== "string" ||
    !Array.isArray(habits) ||
    typeof dailyLog !== "object" ||
    dailyLog === null
  ) {
    return createDefaultState();
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    challenge: {
      title: challenge.title,
      startDate: challenge.startDate,
    },
    habits: habits.filter(isValidHabit),
    dailyLog: sanitizeDailyLog(dailyLog, habits.filter(isValidHabit)),
  };
}

function isValidHabit(h: unknown): h is Habit {
  if (!h || typeof h !== "object") return false;
  const x = h as Habit;
  return (
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    (x.kind === "checkbox" || x.kind === "number" || x.kind === "duration") &&
    (x.target === undefined || (typeof x.target === "number" && x.target >= 0))
  );
}

function sanitizeDailyLog(
  log: Record<string, DayLog>,
  habits: Habit[],
): Record<string, DayLog> {
  const habitIds = new Set(habits.map((h) => h.id));
  const next: Record<string, DayLog> = {};
  for (const [date, day] of Object.entries(log)) {
    if (typeof day !== "object" || day === null) continue;
    const row: DayLog = {};
    for (const [hid, val] of Object.entries(day)) {
      if (!habitIds.has(hid)) continue;
      const habit = habits.find((h) => h.id === hid);
      if (!habit) continue;
      if (habit.kind === "checkbox" && typeof val === "boolean") {
        row[hid] = val;
      } else if (
        (habit.kind === "number" || habit.kind === "duration") &&
        typeof val === "number" &&
        Number.isFinite(val) &&
        val >= 0
      ) {
        row[hid] = val;
      }
    }
    if (Object.keys(row).length) next[date] = row;
  }
  return next;
}
