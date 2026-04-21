import type { Pile } from "../../engines/tableau/types.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, freecellCellStack, rankVal } from "../../engines/tableau/moves.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { bakersGameSettings } from "./index.js";

export type BakersGameSettings = SettingsOf<typeof bakersGameSettings>;

export interface BakersGameState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type BakersGameAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"] as const;
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4"] as const;
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Baker's Game: tableau builds DOWN SAME-SUIT (not alternating colors). */
const bakersTableauStack = (target: Pile, moving: ReturnType<typeof Array.prototype.slice>): boolean => {
  if (target.kind !== "tableau") return false;
  const bottom = moving[0];
  if (!bottom) return false;
  if (target.cards.length === 0) return true;
  const top = target.cards[target.cards.length - 1]!;
  return top.suit === bottom.suit && rankVal(top) === rankVal(bottom) + 1;
};

export const bakersRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "freecell") return freecellCellStack(target, moving);
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind === "tableau") return bakersTableauStack(target, moving);
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

export function initialState(seed: number, _settings: BakersGameSettings): BakersGameState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  const piles: Pile[] = [];

  let idx = 0;
  for (let i = 0; i < 8; i++) {
    const count = i < 4 ? 7 : 6;
    const cards = deck.slice(idx, idx + count);
    idx += count;
    piles.push({ id: CASCADE_IDS[i]!, kind: "tableau", cards, faceUpCount: count });
  }
  for (const id of FREECELL_IDS) {
    piles.push({ id, kind: "freecell", cards: [] });
  }
  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 52, movesMade: 0, won: false };
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

export function reducer(state: BakersGameState, action: BakersGameAction): BakersGameState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      const max = maxMoveable(state.piles, toPile);
      if (count > max) return state;
      if (!canMove(state.piles, { fromPile, toPile, count }, bakersRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      const won = total === 52;
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: Math.max(0, 52 - state.movesMade - 1),
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
            if (canMove(piles, mv, bakersRuleset)) {
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
        score: Math.max(0, 52 - moves),
        won: total === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BakersGameState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: Math.max(0, state.score) };
}
