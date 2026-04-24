import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SeaHavenTowersState {
  piles: Pile[];
  movesMade: number;
  won: boolean;
}

export type SeaHavenTowersAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const COLUMN_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"] as const;
const CELL_IDS = ["r1", "r2", "r3", "r4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/**
 * Sea Haven Towers (also known as Towers): same-suit sequential on tableau (like FreeCell but same-suit),
 * plus 4 reserve cells. Empty column accepts any card.
 */
export const seaHavenRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "freecell") {
      // Reserve cell: accept one card into empty slot
      return target.cards.length === 0 && moving.length === 1;
    }
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    const card = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    // Same suit, one rank lower than top
    return top.suit === card.suit && (top.rank as number) === (card.rank as number) + 1;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") return count === 1;
    return false;
  },
};

export function initialState(seed: number): SeaHavenTowersState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Deal 48 cards to 10 columns (first 8 get 5, last 2 get 4); 4 cards remain as "towers" (reserve cells)
  // Actually classic Sea Haven: 52 cards in 10 columns of 5 each + 2 leftover = deal 50 then 2 in cells
  // Simpler: 10 columns × 5 = 50 cards, 2 remain go to first 2 reserve cells
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const count = 5;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: COLUMN_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: count,
    });
  }

  // 4 reserve cells (freecell kind); first 2 hold remaining 2 cards
  for (let i = 0; i < 4; i++) {
    const card = i < 2 ? deck[idx++] : undefined;
    piles.push({
      id: CELL_IDS[i]!,
      kind: "freecell",
      cards: card ? [card] : [],
    });
  }

  // Foundations: empty
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, movesMade: 0, won: false };
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

function totalCardsOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

export function reducer(
  state: SeaHavenTowersState,
  action: SeaHavenTowersAction,
): SeaHavenTowersState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const move = { fromPile, toPile, count };
      if (!canMove(state.piles, move, seaHavenRuleset)) return state;
      const newPiles = applyMove(state.piles, move);
      const won = totalCardsOnFoundations(newPiles) === 52;
      return { ...state, piles: newPiles, movesMade: state.movesMade + 1, won };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      const sourceIds = [...COLUMN_IDS, ...CELL_IDS];
      while (moved) {
        moved = false;
        for (const srcId of sourceIds) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const mv = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, mv, seaHavenRuleset)) {
              piles = applyMove(piles, mv);
              moves++;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return { ...state, piles, movesMade: moves, won: totalCardsOnFoundations(piles) === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SeaHavenTowersState): { score: number } | null {
  if (totalCardsOnFoundations(state.piles) !== 52) return null;
  return { score: Math.max(0, 300 - state.movesMade) };
}
