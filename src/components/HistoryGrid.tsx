import { Link } from "react-router-dom";
import { fractionComplete, isDayComplete, listChallengeDates } from "@/lib/challenge";
import { toYMD, type Habit } from "@/types";

type Props = {
  startDate: string;
  habits: Habit[];
  dailyLog: Record<string, Record<string, unknown>>;
};

export function HistoryGrid({ startDate, habits, dailyLog }: Props) {
  const today = toYMD(new Date());
  let dates: string[] = [];
  try {
    dates = listChallengeDates(startDate);
  } catch {
    dates = [];
  }

  if (dates.length !== 75) {
    return (
      <p className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 text-sm text-amber-200">
        Fix your start date in Settings to see the 75-day grid.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8" aria-label="Challenge days">
      {dates.map((ymd, idx) => {
        const log = dailyLog[ymd] as Record<string, unknown> | undefined;
        const frac = fractionComplete(habits, log as never);
        const done = isDayComplete(habits, log as never);
        const isFuture = ymd > today;
        const pct = Math.round(frac * 100);
        const cell = (
          <>
            <span className="font-semibold tabular-nums">{idx + 1}</span>
            {!isFuture && habits.length > 0 && (
              <span className="mt-0.5 text-[10px] text-slate-500">{pct}%</span>
            )}
          </>
        );
        return (
          <li key={ymd}>
            {isFuture ? (
              <div
                className="flex aspect-square flex-col items-center justify-center rounded-lg border border-slate-800/80 bg-slate-950/40 text-center text-xs text-slate-600"
                aria-label={`Day ${idx + 1} ${ymd}, upcoming`}
              >
                {cell}
              </div>
            ) : (
              <Link
                to={`/day/${ymd}`}
                className={[
                  "flex aspect-square flex-col items-center justify-center rounded-lg border text-center text-xs transition-colors",
                  done
                    ? "border-emerald-800 bg-emerald-950/40 text-emerald-100 hover:border-emerald-600"
                    : "border-slate-800 bg-slate-900/50 text-slate-200 hover:border-slate-600",
                ].join(" ")}
                aria-label={`Day ${idx + 1} ${ymd}`}
              >
                {cell}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
