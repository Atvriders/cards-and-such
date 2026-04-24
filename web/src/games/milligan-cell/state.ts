import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, klondikeTableauStack, foundationStack, freecellCellStack } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface MilliganCellState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type MilliganCellAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"] as const;
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7", "fc8", "fc9", "fc10", "fc11", "fc12"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export const milliganCellRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return klondikeTableauStack(target, moving);
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
        const upperIsRed = upper.suit === "♥" || upper.suit === "♦";
        const lowerIsRed = lower.suit === "♥" || lower.suit === "♦";
        if (upperIsRed === lowerIsRed) return false;
        if (upper.rank !== lower.rank + 1) return false;
      }
      return true;
    }
    return false;
  },
};

function countEmptyFreeCells(piles: Pile[]): number {
  return FREECELL_IDS.filter((id) => {
    const p = piles.find((pp) => pp.id === id);
    return p && p.cards.length === 0;
  }).length;
}

function countEmptyCascades(piles: Pile[], excludeId?: string): number {
  return CASCADE_IDS.filter((id) => {
    if (id === excludeId) return false;
    const p = piles.find((pp) => pp.id === id);
    return p && p.cards.length === 0;
  }).length;
}

function maxMoveable(piles: Pile[], toPileId: string): number {
  const emptyCells = countEmptyFreeCells(piles);
  const emptyCascades = countEmptyCascades(piles, toPileId as typeof CASCADE_IDS[number]);
  return (1 + emptyCells) * Math.pow(2, emptyCascades);
}

export function initialState(seed: number): MilliganCellState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];

  // Deal 52 cards across 8 cascades: first 4 get 7, last 4 get 6 (same as FreeCell)
  let idx = 0;
  for (let i = 0; i < 8; i++) {
    const count = i < 4 ? 7 : 6;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({
      id: CASCADE_IDS[i]!,
      kind: "tableau",
      cards,
      faceUpCount: count,
    });
  }

  // 12 free cells: all empty
  for (const id of FREECELL_IDS) {
    piles.push({ id, kind: "freecell", cards: [] });
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

export function reducer(state: MilliganCellState, action: MilliganCellAction): MilliganCellState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const max = maxMoveable(state.piles, toPile);
      if (count > max) return state;
      if (!canMove(state.piles, { fromPile, toPile, count }, milliganCellRuleset)) return state;
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
        const sourceIds = [...CASCADE_IDS, ...FREECELL_IDS];
        for (const sourceId of sourceIds) {
          const sp = getPile(piles, sourceId);
          if (!sp || sp.cards.length === 0) continue;
          for (const foundId of FOUNDATION_IDS) {
            const mv = { fromPile: sourceId, toPile: foundId, count: 1 };
            if (canMove(piles, mv, milliganCellRuleset)) {
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

export function isTerminal(state: MilliganCellState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
