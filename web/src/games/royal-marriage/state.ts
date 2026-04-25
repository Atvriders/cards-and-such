import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RoyalMarriageSettings {
  _dummy?: undefined;
}

export interface RoyalMarriageState {
  /** The row of cards currently in play */
  row: Card[];
  /** The stock of remaining undealt cards */
  stock: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type RoyalMarriageAction =
  | { type: "deal-card" }
  | { type: "discard-between"; leftIdx: number; rightIdx: number };

/** Royal Marriage: place King of Hearts at start, Queen of Hearts at end.
 *  Build a row by dealing cards. If two cards of same suit or same rank
 *  sandwich one or two cards, remove the sandwiched card(s).
 *  Win when King and Queen are adjacent (all other cards gone). */

export function initialState(seed: number, _settings: RoyalMarriageSettings): RoyalMarriageState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Extract King of Hearts and Queen of Hearts
  const kingIdx = deck.findIndex((c) => c.rank === 13 && c.suit === "♥");
  const kingOfHearts = deck.splice(kingIdx, 1)[0]!;
  const queenIdx = deck.findIndex((c) => c.rank === 12 && c.suit === "♥");
  const queenOfHearts = deck.splice(queenIdx, 1)[0]!;

  // King at position 0, Queen at the very end of the stock as last card
  const row: Card[] = [kingOfHearts];
  const stock: Card[] = [...deck, queenOfHearts];

  return { row, stock, score: 0, movesMade: 0, won: false };
}

/** Cards at leftIdx and rightIdx match (same suit or same rank) */
function cardsMatch(a: Card, b: Card): boolean {
  return a.suit === b.suit || a.rank === b.rank;
}

export function reducer(
  state: RoyalMarriageState,
  action: RoyalMarriageAction,
): RoyalMarriageState {
  if (state.won) return state;

  switch (action.type) {
    case "deal-card": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.shift()!;
      const newRow = [...state.row, card];
      return {
        ...state,
        stock: newStock,
        row: newRow,
        movesMade: state.movesMade + 1,
      };
    }

    case "discard-between": {
      const { leftIdx, rightIdx } = action;
      const row = state.row;
      if (leftIdx < 0 || rightIdx >= row.length) return state;
      const gap = rightIdx - leftIdx;
      if (gap !== 2 && gap !== 3) return state; // only 1 or 2 cards between
      const left = row[leftIdx]!;
      const right = row[rightIdx]!;
      if (!cardsMatch(left, right)) return state;

      const removed = rightIdx - leftIdx - 1;
      const newRow = [
        ...row.slice(0, leftIdx + 1),
        ...row.slice(rightIdx),
      ];

      // Check win: King at start, Queen at end, only those two remain
      const won =
        newRow.length === 2 &&
        newRow[0]!.rank === 13 &&
        newRow[0]!.suit === "♥" &&
        newRow[1]!.rank === 12 &&
        newRow[1]!.suit === "♥" &&
        state.stock.length === 0;

      return {
        ...state,
        row: newRow,
        score: state.score + removed * 5,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RoyalMarriageState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
