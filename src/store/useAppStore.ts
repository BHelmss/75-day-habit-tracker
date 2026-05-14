import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createDebouncedStorage } from "@/lib/storage";
import {
  SCHEMA_VERSION,
  createDefaultState,
  migrateState,
  type ChallengeConfig,
  type DayLog,
  type Habit,
  type HabitValue,
  type PersistedState,
} from "@/types";

function newId(): string {
  return crypto.randomUUID();
}

export type AppStore = PersistedState & {
  setChallenge: (patch: Partial<ChallengeConfig>) => void;
  setHabits: (habits: Habit[]) => void;
  addHabit: (input: Omit<Habit, "id"> & { id?: string }) => void;
  updateHabit: (id: string, patch: Partial<Omit<Habit, "id">>) => void;
  removeHabit: (id: string) => void;
  moveHabit: (id: string, dir: -1 | 1) => void;
  setHabitValue: (ymd: string, habitId: string, value: HabitValue) => void;
  replacePersisted: (next: PersistedState) => void;
};

const debounced = createDebouncedStorage(250);
const jsonStorage = createJSONStorage(() => debounced);

const base = createDefaultState();

export const useAppStore = create<AppStore>()(
  persist(
    (set, _get) => ({
      ...base,
      setChallenge: (patch) =>
        set((s) => ({
          challenge: { ...s.challenge, ...patch },
        })),
      setHabits: (habits) => set({ habits }),
      addHabit: (input) =>
        set((s) => ({
          habits: [
            ...s.habits,
            {
              id: input.id ?? newId(),
              name: input.name,
              kind: input.kind,
              target: input.target,
            },
          ],
        })),
      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      removeHabit: (id) =>
        set((s) => {
          const habits = s.habits.filter((h) => h.id !== id);
          const dailyLog: Record<string, DayLog> = {};
          for (const [d, log] of Object.entries(s.dailyLog)) {
            const { [id]: _, ...rest } = log;
            if (Object.keys(rest).length) dailyLog[d] = rest;
          }
          return { habits, dailyLog };
        }),
      moveHabit: (id, dir) =>
        set((s) => {
          const idx = s.habits.findIndex((h) => h.id === id);
          if (idx < 0) return s;
          const j = idx + dir;
          if (j < 0 || j >= s.habits.length) return s;
          const habits = [...s.habits];
          const [h] = habits.splice(idx, 1);
          habits.splice(j, 0, h);
          return { habits };
        }),
      setHabitValue: (ymd, habitId, value) =>
        set((s) => {
          const prev = s.dailyLog[ymd] ?? {};
          const nextLog: DayLog = { ...prev, [habitId]: value };
          const cleaned: DayLog = { ...nextLog };
          const habit = s.habits.find((h) => h.id === habitId);
          if (habit?.kind === "checkbox" && value === false) {
            delete cleaned[habitId];
          }
          if (
            habit?.kind === "number" &&
            typeof value === "number" &&
            value === 0 &&
            habit.target === undefined
          ) {
            delete cleaned[habitId];
          }
          if (
            habit?.kind === "duration" &&
            typeof value === "number" &&
            value === 0 &&
            habit.target === undefined
          ) {
            delete cleaned[habitId];
          }
          const dailyLog = { ...s.dailyLog };
          if (Object.keys(cleaned).length === 0) {
            delete dailyLog[ymd];
          } else {
            dailyLog[ymd] = cleaned;
          }
          return { dailyLog };
        }),
      replacePersisted: (next) =>
        set((s) => ({
          ...s,
          ...migrateState(next),
        })),
    }),
    {
      name: "75-soft-tracker",
      storage: jsonStorage,
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        challenge: s.challenge,
        habits: s.habits,
        dailyLog: s.dailyLog,
      }),
      merge: (persisted, current) => {
        const c = current as AppStore;
        const p = persisted as Partial<PersistedState> | undefined;
        if (!p || typeof p !== "object") return c;
        const merged = migrateState({
          schemaVersion: SCHEMA_VERSION,
          challenge: (p.challenge as ChallengeConfig) ?? c.challenge,
          habits: (p.habits as Habit[]) ?? c.habits,
          dailyLog: (p.dailyLog as Record<string, DayLog>) ?? c.dailyLog,
        });
        return { ...c, ...merged };
      },
    },
  ),
);
