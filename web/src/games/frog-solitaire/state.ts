import type { Card } from "../../engines/deck/index.js";
import { newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Frog Solitaire (also known as "The Frog")
 * Two decks. One Ace is placed on the first foundation at the start.
 * Foundations: 8 piles, each builds from Ace to King in any suit (suit-free).
 * Reserve: 13 cards dealt face-up; only the top is playable.
 * Stock: rest of the cards; drawn one at a time to a single waste pile.
 * Only waste top and reserve top are playable onto foundations.
 */

export interface FrogSolitaireState {
  foundations: Card[][];
  reserve: Card[];
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type FrogSolitaireAction =
  | { type: "draw" }
  | { type: "move-waste-to-foundation"; foundIndex: number }
  | { type: "move-reserve-to-foundation"; foundIndex: number };

function canFoundation(found: Card[], card: Card): boolean {
  if (found.length === 0) return card.rank === 1;
  const top = found[found.length - 1]!;
  return (top.rank as number) + 1 === (card.rank as number);
}

function autoFoundation(foundations: Card[][], card: Card): number {
  for (let fi = 0; fi < foundations.length; fi++) {
    if (canFoundation(foundations[fi]!, card)) return fi;
  }
  return -1;
}

export function initialState(seed: number): FrogSolitaireState {
  const rng = mulberry32(seed);
  const deck = shuffle([...newDeck(), ...newDeck()], rng);

  // Find an Ace and pull it as the first foundation card
  const aceIdx = deck.findIndex((c) => c.rank === 1);
  const aceCard = deck[aceIdx]!;
  deck.splice(aceIdx, 1);

  const foundations: Card[][] = [[aceCard], [], [], [], [], [], [], []];

  // Deal 13 reserve cards
  const reserve = deck.splice(0, 13);

  // Remainder is stock
  const stock = deck;

  return { foundations, reserve, stock, waste: [], score: 1, movesMade: 0, won: false };
}

export function reducer(state: FrogSolitaireState, action: FrogSolitaireAction): FrogSolitaireState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.shift()!;
      const newWaste = [...state.waste, card];
      // Auto-place if possible
      const fi = autoFoundation(state.foundations, card);
      if (fi >= 0) {
        const newFound = state.foundations.map((f, i) => i === fi ? [...f, card] : [...f]);
        const won = newFound.every((f) => f.length === 13);
        return { ...state, foundations: newFound, stock: newStock, waste: state.waste, score: state.score + 1, movesMade: state.movesMade + 1, won };
      }
      return { ...state, stock: newStock, waste: newWaste, movesMade: state.movesMade + 1 };
    }

    case "move-waste-to-foundation": {
      const { foundIndex } = action;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      if (!canFoundation(state.foundations[foundIndex]!, card)) return state;
      const newWaste = state.waste.slice(0, -1);
      const newFound = state.foundations.map((f, i) => i === foundIndex ? [...f, card] : [...f]);
      const won = newFound.every((f) => f.length === 13);
      return { ...state, foundations: newFound, waste: newWaste, score: state.score + 1, movesMade: state.movesMade + 1, won };
    }

    case "move-reserve-to-foundation": {
      const { foundIndex } = action;
      if (state.reserve.length === 0) return state;
      const card = state.reserve[state.reserve.length - 1]!;
      if (!canFoundation(state.foundations[foundIndex]!, card)) return state;
      const newReserve = state.reserve.slice(0, -1);
      const newFound = state.foundations.map((f, i) => i === foundIndex ? [...f, card] : [...f]);
      const won = newFound.every((f) => f.length === 13);
      return { ...state, foundations: newFound, reserve: newReserve, score: state.score + 1, movesMade: state.movesMade + 1, won };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FrogSolitaireState): { score: number } | null {
  if (state.won) return { score: state.score };
  if (state.stock.length > 0) return null;
  // Check if waste or reserve top can go to any foundation
  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1]!;
    if (autoFoundation(state.foundations, card) >= 0) return null;
  }
  if (state.reserve.length > 0) {
    const card = state.reserve[state.reserve.length - 1]!;
    if (autoFoundation(state.foundations, card) >= 0) return null;
  }
  return { score: state.score };
}
