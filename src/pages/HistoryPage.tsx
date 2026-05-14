import { HistoryGrid } from "@/components/HistoryGrid";
import { useAppStore } from "@/store/useAppStore";

export function HistoryPage() {
  const challenge = useAppStore((s) => s.challenge);
  const habits = useAppStore((s) => s.habits);
  const dailyLog = useAppStore((s) => s.dailyLog);

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-white">History</h2>
      <p className="mb-4 text-sm text-slate-400">
        Tap a day to view or edit entries. Future days are locked until their date.
      </p>
      <HistoryGrid startDate={challenge.startDate} habits={habits} dailyLog={dailyLog} />
    </div>
  );
}
