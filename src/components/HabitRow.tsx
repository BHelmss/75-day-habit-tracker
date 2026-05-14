import type { Habit, HabitValue } from "@/types";
import { habitSatisfied } from "@/lib/challenge";

type Props = {
  habit: Habit;
  value: HabitValue | undefined;
  disabled?: boolean;
  onChange: (value: HabitValue) => void;
};

export function HabitRow({ habit, value, disabled, onChange }: Props) {
  const ok = habitSatisfied(habit, value);

  return (
    <div
      className={[
        "rounded-xl border p-4 transition-colors",
        ok ? "border-emerald-900/60 bg-emerald-950/30" : "border-slate-800 bg-slate-900/40",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{habit.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {habit.kind === "checkbox" && "Checkbox"}
            {habit.kind === "number" &&
              (habit.target != null ? `Number (goal ${habit.target})` : "Number (any amount > 0)")}
            {habit.kind === "duration" &&
              (habit.target != null ? `Minutes (goal ${habit.target})` : "Minutes (> 0)")}
          </p>
        </div>
        {ok && (
          <span className="shrink-0 rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs font-medium text-emerald-200">
            Done
          </span>
        )}
      </div>
      <div className="mt-3">
        {habit.kind === "checkbox" && (
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
            <input
              type="checkbox"
              className="size-5 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
              checked={value === true}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
            />
            Mark complete
          </label>
        )}
        {habit.kind === "number" && (
          <label className="block text-sm text-slate-300">
            <span className="sr-only">{habit.name}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              value={typeof value === "number" ? value : ""}
              placeholder="0"
              disabled={disabled}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") onChange(0);
                else onChange(Number(v));
              }}
            />
          </label>
        )}
        {habit.kind === "duration" && (
          <label className="block text-sm text-slate-300">
            <span className="sr-only">{habit.name} minutes</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              value={typeof value === "number" ? value : ""}
              placeholder="0"
              disabled={disabled}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") onChange(0);
                else onChange(Number(v));
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
