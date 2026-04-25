import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SolitaireMarathonSettings {
  rounds: "3" | "5" | "7";
}

// Simple card patience: reveal cards one at a time, collect runs
export interface Card {
  suit: "♠" | "♥" | "♦" | "♣";
  rank: number; // 1-13
}

export interface SolitaireMarathonState {
  settings: SolitaireMarathonSettings;
  rngSeed: number;
  round: number;
  totalRounds: number;
  deck: Card[];
  pile: Card[];       // face-up discard pile (top = last)
  collected: number;  // number of cards collected (removed from pile)
  totalCollected: number;
  deckIdx: number;
  roundOver: boolean;
  gameOver: boolean;
}

export type SolitaireMarathonAction =
  | { type: "draw" }
  | { type: "collect" }
  | { type: "nextRound" }
  | { type: "restart" };

const SUITS: Card["suit"][] = ["♠", "♥", "♦", "♣"];

function makeDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({ suit, rank });
    }
  }
  return cards;
}

function shuffleDeck(cards: Card[], rng: () => number): Card[] {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Two top cards of pile can be collected if same suit or same rank */
function canCollect(pile: Card[]): boolean {
  if (pile.length < 2) return false;
  const top = pile[pile.length - 1]!;
  const second = pile[pile.length - 2]!;
  return top.suit === second.suit || top.rank === second.rank;
}

function startRound(seed: number): { deck: Card[]; pile: Card[]; deckIdx: number } {
  const rng = mulberry32(seed);
  const deck = shuffleDeck(makeDeck(), rng);
  return { deck, pile: [], deckIdx: 0 };
}

export function initialState(seed: number, settings: SolitaireMarathonSettings): SolitaireMarathonState {
  const { deck, pile, deckIdx } = startRound(seed);
  return {
    settings,
    rngSeed: seed,
    round: 1,
    totalRounds: parseInt(settings.rounds, 10),
    deck,
    pile,
    collected: 0,
    totalCollected: 0,
    deckIdx,
    roundOver: false,
    gameOver: false,
  };
}

export function reducer(state: SolitaireMarathonState, action: SolitaireMarathonAction): SolitaireMarathonState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "draw") {
    if (state.roundOver) return state;
    if (state.deckIdx >= state.deck.length) {
      // Deck exhausted — round over
      return { ...state, roundOver: true };
    }
    const card = state.deck[state.deckIdx]!;
    const newDeckIdx = state.deckIdx + 1;
    const roundOver = newDeckIdx >= state.deck.length;
    return {
      ...state,
      pile: [...state.pile, card],
      deckIdx: newDeckIdx,
      roundOver,
    };
  }

  if (action.type === "collect") {
    if (!canCollect(state.pile)) return state;
    // Remove the top two cards from the pile
    const newPile = state.pile.slice(0, state.pile.length - 2);
    const collected = state.collected + 2;
    return { ...state, pile: newPile, collected };
  }

  if (action.type === "nextRound") {
    if (!state.roundOver) return state;
    const nextRound = state.round + 1;
    const totalCollected = state.totalCollected + state.collected;
    const gameOver = nextRound > state.totalRounds;
    if (gameOver) {
      return { ...state, totalCollected: totalCollected, gameOver: true };
    }
    const newSeed = state.rngSeed + nextRound;
    const { deck, pile, deckIdx } = startRound(newSeed);
    return {
      ...state,
      round: nextRound,
      deck,
      pile,
      deckIdx,
      collected: 0,
      totalCollected,
      roundOver: false,
    };
  }

  return state;
}

export function isTerminal(state: SolitaireMarathonState): { score: number } | null {
  if (!state.gameOver) return null;
  // Max collectable: 52 cards per round × totalRounds = lots; score 0-100
  const maxPossible = 52 * state.totalRounds; // theoretical (not all pairs)
  return { score: Math.min(100, Math.round((state.totalCollected / (maxPossible * 0.4)) * 100)) };
}
