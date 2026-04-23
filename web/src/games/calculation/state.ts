import type { Card, Suit, Rank } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CalculationSettings {
  _dummy?: undefined;
}

/**
 * Calculation solitaire:
 * 4 foundations starting with A, 2, 3, 4 (any 4 different suits).
 * Each foundation built by a specific increment (mod 13):
 *   F0 (starts A=1): +1 each → A 2 3 4 5 6 7 8 9 10 J Q K
 *   F1 (starts 2):   +2 each → 2 4 6 8 10 Q A 3 5 7 9 J K
 *   F2 (starts 3):   +3 each → 3 6 9 Q 2 5 8 J A 4 7 10 K
 *   F3 (starts 4):   +4 each → 4 8 Q 3 7 J 2 6 10 A 5 9 K
 * 4 waste piles for temporary storage (can place any card, take only top).
 * Stock: remaining 48 cards.
 */

export interface CalculationState {
  foundations: Card[][];
  /** 4 waste piles for storage */
  wastePiles: Card[][];
  stock: Card[];
  /** card on top of stock (revealed), null if stock empty */
  stockTop: Card | null;
  movesMade: number;
  won: boolean;
  settings: CalculationSettings;
}

export type CalculationAction =
  | { type: "draw" }
  | { type: "stock-to-foundation"; foundationIdx: number }
  | { type: "stock-to-waste"; wasteIdx: number }
  | { type: "waste-to-foundation"; wasteIdx: number; foundationIdx: number };

/** The starting rank for each foundation (1=Ace, 2, 3, 4) */
const FOUNDATION_STARTS: Rank[] = [1, 2, 3, 4];
/** The increment (mod 13) for each foundation */
const FOUNDATION_INCREMENTS: number[] = [1, 2, 3, 4];

/** Next expected rank for a foundation (mod 13, 1-indexed) */
export function nextRankForFoundation(foundation: Card[], fIdx: number): Rank {
  const start = FOUNDATION_STARTS[fIdx]!;
  const inc = FOUNDATION_INCREMENTS[fIdx]!;
  const count = foundation.length; // 0 means we need the start card
  if (count === 0) return start;
  // Each foundation needs exactly 13 cards
  // Sequence: start, start+inc, start+2*inc, ... (mod 13, 1-based)
  const nextVal = ((start - 1 + count * inc) % 13) + 1;
  return nextVal as Rank;
}

export function canPlayOnFoundation(card: Card, foundation: Card[], fIdx: number): boolean {
  if (foundation.length === 13) return false;
  const needed = nextRankForFoundation(foundation, fIdx);
  return card.rank === needed;
}

export function initialState(seed: number, settings: CalculationSettings): CalculationState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Extract one card of each starting rank for the foundations
  const foundations: Card[][] = [[], [], [], []];
  const foundationCards: (Card | null)[] = [null, null, null, null];
  const usedIds = new Set<string>();

  for (const card of deck) {
    for (let i = 0; i < 4; i++) {
      if (foundationCards[i] === null && card.rank === FOUNDATION_STARTS[i]) {
        foundationCards[i] = card;
        usedIds.add(card.id);
        break;
      }
    }
  }

  for (let i = 0; i < 4; i++) {
    foundations[i] = [foundationCards[i]!];
  }

  const remaining = deck.filter((c) => !usedIds.has(c.id));
  // remaining has 48 cards
  const stockTop = remaining.length > 0 ? remaining[remaining.length - 1]! : null;
  const stock = remaining.slice(0, -1);

  return {
    foundations,
    wastePiles: [[], [], [], []],
    stock,
    stockTop,
    movesMade: 0,
    won: false,
    settings,
  };
}

export function reducer(state: CalculationState, action: CalculationAction): CalculationState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = state.stock.slice(0, -1);
      const newTop = state.stock[state.stock.length - 1]!;
      return { ...state, stock: newStock, stockTop: newTop, movesMade: state.movesMade + 1 };
    }

    case "stock-to-foundation": {
      const { foundationIdx } = action;
      if (!state.stockTop) return state;
      const foundation = state.foundations[foundationIdx]!;
      if (!canPlayOnFoundation(state.stockTop, foundation, foundationIdx)) return state;

      const newFoundations = state.foundations.map((f, i) =>
        i === foundationIdx ? [...f, state.stockTop!] : [...f]
      );

      // Reveal next stock card
      let newStockTop: Card | null = null;
      let newStock = [...state.stock];
      if (newStock.length > 0) {
        newStockTop = newStock[newStock.length - 1]!;
        newStock = newStock.slice(0, -1);
      }

      const won = newFoundations.every((f) => f.length === 13);

      return {
        ...state,
        foundations: newFoundations,
        stock: newStock,
        stockTop: newStockTop,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "stock-to-waste": {
      const { wasteIdx } = action;
      if (!state.stockTop) return state;
      if (wasteIdx < 0 || wasteIdx > 3) return state;

      const newWaste = state.wastePiles.map((w, i) =>
        i === wasteIdx ? [...w, state.stockTop!] : [...w]
      );

      let newStockTop: Card | null = null;
      let newStock = [...state.stock];
      if (newStock.length > 0) {
        newStockTop = newStock[newStock.length - 1]!;
        newStock = newStock.slice(0, -1);
      }

      return {
        ...state,
        wastePiles: newWaste,
        stock: newStock,
        stockTop: newStockTop,
        movesMade: state.movesMade + 1,
      };
    }

    case "waste-to-foundation": {
      const { wasteIdx, foundationIdx } = action;
      const waste = state.wastePiles[wasteIdx];
      if (!waste || waste.length === 0) return state;
      const card = waste[waste.length - 1]!;
      const foundation = state.foundations[foundationIdx]!;
      if (!canPlayOnFoundation(card, foundation, foundationIdx)) return state;

      const newFoundations = state.foundations.map((f, i) =>
        i === foundationIdx ? [...f, card] : [...f]
      );
      const newWaste = state.wastePiles.map((w, i) =>
        i === wasteIdx ? w.slice(0, -1) : [...w]
      );

      const won = newFoundations.every((f) => f.length === 13);

      return {
        ...state,
        foundations: newFoundations,
        wastePiles: newWaste,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CalculationState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 1000 - state.movesMade * 5) };
}
