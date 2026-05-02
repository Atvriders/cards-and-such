/**
 * Import / export of user data stored in localStorage.
 *
 * Supports settings (theme, light-mode, sound, card-back, animations,
 * card-font), recents, favorites, ratings, stats, and a handful of
 * minor session keys. Only recognized keys are written on import to
 * prevent malicious or unrelated data from polluting localStorage.
 */

/** Keys we round-trip via export / import. Anything not on this list is ignored. */
export const KNOWN_KEYS: readonly string[] = [
  // stats / progression
  "cards-and-such:stats:v1",
  "cards-and-such:recently-played:v1",
  "cards-best-times",
  "cards-last-played",
  "cards-ratings",
  "cards-favorites",
  "cards-lobby-filter",
  "cards-daily-completions",
  "cards-daily-streak",
  // appearance / preferences
  "cards-bg-theme",
  "cards-card-back",
  "cards-card-font",
  "cards-animations",
  "cards-light-mode",
  // sound (current + legacy)
  "cards-sound-on",
  "cards-sound-enabled",
  // ui state
  "cards-stats-panel-collapsed",
  "cards-tutorial-seen",
  "cas:lastSeenHighScoreId",
] as const;

const KNOWN_SET = new Set<string>(KNOWN_KEYS);

export const EXPORT_VERSION = 1;

export interface UserDataExport {
  version: number;
  exportedAt: string;
  app: "cards-and-such";
  data: Record<string, string>;
}

/** Build a snapshot of all recognized keys currently present in localStorage. */
export function exportAll(): UserDataExport {
  const data: Record<string, string> = {};
  if (typeof localStorage !== "undefined") {
    for (const key of KNOWN_KEYS) {
      const v = localStorage.getItem(key);
      if (v !== null) data[key] = v;
    }
  }
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: "cards-and-such",
    data,
  };
}

/** Serialize the export object to a Blob suitable for download. */
export function exportBlob(): Blob {
  return new Blob([JSON.stringify(exportAll(), null, 2)], {
    type: "application/json",
  });
}

/** Generate a filename for downloads, e.g. cards-and-such-data-2026-05-02.json. */
export function exportFilename(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `cards-and-such-data-${y}-${m}-${d}.json`;
}

export interface ImportResult {
  ok: boolean;
  written: number;
  skipped: number;
  error?: string;
}

/**
 * Restore localStorage from the given JSON payload (string or already-parsed
 * object). Only recognized keys are written; unknown / non-string entries are
 * silently skipped. Returns counts so callers can surface a status message.
 */
export function importAll(payload: string | UserDataExport | unknown): ImportResult {
  let parsed: unknown = payload;
  if (typeof payload === "string") {
    try {
      parsed = JSON.parse(payload);
    } catch {
      return { ok: false, written: 0, skipped: 0, error: "Invalid JSON" };
    }
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, written: 0, skipped: 0, error: "Not a user-data export" };
  }
  const obj = parsed as { app?: unknown; data?: unknown };
  if (obj.app !== undefined && obj.app !== "cards-and-such") {
    return { ok: false, written: 0, skipped: 0, error: "Wrong app: " + String(obj.app) };
  }
  const data = obj.data;
  if (!data || typeof data !== "object") {
    return { ok: false, written: 0, skipped: 0, error: "Missing data field" };
  }
  if (typeof localStorage === "undefined") {
    return { ok: false, written: 0, skipped: 0, error: "localStorage unavailable" };
  }
  let written = 0;
  let skipped = 0;
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (!KNOWN_SET.has(k) || typeof v !== "string") {
      skipped += 1;
      continue;
    }
    try {
      localStorage.setItem(k, v);
      written += 1;
    } catch {
      skipped += 1;
    }
  }
  return { ok: true, written, skipped };
}

/**
 * Daily streak helpers.
 *
 * Persisted under `cards-daily-streak` as JSON:
 *   { current: number, longest: number, lastDate: string, days: string[] }
 *
 * `days` is a deduped, sorted list of YYYY-MM-DD stamps the user has played.
 * It backs the 30-day heatmap on the daily page and is bounded to ~120 entries
 * so localStorage stays tiny.
 */

const DAILY_STREAK_KEY = "cards-daily-streak";
const DAILY_DAYS_LIMIT = 120;

export interface DailyStreak {
  current: number;
  longest: number;
  lastDate: string; // YYYY-MM-DD or ""
  days: string[];   // YYYY-MM-DD, sorted ascending
}

/** Parse YYYY-MM-DD into an integer day index (UTC). Returns NaN if malformed. */
function parseDayIndex(stamp: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp)) return Number.NaN;
  const t = Date.parse(`${stamp}T00:00:00Z`);
  if (Number.isNaN(t)) return Number.NaN;
  return (t / 86400000) | 0;
}

