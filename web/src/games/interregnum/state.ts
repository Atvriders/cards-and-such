import type { Card } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface InterregnumSettings {
  _dummy?: undefined;
}

/** Interregnum: Two-deck game.
 *  8 foundations, each starting on a random rank (one card dealt per suit from two special piles).
 *  Build foundations up by suit, wrapping (e.g., 8→9→10→J→Q→K→A→2→…→7).
 *  8 discard piles (tableau). Stock deals one at a time. Each discard pile holds any cards.
 *  Only top of discard is available to play. */
export interface InterregnumState {
  foundations: { suit: string; baseRank: number; cards: Card[] }[];
  discards: Card[][];
  stock: Card[];
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
}

export type InterregnumAction =
  | { type: "draw" }
  | { type: "move-to-foundation"; fromType: "discard" | "waste"; fromIdx: number; foundIdx: number }
  | { type: "move-waste-to-discard"; discardIdx: number }
  | { type: "move-discard-to-discard"; fromIdx: number; toIdx: number };

function rankPlusN(rank: number, n: number): number {
  return ((rank - 1 + n) % 13) + 1;
}

function foundationNext(baseRank: number, cards: Card[]): number {
  if (cards.length === 0) return baseRank;
  return rankPlusN(cards[cards.length - 1]!.rank, 1);
}

export function initialState(seed: number, _settings: InterregnumSettings): InterregnumState {
  const rng = mulberry32(seed);
  const d1 = newDeck();
  const d2 = newDeck().map((c) => ({ ...c, id: c.id + "-b" }));
  const deck = shuffle([...d1, ...d2], rng); // 104 cards

  // Find the first occurrence of each suit to determine base ranks
  // Pick 2 "base" cards per suit (one for each of the 2 foundations per suit)
  // Strategy: scan deck for first 2 cards of each suit
  const suitCount: Record<string, number> = {};
  const baseCards: Card[] = [];
  const restCards: Card[] = [];

  for (const card of deck) {
    const count = suitCount[card.suit] ?? 0;
    if (count < 2) {
      suitCount[card.suit] = count + 1;
      baseCards.push(card);
    } else {
      restCards.push(card);
    }
  }
  // baseCards now has exactly 8 cards (2 per suit)

  // Build foundations: each suit gets base rank from the first base card of that suit
  const foundations: InterregnumState["foundations"] = [];
  const suitBase: Record<string, number> = {};
  for (const card of baseCards) {
    if (!suitBase[card.suit]) suitBase[card.suit] = card.rank;
  }

  for (const suit of SUITS) {
    const base = suitBase[suit] ?? 1;
    foundations.push({ suit, baseRank: base, cards: [] });
    foundations.push({ suit, baseRank: base, cards: [] });
  }

  // Place each base card on its corresponding foundation
  for (const card of baseCards) {
    const fi = foundations.findIndex((f) => f.suit === card.suit && f.cards.length === 0);
    if (fi >= 0) foundations[fi]!.cards.push(card);
  }

  // 8 discard piles, all start empty
  const discards: Card[][] = Array.from({ length: 8 }, () => []);

  return {
    foundations,
    discards,
    stock: restCards,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
  };
}

function totalOnFoundations(f: InterregnumState["foundations"]): number {
  return f.reduce((s, ff) => s + ff.cards.length, 0);
}

export function reducer(state: InterregnumState, action: InterregnumAction): InterregnumState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      return { ...state, stock: newStock, waste: [...state.waste, card], movesMade: state.movesMade + 1 };
    }

    case "move-to-foundation": {
      const { fromType, fromIdx, foundIdx } = action;
      let card: Card | undefined;
      let newDiscards = state.discards.map((d) => [...d]);
      let newWaste = [...state.waste];

      if (fromType === "discard") {
        const d = newDiscards[fromIdx];
        if (!d || d.length === 0) return state;
        card = d[d.length - 1]!;
        newDiscards[fromIdx] = d.slice(0, -1);
      } else {
        if (state.waste.length === 0) return state;
        card = newWaste[newWaste.length - 1]!;
        newWaste = newWaste.slice(0, -1);
      }

      const f = state.foundations[foundIdx];
      if (!f || f.suit !== card.suit) return state;
      if (card.rank !== foundationNext(f.baseRank, f.cards)) return state;

      const newFoundations = state.foundations.map((ff, i) =>
        i === foundIdx ? { ...ff, cards: [...ff.cards, card!] } : ff,
      );
      const total = totalOnFoundations(newFoundations);

      return {
        ...state,
        discards: newDiscards,
        waste: newWaste,
        foundations: newFoundations,
        score: state.score + 5,
        movesMade: state.movesMade + 1,
        won: total === 104,
      };
    }

    case "move-waste-to-discard": {
      const { discardIdx } = action;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      const newDiscards = state.discards.map((d, i) =>
        i === discardIdx ? [...d, card] : [...d],
      );
      return {
        ...state,
        discards: newDiscards,
        waste: state.waste.slice(0, -1),
        movesMade: state.movesMade + 1,
      };
    }

    case "move-discard-to-discard": {
      const { fromIdx, toIdx } = action;
      if (fromIdx === toIdx) return state;
      const from = state.discards[fromIdx];
      if (!from || from.length === 0) return state;
      const card = from[from.length - 1]!;
      const newDiscards = state.discards.map((d, i) => {
        if (i === fromIdx) return d.slice(0, -1);
        if (i === toIdx) return [...d, card];
        return [...d];
      });
      return { ...state, discards: newDiscards, movesMade: state.movesMade + 1 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: InterregnumState): { score: number } | null {
  if (totalOnFoundations(state.foundations) !== 104) return null;
  return { score: state.score };
}
