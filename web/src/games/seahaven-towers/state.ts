import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, freecellCellStack, rankVal } from "../../engines/tableau/moves.js";
import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SeahavenTowersSettings {
  _dummy?: undefined;
}

export interface SeahavenTowersState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: SeahavenTowersSettings;
}

export type SeahavenTowersAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const COLUMN_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"] as const;
const CELL_IDS = ["fc1", "fc2", "fc3", "fc4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Seahaven Towers tableau: same suit, descending. Empty column accepts only Kings. */
function seahavenTableauStack(target: Pile, moving: Card[]): boolean {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return bottom.rank === 13;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
}

export const seahavenTowersRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return seahavenTableauStack(target, moving);
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "freecell") return count === 1;
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind === "tableau") {
      if (count > pile.cards.length) return false;
      const cards = pile.cards.slice(pile.cards.length - count);
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i]!;
        const b = cards[i + 1]!;
        if (a.suit !== b.suit) return false;
        if (rankVal(a) !== rankVal(b) + 1) return false;
      }
      return true;
    }
    return false;
  },
};

export function initialState(seed: number, settings: SeahavenTowersSettings): SeahavenTowersState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];
  // 10 columns × 5 cards = 50 cards (all face-up)
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    const cards = deck.slice(idx, idx + 5);
    idx += 5;
    piles.push({ id: COLUMN_IDS[i]!, kind: "tableau", cards, faceUpCount: 5 });
  }
  // 4 cells: deal remaining 2 cards into the middle two cells (fc2, fc3)
  // Standard Seahaven Towers deal: 2 cards in cells, 2 cells empty
  piles.push({ id: "fc1", kind: "freecell", cards: [] });
  piles.push({ id: "fc2", kind: "freecell", cards: [deck[idx++]!] });
  piles.push({ id: "fc3", kind: "freecell", cards: [deck[idx++]!] });
  piles.push({ id: "fc4", kind: "freecell", cards: [] });
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

function countEmptyCells(piles: Pile[]): number {
  return CELL_IDS.filter((id) => {
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
  const emptyCells = countEmptyCells(piles);
  const emptyColumns = countEmptyColumns(piles, toPileId);
  return (1 + emptyCells) * Math.pow(2, emptyColumns);
}

export function reducer(state: SeahavenTowersState, action: SeahavenTowersAction): SeahavenTowersState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const max = maxMoveable(state.piles, toPile);
      if (count > max) return state;
      if (!canMove(state.piles, { fromPile, toPile, count }, seahavenTowersRuleset)) return state;
      const toP = getPile(state.piles, toPile);
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        score: state.score + (toP?.kind === "foundation" ? 10 : 0),
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let score = state.score;
      let moved = true;
      while (moved) {
        moved = false;
        for (const sid of [...COLUMN_IDS, ...CELL_IDS]) {
          const sp = getPile(piles, sid);
          if (!sp || sp.cards.length === 0) continue;
          for (const fid of FOUNDATION_IDS) {
            const move = { fromPile: sid, toPile: fid, count: 1 };
            if (canMove(piles, move, seahavenTowersRuleset)) {
              piles = applyMove(piles, move);
              score += 10;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      return {
        ...state,
        piles,
        score,
        movesMade: state.movesMade + 1,
        won: totalOnFoundations(piles) === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SeahavenTowersState): { score: number } | null {
  if (totalOnFoundations(state.piles) !== 52) return null;
  return { score: state.score };
}
