import type { BadgeKind } from "./Badge.js";

/**
 * Hand-picked sets that drive QUICK / CHALLENGING badges and the
 * matching lobby filter chips. Anything not in either set gets no
 * difficulty hint. Intentionally short — the badge is meant to be
 * rare so it stays meaningful.
 *
 * These were previously duplicated in LobbyPage and CategoryPage.
 * They live here so both pages share a single source of truth; do
 * not re-introduce file-private copies.
 */
export const QUICK_GAME_IDS = new Set<string>([
  "wordle-mini",
  "speed",
  "war",
  "snap",
  "high-low",
  "coin-flip",
  "yacht-mini",
  "pig-dice",
  "ship-captain-crew",
  "bar-dice-ship-captain",
  "tic-tac-toe-cards",
  "memory-pairs",
  "klondike-1",
]);

export const CHALLENGING_GAME_IDS = new Set<string>([
  "spider",
  "freecell",
  "holdem",
  "stud-7",
  "omaha",
  "bridge",
  "go",
  "chess",
  "shogi",
  "mahjong",
  "skat",
  "pinochle",
  "canasta",
  "hanabi",
  "the-crew",
]);

/**
 * Options for {@link pickBadgeKind}. The lobby owns the canonical
 * editor's-pick list and rating threshold, so it threads them in
 * here rather than duplicating those constants.
 */
export interface PickBadgeKindOptions {
  /** Editor's-pick / featured ids — used as the lowest-priority badge. */
  featuredIds: readonly string[];
  /** Minimum user rating that earns the "popular" badge. */
  topRatedThreshold: number;
}

/**
 * Order: NEW > CHALLENGING > QUICK > POPULAR (rating-based) > EDITORS-PICK.
 * Returns null when no badge should be shown.
 */
export function pickBadgeKind(
  gameId: string,
  isNew: boolean,
  userRating: number | undefined,
  opts: PickBadgeKindOptions,
): BadgeKind | null {
  if (isNew) return "new";
  if (CHALLENGING_GAME_IDS.has(gameId)) return "challenging";
  if (QUICK_GAME_IDS.has(gameId)) return "quick";
  if (typeof userRating === "number" && userRating >= opts.topRatedThreshold) {
    return "popular";
  }
  if (opts.featuredIds.includes(gameId)) return "editors-pick";
  return null;
}
