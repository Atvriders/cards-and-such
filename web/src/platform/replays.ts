/**
 * Replay storage. Holds up to REPLAY_CAP saved replays under
 * `cards-replays` in localStorage, FIFO — saving a sixth replay drops
 * the oldest. Each entry is `{ id, gameId, seed, actions, savedAt }`.
 *
 * Keep this module dependency-free so PlayPage (writer) and StatsPage
 * (reader) can share it without dragging in game-plugin types.
 */

export const REPLAYS_KEY = "cards-replays";
export const REPLAY_CAP = 5;
/** Per-game ring-buffer cap for in-memory action recording on PlayPage. */
export const REPLAY_RING_CAP = 200;

export interface SavedReplay {
  /** Stable id for React keys + data-testid suffixes. Monotonic-ish. */
  id: string;
  gameId: string;
  seed: number;
  actions: unknown[];
  /** Epoch millis when the replay was saved. */
  savedAt: number;
}

function isSavedReplay(v: unknown): v is SavedReplay {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.gameId === "string" &&
    typeof o.seed === "number" &&
    Array.isArray(o.actions) &&
    typeof o.savedAt === "number"
  );
}

/** Load all saved replays. Newest-last on disk; callers that want
 *  newest-first can `.slice().reverse()`. Returns `[]` on any I/O or
 *  parse failure. */
export function loadReplays(): SavedReplay[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(REPLAYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedReplay);
  } catch {
    return [];
  }
}

/** Persist `next` verbatim. Best-effort — quota / private-mode failures
 *  are swallowed so a denied write never breaks gameplay. */
function writeReplays(next: SavedReplay[]): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(REPLAYS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Append a new replay, capping at REPLAY_CAP (drop oldest). Returns the
 *  updated list so the caller can echo it back to UI without a re-read. */
export function saveReplay(input: {
  gameId: string;
  seed: number;
  actions: unknown[];
}): SavedReplay[] {
  const entry: SavedReplay = {
    id: `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    gameId: input.gameId,
    seed: input.seed,
    // Defensive copy so later mutations to the source ring buffer can't
    // bleed into the persisted snapshot.
    actions: input.actions.slice(),
    savedAt: Date.now(),
  };
  const cur = loadReplays();
  const appended = [...cur, entry];
  const capped =
    appended.length > REPLAY_CAP
      ? appended.slice(appended.length - REPLAY_CAP)
      : appended;
  writeReplays(capped);
  return capped;
}
