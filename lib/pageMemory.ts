// Remembers which page is open, for this browser tab only (sessionStorage),
// so reloading lands on the same page instead of the start screen. A new tab
// or a later visit still begins at the start (Marco, 2026-10-13).

export function readPage<T>(key: string): Partial<T> | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}

export function writePage(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: a reload then simply starts at the start.
  }
}
