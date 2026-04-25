import type { Pile } from "../../engines/tableau/types.js";
import { canMove, applyMove, foundationStack, rankVal } from "../../engines/tableau/moves.js";
import type { Ruleset } from "../../engines/tableau/types.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ShamrocksSettings {
  _dummy?: undefined;
}

export interface ShamrocksState {
  piles: Pile[];
  score: number;
  movesMade: number;
  won: boolean;
  settings: ShamrocksSettings;
}

export type ShamrocksAction =
  | { type: "move"; fromPile: string; toPile: string; count: number }
  | { type: "auto-move-to-foundation" };

// 17 tableau piles (3 cards each) + 2 leftovers = 51... actually 17*3=51 + 1 extra
// Standard Shamrocks: deal all 52 into 17 piles of 3, 1 pile of 1 (or 18 piles: 16*3+1*4? No)
// Real: 17 piles of 3 = 51, 1 pile of 1. Total 18 piles.
const TABLEAU_IDS = Array.from({ length: 18 }, (_, i) => `t${i + 1}`) as readonly string[];
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

/** Shamrocks tableau: can stack one card if adjacent rank (±1), any suit. Max 3 cards per pile. */
export const shamrocksRuleset: Ruleset = {
  canStack: (target, moving) => {
    if (target.kind === "foundation") return foundationStack(target, moving);
    if (target.kind !== "tableau") return false;
    if (moving.length !== 1) return false;
    if (target.cards.length >= 3) return false; // max 3 cards per pile
    const bottom = moving[0]!;
    if (target.cards.length === 0) return true;
    const top = target.cards[target.cards.length - 1]!;
    const diff = Math.abs(rankVal(top) - rankVal(bottom));
    // Adjacent rank: 1 apart (wrapping: A-K allowed)
    if (diff === 1) return true;
    if (diff === 12) return true; // A-K wrap
    return false;
  },
  canPickUp: (pile, count) => {
    if (pile.kind === "foundation") return count === 1;
    if (pile.kind !== "tableau") return false;
    return count === 1; // only top card
  },
};

export function initialState(seed: number, settings: ShamrocksSettings): ShamrocksState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const piles: Pile[] = [];
  let idx = 0;

  // 17 piles of 3 + 1 pile of 1
  for (let i = 0; i < 17; i++) {
    piles.push({
      id: TABLEAU_IDS[i]!,
      kind: "tableau",
      cards: deck.slice(idx, idx + 3),
      faceUpCount: 3,
    });
    idx += 3;
  }
  piles.push({
    id: TABLEAU_IDS[17]!,
    kind: "tableau",
    cards: deck.slice(idx, idx + 1),
    faceUpCount: 1,
  });

  for (const id of FOUNDATION_IDS) {
    piles.push({ id, kind: "foundation", cards: [] });
  }

  return { piles, score: 0, movesMade: 0, won: false, settings };
}

function totalOnFoundations(piles: Pile[]): number {
  return FOUNDATION_IDS.reduce((sum, id) => {
    const p = piles.find((pp) => pp.id === id);
    return sum + (p?.cards.length ?? 0);
  }, 0);
}

function getPile(piles: Pile[], id: string): Pile | undefined {
  return piles.find((p) => p.id === id);
}

export function reducer(state: ShamrocksState, action: ShamrocksAction): ShamrocksState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromPile, toPile, count } = action;
      if (!canMove(state.piles, { fromPile, toPile, count }, shamrocksRuleset)) return state;
      const newPiles = applyMove(state.piles, { fromPile, toPile, count });
      const total = totalOnFoundations(newPiles);
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 52,
      };
    }

    case "auto-move-to-foundation": {
      let piles = state.piles;
      let moves = state.movesMade;
      let moved = true;
      while (moved) {
        moved = false;
        for (const srcId of [...TABLEAU_IDS]) {
          const src = getPile(piles, srcId);
          if (!src || src.cards.length === 0) continue;
          for (const fId of FOUNDATION_IDS) {
            const m = { fromPile: srcId, toPile: fId, count: 1 };
            if (canMove(piles, m, shamrocksRuleset)) {
              piles = applyMove(piles, m);
              moves++;
              moved = true;
              break;
            }
          }
          if (moved) break;
        }
      }
      if (piles === state.piles) return state;
      const total = totalOnFoundations(piles);
      return { ...state, piles, movesMade: moves, score: total, won: total === 52 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ShamrocksState): { score: number } | null {
  const total = totalOnFoundations(state.piles);
  if (total !== 52) return null;
  return { score: state.score };
}
