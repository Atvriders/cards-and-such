import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Pile Bet: Top card of a pile is shown. Bet whether the NEXT card from the pile
// is red or black. Correct = +20pts, Wrong = -10pts. 10 rounds.

export interface CardPileBetSettings { rounds: "8" | "12" | "16"; }

export interface CardPileBetState {
  round: number;
  maxRounds: number;
  pile: number[];         // remaining cards
  topCard: number;        // current top card revealed
  nextCard: number | null;
  bet: "red" | "black" | null;
  result: "correct" | "wrong" | null;
  score: number;
  phase: "betting" | "reveal" | "gameover";
  rngSeed: number;
}

export type CardPileBetAction =
  | { type: "bet"; color: "red" | "black" }
  | { type: "next" };

const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const SUITS = ["♠","♥","♦","♣"];
export function cardName(c: number): string { return RANKS[c % 13]! + SUITS[Math.floor(c / 13)]!; }
export function cardColor(c: number): "red" | "black" { return Math.floor(c / 13) >= 2 ? "black" : "red"; }

function makeShuffledDeck(seed: number): { pile: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = 51; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j]!, deck[i]!]; }
  return { pile: deck, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: CardPileBetSettings): CardPileBetState {
  const { pile } = makeShuffledDeck(seed);
  const rng = mulberry32(seed);
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), pile: pile.slice(1), topCard: pile[0]!, nextCard: null, bet: null, result: null, score: 0, phase: "betting", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: CardPileBetState, action: CardPileBetAction): CardPileBetState {
  if (state.phase === "gameover") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting" || state.pile.length === 0) return state;
    const nextCard = state.pile[0]!;
    const correct = cardColor(nextCard) === action.color;
    const pts = correct ? 20 : -10;
    const phase = state.round >= state.maxRounds ? "gameover" : "reveal";
    return { ...state, bet: action.color, nextCard, result: correct ? "correct" : "wrong", score: Math.max(0, state.score + pts), pile: state.pile.slice(1), phase };
  }
  if (action.type === "next") {
    if (state.phase !== "reveal") return state;
    return { ...state, round: state.round + 1, topCard: state.nextCard!, nextCard: null, bet: null, result: null, phase: "betting" };
  }
  return state;
}

export function isTerminal(state: CardPileBetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
