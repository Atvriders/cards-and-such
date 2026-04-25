import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PrecedenceState {
  /** 8 foundations — build K down to A (one per suit, 2 decks, but we use 1 deck with 4 foundations) */
  foundations: Card[][];
  /** Stock */
  stock: Card[];
  /** Waste */
  waste: Card[];
  /** 8 reserve cells — hold any single card */
  reserve: Array<Card | null>;
  movesMade: number;
  won: boolean;
}

export type PrecedenceAction =
  | { type: "draw" }
  | { type: "waste-to-reserve"; reserveIdx: number }
  | { type: "waste-to-foundation" }
  | { type: "reserve-to-foundation"; reserveIdx: number };

const SUIT_ORDER: Suit[] = ["♠", "♥", "♦", "♣"];

// Foundations start with King and build down to Ace same suit
function canPlaceFoundation(foundation: Card[], card: Card): boolean {
  if (foundation.length === 0) return card.rank === 13; // Start with King
  const top = foundation[foundation.length - 1]!;
  return card.suit === top.suit && card.rank === top.rank - 1;
}

function findFoundation(foundations: Card[][], card: Card): number {
  for (let i = 0; i < foundations.length; i++) {
    if (canPlaceFoundation(foundations[i]!, card)) return i;
  }
  return -1;
}

export function initialState(seed: number): PrecedenceState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  return {
    foundations: [[], [], [], []],
    stock: deck,
    waste: [],
    reserve: new Array(8).fill(null) as Array<Card | null>,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: PrecedenceState, action: PrecedenceAction): PrecedenceState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) {
        if (state.waste.length === 0) return state;
        return { ...state, stock: [...state.waste].reverse(), waste: [], movesMade: state.movesMade + 1 };
      }
      const card = state.stock[state.stock.length - 1]!;
      return {
        ...state,
        stock: state.stock.slice(0, -1),
        waste: [...state.waste, card],
        movesMade: state.movesMade + 1,
      };
    }

    case "waste-to-foundation": {
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const fIdx = findFoundation(state.foundations, card);
      if (fIdx === -1) return state;
      const newFoundations = state.foundations.map((f, i) => i === fIdx ? [...f, card] : f);
      const total = newFoundations.reduce((s, f) => s + f.length, 0);
      return {
        ...state,
        foundations: newFoundations,
        waste: state.waste.slice(0, -1),
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "waste-to-reserve": {
      const { reserveIdx } = action;
      if (state.waste.length === 0) return state;
      if (state.reserve[reserveIdx] !== null) return state;
      const card = state.waste[state.waste.length - 1]!;
      return {
        ...state,
        waste: state.waste.slice(0, -1),
        reserve: state.reserve.map((c, i) => i === reserveIdx ? card : c),
        movesMade: state.movesMade + 1,
      };
    }

    case "reserve-to-foundation": {
      const { reserveIdx } = action;
      const card = state.reserve[reserveIdx];
      if (!card) return state;
      const fIdx = findFoundation(state.foundations, card);
      if (fIdx === -1) return state;
      const newFoundations = state.foundations.map((f, i) => i === fIdx ? [...f, card] : f);
      const total = newFoundations.reduce((s, f) => s + f.length, 0);
      return {
        ...state,
        foundations: newFoundations,
        reserve: state.reserve.map((c, i) => i === reserveIdx ? null : c),
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PrecedenceState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
