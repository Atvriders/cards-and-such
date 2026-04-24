import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Memory Pairs (Kids) — flip cards to find matching pairs

export type MemorySymbol = "🐶" | "🐱" | "🐸" | "🦊" | "🐧" | "🐼" | "🦋" | "🌟";

export interface MemorySettings {
  pairs: "6" | "8";
}

export interface Card {
  id: number;
  symbol: MemorySymbol;
  faceUp: boolean;
  matched: boolean;
}

export interface MemoryState {
  settings: MemorySettings;
  rngSeed: number;
  cards: Card[];
  flipped: number[]; // indices of currently face-up unmatched cards (max 2)
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  message: string;
  locked: boolean; // true when 2 non-matching cards are shown briefly
}

export type MemoryAction = { type: "flip"; index: number } | { type: "clear" };

const ALL_SYMBOLS: MemorySymbol[] = ["🐶", "🐱", "🐸", "🦊", "🐧", "🐼", "🦋", "🌟"];

export function initialState(seed: number, settings: MemorySettings): MemoryState {
  const totalPairs = parseInt(settings.pairs);
  const symbols = ALL_SYMBOLS.slice(0, totalPairs);
  const pool: MemorySymbol[] = [...symbols, ...symbols];

  // Fisher-Yates shuffle using mulberry32
  const rng = mulberry32(seed);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }

  const cards: Card[] = pool.map((symbol, id) => ({ id, symbol, faceUp: false, matched: false }));

  return {
    settings,
    rngSeed: seed,
    cards,
    flipped: [],
    moves: 0,
    matchedPairs: 0,
    totalPairs,
    message: "Flip two cards to find a pair!",
    locked: false,
  };
}

export function reducer(state: MemoryState, action: MemoryAction): MemoryState {
  if (action.type === "clear") {
    // Hide the two non-matching cards
    const newCards = state.cards.map((c, i) =>
      state.flipped.includes(i) && !c.matched ? { ...c, faceUp: false } : c
    );
    return { ...state, cards: newCards, flipped: [], locked: false, message: "Flip two cards to find a pair!" };
  }

  if (action.type !== "flip") return state;
  if (state.locked) return state;
  const { index } = action;
  if (state.cards[index]!.faceUp || state.cards[index]!.matched) return state;
  if (state.flipped.length >= 2) return state;

  const newCards = state.cards.map((c, i) => (i === index ? { ...c, faceUp: true } : c));
  const newFlipped = [...state.flipped, index];

  if (newFlipped.length < 2) {
    return { ...state, cards: newCards, flipped: newFlipped };
  }

  // Two cards flipped — check for match
  const moves = state.moves + 1;
  const [a, b] = newFlipped as [number, number];
  const cardA = newCards[a]!;
  const cardB = newCards[b]!;

  if (cardA.symbol === cardB.symbol) {
    const matched = newCards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
    const matchedPairs = state.matchedPairs + 1;
    const allDone = matchedPairs === state.totalPairs;
    return {
      ...state,
      cards: matched,
      flipped: [],
      moves,
      matchedPairs,
      locked: false,
      message: allDone ? `You matched all pairs in ${moves} moves! Great job!` : "Match! Keep going!",
    };
  }

  return {
    ...state,
    cards: newCards,
    flipped: newFlipped,
    moves,
    locked: true,
    message: "No match — tap anywhere or wait!",
  };
}

export function isTerminal(state: MemoryState): { score: number } | null {
  if (state.matchedPairs < state.totalPairs) return null;
  // Score: fewer moves = higher score (max 100)
  const perfect = state.totalPairs;
  const score = Math.max(10, Math.round(100 - (state.moves - perfect) * 3));
  return { score };
}