/** Read the streak record. Returns a zeroed record if missing/corrupt. */
export function getStreak(): DailyStreak {
  try {
    if (typeof localStorage === "undefined") {
      return { current: 0, longest: 0, lastDate: "", days: [] };
    }
    const raw = localStorage.getItem(DAILY_STREAK_KEY);
    if (!raw) return { current: 0, longest: 0, lastDate: "", days: [] };
    const parsed = JSON.parse(raw) as Partial<DailyStreak> & { count?: number };
    // Tolerate the legacy { lastDate, count } shape written by older builds.
    const current = typeof parsed.current === "number"
      ? parsed.current
      : (typeof parsed.count === "number" ? parsed.count : 0);
    const longest = typeof parsed.longest === "number" ? parsed.longest : current;
    const lastDate = typeof parsed.lastDate === "string" ? parsed.lastDate : "";
    const daysRaw = Array.isArray(parsed.days) ? parsed.days.filter((d) => typeof d === "string") : [];
    const days = Array.from(new Set(daysRaw)).sort();
    return { current, longest, lastDate, days };
  } catch {
    return { current: 0, longest: 0, lastDate: "", days: [] };
  }
}

/**
 * Mark `stamp` (YYYY-MM-DD) as a played day and return the updated record.
 * Idempotent within a day; bumps the streak when stamp == lastDate + 1 day.
 */
export function recordDailyPlayed(stamp: string): DailyStreak {
  const cur = getStreak();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp)) return cur;
  if (cur.lastDate === stamp) return cur;

  const today = parseDayIndex(stamp);
  const last = cur.lastDate ? parseDayIndex(cur.lastDate) : Number.NaN;
  const consecutive = !Number.isNaN(last) && today - last === 1;
  const current = consecutive ? cur.current + 1 : 1;
  const longest = Math.max(cur.longest, current);
  const days = Array.from(new Set([...cur.days, stamp])).sort();
  // Trim to the most-recent N days so the blob stays bounded.
  const trimmed = days.slice(Math.max(0, days.length - DAILY_DAYS_LIMIT));
  const next: DailyStreak = { current, longest, lastDate: stamp, days: trimmed };
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(next));
    }
  } catch { /* ignore */ }
  return next;
}

/**
 * Per-game last-played timestamps.
 *
 * Persisted under `cards-last-played` as a JSON object mapping
 * `gameId -> epoch ms`. Powers the "My Ladder" relative-time column on
 * the leaderboard and is written every time {@link recordPlayed} runs in
 * `platform/quickstart.ts`. Kept here next to the other user-data helpers
 * so the export/import round-trip in {@link KNOWN_KEYS} stays the single
 * source of truth.
 */

const LAST_PLAYED_KEY = "cards-last-played";

/** Read the full `gameId -> epoch ms` map. Returns `{}` if missing/corrupt. */
export function getLastPlayed(): Record<string, number> {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(LAST_PLAYED_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

/** Convenience: last-played epoch ms for `id`, or undefined if never played. */
export function getLastPlayedFor(id: string): number | undefined {
  const map = getLastPlayed();
  const v = map[id];
  return typeof v === "number" ? v : undefined;
}

/** Stamp `id` as played at `now` (defaults to {@link Date.now}). Best-effort. */
export function recordLastPlayed(id: string, now: number = Date.now()): void {
  if (!id) return;
  try {
    if (typeof localStorage === "undefined") return;
    const map = getLastPlayed();
    map[id] = now;
    localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(map));
  } catch {
    /* ignore — storage is best-effort */
  }
}

/* ----------------------------------------------------------------------
 * Favorites
 *
 * Persisted under `cards-favorites` as a JSON array of game ids. The
 * lobby surfaces a "Favorites" filter chip and each tile has a heart
 * toggle on hover; the same map drives both. Read shape is tolerant
 * of either an array (canonical) or `Record<string, true>` (legacy /
 * forward-compatible) so older builds round-trip cleanly.
 * -------------------------------------------------------------------- */

const FAVORITES_KEY = "cards-favorites";

/** Returns the canonical Set of favorited game ids. Empty on missing/corrupt. */
export function readFavorites(): Set<string> {
  try {
    if (typeof localStorage === "undefined") return new Set();
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x): x is string => typeof x === "string"));
    }
    if (parsed && typeof parsed === "object") {
      const out = new Set<string>();
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (v) out.add(k);
      }
      return out;
    }
    return new Set();
  } catch {
    return new Set();
  }
}

/** Convenience: is `gameId` favorited? */
export function isFavorite(gameId: string): boolean {
  return readFavorites().has(gameId);
}

/** Persist the given Set of ids as the favorites blob. Best-effort. */
function writeFavoritesSet(ids: Set<string>): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(ids).sort()));
  } catch {
    /* ignore */
  }
}

/**
 * Flip favorite status for `gameId` and return the new state. Used by
 * the lobby tile heart toggle so callers don't need to coordinate the
 * read+write themselves.
 */
export function toggleFavorite(gameId: string): boolean {
  if (!gameId) return false;
  const cur = readFavorites();
  if (cur.has(gameId)) {
    cur.delete(gameId);
    writeFavoritesSet(cur);
    return false;
  }
  cur.add(gameId);
  writeFavoritesSet(cur);
  return true;
}

/** Wipe every favorite. Used by the Settings → Data → "Reset favorites" action. */
export function clearAllFavorites(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(FAVORITES_KEY);
  } catch {
    /* ignore */
  }
}

/** Wipe every rating. Mirror of {@link clearAllFavorites} for the matching action. */
export function clearAllRatings(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem("cards-ratings");
  } catch {
    /* ignore */
  }
}

/** Trigger a browser download of the current user-data snapshot. */
export function downloadExport(now: Date = new Date()): void {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const url = URL.createObjectURL(exportBlob());
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFilename(now);
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on next tick so the click has a chance to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
