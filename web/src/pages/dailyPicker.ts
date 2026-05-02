/**
 * Deterministic daily-game picker.
 *
 * Hashes a YYYY-MM-DD stamp -> stable index into the GAMES registry. The same
 * date always returns the same game id (and the same numeric seed for use as
 * `?seed=` on the play page). Independent of GAMES ordering changes only in
 * that adding/removing games will of course shift the per-date pick — but for
 * a fixed registry, the mapping is total and reproducible.
 */

import { GAMES } from "../games/registry.js";
import type { GamePlugin } from "../platform/game-plugin/types.js";

/** Format `d` (local time) as YYYY-MM-DD. */
export function formatDateStamp(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today's stamp in the user's local timezone. */
export function todayStamp(now: Date = new Date()): string {
  return formatDateStamp(now);
}

/** Yesterday relative to `now` (local). */
export function yesterdayStamp(now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return formatDateStamp(d);
}

/**
 * 32-bit FNV-1a hash. Good-enough avalanche for a date string and trivially
 * deterministic across browsers / Node — no Math.random, no crypto.
 */
export function hashStamp(stamp: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < stamp.length; i++) {
    h ^= stamp.charCodeAt(i);
    // Multiply by FNV prime (0x01000193) using 32-bit math.
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface DailyPick {
  /** YYYY-MM-DD this pick is for. */
  stamp: string;
  /** The picked plugin (full object, for title/category/etc). */
  game: GamePlugin;
  /** A 32-bit unsigned seed to pass as `?seed=` to the play page. */
  seed: number;
}

/**
 * Pick today's daily game. Same `stamp` => same game + seed, always.
 * Falls back to the first registry entry if `games` is empty.
 */
export function pickDailyGame(stamp: string, games: readonly GamePlugin[] = GAMES): DailyPick {
  const seed = hashStamp(stamp);
  const list = games.length > 0 ? games : GAMES;
  // Defensive: if both lists are empty (test environments), throw a descriptive
  // error rather than returning undefined and breaking the page silently.
  if (list.length === 0) {
    throw new Error("pickDailyGame: empty game registry");
  }
  const idx = seed % list.length;
  return { stamp, game: list[idx]!, seed };
}

/** Convenience: today's daily pick. */
export function getTodaysDaily(now: Date = new Date()): DailyPick {
  return pickDailyGame(todayStamp(now));
}

/** Convenience: yesterday's daily pick (for the recap card). */
export function getYesterdaysDaily(now: Date = new Date()): DailyPick {
  return pickDailyGame(yesterdayStamp(now));
}

/**
 * Algorithmic "par" score for a daily pick. Solitaire/cards reward higher
 * scores than dice/board defaults — used to give the user a reference number
 * in the recap until real leaderboard data lands.
 */
export function parScore(game: GamePlugin, seed: number): number {
  const base =
    game.category === "solitaire" ? 600
    : game.category === "cards" ? 450
    : game.category === "arcade" ? 350
    : game.category === "board" ? 250
    : 200; // dice + fallback
  // Deterministic +/- 25% wobble derived from the seed so par feels "tuned".
  const wobble = ((seed >>> 8) % 51) - 25; // -25..+25
  return Math.max(50, Math.round(base * (100 + wobble) / 100));
}

/** Format estimated playtime for a category. Cheap heuristic, no per-game data. */
export function estimatedMinutes(game: GamePlugin): number {
  switch (game.category) {
    case "solitaire": return 8;
    case "cards": return 6;
    case "board": return 10;
    case "arcade": return 4;
    case "dice": return 5;
    default: return 5;
  }
}
