import type { Card, Suit } from "../../engines/deck/index.js";
import { SUITS, newDeck, shuffle } from "../../engines/deck/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RoyalCotillionSettings {
  _dummy?: undefined;
}

export interface RoyalCotillionState {
  /** Left bank: 8 foundations build by odds A,3,5,7,9,J,K */
  oddFoundations: { suit: Suit; cards: Card[] }[];
  /** Right bank: 8 foundations build by evens 2,4,6,8,10,Q */
  evenFoundations: { suit: Suit; cards: Card[] }[];
  /** 8 columns of reserve (3 cards each) */
  reserve: Card[][];
  /** Stock */
  stock: Card[];
  /** Waste (top 1 visible) */
  waste: Card[];
  score: number;
  movesMade: number;
  won: boolean;
  recyclesLeft: number;
}

export type RoyalCotillionAction =
  | { type: "draw" }
  | { type: "recycle" }
  | { type: "play-waste-odd"; foundationIndex: number }
  | { type: "play-waste-even"; foundationIndex: number }
  | { type: "play-reserve-odd"; reserveIndex: number; foundationIndex: number }
  | { type: "play-reserve-even"; reserveIndex: number; foundationIndex: number };

const ODD_SEQ = [1, 3, 5, 7, 9, 11, 13]; // A,3,5,7,9,J,K (7 cards)
const EVEN_SEQ = [2, 4, 6, 8, 10, 12]; // 2,4,6,8,10,Q (6 cards)

// Royal Cotillion uses 2 decks — odd and even foundations each have 2 piles per suit
// Total: 8 odd foundations + 8 even foundations = 16 foundations × ~6.5 cards = 104 total
// Actually Royal Cotillion is a 2-deck patience game (104 cards)

function canPlayOdd(f: { suit: Suit; cards: Card[] }, c: Card): boolean {
  if (f.suit !== c.suit) return false;
  if (f.cards.length === 0) return c.rank === 1; // starts at Ace
  const nextIdx = f.cards.length;
  if (nextIdx >= ODD_SEQ.length) return false;
  return (c.rank as number) === ODD_SEQ[nextIdx]!;
}

function canPlayEven(f: { suit: Suit; cards: Card[] }, c: Card): boolean {
  if (f.suit !== c.suit) return false;
  if (f.cards.length === 0) return c.rank === 2; // starts at 2
  const nextIdx = f.cards.length;
  if (nextIdx >= EVEN_SEQ.length) return false;
  return (c.rank as number) === EVEN_SEQ[nextIdx]!;
}

export function initialState(seed: number, _settings: RoyalCotillionSettings): RoyalCotillionState {
  const rng = mulberry32(seed);
  // Two decks
  const deck = shuffle(newDeck(2), rng);

  // 8 reserve columns of 3 cards each = 24 cards
  const reserve: Card[][] = [];
  let idx = 0;
  for (let i = 0; i < 8; i++) {
    reserve.push(deck.slice(idx, idx + 3));
    idx += 3;
  }

  // Rest goes to stock
  const stock = deck.slice(idx);

  // 8 odd foundations (2 per suit), 8 even foundations (2 per suit)
  const oddFoundations: { suit: Suit; cards: Card[] }[] = [];
  const evenFoundations: { suit: Suit; cards: Card[] }[] = [];
  for (let copy = 0; copy < 2; copy++) {
    for (const suit of SUITS) {
      oddFoundations.push({ suit, cards: [] });
      evenFoundations.push({ suit, cards: [] });
    }
  }

  return {
    oddFoundations,
    evenFoundations,
    reserve,
    stock,
    waste: [],
    score: 0,
    movesMade: 0,
    won: false,
    recyclesLeft: 2,
  };
}

function tryPlay(
  source: Card[],
  foundations: { suit: Suit; cards: Card[] }[],
  fi: number,
  canPlay: (f: { suit: Suit; cards: Card[] }, c: Card) => boolean,
): { newSource: Card[]; newFoundations: typeof foundations } | null {
  if (source.length === 0) return null;
  const card = source[source.length - 1]!;
  const f = foundations[fi];
  if (!f || !canPlay(f, card)) return null;
  const newFoundations = foundations.map((ff, i) =>
    i === fi ? { ...ff, cards: [...ff.cards, card] } : ff,
  );
  const newSource = source.slice(0, -1);
  return { newSource, newFoundations };
}

export function reducer(
  state: RoyalCotillionState,
  action: RoyalCotillionAction,
): RoyalCotillionState {
  if (state.won) return state;

  function totalCards() {
    const odd = state.oddFoundations.reduce((s, f) => s + f.cards.length, 0);
    const even = state.evenFoundations.reduce((s, f) => s + f.cards.length, 0);
    return odd + even + state.reserve.reduce((s, p) => s + p.length, 0) + state.stock.length + state.waste.length;
  }

  function totalFoundation(o: typeof state.oddFoundations, e: typeof state.evenFoundations) {
    return o.reduce((s, f) => s + f.cards.length, 0) + e.reduce((s, f) => s + f.cards.length, 0);
  }

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

    case "play-waste-odd": {
      const result = tryPlay(state.waste, state.oddFoundations, action.foundationIndex, canPlayOdd);
      if (!result) return state;
      const total = totalFoundation(result.newFoundations, state.evenFoundations);
      return {
        ...state,
        waste: result.newSource,
        oddFoundations: result.newFoundations,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 104,
      };
    }

    case "play-waste-even": {
      const result = tryPlay(state.waste, state.evenFoundations, action.foundationIndex, canPlayEven);
      if (!result) return state;
      const total = totalFoundation(state.oddFoundations, result.newFoundations);
      return {
        ...state,
        waste: result.newSource,
        evenFoundations: result.newFoundations,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 104,
      };
    }

    case "play-reserve-odd": {
      const reservePile = state.reserve[action.reserveIndex];
      if (!reservePile || reservePile.length === 0) return state;
      const result = tryPlay(reservePile, state.oddFoundations, action.foundationIndex, canPlayOdd);
      if (!result) return state;
      const newReserve = state.reserve.map((p, i) => i === action.reserveIndex ? result.newSource : [...p]);
      const total = totalFoundation(result.newFoundations, state.evenFoundations);
      return {
        ...state,
        reserve: newReserve,
        oddFoundations: result.newFoundations,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 104,
      };
    }

    case "play-reserve-even": {
      const reservePile = state.reserve[action.reserveIndex];
      if (!reservePile || reservePile.length === 0) return state;
      const result = tryPlay(reservePile, state.evenFoundations, action.foundationIndex, canPlayEven);
      if (!result) return state;
      const newReserve = state.reserve.map((p, i) => i === action.reserveIndex ? result.newSource : [...p]);
      const total = totalFoundation(state.oddFoundations, result.newFoundations);
      return {
        ...state,
        reserve: newReserve,
        evenFoundations: result.newFoundations,
        movesMade: state.movesMade + 1,
        score: total,
        won: total === 104,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: RoyalCotillionState): { score: number } | null {
  if (!state.won) return null;
  return { score: state.score };
}
