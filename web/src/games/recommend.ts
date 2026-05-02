/**
 * Personalized lobby recommendations.
 *
 * Given the user's stats (per-game play counts), favorites set, ratings
 * map, and the full game catalogue, pick up to 6 games to surface in the
 * "Recommended for you" strip on the lobby.
 *
 * Heuristic (in order — earlier picks fall through to "any" filler if
 * their slot can't be filled cleanly so the strip always renders 6 when
 * the catalogue is large enough):
 *
 *   1. One game from the same category as the most-played game,
 *      excluding the user's top-played 5.
 *   2. One game the user rated >=4 that has NOT been played in the last
 *      7 days (rediscovery slot).
 *   3. One game from a category the user has not tried (or has tried
 *      least).
 *   4. Two games from the *family* of the most-played game (variants).
 *      "Family" here means the id prefix share — `klondike-*`, etc.
 *   5. One random surprise from any category.
 *
 * The user's most-played 5 games are always filtered out so the strip
 * never reduces to "the things you obviously already play."
 *
 * The function is fully pure: it consumes raw inputs and returns an
 * array. Storage reads happen at the call-site (LobbyPage). This makes
 * unit testing trivial — no mocks of localStorage required.
 */

import type { GamePlugin } from "../platform/game-plugin/types.js";

/** Read from `loadStats()` — only the fields we actually need. */
export interface RecommendStats {
  perGame: Record<string, { played: number; wins: number; best: number }>;
  perCategory: Record<string, number>;
}

/** Optional extra signal: per-game last-played epoch ms map. When supplied,
 *  the "rediscovery" slot uses it to filter out games played in the last 7
 *  days. Absent → that filter is a no-op. */
export interface RecommendOptions {
  lastPlayed?: Record<string, number>;
  /** Override for unit tests so the random surprise stays stable. */
  rng?: () => number;
  /** Override for unit tests so the 7-day cutoff is deterministic. */
  now?: number;
}

const TARGET_COUNT = 6;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TOP_PLAYED_EXCLUDE = 5;
const MIN_RATING = 4;

/**
 * Heuristic family detector — two ids belong to the same family when one
 * is a prefix of the other separated by `-` or `_`. Mirrors the helper
 * inside `stats.ts` (`familyStats`) but keeps `recommend.ts` standalone.
 */
function isFamilyMember(id: string, anchor: string): boolean {
  if (!anchor) return false;
  if (id === anchor) return true;
  // Anchor as a strict prefix — split on the canonical id separator.
  return id.startsWith(`${anchor}-`) || id.startsWith(`${anchor}_`);
}

/** Sorted ids by play count desc. Tie-break alphabetically for determinism. */
function topPlayedIds(perGame: RecommendStats["perGame"]): string[] {
  const entries = Object.entries(perGame ?? {});
  entries.sort((a, b) => {
    const da = a[1]?.played ?? 0;
    const db = b[1]?.played ?? 0;
    if (db !== da) return db - da;
    return a[0].localeCompare(b[0]);
  });
  return entries.map((e) => e[0]);
}

/** Pick the user's "anchor" game id — the most played one. `null` if none. */
function mostPlayedId(perGame: RecommendStats["perGame"]): string | null {
  const sorted = topPlayedIds(perGame);
  return sorted.length > 0 ? sorted[0]! : null;
}

/**
 * Lowest-cost categorical complement: among the five categories, return
 * the one the user has tried *least* (zero plays first, then minimum).
 * Falls back to the first category in `all` if nothing matches.
 */
function leastTriedCategory(
  perCategory: RecommendStats["perCategory"],
  all: GamePlugin[],
): string | null {
  const seen = new Set<string>();
  for (const g of all) seen.add(g.category);
  if (seen.size === 0) return null;
  let bestCat: string | null = null;
  let bestCount = Number.POSITIVE_INFINITY;
  for (const cat of seen) {
    const c = perCategory[cat] ?? 0;
    if (c < bestCount) {
      bestCount = c;
      bestCat = cat;
    }
  }
  return bestCat;
}

/**
 * Pick the first eligible game from `pool` that hasn't already been
 * chosen. Optionally filter by predicate; if no match, returns null.
 */
function pickFirst(
  pool: GamePlugin[],
  chosen: Set<string>,
  pred?: (g: GamePlugin) => boolean,
): GamePlugin | null {
  for (const g of pool) {
    if (chosen.has(g.id)) continue;
    if (pred && !pred(g)) continue;
    return g;
  }
  return null;
}

/**
 * Stable, lightweight shuffle. Uses Fisher–Yates seeded with the
 * supplied RNG (defaults to Math.random). Mutates a copy so the caller's
 * array is untouched.
 */
function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

