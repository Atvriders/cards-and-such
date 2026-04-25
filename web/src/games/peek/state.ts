import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Peek Solitaire
 * Single deck. Deal 3 rows of 4 cards face-up (overlapping fans) = 12 tableau piles.
 * Stock drawn 3 at a time (dealt as one row at a time over the 12 piles).
 * Build 4 foundations Ace→King by suit.
 * Only exposed top cards are playable to foundations or between columns.
 * Tableau: build down by rank only (any suit), single cards only.
 */

export interface PeekState {
  foundations: Card[][];
  tableau: Card[][];   // 12 piles
  stock: Card[][];     // batches of up to 12 (one deal round at a time)
  stockRound: number;
  score: number;
  movesMade: number;
  won: boolean;
}

export type PeekAction =
  | { type: "deal-round" }
  | { type: "move-to-foundation"; colIndex: number; foundIndex: number }
  | { type: "move-col"; fromCol: number; toCol: number };

function canFoundation(found: Card[], card: Card): boolean {
  if (found.length === 0) return card.rank === 1;
  const top = found[found.length - 1]!;
  return top.suit === card.suit && (top.rank as number) + 1 === (card.rank as number);
}

function canTableau(target: Card, moving: Card): boolean {
  return (target.rank as number) === (moving.rank as number) + 1;
}

export function initialState(seed: number): PeekState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Deal first 12 cards to tableau (1 each)
  const tableau: Card[][] = [];
  for (let i = 0; i < 12; i++) {
    tableau.push([deck[i]!]);
  }

  // Remaining 40 cards form rounds of 12 (3 full rounds + 4 leftover)
  const remaining = deck.slice(12);
  const stockRounds: Card[][] = [];
  for (let i = 0; i < remaining.length; i += 12) {
    stockRounds.push(remaining.slice(i, i + 12));
  }

  return {
    foundations: [[], [], [], []],
    tableau,
    stock: stockRounds,
    stockRound: 0,
    score: 0,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: PeekState, action: PeekAction): PeekState {
  if (state.won) return state;

  switch (action.type) {
    case "deal-round": {
      if (state.stockRound >= state.stock.length) return state;
      const round = state.stock[state.stockRound]!;
      const newTableau = state.tableau.map((col, i) => {
        const card = round[i];
        return card ? [...col, card] : [...col];
      });
      return { ...state, tableau: newTableau, stockRound: state.stockRound + 1, movesMade: state.movesMade + 1 };
    }

    case "move-to-foundation": {
      const { colIndex, foundIndex } = action;
      const col = state.tableau[colIndex];
      const found = state.foundations[foundIndex];
      if (!col || col.length === 0 || !found) return state;
      const card = col[col.length - 1]!;
      if (!canFoundation(found, card)) return state;
      const newCols = state.tableau.map((c, i) => i === colIndex ? c.slice(0, -1) : [...c]);
      const newFound = state.foundations.map((f, i) => i === foundIndex ? [...f, card] : [...f]);
      const won = newFound.every((f) => f.length === 13);
      return { ...state, tableau: newCols, foundations: newFound, score: state.score + 5, movesMade: state.movesMade + 1, won };
    }

    case "move-col": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      const from = state.tableau[fromCol];
      const to = state.tableau[toCol];
      if (!from || from.length === 0 || !to || to.length === 0) return state;
      const card = from[from.length - 1]!;
      const target = to[to.length - 1]!;
      if (!canTableau(target, card)) return state;
      const newCols = state.tableau.map((c, i) => {
        if (i === fromCol) return c.slice(0, -1);
        if (i === toCol) return [...c, card];
        return [...c];
      });
      return { ...state, tableau: newCols, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PeekState): { score: number } | null {
  if (state.won) return { score: state.score };
  if (state.stockRound < state.stock.length) return null;
  // Check if any column top can go to foundation or another column
  for (let ci = 0; ci < state.tableau.length; ci++) {
    const col = state.tableau[ci]!;
    if (col.length === 0) continue;
    const card = col[col.length - 1]!;
    for (let fi = 0; fi < 4; fi++) {
      if (canFoundation(state.foundations[fi]!, card)) return null;
    }
    for (let ti = 0; ti < state.tableau.length; ti++) {
      if (ti === ci) continue;
      const to = state.tableau[ti]!;
      if (to.length > 0 && canTableau(to[to.length - 1]!, card)) return null;
    }
  }
  return { score: state.score };
}
