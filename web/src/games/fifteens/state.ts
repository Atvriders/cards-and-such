import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Fifteens — card solitaire. Draw 3 face-up cards.
// Select any subset summing to 15 (Ace=1, J/Q/K=10). Remove them, draw to refill.
// Goal: clear the deck.

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export interface Card { rank: Rank; suit: Suit; id: number }

export const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const CARD_VALUE: Record<Rank, number> = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 10, Q: 10, K: 10,
};

export interface FifteensSettings { dummy: boolean }

export interface FifteensState {
  settings: FifteensSettings;
  rngSeed: number;
  deck: readonly Card[];       // remaining draw pile
  faceUp: readonly (Card | null)[]; // 3 face-up slots
  selected: readonly number[];  // selected card ids
  moves: number;
  phase: "playing" | "won" | "lost";
}

export type FifteensAction =
  | { type: "toggleSelect"; cardId: number }
  | { type: "remove" }
  | { type: "newGame" };

function makeDeck(seed: number): Card[] {
  const cards: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ rank, suit, id: id++ });
    }
  }
  // Fisher-Yates shuffle using mulberry32
  const rng = mulberry32(seed);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

function hasAnyValidMove(deck: readonly Card[], faceUp: readonly (Card | null)[]): boolean {
  const visible = faceUp.filter(Boolean) as Card[];
  if (deck.length > 0) return true; // can always draw
  // Check if any subset sums to 15
  const n = visible.length;
  for (let mask = 1; mask < (1 << n); mask++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) sum += CARD_VALUE[visible[i]!.rank];
    }
    if (sum === 15) return true;
  }
  return false;
}

export function initialState(seed: number, settings: FifteensSettings): FifteensState {
  const deck = makeDeck(seed);
  const faceUp: (Card | null)[] = [null, null, null];
  const remaining = [...deck];
  for (let i = 0; i < 3; i++) {
    faceUp[i] = remaining.shift() ?? null;
  }
  return {
    settings,
    rngSeed: seed,
    deck: remaining,
    faceUp,
    selected: [],
    moves: 0,
    phase: "playing",
  };
}

export function reducer(state: FifteensState, action: FifteensAction): FifteensState {
  if (action.type === "newGame") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (state.phase !== "playing") return state;

  if (action.type === "toggleSelect") {
    const { cardId } = action;
    const isSelected = state.selected.includes(cardId);
    const newSelected = isSelected
      ? state.selected.filter((id) => id !== cardId)
      : [...state.selected, cardId];
    return { ...state, selected: newSelected };
  }

  if (action.type === "remove") {
    const { selected, faceUp, deck } = state;
    if (selected.length === 0) return state;
    // Validate sum = 15
    const cards = faceUp.filter(Boolean) as Card[];
    const selectedCards = cards.filter((c) => selected.includes(c.id));
    if (selectedCards.length !== selected.length) return state;
    const sum = selectedCards.reduce((s, c) => s + CARD_VALUE[c.rank], 0);
    if (sum !== 15) return state;

    // Remove selected cards and refill
    const remaining = [...deck];
    const newFaceUp: (Card | null)[] = faceUp.map((card) =>
      card && selected.includes(card.id) ? (remaining.shift() ?? null) : card
    );

    const newMoves = state.moves + 1;
    const deckEmpty = remaining.length === 0;
    const faceUpCards = newFaceUp.filter(Boolean) as Card[];
    const won = deckEmpty && faceUpCards.length === 0;
    const lost = !won && !hasAnyValidMove(remaining, newFaceUp);

    return {
      ...state,
      deck: remaining,
      faceUp: newFaceUp,
      selected: [],
      moves: newMoves,
      phase: won ? "won" : lost ? "lost" : "playing",
    };
  }

  return state;
}

export function isTerminal(state: FifteensState): { score: number } | null {
  if (state.phase === "playing") return null;
  if (state.phase === "won") return { score: Math.max(0, 100 - state.moves) };
  return { score: 0 };
}
