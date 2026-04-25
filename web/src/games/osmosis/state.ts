import type { Card, Suit } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface OsmosisSettings {
  _dummy?: undefined;
}

export interface OsmosisState {
  /** 4 reserve piles of 13 cards (face down except top) */
  reserve: Card[][];
  /** 4 foundation piles, one per suit. Each grows by matching suit IF same rank exists on first foundation */
  foundations: { suit: Suit; cards: Card[] }[];
  /** Stock pile */
  stock: Card[];
  /** Waste pile (top 1 visible) */
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
  recyclesLeft: number;
}

export type OsmosisAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "move-waste-to-foundation"; foundationIndex: number }
  | { type: "move-reserve-to-foundation"; reserveIndex: number; foundationIndex: number };

function rankVal(c: Card): number { return c.rank as number; }

/** Can we place card `c` on foundation at index `fi`?
 * Rule: the first foundation (fi=0) accepts any card of its suit.
 * Other foundations (fi=1,2,3) accept a card of their suit only if the
 * first foundation already contains a card of the same rank.
 */
function canPlaceOnFoundation(
  foundations: OsmosisState["foundations"],
  fi: number,
  c: Card,
): boolean {
  const f = foundations[fi]!;
  if (f.suit !== c.suit) return false;
  // Card must not already be on the foundation
  if (f.cards.some((x) => x.rank === c.rank)) return false;
  if (fi === 0) return true;
  // For foundations 1-3: first foundation must have same rank
  const first = foundations[0]!;
  return first.cards.some((x) => x.rank === rankVal(c));
}

export function initialState(seed: number, _settings: OsmosisSettings): OsmosisState {
  const rng = mulberry32(seed);
  const deck = shuffle(newDeck(), rng);

  // Deal 4 reserve piles of 13 cards (we only use 12 per reserve, leaving 4 for foundation starters)
  // Standard Osmosis: 4 reserve piles of 13, 1 card placed on each foundation (first foundation seed), rest to stock
  // Actually: deal 4x13=52 into reserve piles (4 piles * 13). Then first card of first reserve goes to foundation.
  // Wait - standard: 4 reserve piles of 13 = 52 total, nothing left. That can't work.
  // Real Osmosis: deal 4 piles of 13 (reserve). The top card of first reserve starts the first foundation.
  // But that's 4*13=52 with no stock. Alternate: 4 piles of 4 = 16 reserve, 1 card to first foundation, 35 stock.
  // Standard rules: 4 reserve columns of 4 cards (face down except top), 1 card to first foundation, rest (35) to stock.

  const reserve: Card[][] = [[], [], [], []];
  let idx = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      reserve[i]!.push(deck[idx++]!);
    }
  }

  // First foundation started with next card, its suit determines the suit for that position
  const seed1 = deck[idx++]!;
  const foundations: OsmosisState["foundations"] = SUITS.map((suit, i) => ({
    suit: i === 0 ? seed1.suit : suit === seed1.suit ? SUITS[(SUITS.indexOf(seed1.suit) + 1) % 4]! : suit,
    cards: i === 0 ? [seed1] : [],
  }));

  // Assign remaining suits to remaining foundations (the suit order: remaining 3 suits after seed1.suit)
  const remainingSuits = SUITS.filter((s) => s !== seed1.suit);
  for (let i = 1; i < 4; i++) {
    foundations[i]!.suit = remainingSuits[i - 1]!;
  }

  // Stock: remaining cards
  const stock = deck.slice(idx);

  return {
    reserve,
    foundations,
    stock,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
    recyclesLeft: 3,
  };
}

export function reducer(state: OsmosisState, action: OsmosisAction): OsmosisState {
  if (state.won) return state;

  switch (action.type) {
    case "draw": {
      if (state.stock.length === 0) return state;
      const newStock = [...state.stock];
      const card = newStock.pop()!;
      return { ...state, stock: newStock, waste: [...state.waste, card] };
    }

    case "recycle": {
      if (state.stock.length > 0 || state.recyclesLeft <= 0) return state;
      if (state.waste.length === 0) return state;
      const newStock = [...state.waste].reverse();
      return { ...state, stock: newStock, waste: [], recyclesLeft: state.recyclesLeft - 1 };
    }

    case "move-waste-to-foundation": {
      const { foundationIndex: fi } = action;
      if (state.waste.length === 0) return state;
      const card = state.waste[state.waste.length - 1]!;
      if (!canPlaceOnFoundation(state.foundations, fi, card)) return state;
      const newWaste = state.waste.slice(0, -1);
      const newFoundations = state.foundations.map((f, i) =>
        i === fi ? { ...f, cards: [...f.cards, card] } : f,
      );
      const total = newFoundations.reduce((s, f) => s + f.cards.length, 0);
      return {
        ...state,
        waste: newWaste,
        foundations: newFoundations,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 52,
      };
    }

    case "move-reserve-to-foundation": {
      const { reserveIndex: ri, foundationIndex: fi } = action;
      const reservePile = state.reserve[ri];
      if (!reservePile || reservePile.length === 0) return state;
      const card = reservePile[reservePile.length - 1]!;
      if (!canPlaceOnFoundation(state.foundations, fi, card)) return state;
      const newReserve = state.reserve.map((pile, i) =>
        i === ri ? pile.slice(0, -1) : [...pile],
      );
      const newFoundations = state.foundations.map((f, i) =>
        i === fi ? { ...f, cards: [...f.cards, card] } : f,
      );
      const total = newFoundations.reduce((s, f) => s + f.cards.length, 0);
      return {
        ...state,
        reserve: newReserve,
        foundations: newFoundations,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 52,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: OsmosisState): { score: number } | null {
  const total = state.foundations.reduce((s, f) => s + f.cards.length, 0);
  if (total !== 52) return null;
  return { score: state.score };
}
