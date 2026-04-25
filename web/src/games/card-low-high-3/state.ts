import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Low High 3: Draw 3 cards. Pick the lowest or highest for scoring.
// "Lowest" = 30 pts if your pick IS the lowest. "Highest" = 30 pts if your pick IS the highest.
// 10 rounds.

export interface CardLowHigh3Settings { rounds: "8" | "10" | "12"; }

export interface CardLowHigh3State {
  round: number;
  maxRounds: number;
  cards: number[];
  choice: number | null;     // which card index picked
  bet: "low" | "high" | null;
  score: number;
  result: "correct" | "wrong" | null;
  phase: "picking" | "result" | "gameover";
  rngSeed: number;
}

export type CardLowHigh3Action =
  | { type: "pick"; cardIdx: number; bet: "low" | "high" }
  | { type: "next" };

const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const SUITS = ["♠","♥","♦","♣"];
export function cardName(c: number): string { return RANKS[c % 13]! + SUITS[Math.floor(c / 13)]!; }

function deal3(seed: number): { cards: number[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const drawn = new Set<number>();
  while (drawn.size < 3) drawn.add(Math.floor(rng() * 52));
  return { cards: [...drawn], nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, settings: CardLowHigh3Settings): CardLowHigh3State {
  const { cards, nextSeed } = deal3(seed);
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), cards, choice: null, bet: null, score: 0, result: null, phase: "picking", rngSeed: nextSeed };
}

export function reducer(state: CardLowHigh3State, action: CardLowHigh3Action): CardLowHigh3State {
  if (state.phase === "gameover") return state;
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    const ranks = state.cards.map(c => c % 13);
    const pickedRank = ranks[action.cardIdx]!;
    let correct: boolean;
    if (action.bet === "low") correct = pickedRank === Math.min(...ranks);
    else correct = pickedRank === Math.max(...ranks);
    const pts = correct ? 30 : 0;
    const phase = state.round >= state.maxRounds ? "gameover" : "result";
    return { ...state, choice: action.cardIdx, bet: action.bet, result: correct ? "correct" : "wrong", score: state.score + pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const { cards, nextSeed } = deal3(state.rngSeed);
    return { ...state, round: state.round + 1, cards, choice: null, bet: null, result: null, phase: "picking", rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: CardLowHigh3State): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
