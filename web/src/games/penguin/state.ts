import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, freecellCellStack, rankVal } from "../../engines/tableau/moves.js";
import { type Card, type Rank, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PenguinSettings {
  _dummy?: undefined;
}

export interface PenguinState {
  piles: Pile[];
  /** The starting rank for all four foundations (1-13, wrapping). */
  foundationRank: Rank;
  score: number;
  movesMade: number;
  won: boolean;
}

export type PenguinAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const COLUMN_IDS = ["col1", "col2", "col3", "col4", "col5", "col6", "col7"] as const;
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** One rank above, same suit, wrapping K→A. */
function nextRank(r: number): number {
  return r === 13 ? 1 : r + 1;
}

function penguinFoundationStack(target: Pile, moving: Card[], foundationRank: Rank): boolean {
  if (target.kind !== "foundation") return false;
  if (moving.length !== 1) return false;
  const c = moving[0]!;
  if (target.cards.length === 0) return c.rank === foundationRank;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === c.suit && (c.rank as number) === nextRank(rankVal(top));
}

/** Penguin tableau: build DOWN same suit, wrapping (2 below Ace below K). Empty accepts any card/sequence. */
function penguinTableauStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  if (top.suit !== bottom.suit) return false;
  // Descending with wrap: A is below 2, which is below 3... K above Q... A is above nothing (unless we do wrap)
  // Standard Penguin: build down same suit, Aces wrap below 2s
  const expected = top.rank === 1 ? 13 : (top.rank as number) - 1;
  return (bottom.rank as number) === expected;
}

function makePenguinRuleset(foundationRank: Rank): Ruleset {
  return {
    canStack: (target, moving) => {
      if (target.kind === "freecell") return freecellCellStack(target, moving);
      if (target.kind === "foundation") return penguinFoundationStack(target, moving, foundationRank);
      if (target.kind === "tableau") return penguinTableauStack(target, moving);
      return false;
    },
    canPickUp: (pile, count) => {
      if (pile.kind === "freecell") return count === 1;
      if (pile.kind === "foundation") return count === 1;
      if (pile.kind === "tableau") {
        if (count > pile.cards.length) return false;
        const cards = pile.cards.slice(pile.cards.length - count);
        for (let i = 0; i < cards.length - 1; i++) {
          const upper = cards[i]!;
          const lower = cards[i + 1]!;
          if (upper.suit !== lower.suit) return false;
          const expected = upper.rank === 1 ? 13 : (upper.rank as number) - 1;
          if ((lower.rank as number) !== expected) return false;
        }
        return true;
      }
      return false;
    },
  };
}

export function makePenguinRulesetPublic(foundationRank: Rank): Ruleset {
  return makePenguinRuleset(foundationRank);
}

export function initialState(seed: number, _settings: PenguinSettings): PenguinState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // The top-left card determines the foundation starting rank
  const topLeft = deck[0]!;
  const foundationRank = topLeft.rank as Rank;

  // Pull out the 3 other cards of the same rank as starters for foundations 2-4
  const starterIndices: number[] = [0]; // index 0 is already used
  const starters: Card[] = [topLeft];
  for (let i = 1; i < deck.length && starters.length < 4; i++) {
    if (deck[i]!.rank === foundationRank) {
      starterIndices.push(i);
      starters.push(deck[i]!);
    }
  }

  // Remaining 48 cards for 7 columns of 7
  const remaining = deck.filter((_, i) => !starterIndices.includes(i));
  // Should be 48 cards for 7×7=49; but 4 cards removed leaves 48, not 49.
  // Penguin: 7×7=49 cards in tableau. With 4 starters removed we have 48. Deal 6-7-7-7-7-7-7.
  // Actually: 52 - 4 starters = 48. 7 columns: 48/7 is not even. Standard Penguin deals 7 cols × 7 cards
  // using the remaining 49 cards (one starter stays in tableau col 1 as the first card).
  // Simpler: 1 starter goes to f1, other 3 starters go to f2/f3/f4.
  // Remaining 48 cards fill 7 cols: cols 1-6 get 7 cards each (42), col 7 gets 6 = 48. Done.

  const piles: Pile[] = [];

  // Foundations — 4, each starts with its rank-matching card
  for (let i = 0; i < 4; i++) {
    piles.push({ id: FOUNDATION_IDS[i]!, kind: "foundation", cards: [starters[i]!] });
  }

  // 7 columns
  let idx = 0;
  for (let i = 0; i < 7; i++) {
    const count = i < 6 ? 7 : 6;
    const cards = remaining.slice(idx, idx + count);
    idx += count;
    piles.push({ id: COLUMN_IDS[i]!, kind: "tableau", cards, faceUpCount: count });
  }

  // 7 free cells
  for (const id of FREECELL_IDS) {
    piles.push({ id, kind: "freecell", cards: [] });
  }

  return { piles, foundationRank, score: 0, movesMade: 0, won: false };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

function countEmptyFreeCells(piles: Pile[]): number {
  return FREECELL_IDS.filter((id) => {
    const p = piles.find((pp) => pp.id === id);
    return p && p.cards.length === 0;
  }).length;
}

function countEmptyColumns(piles: Pile[], excludeId?: string): number {
  return COLUMN_IDS.filter((id) => {
    if (id === excludeId) return false;
    const p = piles.find((pp) => pp.id === id);
    return p && p.cards.length === 0;
  }).length;
}

function maxMoveable(piles: Pile[], toPileId: string): number {
  const emptyCells = countEmptyFreeCells(piles);
  const emptyCols = countEmptyColumns(piles, toPileId as typeof COLUMN_IDS[number]);
  return (1 + emptyCells) * Math.pow(2, emptyCols);
}

export function reducer(state: PenguinState, action: PenguinAction): PenguinState {
  if (state.won) return state;
  const ruleset = makePenguinRuleset(state.foundationRank);

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const max = maxMoveable(state.piles, toPile);
      if (count > max) return state;
      if (!canMove(state.piles, { fromPile, toPile, count }, ruleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      const won = total === 52;
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: total,
        won,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      while (moved) {
        moved = false;
        const sourceIds = [...COLUMN_IDS, ...FREECELL_IDS];
        for (const sourceId of sourceIds) {
          const sp = getPile(piles, sourceId);
          if (!sp || sp.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const mv = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, mv, ruleset)) {
              piles = applyMove(piles, mv);
              moves += 1;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      return {
        ...state,
        piles,
        movesMade: moves,
        score: total,
        won: total === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PenguinState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
