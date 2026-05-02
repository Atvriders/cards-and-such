import { GAMES } from "../games/registry.js";
import { readRatings } from "./StarRating.js";

/**
 * Quick Start picker.
 *
 * Picks a game id to launch via the AppShell "Quick Start" button. The
 * pool is drawn from the user's "favorites" — games they've actually
 * engaged with — using one of three strategies chosen at random:
 *
 *   1. most-recently-played   — pulls from {@link readRecentlyPlayed}.
 *   2. highest-rated          — pulls from {@link readRatings} (top score).
 *   3. random favorite        — uniform pick from the union of (1) and (2).
 *
 * If the user has no favorites yet, falls back to a random featured game
 * (mirrors the lobby's hand-curated FEATURED_IDS list).
 */

const RECENT_KEY = "cards-and-such:recently-played:v1";
const RECENT_LIMIT = 12;

/** Subset of FEATURED_IDS from LobbyPage; kept here to avoid a cycle. */
const FEATURED_FALLBACK_IDS = [
  "klondike",
  "freecell",
  "spider",
  "holdem",
  "game-of-life",
  "wordle-mini",
] as const;

export type QuickstartStrategy = "recent" | "top-rated" | "random-favorite";

export interface QuickstartPick {
  gameId: string;
  strategy: QuickstartStrategy | "featured-fallback";
}

/** Return the list of game ids the user has played, newest first. */
export function readRecentlyPlayed(): string[] {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

/** Record a game id at the head of the recently-played list. */
export function recordPlayed(gameId: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (!gameId) return;
    const prev = readRecentlyPlayed().filter((g) => g !== gameId);
    const next = [gameId, ...prev].slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore — storage is best-effort */
  }
}

/** Game ids known to the registry (filters out stale ids in localStorage). */
function knownIds(): Set<string> {
  return new Set(GAMES.filter((g) => g != null).map((g) => g.id));
}

/** Highest-rated game ids (5 first, then 4, etc.); ties keep insertion order. */
function topRatedIds(): string[] {
  const ratings = readRatings();
  const known = knownIds();
  return Object.entries(ratings)
    .filter(([id, v]) => known.has(id) && typeof v === "number" && v >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

function pickOne<T>(arr: readonly T[], rng: () => number = Math.random): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(rng() * arr.length)] ?? null;
}

/**
 * Pick a Quick Start target.
 *
 * @param rng injectable RNG for deterministic tests; defaults to Math.random
 */
export function pickQuickstart(rng: () => number = Math.random): QuickstartPick | null {
  const known = knownIds();
  const recent = readRecentlyPlayed().filter((id) => known.has(id));
  const rated = topRatedIds();

  // Build the pool of "favorites" — anything the user has touched.
  const favSet = new Set<string>([...recent, ...rated]);

  if (favSet.size === 0) {
    const fallbackPool = FEATURED_FALLBACK_IDS.filter((id) => known.has(id));
    const pick = pickOne(fallbackPool, rng);
    if (pick) return { gameId: pick, strategy: "featured-fallback" };
    // Last-ditch: any registered game.
    const anyPick = pickOne(Array.from(known), rng);
    return anyPick ? { gameId: anyPick, strategy: "featured-fallback" } : null;
  }

  // Pick one of three strategies at random.
  const strategies: QuickstartStrategy[] = ["recent", "top-rated", "random-favorite"];
  const strategy = strategies[Math.floor(rng() * strategies.length)] ?? "random-favorite";

  if (strategy === "recent" && recent.length > 0) {
    return { gameId: recent[0]!, strategy };
  }
  if (strategy === "top-rated" && rated.length > 0) {
    return { gameId: rated[0]!, strategy };
  }
  // random-favorite (or fallback when the chosen strategy has no data).
  const pick = pickOne(Array.from(favSet), rng);
  return pick ? { gameId: pick, strategy: "random-favorite" } : null;
}
