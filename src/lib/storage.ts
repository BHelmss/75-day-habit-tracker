import type { StateStorage } from "zustand/middleware";

/** Debounced localStorage writes; flushes on `pagehide` to reduce data loss on close. */
export function createDebouncedStorage(delayMs = 250): StateStorage {
  const pending = new Map<string, string>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const flush = (name: string) => {
    const t = timers.get(name);
    if (t) clearTimeout(t);
    timers.delete(name);
    const v = pending.get(name);
    if (v !== undefined) {
      localStorage.setItem(name, v);
      pending.delete(name);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", () => {
      for (const name of [...pending.keys()]) flush(name);
    });
  }

  return {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
      pending.set(name, value);
      const existing = timers.get(name);
      if (existing) clearTimeout(existing);
      timers.set(
        name,
        setTimeout(() => {
          flush(name);
        }, delayMs),
      );
    },
    removeItem: (name) => {
      pending.delete(name);
      const t = timers.get(name);
      if (t) clearTimeout(t);
      timers.delete(name);
      localStorage.removeItem(name);
    },
  };
}
