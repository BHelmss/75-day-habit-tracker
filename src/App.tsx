import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { DayPage } from "@/pages/DayPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TodayPage } from "@/pages/TodayPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="day/:ymd" element={<DayPage />} />
      </Route>
    </Routes>
  );
}
