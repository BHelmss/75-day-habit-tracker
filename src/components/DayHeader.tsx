import type { ChallengePhase } from "@/lib/challenge";

type Props = {
  title: string;
  phase: ChallengePhase;
};

export function DayHeader({ title, phase }: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm ring-1 ring-white/5">
      <p className="text-sm text-slate-400">{title}</p>
      {phase.phase === "invalid_start" && (
        <p className="mt-2 text-lg font-medium text-amber-300">Set a valid start date in Settings.</p>
      )}
      {phase.phase === "upcoming" && (
        <div className="mt-2">
          <p className="text-3xl font-semibold text-white">Starting soon</p>
          <p className="mt-1 text-slate-400">
            {phase.startsInDays} day{phase.startsInDays === 1 ? "" : "s"} until day 1.
          </p>
        </div>
      )}
      {phase.phase === "active" && (
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <p className="text-4xl font-semibold tabular-nums text-white">Day {phase.dayNumber}</p>
          <p className="pb-1 text-slate-400">of 75</p>
          <span className="ml-auto rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            {phase.daysRemaining} left
          </span>
        </div>
      )}
      {phase.phase === "completed" && (
        <div className="mt-2">
          <p className="text-3xl font-semibold text-emerald-400">Challenge complete</p>
          <p className="mt-1 text-slate-400">Last tracked day: {phase.lastDayYmd}</p>
        </div>
      )}
    </div>
  );
}
