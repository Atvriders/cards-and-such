import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface NarcoticSettings {
  _dummy?: undefined;
}

export interface NarcoticState {
  stock: Card[];       // cards not yet turned (bottom = next to draw)
  pile: Card[];        // the single discard pile (bottom → top)
  score: number;
  movesMade: number;
  won: boolean;
  settings: NarcoticSettings;
}

export type NarcoticAction =
  | { type: "draw" }
  | { type: "remove"; targetIndex: number }; // remove cards in between pile[targetIndex] and top

export function initialState(seed: number, settings: NarcoticSettings): NarcoticState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  return {
    stock: deck,
    pile: [],
    score: 0,
    movesMade: 0,
    won: false,
    settings,
  };
}

/** Returns the index in pile[] of the top-most card (below the actual top) that matches
 *  rank or suit with the very top card. Returns -1 if none found. */
export function findMatchBelow(pile: Card[]): number {
  if (pile.length < 2) return -1;
  const top = pile[pile.length - 1]!;
  // Scan downward from second-to-top
  for (let i = pile.length - 2; i >= 0; i--) {
    const c = pile[i]!;
    if (c.rank === top.rank || c.suit === top.suit) {
      return i;
    }
  }
  return -1;
}

export function reducer(state: NarcoticState, action: NarcoticAction): NarcoticState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newCard = state.stock[state.stock.length - 1]!;
      const newStock = state.stock.slice(0, state.stock.length - 1);
      const newPile = [...state.pile, newCard];

      // After drawing, auto-remove if there's a match below
      const result = autoRemove(newPile);
      const won = newStock.length === 0 && result.pile.length === 0;

      return {
        ...state,
        stock: newStock,
        pile: result.pile,
        score: state.score + result.removed * 5,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "remove": {
      // Remove cards between pile[targetIndex] (exclusive) and top (exclusive)
      // i.e., remove pile[targetIndex+1 .. length-2], keep both endpoints
      const { targetIndex } = action;
      if (targetIndex < 0 || targetIndex >= state.pile.length - 1) return state;
      const top = state.pile[state.pile.length - 1]!;
      const anchor = state.pile[targetIndex]!;
      if (anchor.rank !== top.rank && anchor.suit !== top.suit) return state;

      const between = state.pile.length - 2 - targetIndex; // cards removed
      if (between <= 0) return state;

      const newPile = [...state.pile.slice(0, targetIndex + 1), top];
      const result = autoRemove(newPile);
      const won = state.stock.length === 0 && result.pile.length === 0;

      return {
        ...state,
        pile: result.pile,
        score: state.score + (between + result.removed) * 5,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

/** Repeatedly collapse the pile while the top matches something below */
function autoRemove(pile: Card[]): { pile: Card[]; removed: number } {
  let removed = 0;
  let cur = pile;
  let found = findMatchBelow(cur);
  while (found !== -1) {
    const between = cur.length - 2 - found;
    if (between <= 0) break; // top is directly adjacent — no cards to remove, stop
    const top = cur[cur.length - 1]!;
    cur = [...cur.slice(0, found + 1), top];
    removed += between;
    found = findMatchBelow(cur);
  }
  return { pile: cur, removed };
}

export function isTerminal(state: NarcoticState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
