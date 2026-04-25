import type { Card, Suit } from "../../engines/deck/index.js";
import { newDeck, shuffle, SUITS } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BetsyRossState {
  /** 4 reference piles (A, 2, 3, 4 — one per suit, just for display) */
  reference: Card[];
  /** 4 foundation piles — build up by 2s from A: A,3,5,7,9,J,K (odd) or 2,4,6,8,10,Q (even) */
  foundations: Card[][];
  /** The building bases: one per suit, each with a face-up base card */
  bases: Array<{ suit: Suit; nextRank: number }>;
  /** Stock */
  stock: Card[];
  /** Waste pile */
  waste: Card[];
  movesMade: number;
  won: boolean;
}

export type BetsyRossAction =
  | { type: "draw" }
  | { type: "move-waste-to-foundation" };

// Foundation sequence: build up by 2 from Ace (wrapping: A=1,3,5,7,9,11,13 for odd; 2,4,6,8,10,12 then done)
// Betsy Ross: each suit has a foundation starting at Ace, building by 2 (mod 13):
// A(1) -> 3 -> 5 -> 7 -> 9 -> J(11) -> K(13) -> 2 -> 4 -> 6 -> 8 -> 10 -> Q(12) = 13 cards each

function nextInSequence(current: number): number {
  // Build by 2, wrapping from 13 -> 2 (rank mod 13 + 1, stepping by 2)
  // Sequence for each suit: 1,3,5,7,9,11,13,2,4,6,8,10,12 (13 steps)
  const sequence = [1, 3, 5, 7, 9, 11, 13, 2, 4, 6, 8, 10, 12];
  const idx = sequence.indexOf(current);
  if (idx === -1 || idx === 12) return -1; // complete
  return sequence[idx + 1]!;
}

const SUIT_ORDER: Suit[] = ["♠", "♥", "♦", "♣"];

export function initialState(seed: number): BetsyRossState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Extract one Ace per suit for foundations
  const foundations: Card[][] = [[], [], [], []];
  const bases: Array<{ suit: Suit; nextRank: number }> = SUIT_ORDER.map(() => ({ suit: "♠", nextRank: 3 }));
  const remaining: Card[] = [];

  // Pull out aces in suit order
  const aces = new Map<Suit, Card>();
  const rest: Card[] = [];
  for (const card of deck) {
    if (card.rank === 1 && !aces.has(card.suit)) {
      aces.set(card.suit, card);
    } else {
      rest.push(card);
    }
  }

  SUIT_ORDER.forEach((suit, i) => {
    const ace = aces.get(suit)!;
    foundations[i] = [ace];
    bases[i] = { suit, nextRank: 3 };
  });

  return {
    reference: SUIT_ORDER.map(s => aces.get(s)!),
    foundations,
    bases,
    stock: rest,
    waste: [],
    movesMade: 0,
    won: false,
  };
}

export function reducer(state: BetsyRossState, action: BetsyRossAction): BetsyRossState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) {
        // Redeal from waste (flip waste back to stock)
        if (state.waste.length === 0) return state;
        return { ...state, stock: [...state.waste].reverse(), waste: [], movesMade: state.movesMade + 1 };
      }
      const card = state.stock[state.stock.length - 1]!;
      return {
        ...state,
        stock: state.stock.slice(0, -1),
        waste: [...state.waste, card],
        movesMade: state.movesMade + 1,
      };
    }

    case "move-waste-to-foundation": {
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const suitIdx = SUIT_ORDER.indexOf(card.suit);
      if (suitIdx === -1) return state;
      const foundation = state.foundations[suitIdx]!;
      const topCard = foundation[foundation.length - 1]!;
      const expected = nextInSequence(topCard.rank);
      if (expected === -1 || card.rank !== expected) return state;

      const newFoundations = state.foundations.map((f, i) =>
        i === suitIdx ? [...f, card] : f
      );
      const newBases = state.bases.map((b, i) => {
        if (i !== suitIdx) return b;
        const next = nextInSequence(card.rank);
        return { ...b, nextRank: next === -1 ? -1 : next };
      });
      const total = newFoundations.reduce((s, f) => s + f.length, 0);

      return {
        ...state,
        foundations: newFoundations,
        bases: newBases,
        waste: state.waste.slice(0, -1),
        movesMade: state.movesMade + 1,
        won: total === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BetsyRossState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(0, 500 - state.movesMade) };
}