/**
 * Compute up to 6 recommendations tailored to the user's history. See the
 * file-level doc comment for the heuristic. Always returns at most 6
 * games; may return fewer when the catalogue itself can't supply more.
 *
 * @param stats     per-game / per-category aggregates from loadStats()
 * @param favorites set of favorite game ids (currently used as a tie-
 *                  breaker / category hint — kept in the signature for
 *                  forward compatibility with future favourite-aware
 *                  ranking)
 * @param ratings   user's per-game star rating (1..5)
 * @param all       full GamePlugin catalogue (post-null-filtering)
 */
export function getRecommendations(
  stats: RecommendStats,
  favorites: ReadonlySet<string> | Set<string>,
  ratings: Record<string, number>,
  all: readonly GamePlugin[],
  opts: RecommendOptions = {},
): GamePlugin[] {
  const safeAll = all.filter((g): g is GamePlugin => g != null);
  if (safeAll.length === 0) return [];

  const rng = opts.rng ?? Math.random;
  const now = opts.now ?? Date.now();
  const lastPlayed = opts.lastPlayed ?? {};

  // ---- Excluded set: top-5 most played + already-chosen ------------------
  const sortedPlayed = topPlayedIds(stats.perGame ?? {});
  const topPlayedSet = new Set(sortedPlayed.slice(0, TOP_PLAYED_EXCLUDE));
  const chosen = new Set<string>();
  const out: GamePlugin[] = [];

  function take(g: GamePlugin | null): boolean {
    if (!g) return false;
    if (chosen.has(g.id)) return false;
    chosen.add(g.id);
    out.push(g);
    return true;
  }

  /** Filter helper: skip top-played and skip anything already chosen. */
  function eligible(g: GamePlugin): boolean {
    return !topPlayedSet.has(g.id) && !chosen.has(g.id);
  }

  // Catalogue shuffled once — used by every "random from pool" slot.
  const shuffled = shuffle(safeAll, rng);
  const anchorId = mostPlayedId(stats.perGame ?? {});
  const anchorGame = anchorId ? safeAll.find((g) => g.id === anchorId) ?? null : null;

  // ---- Slot 1: same category as most-played -----------------------------
  if (anchorGame) {
    const sameCat = shuffled.filter(
      (g) => g.category === anchorGame.category && eligible(g) && g.id !== anchorGame.id,
    );
    take(pickFirst(sameCat, chosen));
  }

  // ---- Slot 2: highly-rated, NOT played in last 7 days ------------------
  const ratedHigh = Object.entries(ratings)
    .filter(([, v]) => typeof v === "number" && v >= MIN_RATING)
    .map(([id]) => id);
  if (ratedHigh.length > 0) {
    const pool: GamePlugin[] = [];
    for (const id of shuffle(ratedHigh, rng)) {
      const g = safeAll.find((x) => x.id === id);
      if (!g) continue;
      const lp = lastPlayed[id];
      const recent = typeof lp === "number" && now - lp < SEVEN_DAYS_MS;
      if (recent) continue;
      if (!eligible(g)) continue;
      pool.push(g);
    }
    take(pickFirst(pool, chosen));
  }

  // ---- Slot 3: a category the user hasn't tried (or tried least) --------
  const coldCategory = leastTriedCategory(stats.perCategory ?? {}, safeAll);
  if (coldCategory) {
    const pool = shuffled.filter(
      (g) => g.category === coldCategory && eligible(g),
    );
    take(pickFirst(pool, chosen));
  }

  // ---- Slot 4 + 5: two random variants from the most-played's family ----
  if (anchorId) {
    const familyPool = shuffled.filter(
      (g) => isFamilyMember(g.id, anchorId) && eligible(g) && g.id !== anchorId,
    );
    take(pickFirst(familyPool, chosen));
    take(pickFirst(familyPool, chosen));
  }

  // ---- Backfill (slots 4/5 may have been empty for solo games) ----------
  // Walk the shuffled catalogue and fill any remaining slots before the
  // surprise pick so we always reach `TARGET_COUNT - 1`. Favorites get a
  // tiny edge here as a tie-breaker — surfacing things the user already
  // liked when nothing more specific is available.
  if (out.length < TARGET_COUNT - 1) {
    const favFirst = shuffled.slice().sort((a, b) => {
      const fa = favorites.has(a.id) ? 1 : 0;
      const fb = favorites.has(b.id) ? 1 : 0;
      return fb - fa;
    });
    for (const g of favFirst) {
      if (out.length >= TARGET_COUNT - 1) break;
      if (eligible(g)) take(g);
    }
  }

  // ---- Slot 6: random surprise from any category ------------------------
  if (out.length < TARGET_COUNT) {
    for (const g of shuffled) {
      if (out.length >= TARGET_COUNT) break;
      if (eligible(g)) take(g);
    }
  }

  return out.slice(0, TARGET_COUNT);
}
