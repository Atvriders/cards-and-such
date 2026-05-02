/**
 * Per-game playtime + difficulty hints surfaced as small chips on the
 * lobby tile. The exact numbers are coarse — we only need three
 * buckets (fast / medium / long) to give players an at-a-glance feel
 * for whether a tile is a one-minute filler or a multi-deal sit-down.
 *
 * Anything not listed here defaults to a generic "5 min" / "medium"
 * pair, which is roughly the median for this catalog.
 */

export interface GameEta {
  /** Approximate minutes a single round takes. */
  mins: number;
  /** Compact label for the chip ("<1 min", "5-10 min", ...). */
  label: string;
}

export type GameDifficulty = "easy" | "medium" | "hard";

/** Games that finish in well under a minute (one-tap, one-deal). */
const FAST_GAME_IDS = new Set<string>([
  "war",
  "snap",
  "high-low",
  "coin-flip",
  "speed",
  "pig-dice",
  "ship-captain-crew",
  "bar-dice-ship-captain",
  "tic-tac-toe-cards",
  "memory-pairs",
  "yacht-mini",
  "wordle-mini",
]);

/** Games that typically take 5-10 minutes to play through. */
const MEDIUM_GAME_IDS = new Set<string>([
  "klondike",
  "klondike-1",
  "freecell",
  "yukon",
  "tri-peaks",
  "pyramid",
  "golf-solitaire",
  "canfield",
  "blackjack",
  "video-poker",
]);

/** Games that routinely run 10-20+ minutes per session. */
const LONG_GAME_IDS = new Set<string>([
  "spider",
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
 * Difficulty buckets. Mostly mirrors LobbyPage's QUICK / CHALLENGING
 * sets but is intentionally re-listed here so this module stays
 * self-contained (those constants are file-private to LobbyPage).
 */
const EASY_GAME_IDS = new Set<string>([
  "war",
  "snap",
  "high-low",
  "coin-flip",
  "speed",
  "pig-dice",
  "ship-captain-crew",
  "bar-dice-ship-captain",
  "tic-tac-toe-cards",
  "memory-pairs",
  "yacht-mini",
  "wordle-mini",
  "klondike-1",
]);

const HARD_GAME_IDS = new Set<string>([
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

const DEFAULT_ETA: GameEta = { mins: 5, label: "5 min" };

export function getEta(gameId: string): GameEta {
  if (FAST_GAME_IDS.has(gameId)) return { mins: 1, label: "<1 min" };
  if (MEDIUM_GAME_IDS.has(gameId)) return { mins: 8, label: "5-10 min" };
  if (LONG_GAME_IDS.has(gameId)) return { mins: 15, label: "10-20 min" };
  return DEFAULT_ETA;
}

export function getDifficulty(gameId: string): GameDifficulty {
  if (HARD_GAME_IDS.has(gameId)) return "hard";
  if (EASY_GAME_IDS.has(gameId)) return "easy";
  return "medium";
}

/** Number of dots (1, 2, or 3) used to render the difficulty chip. */
export function difficultyDots(difficulty: GameDifficulty): 1 | 2 | 3 {
  if (difficulty === "easy") return 1;
  if (difficulty === "hard") return 3;
  return 2;
}
