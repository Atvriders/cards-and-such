import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, freecellCellStack, rankVal } from "../../engines/tableau/moves.js";
import type { Card } from "../../engines/deck/index.js";
import { isRed, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TripleFreecellSettings {
  _dummy?: undefined;
}

export interface TripleFreecellState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: TripleFreecellSettings;
}

export type TripleFreecellAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12", "c13"] as const;
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7", "fc8"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"] as const;

function tfFoundationStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "foundation") return false;
  if (moving.length !== 1) return false;
  const c = moving[0]!;
  if (target.cards.length === 0) return c.rank === 1;
  if (target.cards.length >= 13) return false;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === c.suit && rankVal(c) === rankVal(top) + 1;
}

export const tripleFreecellRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return tfFoundationStack(target, moving);
    if (target.kind === "tableau") {
      const bottom = moving[0];
      if (!bottom) return false;
      if (target.cards.length === 0) return true;
      const top = target.cards[target.cards.length - 1]!;
      return isRed(top.suit) !== isRed(bottom.suit) && rankVal(top) === rankVal(bottom) + 1;
    }
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
        if (isRed(upper.suit) === isRed(lower.suit)) return false;
        if (rankVal(upper) !== rankVal(lower) + 1) return false;
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
  const emptyCascades = countEmptyCascades(piles, toPileId);
  return (1 + emptyCells) * Math.pow(2, emptyCascades);
}

export function initialState(seed: number, settings: TripleFreecellSettings): TripleFreecellState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(3), rng); // 156 cards
  const piles: Pile[] = [];
  // 13 cascades — each gets 12 cards (13×12 = 156)
  let idx = 0;
  for (let i = 0; i < 13; i++) {
    const count = 12;
    piles.push({ id: CASCADE_IDS[i]!, kind: "tableau", cards: deck.slice(idx, idx + count), faceUpCount: count });
    idx += count;
  }
  for (const id of FREECELL_IDS) piles.push({ id, kind: "freecell", cards: [] });
  for (const id of FOUNDATION_IDS) piles.push({ id, kind: "foundation", cards: [] });
  return { piles, score: 0, movesMade: 0, won: false, settings };
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

export function reducer(state: TripleFreecellState, action: TripleFreecellAction): TripleFreecellState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const max = maxMoveable(state.piles, toPile);
      if (count > max) return state;
      if (!canMove(state.piles, { fromPile, toPile, count }, tripleFreecellRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 156,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      while (moved) {
        moved = false;
        for (const sid of [...CASCADE_IDS, ...FREECELL_IDS]) {
          const sp = getPile(piles, sid);
          if (!sp || sp.cards.length === 0) continue;
          for (const fid of FOUNDATION_IDS) {
            const move = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, move, tripleFreecellRuleset)) {
              piles = applyMove(piles, move);
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
      return { ...state, piles, movesMade: moves, score: total, won: total === 156 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TripleFreecellState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 156) return null;
  return { score: state.score };
}
