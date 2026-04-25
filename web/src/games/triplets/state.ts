import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TripletsState {
  /** 18 piles of 3 cards (54 total — we use a double deck and pick 54). Actually: 1 deck, deal 12 piles of 3 = 36, plus stock */
  /** 12 active piles of 3 cards each, displayed as columns */
  piles: Card[][];
  /** Stock of remaining cards */
  stock: Card[];
  /** Discard (removed triplets) */
  removed: number; // count of removed groups
  /** Selected pile indices */
  selected: number[];
  movesMade: number;
  won: boolean;
}

export type TripletsAction =
  | { type: "select"; pileIdx: number }
  | { type: "deselect"; pileIdx: number }
  | { type: "remove-triplet" } // remove selected 3 if they sum to target
  | { type: "deal" }; // deal 3 new cards to replace empties or add more

const TARGET_SUM = 15; // Face cards (J=11,Q=12,K=13) count as 10

function cardValue(rank: number): number {
  if (rank >= 10) return 10;
  return rank; // Ace = 1
}

export function initialState(seed: number): TripletsState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Deal 12 piles of 3 cards
  const piles: Card[][] = [];
  for (let i = 0; i < 12; i++) {
    piles.push(deck.slice(i * 3, i * 3 + 3));
  }
  const stock = deck.slice(36);

  return {
    piles,
    stock,
    removed: 0,
    selected: [],
    movesMade: 0,
    won: false,
  };
}

function tripletValid(cards: Card[]): boolean {
  if (cards.length !== 3) return false;
  const sum = cards.reduce((s, c) => s + cardValue(c.rank), 0);
  return sum === TARGET_SUM;
}

export function reducer(state: TripletsState, action: TripletsAction): TripletsState {
  if (state.won) return state;

  switch (action.type) {
    case "select": {
      const { pileIdx } = action;
      if (state.piles[pileIdx]?.length === 0) return state;
      if (state.selected.includes(pileIdx)) return state;
      if (state.selected.length >= 3) return state;
      return { ...state, selected: [...state.selected, pileIdx] };
    }

    case "deselect": {
      return { ...state, selected: state.selected.filter(i => i !== action.pileIdx) };
    }

    case "remove-triplet": {
      if (state.selected.length !== 3) return state;
      const [i0, i1, i2] = state.selected as [number, number, number];
      const cards = [
        state.piles[i0]![state.piles[i0]!.length - 1]!,
        state.piles[i1]![state.piles[i1]!.length - 1]!,
        state.piles[i2]![state.piles[i2]!.length - 1]!,
      ];
      if (!tripletValid(cards)) return state;

      const newPiles = state.piles.map((pile, i) => {
        if (i === i0 || i === i1 || i === i2) return pile.slice(0, -1);
        return pile;
      });

      const newRemoved = state.removed + 1;
      // Win if all piles empty and stock empty
      const allEmpty = newPiles.every(p => p.length === 0) && state.stock.length === 0;

      return {
        ...state,
        piles: newPiles,
        removed: newRemoved,
        selected: [],
        movesMade: state.movesMade + 1,
        won: allEmpty,
      };
    }

    case "deal": {
      if (state.stock.length === 0) return state;
      // Deal one card to each empty pile, or add new pile
      let remaining = [...state.stock];
      const newPiles = state.piles.map(pile => {
        if (pile.length === 0 && remaining.length > 0) {
          return [remaining.shift()!];
        }
        return pile;
      });
      return {
        ...state,
        piles: newPiles,
        stock: remaining,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TripletsState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
