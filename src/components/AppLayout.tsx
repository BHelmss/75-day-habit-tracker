import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-slate-800 text-white ring-1 ring-slate-700"
      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
  ].join(" ");

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-10 pt-6">
      <header className="mb-6 flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Install this app from the browser menu for offline use (Add to Home Screen on iOS).
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">75-day tracker</h1>
      </header>
      <nav className="mb-6 flex gap-2" aria-label="Main">
        <NavLink to="/" end className={linkClass}>
          Today
        </NavLink>
        <NavLink to="/history" className={linkClass}>
          History
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
