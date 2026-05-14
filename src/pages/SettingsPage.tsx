import { useRef, useState, type ChangeEventHandler } from "react";
import {
  SCHEMA_VERSION,
  createDefaultState,
  migrateState,
  type Habit,
  type HabitKind,
  type PersistedState,
} from "@/types";
import { useAppStore } from "@/store/useAppStore";

export function SettingsPage() {
  const challenge = useAppStore((s) => s.challenge);
  const habits = useAppStore((s) => s.habits);
  const setChallenge = useAppStore((s) => s.setChallenge);
  const addHabit = useAppStore((s) => s.addHabit);
  const updateHabit = useAppStore((s) => s.updateHabit);
  const removeHabit = useAppStore((s) => s.removeHabit);
  const moveHabit = useAppStore((s) => s.moveHabit);
  const replacePersisted = useAppStore((s) => s.replacePersisted);

  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const exportJson = () => {
    const payload: PersistedState = {
      schemaVersion: SCHEMA_VERSION,
      challenge,
      habits,
      dailyLog: useAppStore.getState().dailyLog,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `75-soft-backup-${challenge.startDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    setImportError(null);
    if (!file) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text) as unknown;
      const ok = window.confirm(
        "Replace all data on this device with the imported file? This cannot be undone.",
      );
      if (!ok) return;
      const next = migrateState(raw);
      replacePersisted(next);
    } catch {
      setImportError("Could not read that file. Make sure it is valid JSON.");
    }
  };

  const reset = () => {
    if (!window.confirm("Reset all challenge data to defaults?")) return;
    replacePersisted(createDefaultState());
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-lg font-semibold text-white">Challenge</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="block text-sm text-slate-300">
            Title
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              value={challenge.title}
              onChange={(e) => setChallenge({ title: e.target.value })}
            />
          </label>
          <label className="block text-sm text-slate-300">
            Start date
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              value={challenge.startDate}
              onChange={(e) => setChallenge({ startDate: e.target.value })}
            />
          </label>
          <p className="text-xs text-slate-500">
            Day 1 is the start date. The challenge runs for 75 consecutive calendar days.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Habits</h2>
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            onClick={() =>
              addHabit({
                name: "New habit",
                kind: "checkbox",
              })
            }
          >
            Add habit
          </button>
        </div>
        {habits.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No habits yet. Add one to begin.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {habits.map((h, idx) => (
              <li
                key={h.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                    disabled={idx === 0}
                    onClick={() => moveHabit(h.id, -1)}
                    aria-label="Move up"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                    disabled={idx === habits.length - 1}
                    onClick={() => moveHabit(h.id, 1)}
                    aria-label="Move down"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="ml-auto rounded border border-red-900/60 px-2 py-1 text-xs text-red-300 hover:bg-red-950/40"
                    onClick={() => removeHabit(h.id)}
                  >
                    Delete
                  </button>
                </div>
                <HabitEditor habit={h} onChange={(patch) => updateHabit(h.id, patch)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Backup</h2>
        <p className="mt-2 text-sm text-slate-400">
          Export a JSON file to move data between browsers or devices. Import replaces everything on this device.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
            onClick={exportJson}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
        </div>
        {importError && <p className="mt-2 text-sm text-red-300">{importError}</p>}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Danger zone</h2>
        <button
          type="button"
          className="mt-2 rounded-lg border border-red-900/60 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-950/40"
          onClick={reset}
        >
          Reset all data
        </button>
      </section>
    </div>
  );
}

function HabitEditor({
  habit,
  onChange,
}: {
  habit: Habit;
  onChange: (patch: Partial<Omit<Habit, "id">>) => void;
}) {
  const setKind = (kind: HabitKind) => {
    if (kind === "checkbox") onChange({ kind, target: undefined });
    else onChange({ kind });
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <label className="block text-sm text-slate-300">
        Name
        <input
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          value={habit.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </label>
      <fieldset>
        <legend className="text-sm text-slate-300">Type</legend>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-200">
          <label className="flex items-center gap-2">
            <input type="radio" name={`kind-${habit.id}`} checked={habit.kind === "checkbox"} onChange={() => setKind("checkbox")} />
            Checkbox
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name={`kind-${habit.id}`} checked={habit.kind === "number"} onChange={() => setKind("number")} />
            Number
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name={`kind-${habit.id}`} checked={habit.kind === "duration"} onChange={() => setKind("duration")} />
            Duration (minutes)
          </label>
        </div>
      </fieldset>
      {(habit.kind === "number" || habit.kind === "duration") && (
        <label className="block text-sm text-slate-300">
          Daily target (optional)
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            value={habit.target ?? ""}
            placeholder="Leave empty for any positive entry"
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") onChange({ target: undefined });
              else onChange({ target: Math.max(0, Number(v)) });
            }}
          />
          <span className="mt-1 block text-xs text-slate-500">
            If empty, logging any value greater than zero counts as done for that habit.
          </span>
        </label>
      )}
    </div>
  );
}
