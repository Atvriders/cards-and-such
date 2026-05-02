import { GAMES } from "../games/registry.js";
import { FAMILIES } from "../games/families.js";
import type { GameCategory, GamePlugin } from "./game-plugin/types.js";

/**
 * Shared search/scoring logic used by both the dedicated `/search` page
 * and the AppShell header live-preview popover. Extracted here so we
 * don't drift two scoring implementations.
 */

export type ResultKind = "game" | "family" | "category";

export interface SearchHit {
  kind: ResultKind;
  /** Stable id used for testid + dedupe (game id, family id, or category name). */
  id: string;
  title: string;
  description: string;
  /** Where this hit links. */
  href: string;
  /** Score — higher is better. */
  score: number;
}

export interface SearchResults {
  topMatch: SearchHit | null;
  games: SearchHit[];
  families: SearchHit[];
  categories: SearchHit[];
}

const CATEGORY_ORDER: GameCategory[] = [
  "solitaire", "cards", "dice", "board", "arcade",
];
const CATEGORY_LABELS: Record<GameCategory, string> = {
  solitaire: "Solitaire",
  cards: "Cards",
  dice: "Dice",
  board: "Board",
  arcade: "Arcade",
};

/**
 * Score a single text field against the lowercased query. Title-class
 * fields should weigh more than description-class fields — the caller
 * passes a `weight` multiplier per field.
 *
 * Scoring tiers (per field):
 *   exact match         100
 *   word-boundary start  60
 *   substring contains   30
 *   no match              0
 */
export function scoreField(text: string | undefined, q: string, weight: number): number {
  if (!text || !q) return 0;
  const lower = text.toLowerCase();
  if (lower === q) return 100 * weight;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`(^|[^a-z0-9])${escaped}`, "i").test(lower)) return 60 * weight;
  if (lower.includes(q)) return 30 * weight;
  return 0;
}

/**
 * Build the ranked hit list for a (raw) query. Returns [] for empty input.
 * Same scoring weights as the original SearchPage implementation.
 */
export function buildHits(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: SearchHit[] = [];
  const safeGames = GAMES.filter((g): g is GamePlugin => g != null);

  for (const g of safeGames) {
    const score
      = scoreField(g.title, q, 3)
      + scoreField(g.category, q, 1.5)
      + scoreField(g.description, q, 1)
      + scoreField(g.howToPlay, q, 0.5);
    if (score > 0) {
      out.push({
        kind: "game",
        id: g.id,
        title: g.title,
        description: g.description,
        href: `/play/${g.id}`,
        score,
      });
    }
  }

  for (const fam of FAMILIES) {
    const score
      = scoreField(fam.id, q, 2)
      + scoreField(fam.label, q, 3)
      + scoreField(fam.description, q, 1);
    if (score > 0) {
      out.push({
        kind: "family",
        id: fam.id,
        title: fam.label,
        description: fam.description,
        href: `/?q=${encodeURIComponent(fam.label)}`,
        score,
      });
    }
  }

  for (const cat of CATEGORY_ORDER) {
    const score = scoreField(cat, q, 4) + scoreField(CATEGORY_LABELS[cat], q, 4);
    if (score > 0) {
      const count = safeGames.filter((g) => g.category === cat).length;
      out.push({
        kind: "category",
        id: cat,
        title: `Show all ${count.toLocaleString()} ${CATEGORY_LABELS[cat]} games`,
        description: `Browse the full ${CATEGORY_LABELS[cat]} catalog.`,
        href: `/category/${cat}`,
        score,
      });
    }
  }

  out.sort((a, b) => b.score - a.score);
  return out;
}

/**
 * Compute the grouped search result for `query`, with the top-scoring hit
 * promoted into `topMatch` and removed from its source group so it isn't
 * duplicated. Group sizes are capped (games default 30, families 12,
 * categories 5); pass `limit` to override the games cap (popover passes 3).
 */
export function searchAll(query: string, limit?: number): SearchResults {
  const hits = buildHits(query);
  const allGames = hits.filter((h) => h.kind === "game");
  const allFamilies = hits.filter((h) => h.kind === "family");
  const allCats = hits.filter((h) => h.kind === "category");
  const top = hits.length > 0 ? hits[0]! : null;
  const games = top && top.kind === "game"
    ? allGames.filter((g) => g.id !== top.id)
    : allGames;
  const families = top && top.kind === "family"
    ? allFamilies.filter((f) => f.id !== top.id)
    : allFamilies;
  const categories = top && top.kind === "category"
    ? allCats.filter((c) => c.id !== top.id)
    : allCats;
  const gamesCap = typeof limit === "number" ? limit : 30;
  return {
    topMatch: top,
    games: games.slice(0, gamesCap),
    families: families.slice(0, 12),
    categories: categories.slice(0, 5),
  };
}
