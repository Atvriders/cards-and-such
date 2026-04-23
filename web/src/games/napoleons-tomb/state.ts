import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Napoleon's Tomb — solitaire.
// 3x3 center grid + 4 corner foundations.
// Place cards from deck one by one into center (any card) or foundations (build Ace→King by suit).
// Move center grid cards to foundations when they fit.
// Goal: empty deck and complete all 4 foundations.

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
export interface Card { rank: Rank; suit: Suit; id: number }

export const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const RANK_NUM: Record<Rank, number> = {
  A: 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13,
};

export interface NapoleonsTombSettings { dummy: boolean }

export interface NapoleonsTombState {
  settings: NapoleonsTombSettings;
  rngSeed: number;
  deck: readonly Card[];
  currentCard: Card | null;
  grid: readonly (Card | null)[];    // 9 cells (3x3 center)
  foundations: readonly (Card | null)[][]; // 4 foundations indexed by suit
  phase: "playing" | "won" | "lost";
  moves: number;
}

export type NapoleonsTombAction =
  | { type: "placeGrid"; cell: number }
  | { type: "placeFoundation"; suit: Suit }
  | { type: "moveToFoundation"; cell: number }
  | { type: "newGame" };

function makeDeck(seed: number): Card[] {
  const cards: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ rank, suit, id: id++ });
    }
  }
  const rng = mulberry32(seed);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

function topOfFoundation(foundations: readonly (Card | null)[][], suit: Suit): Card | null {
  const suitIdx = SUITS.indexOf(suit);
  const pile = foundations[suitIdx] ?? [];
  return pile.length > 0 ? pile[pile.length - 1]! : null;
}

function canPlayToFoundation(card: Card, foundations: readonly (Card | null)[][]): boolean {
  const top = topOfFoundation(foundations, card.suit);
  if (top === null) return card.rank === "A";
  return RANK_NUM[card.rank] === RANK_NUM[top.rank] + 1;
}

function isWon(foundations: readonly (Card | null)[][]): boolean {
  return foundations.every((pile) => pile.length === 13);
}

function isLost(state: NapoleonsTombState): boolean {
  if (state.deck.length > 0 || state.currentCard !== null) return false;
  // Check if any grid card can move to foundation
  for (const card of state.grid) {
    if (card && canPlayToFoundation(card, state.foundations)) return false;
  }
  return true;
}

function withNewCard(state: NapoleonsTombState): NapoleonsTombState {
  const newDeck = [...state.deck];
  const next = newDeck.shift() ?? null;
  return { ...state, deck: newDeck, currentCard: next };
}

export function initialState(seed: number, settings: NapoleonsTombSettings): NapoleonsTombState {
  const deck = makeDeck(seed);
  const remaining = [...deck];
  const first = remaining.shift() ?? null;
  return {
    settings,
    rngSeed: seed,
    deck: remaining,
    currentCard: first,
    grid: Array(9).fill(null),
    foundations: [[], [], [], []],
    phase: "playing",
    moves: 0,
  };
}

export function reducer(state: NapoleonsTombState, action: NapoleonsTombAction): NapoleonsTombState {
  if (action.type === "newGame") return initialState(state.rngSeed + 1, state.settings);
  if (state.phase !== "playing") return state;

  if (action.type === "placeGrid" && state.currentCard !== null) {
    const { cell } = action;
    if (state.grid[cell] !== null) return state; // cell occupied
    const newGrid = [...state.grid];
    newGrid[cell] = state.currentCard;
    const next = withNewCard({ ...state, grid: newGrid, moves: state.moves + 1 });
    const phase = isWon(next.foundations) ? "won" : isLost(next) ? "lost" : "playing";
    return { ...next, phase };
  }

  if (action.type === "placeFoundation" && state.currentCard !== null) {
    const card = state.currentCard;
    if (!canPlayToFoundation(card, state.foundations)) return state;
    const suitIdx = SUITS.indexOf(card.suit);
    const newFoundations = state.foundations.map((pile, i) =>
      i === suitIdx ? [...pile, card] : pile
    );
    const next = withNewCard({ ...state, foundations: newFoundations, moves: state.moves + 1 });
    const phase = isWon(next.foundations) ? "won" : isLost(next) ? "lost" : "playing";
    return { ...next, phase };
  }

  if (action.type === "moveToFoundation") {
    const { cell } = action;
    const card = state.grid[cell];
    if (!card) return state;
    if (!canPlayToFoundation(card, state.foundations)) return state;
    const suitIdx = SUITS.indexOf(card.suit);
    const newFoundations = state.foundations.map((pile, i) =>
      i === suitIdx ? [...pile, card] : pile
    );
    const newGrid = [...state.grid];
    newGrid[cell] = null;
    const newState = { ...state, grid: newGrid, foundations: newFoundations, moves: state.moves + 1 };
    const phase = isWon(newFoundations) ? "won" : isLost(newState) ? "lost" : "playing";
    return { ...newState, phase };
  }

  return state;
}

export function isTerminal(state: NapoleonsTombState): { score: number } | null {
  if (state.phase === "playing") return null;
  if (state.phase === "won") return { score: Math.max(0, 200 - state.moves) };
  return { score: state.foundations.reduce((s, pile) => s + pile.length, 0) };
}
