import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardLineupSettings {
  // 9 cards, sort by rank
}

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface CardLineupState {
  settings: CardLineupSettings;
  cards: Card[];   // current arrangement (length 9)
  target: number[]; // sorted rank indices — correct order by rank then suit
  moves: number;
  solved: boolean;
  selected: number | null; // index of selected card for swap
}

export type CardLineupAction =
  | { type: "select"; idx: number }  // select a card to move
  | { type: "swap"; idx: number };   // swap selected with this idx

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function rankLabel(r: Rank): string {
  if (r === 11) return "J";
  if (r === 12) return "Q";
  if (r === 13) return "K";
  if (r === 14) return "A";
  return String(r);
}

function cardValue(c: Card): number {
  return c.rank * 10 + SUITS.indexOf(c.suit);
}

function isSorted(cards: Card[]): boolean {
  for (let i = 1; i < cards.length; i++) {
    if (cardValue(cards[i]!) < cardValue(cards[i - 1]!)) return false;
  }
  return true;
}

function deal9(seed: number): Card[] {
  const rng = mulberry32(seed);
  const fullDeck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      fullDeck.push({ rank, suit });
    }
  }
  // Shuffle
  for (let i = fullDeck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [fullDeck[i], fullDeck[j]] = [fullDeck[j]!, fullDeck[i]!];
  }
  const nine = fullDeck.slice(0, 9);
  // Ensure not already sorted
  if (isSorted(nine)) {
    // Swap first two cards
    [nine[0], nine[1]] = [nine[1]!, nine[0]!];
  }
  return nine;
}

export function initialState(seed: number, settings: CardLineupSettings): CardLineupState {
  const cards = deal9(seed >>> 0);
  const sorted = [...cards].sort((a, b) => cardValue(a) - cardValue(b));
  const target = sorted.map((c) => cards.findIndex((x) => x.rank === c.rank && x.suit === c.suit));
  return {
    settings,
    cards,
    target,
    moves: 0,
    solved: false,
    selected: null,
  };
}

export function reducer(state: CardLineupState, action: CardLineupAction): CardLineupState {
  if (state.solved) return state;

  if (action.type === "select") {
    if (state.selected === action.idx) {
      return { ...state, selected: null };
    }
    return { ...state, selected: action.idx };
  }

  if (action.type === "swap") {
    if (state.selected === null || state.selected === action.idx) {
      return { ...state, selected: action.idx };
    }
    const cards = [...state.cards];
    const a = state.selected;
    const b = action.idx;
    [cards[a], cards[b]] = [cards[b]!, cards[a]!];
    const solved = isSorted(cards);
    return {
      ...state,
      cards,
      moves: state.moves + 1,
      solved,
      selected: null,
    };
  }

  return state;
}

export function isTerminal(state: CardLineupState): { score: number } | null {
  if (!state.solved) return null;
  const score = Math.max(0, 200 - state.moves * 10);
  return { score };
}

export { isSorted, cardValue };
