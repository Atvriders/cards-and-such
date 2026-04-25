import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WishSettings {
  _dummy?: undefined;
}

export interface WishState {
  piles: Card[][];
  score: number;
  movesMade: number;
  won: boolean;
}

export type WishAction =
  | { type: "remove-pair"; pileA: number; pileB: number }
  | { type: "shift-left" };

/** Wish (a.k.a. "Wish Solitaire"): deal 4 piles of 8 from a 32-card pack (A-7 stripped).
 *  Remove pairs of same-rank cards from any two piles' top cards.
 *  Goal: remove all cards. */
function makeShortDeck(): Card[] {
  const full = newDeck();
  // Keep only ranks 7-A (ranks 7,8,9,10,11,12,13,1 in numeric = 7,8,9,10,J,Q,K,A)
  return full.filter((c) => c.rank >= 7 || c.rank === 1);
}

export function initialState(seed: number, _settings: WishSettings): WishState {
  const rng = mulberry32(seed);
  const deck = shuffle(makeShortDeck(), rng); // 32 cards

  // Deal into 4 piles of 8
  const piles: Card[][] = [[], [], [], []];
  for (let i = 0; i < 32; i++) {
    piles[i % 4]!.push(deck[i]!);
  }

  return { piles, score: 0, movesMade: 0, won: false };
}

export function reducer(state: WishState, action: WishAction): WishState {
  if (state.won) return state;

  switch (action.type) {
    case "remove-pair": {
      const { pileA, pileB } = action;
      if (pileA === pileB) return state;
      const a = state.piles[pileA];
      const b = state.piles[pileB];
      if (!a || !b || a.length === 0 || b.length === 0) return state;
      const topA = a[a.length - 1]!;
      const topB = b[b.length - 1]!;
      if (topA.rank !== topB.rank) return state;
      const newPiles = state.piles.map((p, i) => {
        if (i === pileA) return p.slice(0, -1);
        if (i === pileB) return p.slice(0, -1);
        return [...p];
      });
      const remaining = newPiles.reduce((s, p) => s + p.length, 0);
      const won = remaining === 0;
      const newScore = state.score + 2;
      return {
        ...state,
        piles: newPiles,
        movesMade: state.movesMade + 1,
        score: newScore,
        won,
      };
    }

    case "shift-left": {
      // Compact: remove empty piles by shifting others left
      const nonEmpty = state.piles.filter((p) => p.length > 0);
      if (nonEmpty.length === state.piles.filter((p) => p.length > 0).length &&
          nonEmpty.length === state.piles.length) return state;
      const newPiles: Card[][] = [...nonEmpty];
      while (newPiles.length < 4) newPiles.push([]);
      return { ...state, piles: newPiles };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WishState): { score: number } | null {
  const total = state.piles.reduce((s, p) => s + p.length, 0);
  if (total !== 0) return null;
  return { score: state.score };
}
