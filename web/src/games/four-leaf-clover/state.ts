import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FourLeafCloverState {
  /** 4 "leaf" piles — one per suit, dealt 13 cards each, all face-up. Top = last. */
  leaves: Card[][];
  /** 4 foundations, one per suit, build A to K */
  foundations: Card[][];
  /** Reserve buffer: up to 4 cards parked here */
  reserve: Array<Card | null>;
  movesMade: number;
  won: boolean;
}

export type FourLeafCloverAction =
  | { type: "leaf-to-foundation"; leafIdx: number }
  | { type: "reserve-to-foundation"; reserveIdx: number }
  | { type: "leaf-to-reserve"; leafIdx: number; reserveIdx: number }
  | { type: "reserve-to-leaf"; reserveIdx: number; leafIdx: number };

const SUIT_ORDER: Suit[] = ["♠", "♥", "♦", "♣"];

export function initialState(seed: number): FourLeafCloverState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Sort by suit into 4 groups but keep random order within each suit
  const leaves: Card[][] = SUIT_ORDER.map((suit) =>
    deck.filter((c) => c.suit === suit)
  );

  return {
    leaves,
    foundations: [[], [], [], []],
    reserve: [null, null, null, null],
    movesMade: 0,
    won: false,
  };
}

function canPlaceFoundation(foundation: Card[], card: Card): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1]!;
  return card.suit === top.suit && card.rank === top.rank + 1;
}

export function reducer(state: FourLeafCloverState, action: FourLeafCloverAction): FourLeafCloverState {
  if (state.won) return state;

  switch (action.type) {
    case "leaf-to-foundation": {
      const { leafIdx } = action;
      const leaf = state.leaves[leafIdx];
      if (!leaf || leaf.length === 0) return state;
      const card = leaf[leaf.length - 1]!;
      const suitIdx = SUIT_ORDER.indexOf(card.suit);
      if (suitIdx === -1) return state;
      const foundation = state.foundations[suitIdx]!;
      if (!canPlaceFoundation(foundation, card)) return state;
      const newFoundations = state.foundations.map((f, i) => i === suitIdx ? [...f, card] : f);
      const total = newFoundations.reduce((s, f) => s + f.length, 0);
      return {
        ...state,
        leaves: state.leaves.map((l, i) => i === leafIdx ? l.slice(0, -1) : l),
        foundations: newFoundations,
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "reserve-to-foundation": {
      const { reserveIdx } = action;
      const card = state.reserve[reserveIdx];
      if (!card) return state;
      const suitIdx = SUIT_ORDER.indexOf(card.suit);
      if (suitIdx === -1) return state;
      const foundation = state.foundations[suitIdx]!;
      if (!canPlaceFoundation(foundation, card)) return state;
      const newFoundations = state.foundations.map((f, i) => i === suitIdx ? [...f, card] : f);
      const total = newFoundations.reduce((s, f) => s + f.length, 0);
      return {
        ...state,
        foundations: newFoundations,
        reserve: state.reserve.map((c, i) => i === reserveIdx ? null : c),
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "leaf-to-reserve": {
      const { leafIdx, reserveIdx } = action;
      const leaf = state.leaves[leafIdx];
      if (!leaf || leaf.length === 0) return state;
      if (state.reserve[reserveIdx] !== null) return state; // slot must be empty
      const card = leaf[leaf.length - 1]!;
      return {
        ...state,
        leaves: state.leaves.map((l, i) => i === leafIdx ? l.slice(0, -1) : l),
        reserve: state.reserve.map((c, i) => i === reserveIdx ? card : c),
        movesMade: state.movesMade + 1,
      };
    }

    case "reserve-to-leaf": {
      const { reserveIdx, leafIdx } = action;
      const card = state.reserve[reserveIdx];
      if (!card) return state;
      const leaf = state.leaves[leafIdx];
      if (!leaf) return state;
      // Can place on leaf if leaf is empty or top card is one rank higher, same suit
      if (leaf.length > 0) {
        const top = leaf[leaf.length - 1]!;
        if (card.suit !== top.suit || card.rank !== top.rank - 1) return state;
      }
      return {
        ...state,
        leaves: state.leaves.map((l, i) => i === leafIdx ? [...l, card] : l),
        reserve: state.reserve.map((c, i) => i === reserveIdx ? null : c),
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FourLeafCloverState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
