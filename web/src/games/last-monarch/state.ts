import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Last Monarch Solitaire
 * Goal: be left with only the four Kings in the tableau after discarding all other cards.
 * Single deck, deal all 52 cards face-up in a 4×13 grid (or linear row).
 * Discard a card if the card 3 positions ahead shares its suit or rank.
 * Continue discarding until no more valid discards exist.
 * Win: exactly the 4 Kings remain.
 */

export interface LastMonarchState {
  row: (Card | null)[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type LastMonarchAction =
  | { type: "discard"; index: number };

function cardMatches(a: Card, b: Card): boolean {
  return a.suit === b.suit || a.rank === b.rank;
}

function nextIdx(row: (Card | null)[], from: number): number {
  // The card 3 positions ahead (skipping gaps)
  let count = 0;
  let i = from + 1;
  while (i < row.length) {
    if (row[i] !== null) {
      count++;
      if (count === 3) return i;
    }
    i++;
  }
  return -1;
}

export function legalDiscards(row: (Card | null)[]): number[] {
  const result: number[] = [];
  for (let i = 0; i < row.length; i++) {
    if (row[i] === null) continue;
    const target = nextIdx(row, i);
    if (target === -1) continue;
    if (cardMatches(row[i]!, row[target]!)) {
      result.push(i);
    }
  }
  return result;
}

export function initialState(seed: number): LastMonarchState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);
  return { row: deck, score: 0, movesMade: 0, won: false };
}

export function reducer(state: LastMonarchState, action: LastMonarchAction): LastMonarchState {
  if (state.won) return state;

  switch (action.type) {
    case "discard": {
      const { index } = action;
      if (index < 0 || index >= state.row.length) return state;
      if (state.row[index] === null) return state;
      const target = nextIdx(state.row, index);
      if (target === -1) return state;
      const card = state.row[index]!;
      const tCard = state.row[target]!;
      if (!cardMatches(card, tCard)) return state;

      const newRow = [...state.row];
      newRow[index] = null;
      const remaining = newRow.filter((c) => c !== null).length;
      const kingsOnly = newRow.every((c) => c === null || c.rank === 13);
      const won = kingsOnly && remaining === 4;

      return {
        ...state,
        row: newRow,
        score: state.score + 1,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: LastMonarchState): { score: number } | null {
  if (state.won) return { score: 100 };
  const moves = legalDiscards(state.row);
  if (moves.length === 0) return { score: state.score };
  return null;
}
