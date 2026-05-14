import { Link, useParams } from "react-router-dom";
import { HabitRow } from "@/components/HabitRow";
import {
  diffCalendarDaysUtc,
  getChallengePhase,
  isDayComplete,
  listChallengeDates,
} from "@/lib/challenge";
import { useAppStore } from "@/store/useAppStore";
import { toYMD } from "@/types";

export function DayPage() {
  const { ymd } = useParams<{ ymd: string }>();
  const challenge = useAppStore((s) => s.challenge);
  const habits = useAppStore((s) => s.habits);
  const dailyLog = useAppStore((s) => s.dailyLog);
  const setHabitValue = useAppStore((s) => s.setHabitValue);

  const date = ymd ?? "";
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const today = toYMD(new Date());
  const phaseToday = getChallengePhase(challenge.startDate, today);
  const dates = valid ? listChallengeDates(challenge.startDate) : [];
  const inChallenge = valid && dates.includes(date);
  const dayIndex = inChallenge ? dates.indexOf(date) + 1 : null;
  const diff = valid ? diffCalendarDaysUtc(challenge.startDate, date) : NaN;
  const editable =
    inChallenge &&
    !Number.isNaN(diff) &&
    diff >= 0 &&
    diff < 75 &&
    date <= today;

  const log = dailyLog[date];
  const complete = isDayComplete(habits, log);

  if (!valid) {
    return (
      <p className="text-sm text-amber-300">
        Invalid date. <Link to="/history" className="underline">Back to history</Link>
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link to="/history" className="text-sm text-slate-400 hover:text-white">
          ← History
        </Link>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 ring-1 ring-white/5">
        <p className="text-sm text-slate-400">{challenge.title}</p>
        {inChallenge && dayIndex ? (
          <p className="mt-2 text-3xl font-semibold text-white">
            Day {dayIndex} <span className="text-slate-500">of 75</span>
          </p>
        ) : (
          <p className="mt-2 text-lg font-medium text-slate-200">Day log</p>
        )}
        {phaseToday.phase === "invalid_start" && (
          <p className="mt-2 text-sm text-amber-300">Your challenge start date is invalid. Fix it in Settings.</p>
        )}
      </div>
      {!inChallenge && (
        <p className="mb-4 rounded-lg border border-amber-900/50 bg-amber-950/30 p-3 text-sm text-amber-200">
          This date is outside your 75-day window for the current start date.
        </p>
      )}
      {complete && editable && (
        <div
          className="mb-4 rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100"
          role="status"
        >
          All habits satisfied for this day.
        </div>
      )}
      {habits.length === 0 ? (
        <p className="text-slate-400">No habits configured.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {habits.map((h) => (
            <li key={h.id}>
              <HabitRow
                habit={h}
                value={log?.[h.id]}
                disabled={!editable}
                onChange={(v) => setHabitValue(date, h.id, v)}
              />
            </li>
          ))}
        </ul>
      )}
      {!editable && inChallenge && date > today && (
        <p className="mt-4 text-sm text-slate-500">This day is in the future and cannot be edited yet.</p>
      )}
    </div>
  );
}
