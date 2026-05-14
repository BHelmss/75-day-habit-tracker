# 75 sustained (PWA)

Web app for a **75-day challenge** with a **custom habit list** (checkbox, numeric goals, or minutes). Data stays in **this browser** via `localStorage` unless you export a JSON backup.

## Scripts

```bash
npm install
npm run dev
```

**If you see `'vite' is not recognized` (Windows / Git Bash):** run `npm install` in this folder first so `node_modules` exists. Scripts use `npx --no-install` so npm runs the local Vite binary instead of relying on a global `vite` on your PATH.

Open the URL shown in the terminal (usually `http://localhost:5173`).

```bash
npm run build
npm run preview
```

Production build output is in `dist/` and can be hosted on any static file host.

```bash
npm test
```

Runs unit tests for date and completion logic.

## PWA

After `npm run build`, the service worker precaches the app shell. In Chrome or Edge, use the install prompt; on **iOS Safari**, use **Share → Add to Home Screen**.

## Project layout

- `src/lib/challenge.ts` — day index (1–75), completion rules, calendar helpers
- `src/store/useAppStore.ts` — Zustand store with persistence
- `src/pages/` — Today, History, Settings, and per-day log
