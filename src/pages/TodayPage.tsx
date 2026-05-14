import { DayHeader } from "@/components/DayHeader";
import { HabitRow } from "@/components/HabitRow";
import { getChallengePhase, isDayComplete } from "@/lib/challenge";
import { useAppStore } from "@/store/useAppStore";
import { toYMD } from "@/types";

export function TodayPage() {
  const challenge = useAppStore((s) => s.challenge);
  const habits = useAppStore((s) => s.habits);
  const dailyLog = useAppStore((s) => s.dailyLog);
  const setHabitValue = useAppStore((s) => s.setHabitValue);

  const today = toYMD(new Date());
  const phase = getChallengePhase(challenge.startDate, today);
  const log = dailyLog[today];
  const complete = isDayComplete(habits, log);

  const editable = phase.phase === "active";

  return (
    <div>
      <DayHeader title={challenge.title} phase={phase} />
      {complete && editable && (
        <div
          className="mb-4 rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100"
          role="status"
        >
          Today is fully logged. Nice work.
        </div>
      )}
      {habits.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center">
          <p className="text-slate-300">No habits yet.</p>
          <p className="mt-2 text-sm text-slate-500">Add habits in Settings to start tracking.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {habits.map((h) => (
            <li key={h.id}>
              <HabitRow
                habit={h}
                value={log?.[h.id]}
                disabled={!editable}
                onChange={(v) => setHabitValue(today, h.id, v)}
              />
            </li>
          ))}
        </ul>
      )}
      {!editable && habits.length > 0 && phase.phase !== "invalid_start" && (
        <p className="mt-4 text-sm text-slate-500">
          Logging is only available on active challenge days (1–75).
        </p>
      )}
    </div>
  );
}
