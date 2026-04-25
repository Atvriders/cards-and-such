import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PaganiniState {
  /** 8 tableau columns, top = last */
  tableau: Card[][];
  /** 8 foundations (2 per suit) — each builds A to K same suit */
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
  movesMade: number;
  won: boolean;
}

export type PaganiniAction =
  | { type: "draw" }
  | { type: "move"; fromCol: number; toCol: number; count: number }
  | { type: "waste-to-tableau"; toCol: number }
  | { type: "waste-to-foundation"; foundIdx: number }
  | { type: "tableau-to-foundation"; fromCol: number; foundIdx: number };

const SUIT_ORDER: Suit[] = ["♠", "♥", "♦", "♣"];

// 8 foundations: foundations[0],[4] = ♠, [1],[5] = ♥, [2],[6] = ♦, [3],[7] = ♣
function suitFoundationIndices(suit: Suit): number[] {
  const base = SUIT_ORDER.indexOf(suit);
  return [base, base + 4];
}

function canPlaceFoundation(foundation: Card[], card: Card): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1]!;
  return card.suit === top.suit && card.rank === top.rank + 1;
}

function findOpenFoundation(foundations: Card[][], card: Card): number {
  const idxs = suitFoundationIndices(card.suit);
  for (const i of idxs) {
    if (canPlaceFoundation(foundations[i]!, card)) return i;
  }
  return -1;
}

// Tableau: build down alternating color
function isRed(suit: Suit): boolean { return suit === "♥" || suit === "♦"; }

function canPlaceTableau(target: Card[], card: Card): boolean {
  if (target.length === 0) return true;
  const top = target[target.length - 1]!;
  return isRed(top.suit) !== isRed(card.suit) && card.rank === top.rank - 1;
}

export function initialState(seed: number): PaganiniState {
  const rng = mulberry32(seed);
  // Paganini uses a single deck dealt into 8 columns
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
    foundations: [[], [], [], [], [], [], [], []],
    stock: [],
    waste: [],
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: PaganiniState, action: PaganiniAction): PaganiniState {
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
      if (!to || !canPlaceTableau(to, card)) return state;
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
      if (!foundation || !canPlaceFoundation(foundation, card)) return state;
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

export function isTerminal(state: PaganiniState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
