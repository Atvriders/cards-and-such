import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FlorentineState {
  /** 5 tableau columns, top card is the last element */
  tableau: Card[][];
  /** 4 foundations, one per suit, build A to K */
  foundations: Card[][];
  /** Reserve: 4 face-up cards available at all times */
  reserve: Array<Card | null>;
  /** Stock */
  stock: Card[];
  movesMade: number;
  won: boolean;
}

export type FlorentineAction =
  | { type: "move-tableau"; fromCol: number; toCol: number }
  | { type: "move-reserve"; reserveIdx: number; toCol: number }
  | { type: "reserve-to-foundation"; reserveIdx: number }
  | { type: "tableau-to-foundation"; fromCol: number }
  | { type: "draw" };

const SUIT_ORDER: Suit[] = ["♠", "♥", "♦", "♣"];

function canPlaceTableau(target: Card[], card: Card): boolean {
  if (target.length === 0) return true;
  const top = target[target.length - 1]!;
  // Build down same suit
  return card.suit === top.suit && card.rank === top.rank - 1;
}

function canPlaceFoundation(foundation: Card[], card: Card): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1]!;
  return card.suit === top.suit && card.rank === top.rank + 1;
}

export function initialState(seed: number): FlorentineState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // 5 columns of 5 cards each = 25 cards
  const tableau: Card[][] = [];
  for (let i = 0; i < 5; i++) {
    tableau.push(deck.slice(i * 5, i * 5 + 5));
  }

  // 4 reserve slots each with 1 card
  const reserve: Array<Card | null> = [
    deck[25] ?? null,
    deck[26] ?? null,
    deck[27] ?? null,
    deck[28] ?? null,
  ];

  const stock = deck.slice(29);

  return {
    tableau,
    foundations: [[], [], [], []],
    reserve,
    stock,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: FlorentineState, action: FlorentineAction): FlorentineState {
  if (state.won) return state;

  switch (action.type) {
    case "move-tableau": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || !to || from.length === 0) return state;
      const card = from[from.length - 1]!;
      if (!canPlaceTableau(to, card)) return state;
      return {
        ...state,
        tableau: state.tableau.map((col, i) => {
          if (i === fromCol) return col.slice(0, -1);
          if (i === toCol) return [...col, card];
          return col;
        }),
        movesMade: state.movesMade + 1,
      };
    }

    case "move-reserve": {
      const { reserveIdx, toCol } = action;
      const card = state.reserve[reserveIdx];
      if (!card) return state;
      const to = state.tableau[toCol];
      if (!to) return state;
      if (!canPlaceTableau(to, card)) return state;
      const newReserve = state.reserve.map((c, i) => (i === reserveIdx ? null : c));
      return {
        ...state,
        tableau: state.tableau.map((col, i) => i === toCol ? [...col, card] : col),
        reserve: newReserve,
        movesMade: state.movesMade + 1,
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
        reserve: state.reserve.map((c, i) => (i === reserveIdx ? null : c)),
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "tableau-to-foundation": {
      const { fromCol } = action;
      const col = state.tableau[fromCol];
      if (!col || col.length === 0) return state;
      const card = col[col.length - 1]!;
      const suitIdx = SUIT_ORDER.indexOf(card.suit);
      if (suitIdx === -1) return state;
      const foundation = state.foundations[suitIdx]!;
      if (!canPlaceFoundation(foundation, card)) return state;
      const newFoundations = state.foundations.map((f, i) => i === suitIdx ? [...f, card] : f);
      const total = newFoundations.reduce((s, f) => s + f.length, 0);
      return {
        ...state,
        tableau: state.tableau.map((c, i) => i === fromCol ? c.slice(0, -1) : c),
        foundations: newFoundations,
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    case "draw": {
      if (state.stock.length === 0) return state;
      // Fill empty reserve slots first, then deal to tableau columns
      let remaining = [...state.stock];
      const newReserve = state.reserve.map(slot => {
        if (slot === null && remaining.length > 0) {
          return remaining.shift()!;
        }
        return slot;
      });
      return { ...state, stock: remaining, reserve: newReserve, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FlorentineState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
