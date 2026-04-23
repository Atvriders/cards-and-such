import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AuldLangSyneSettings {
  _dummy?: undefined;
}

export interface AuldLangSyneState {
  /** 4 foundations (one per suit), pre-loaded with the Ace. Top = last. */
  foundations: Card[][];
  /** 4 tableau piles, 1 card each initially. Top = last. */
  tableau: Card[][];
  /** Stock: remaining 47 cards (deck minus 4 aces minus 4 dealt to tableau). */
  stock: Card[];
  /** Waste pile for discarded cards. */
  waste: Card[];
  movesMade: number;
  won: boolean;
  settings: AuldLangSyneSettings;
}

export type AuldLangSyneAction =
  | { type: "move-to-foundation"; tableauIdx: number }
  | { type: "discard-to-waste"; tableauIdx: number }
  | { type: "draw" };

/** Suits in foundation order */
const FOUNDATION_SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function initialState(seed: number, settings: AuldLangSyneSettings): AuldLangSyneState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Extract the 4 Aces (one per suit) for foundations
  const aces: Card[] = [];
  const remaining: Card[] = [];
  for (const card of deck) {
    if (card.rank === 1) {
      aces.push(card);
    } else {
      remaining.push(card);
    }
  }

  // Sort aces by suit order for consistent foundation assignment
  const foundations: Card[][] = FOUNDATION_SUITS.map((suit) => {
    const ace = aces.find((a) => a.suit === suit)!;
    return [ace];
  });

  // Deal 4 cards to tableau (one each)
  const tableau: Card[][] = [];
  for (let i = 0; i < 4; i++) {
    tableau.push([remaining[i]!]);
  }

  const stock = remaining.slice(4);

  return {
    foundations,
    tableau,
    stock,
    waste: [],
    movesMade: 0,
    won: false,
    settings,
  };
}

export function reducer(state: AuldLangSyneState, action: AuldLangSyneAction): AuldLangSyneState {
  if (state.won) return state;

  switch (action.type) {
    case "move-to-foundation": {
      const { tableauIdx } = action;
      const col = state.tableau[tableauIdx];
      if (!col || col.length === 0) return state;
      const card = col[col.length - 1]!;

      // Find matching foundation (same suit)
      const fIdx = FOUNDATION_SUITS.indexOf(card.suit);
      if (fIdx === -1) return state;
      const foundation = state.foundations[fIdx]!;
      const topFoundation = foundation[foundation.length - 1]!;

      // Must be same suit, one rank higher
      if (card.suit !== topFoundation.suit) return state;
      if (card.rank !== topFoundation.rank + 1) return state;

      const newTableau = state.tableau.map((c, i) => i === tableauIdx ? c.slice(0, -1) : [...c]);
      const newFoundations = state.foundations.map((f, i) => i === fIdx ? [...f, card] : [...f]);

      // If tableau is empty, deal from stock
      const finalTableau = newTableau.map((col, i) => {
        if (col.length === 0 && state.stock.length > 0) {
          // we'll handle stock dealing below
          return col;
        }
        return col;
      });

      // Refill empty tableau slots from stock
      let stockRemaining = [...state.stock];
      const refilledTableau = newTableau.map((col) => {
        if (col.length === 0 && stockRemaining.length > 0) {
          const card = stockRemaining.pop()!;
          return [card];
        }
        return col;
      });

      const totalOnFoundations = newFoundations.reduce((s, f) => s + f.length, 0);
      const won = totalOnFoundations === 52;

      return {
        ...state,
        foundations: newFoundations,
        tableau: refilledTableau,
        stock: stockRemaining,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "discard-to-waste": {
      const { tableauIdx } = action;
      const col = state.tableau[tableauIdx];
      if (!col || col.length === 0) return state;
      const card = col[col.length - 1]!;

      const newTableau = state.tableau.map((c, i) => i === tableauIdx ? c.slice(0, -1) : [...c]);
      const newWaste = [...state.waste, card];

      // Refill empty tableau slots from stock
      let stockRemaining = [...state.stock];
      const refilledTableau = newTableau.map((col) => {
        if (col.length === 0 && stockRemaining.length > 0) {
          const drawn = stockRemaining.pop()!;
          return [drawn];
        }
        return col;
      });

      return {
        ...state,
        tableau: refilledTableau,
        stock: stockRemaining,
        waste: newWaste,
        movesMade: state.movesMade + 1,
      };
    }

    case "draw": {
      if (state.stock.length === 0) return state;
      // Deal one card to each empty tableau slot, or just draw to waste
      let stockRemaining = [...state.stock];
      const newTableau = state.tableau.map((col) => {
        if (col.length === 0 && stockRemaining.length > 0) {
          const drawn = stockRemaining.pop()!;
          return [drawn];
        }
        return col;
      });
      // If no empty slots, draw one card to waste
      if (stockRemaining.length === state.stock.length && stockRemaining.length > 0) {
        const drawn = stockRemaining.pop()!;
        return {
          ...state,
          tableau: newTableau,
          stock: stockRemaining,
          waste: [...state.waste, drawn],
          movesMade: state.movesMade + 1,
        };
      }
      return {
        ...state,
        tableau: newTableau,
        stock: stockRemaining,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AuldLangSyneState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
