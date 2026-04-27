import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Quint Deal: 10 rounds. 5 cards dealt face up. Player taps the card they think is highest.
// Correct = +10. Aces high.

export const TOTAL_ROUNDS = 10;

export interface QuintDealSettings { dummy: boolean; }

export interface QuintDealState {
  rngSeed: number;
  round: number;
  hand: number[];
  highestIndex: number;
  guess: number | null;
  score: number;
  phase: "guessing" | "result" | "done";
  lastWin: boolean;
}

export type QuintDealAction = { type: "guess"; index: number } | { type: "next" };

export function rankOf(c: number): number { return c % 13; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal5(rng: () => number): number[] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 5) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return out;
}

function highestIdx(hand: number[]): number {
  let bestIdx = 0; let bestRank = -1;
  for (let i = 0; i < hand.length; i++) {
    const r = rankOf(hand[i]!);
    if (r > bestRank) { bestRank = r; bestIdx = i; }
  }
  return bestIdx;
}

export function initialState(seed: number, _settings: QuintDealSettings): QuintDealState {
  const rng = mulberry32(seed);
  const hand = deal5(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, hand, highestIndex: highestIdx(hand), guess: null, score: 0, phase: "guessing", lastWin: false };
}

export function reducer(state: QuintDealState, action: QuintDealAction): QuintDealState {
  if (state.phase === "done") return state;
  if (action.type === "guess") {
    if (state.phase !== "guessing") return state;
    const win = action.index === state.highestIndex;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, guess: action.index, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, hand, highestIndex: highestIdx(hand), guess: null, phase: "guessing", lastWin: false };
  }
  return state;
}

export function isTerminal(state: QuintDealState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
