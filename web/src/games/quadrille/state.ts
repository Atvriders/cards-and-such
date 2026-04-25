import type { Card, Suit } from "../../engines/deck/index.js";
import { SUITS, RANKS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuadrilleSettings {
  _dummy?: undefined;
}

export interface QuadrilleState {
  /** 4 "up" foundations: build 5→K for each suit */
  upFoundations: { suit: Suit; cards: Card[] }[];
  /** 4 "down" foundations: build 4→A for each suit */
  downFoundations: { suit: Suit; cards: Card[] }[];
  /** Stock pile */
  stock: Card[];
  /** Waste (one card visible) */
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
  recyclesLeft: number;
}

export type QuadrilleAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "play-waste-up"; suitIndex: number }
  | { type: "play-waste-down"; suitIndex: number };

/** Quadrille: Remove all 6s and deal to center. Each suit has two foundations:
 * "up" pile: builds 5, 7, 8, 9, 10, J, Q, K (filling upward from 5, skipping 6)
 * "down" pile: builds 4, 3, 2, A (filling downward from 4)
 * Actually classic Quadrille: 6s are the center piles. Foundations built:
 * - Upward from 6: 6, 7, 8, 9, 10, J, Q, K
 * - Downward from 6: 6, 5, 4, 3, 2, A
 * But that uses 6 twice... The real rule: 6s go to center immediately.
 * One pile per suit: builds 5→K (8 cards) on top half, and 4→A (4 cards? no, 5 cards counting from 4 to A) on bottom.
 * Actually: Quadrille uses TWO piles per suit: an "up" pile (6→K wrapping over K to Q? no).
 * Simple interpretation: 6s start. Up pile adds 7,8..K; down pile adds 5,4,3,2,A.
 * So we remove all 6s (4 cards), deal rest to stock (48 cards).
 * For each suit: upCards go on the 6 building 7..K (7 cards), downCards go building 5..A (5 cards).
 * Total per suit: 1(six) + 7(up) + 5(down) = 13. Total 52. Correct!
 */

export function initialState(seed: number, _settings: QuadrilleSettings): QuadrilleState {
  const rng = mulberry32(seed);
  // Remove all 6s, shuffle the rest
  const allCards = newDeck();
  const sixes = allCards.filter((c) => c.rank === 6);
  const rest = shuffle(allCards.filter((c) => c.rank !== 6), rng);

  // upFoundations: each suit starts with the 6, builds upward to K
  const upFoundations = SUITS.map((suit) => ({
    suit,
    cards: [sixes.find((c) => c.suit === suit)!], // 6 already placed
  }));

  // downFoundations: each suit starts empty, builds downward 5→A
  const downFoundations = SUITS.map((suit) => ({
    suit,
    cards: [] as Card[],
  }));

  return {
    upFoundations,
    downFoundations,
    stock: rest,
    waste: [],
    score: 4, // 4 sixes placed
    movesMade: 0,
    won: false,
    recyclesLeft: 2,
  };
}

function canPlayUp(f: { suit: Suit; cards: Card[] }, c: Card): boolean {
  if (f.suit !== c.suit) return false;
  if (f.cards.length === 0) return c.rank === 6;
  const top = f.cards[f.cards.length - 1]!;
  if (top.rank === 13) return false; // already complete (K)
  return (c.rank as number) === (top.rank as number) + 1;
}

function canPlayDown(f: { suit: Suit; cards: Card[] }, c: Card): boolean {
  if (f.suit !== c.suit) return false;
  if (f.cards.length === 0) return c.rank === 5; // starts at 5 (below the 6)
  const top = f.cards[f.cards.length - 1]!;
  if (top.rank === 1) return false; // already complete (A)
  return (c.rank as number) === (top.rank as number) - 1;
}

export function reducer(state: QuadrilleState, action: QuadrilleAction): QuadrilleState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      return { ...state, stock: newStock, waste: [...state.waste, card] };
    }

    case "recycle": {
      if (state.stock.length > 0 || state.recyclesLeft <= 0 || state.waste.length === 0) return state;
      return {
        ...state,
        stock: [...state.waste].reverse(),
        waste: [],
        recyclesLeft: state.recyclesLeft - 1,
      };
    }

    case "play-waste-up": {
      const si = action.suitIndex;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const f = state.upFoundations[si]!;
      if (!canPlayUp(f, card)) return state;
      const newUpF = state.upFoundations.map((ff, i) =>
        i === si ? { ...ff, cards: [...ff.cards, card] } : ff,
      );
      const newWaste = state.waste.slice(0, -1);
      const total = newUpF.reduce((s, ff) => s + ff.cards.length, 0) +
        state.downFoundations.reduce((s, ff) => s + ff.cards.length, 0);
      return {
        ...state,
        upFoundations: newUpF,
        waste: newWaste,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 52,
      };
    }

    case "play-waste-down": {
      const si = action.suitIndex;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const f = state.downFoundations[si]!;
      if (!canPlayDown(f, card)) return state;
      const newDownF = state.downFoundations.map((ff, i) =>
        i === si ? { ...ff, cards: [...ff.cards, card] } : ff,
      );
      const newWaste = state.waste.slice(0, -1);
      const total = state.upFoundations.reduce((s, ff) => s + ff.cards.length, 0) +
        newDownF.reduce((s, ff) => s + ff.cards.length, 0);
      return {
        ...state,
        downFoundations: newDownF,
        waste: newWaste,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: QuadrilleState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
