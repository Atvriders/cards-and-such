import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle, isRed } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KingsRowState {
  /** 8 tableau columns. Top = last element. */
  tableau: Card[][];
  /** 4 foundations — build K down to A, same color (two red, two black) */
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
  movesMade: number;
  won: boolean;
}

export type KingsRowAction =
  | { type: "draw" }
  | { type: "move"; fromCol: number; toCol: number; count: number }
  | { type: "waste-to-tableau"; toCol: number }
  | { type: "waste-to-foundation"; foundIdx: number }
  | { type: "tableau-to-foundation"; fromCol: number; foundIdx: number };

function cardIsRed(card: Card): boolean {
  return isRed(card.suit);
}

// Foundation builds down from King to Ace, same color
// Foundation 0,1 = black (♠/♣), Foundation 2,3 = red (♥/♦)
// Any black K starts a black foundation, any red K starts a red foundation
function canPlaceFoundation(foundation: Card[], card: Card): boolean {
  if (foundation.length === 0) return card.rank === 13; // Must start with King
  const top = foundation[foundation.length - 1]!;
  const topRed = cardIsRed(top);
  const cardRed = cardIsRed(card);
  return topRed === cardRed && card.rank === top.rank - 1;
}

// Tableau builds down in alternating colors
function canPlaceTableau(target: Card[], card: Card): boolean {
  if (target.length === 0) return true;
  const top = target[target.length - 1]!;
  const topRed = cardIsRed(top);
  const cardRed = cardIsRed(card);
  return topRed !== cardRed && card.rank === top.rank - 1;
}

export function initialState(seed: number): KingsRowState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const tableau: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 8; i++) {
    const count = i < 4 ? 7 : 6;
    tableau.push(deck.slice(idx, idx + count));
    idx += count;
  }

  return {
    tableau,
    foundations: [[], [], [], []],
    stock: [],
    waste: [],
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: KingsRowState, action: KingsRowAction): KingsRowState {
  if (state.won) return state;

  switch (action.type) {
    case "move": {
      const { fromCol, toCol, count } = action;
      if (fromCol === toCol || count < 1) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || !to || from.length < count) return state;
      const moving = from.slice(from.length - count);
      if (!canPlaceTableau(to, moving[0]!)) return state;
      return {
        ...state,
        tableau: state.tableau.map((col, i) => {
          if (i === fromCol) return col.slice(0, col.length - count);
          if (i === toCol) return [...col, ...moving];
          return col;
        }),
        movesMade: state.movesMade + 1,
      };
    }

    case "tableau-to-foundation": {
      const { fromCol, foundIdx } = action;
      const col = state.tableau[fromCol];
      if (!col || col.length === 0) return state;
      const card = col[col.length - 1]!;
      const foundation = state.foundations[foundIdx];
      if (!foundation) return state;
      if (!canPlaceFoundation(foundation, card)) return state;
      const newFoundations = state.foundations.map((f, i) => i === foundIdx ? [...f, card] : f);
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
      if (state.stock.length === 0) {
        if (state.waste.length === 0) return state;
        return { ...state, stock: [...state.waste].reverse(), waste: [], movesMade: state.movesMade + 1 };
      }
      const card = state.stock[state.stock.length - 1]!;
      return { ...state, stock: state.stock.slice(0, -1), waste: [...state.waste, card], movesMade: state.movesMade + 1 };
    }

    case "waste-to-tableau": {
      const { toCol } = action;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const to = state.tableau[toCol];
      if (!to) return state;
      if (!canPlaceTableau(to, card)) return state;
      return {
        ...state,
        waste: state.waste.slice(0, -1),
        tableau: state.tableau.map((col, i) => i === toCol ? [...col, card] : col),
        movesMade: state.movesMade + 1,
      };
    }

    case "waste-to-foundation": {
      const { foundIdx } = action;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const foundation = state.foundations[foundIdx];
      if (!foundation) return state;
      if (!canPlaceFoundation(foundation, card)) return state;
      const newFoundations = state.foundations.map((f, i) => i === foundIdx ? [...f, card] : f);
      const total = newFoundations.reduce((s, f) => s + f.length, 0);
      return {
        ...state,
        waste: state.waste.slice(0, -1),
        foundations: newFoundations,
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: KingsRowState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
