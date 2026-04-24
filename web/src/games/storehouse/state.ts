import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, freecellCellStack, rankVal } from "../../engines/tableau/moves.js";
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface StorehouseState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type StorehouseAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const TABLEAU_IDS = ["t1", "t2", "t3", "t4"] as const;
const CELL_IDS = ["c1", "c2", "c3", "c4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Descending same-suit stacking on tableau. Empty accepts any card. */
function storehouseTableauStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
}

export const storehouseRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return storehouseTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      if (count > pile.cards.length) return false;
      const faceUp = pile.faceUpCount ?? pile.cards.length;
      if (count > faceUp) return false;
      // All picked cards must form a valid descending same-suit sequence
      const cards = pile.cards.slice(pile.cards.length - count);
      for (let i = 0; i < cards.length - 1; i++) {
        const upper = cards[i]!;
        const lower = cards[i + 1]!;
        if (upper.suit !== lower.suit) return false;
        if (rankVal(upper) !== rankVal(lower) + 1) return false;
      }
      return true;
    }
    return false;
  },
};

export function initialState(seed: number): StorehouseState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // 4 tableau columns × 10 cards each (40 total), all face-up
  let idx = 0;
  for (let i = 0; i < 4; i++) {
    const cards = deck.slice(idx, idx + 10);
    idx += 10;
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: 10,
    });
  }

  // Remaining 12 cards split: 4 cells + 8 to reserve / discard
  // Standard Storehouse: 4 free cells start with 3 cards each (12 total)
  // Actually: 52 - 40 = 12 cards. Deal 3 to each of 4 cells.
  for (let i = 0; i < 4; i++) {
    const cards = deck.slice(idx, idx + 3);
    idx += 3;
    piles.push({ id: CELL_IDS[i]!, kind: "freecell", cards });
  }

  // Foundations: empty
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false };
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

function countEmptyCells(piles: Pile[]): number {
  return CELL_IDS.filter((id) => {
    const p = piles.find((pp) => pp.id === id);
    return p && p.cards.length === 0;
  }).length;
}

function countEmptyTableaux(piles: Pile[], excludeId?: string): number {
  return TABLEAU_IDS.filter((id) => {
    if (id === excludeId) return false;
    const p = piles.find((pp) => pp.id === id);
    return p && p.cards.length === 0;
  }).length;
}

function maxMoveable(piles: Pile[], toPileId: string): number {
  const emptyCells = countEmptyCells(piles);
  const emptyTableaux = countEmptyTableaux(piles, toPileId as typeof TABLEAU_IDS[number]);
  return (1 + emptyCells) * Math.pow(2, emptyTableaux);
}

export function reducer(state: StorehouseState, action: StorehouseAction): StorehouseState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const max = maxMoveable(state.piles, toPile);
      if (count > max) return state;
      if (!canMove(state.piles, { fromPile, toPile, count }, storehouseRuleset)) return state;
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
        const sourceIds = [...TABLEAU_IDS, ...CELL_IDS];
        for (const sourceId of sourceIds) {
          const sp = getPile(piles, sourceId);
          if (!sp || sp.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const mv = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, mv, storehouseRuleset)) {
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

export function isTerminal(state: StorehouseState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
