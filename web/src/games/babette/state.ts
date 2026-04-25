import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Babette Solitaire
 * Single deck. Deal 10 columns of 5 cards face-up (last card exposed).
 * The remaining 2 cards form the "hand" (drawn one at a time).
 * Build 4 foundations A→K by suit.
 * On the tableau build down in alternating color; only top card moves.
 */

export interface BabetteState {
  foundations: Card[][];
  columns: Card[][];
  hand: Card[];
  handIndex: number;
  score: number;
  movesMade: number;
  won: boolean;
}

export type BabetteAction =
  | { type: "move-col-to-foundation"; colIndex: number; foundIndex: number }
  | { type: "move-col-to-col"; fromCol: number; toCol: number }
  | { type: "move-hand-to-foundation"; foundIndex: number }
  | { type: "move-hand-to-col"; colIndex: number }
  | { type: "draw-hand" };

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

function canStack(target: Card, moving: Card): boolean {
  return (
    isRed(target.suit) !== isRed(moving.suit) &&
    (target.rank as number) === (moving.rank as number) + 1
  );
}

function canFoundation(found: Card[], card: Card): boolean {
  if (found.length === 0) return card.rank === 1;
  const top = found[found.length - 1]!;
  return top.suit === card.suit && (top.rank as number) + 1 === (card.rank as number);
}

export function initialState(seed: number): BabetteState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  const columns: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 10; i++) {
    columns.push(deck.slice(idx, idx + 5));
    idx += 5;
  }
  const hand = deck.slice(idx); // remaining 2 cards

  return {
    foundations: [[], [], [], []],
    columns,
    hand,
    handIndex: 0,
    score: 0,
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: BabetteState, action: BabetteAction): BabetteState {
  if (state.won) return state;

  switch (action.type) {
    case "move-col-to-foundation": {
      const { colIndex, foundIndex } = action;
      const col = state.columns[colIndex];
      const found = state.foundations[foundIndex];
      if (!col || col.length === 0 || !found) return state;
      const card = col[col.length - 1]!;
      if (!canFoundation(found, card)) return state;
      const newCols = state.columns.map((c, i) => i === colIndex ? c.slice(0, -1) : [...c]);
      const newFound = state.foundations.map((f, i) => i === foundIndex ? [...f, card] : [...f]);
      const won = newFound.every((f) => f.length === 13);
      return { ...state, columns: newCols, foundations: newFound, score: state.score + 5, movesMade: state.movesMade + 1, won };
    }

    case "move-col-to-col": {
      const { fromCol, toCol } = action;
      if (fromCol === toCol) return state;
      const from = state.columns[fromCol];
      const to = state.columns[toCol];
      if (!from || from.length === 0 || !to) return state;
      const card = from[from.length - 1]!;
      if (to.length > 0 && !canStack(to[to.length - 1]!, card)) return state;
      const newCols = state.columns.map((c, i) => {
        if (i === fromCol) return c.slice(0, -1);
        if (i === toCol) return [...c, card];
        return [...c];
      });
      return { ...state, columns: newCols, movesMade: state.movesMade + 1 };
    }

    case "draw-hand": {
      if (state.handIndex >= state.hand.length) return state;
      return { ...state, handIndex: state.handIndex + 1, movesMade: state.movesMade + 1 };
    }

    case "move-hand-to-foundation": {
      const { foundIndex } = action;
      if (state.handIndex === 0) return state;
      const card = state.hand[state.handIndex - 1]!;
      const found = state.foundations[foundIndex];
      if (!found || !canFoundation(found, card)) return state;
      const newHand = state.hand.filter((_, i) => i !== state.handIndex - 1);
      const newFound = state.foundations.map((f, i) => i === foundIndex ? [...f, card] : [...f]);
      const won = newFound.every((f) => f.length === 13);
      return { ...state, hand: newHand, handIndex: state.handIndex - 1, foundations: newFound, score: state.score + 5, movesMade: state.movesMade + 1, won };
    }

    case "move-hand-to-col": {
      const { colIndex } = action;
      if (state.handIndex === 0) return state;
      const card = state.hand[state.handIndex - 1]!;
      const col = state.columns[colIndex];
      if (!col) return state;
      if (col.length > 0 && !canStack(col[col.length - 1]!, card)) return state;
      const newHand = state.hand.filter((_, i) => i !== state.handIndex - 1);
      const newCols = state.columns.map((c, i) => i === colIndex ? [...c, card] : [...c]);
      return { ...state, hand: newHand, handIndex: state.handIndex - 1, columns: newCols, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BabetteState): { score: number } | null {
  if (state.won) return { score: state.score };
  // No legal moves: no stock left, no valid col→foundation or col→col or hand→anywhere
  if (state.hand.length > state.handIndex) return null; // still can draw
  // Check if any move is possible
  for (let ci = 0; ci < state.columns.length; ci++) {
    const col = state.columns[ci]!;
    if (col.length === 0) continue;
    const card = col[col.length - 1]!;
    for (let fi = 0; fi < 4; fi++) {
      if (canFoundation(state.foundations[fi]!, card)) return null;
    }
    for (let ti = 0; ti < state.columns.length; ti++) {
      if (ti === ci) continue;
      const to = state.columns[ti]!;
      if (to.length === 0 || canStack(to[to.length - 1]!, card)) return null;
    }
  }
  return { score: state.score };
}
