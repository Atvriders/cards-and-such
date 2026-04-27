import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Triple Deal: 12 rounds. Player bets "middle is between others" (yes/no) before 3 cards revealed.
// Cards are 3 distinct cards. Middle = strictly between min(left, right) and max(left, right) in rank.
// Ties (any equal ranks) = push = 0.

export const TOTAL_ROUNDS = 12;

export interface TripleDealSettings { dummy: boolean; }

export interface TripleDealState {
  rngSeed: number;
  round: number;
  cards: [number, number, number] | null;
  bet: "yes" | "no" | null;
  score: number;
  phase: "betting" | "result" | "done";
  lastWin: boolean;
  push: boolean;
}

export type TripleDealAction = { type: "bet"; choice: "yes" | "no" } | { type: "next" };

export function rankOf(c: number): number { return c % 13; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal3(rng: () => number): [number, number, number] {
  const used = new Set<number>();
  const out: number[] = [];
  while (out.length < 3) {
    const c = Math.floor(rng() * 52);
    if (!used.has(c)) { used.add(c); out.push(c); }
  }
  return [out[0]!, out[1]!, out[2]!];
}

export function initialState(seed: number, _settings: TripleDealSettings): TripleDealState {
  return { rngSeed: seed, round: 1, cards: null, bet: null, score: 0, phase: "betting", lastWin: false, push: false };
}

export function reducer(state: TripleDealState, action: TripleDealAction): TripleDealState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const cards = deal3(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const a = rankOf(cards[0]); const b = rankOf(cards[1]); const c = rankOf(cards[2]);
    const lo = Math.min(a, c); const hi = Math.max(a, c);
    let push = false; let between = false;
    if (a === b || b === c || a === c) push = true;
    else between = b > lo && b < hi;
    let win = false;
    if (!push) win = (action.choice === "yes" && between) || (action.choice === "no" && !between);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, cards, bet: action.choice, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win, push };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, cards: null, bet: null, phase: "betting", lastWin: false, push: false };
  }
  return state;
}

export function isTerminal(state: TripleDealState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
