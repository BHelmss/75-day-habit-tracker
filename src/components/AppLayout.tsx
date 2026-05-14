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
      <header className="mb-8 border-b border-slate-800/90 pb-6">
        <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-600 bg-clip-text text-5xl font-black tabular-nums leading-none text-transparent drop-shadow-[0_0_32px_rgba(52,211,153,0.25)] sm:text-6xl">
            75
          </span>
          <span className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">sustained</span>
        </h1>
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
