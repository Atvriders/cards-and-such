import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Hold-em (mini): each round you're dealt a 2-card hand. Bet on strength: STRONG
// (sum of ranks >= 18, where Ace=14, K=13, Q=12, J=11, 10=10..2=2) or WEAK (< 18).
// Pair always counts as STRONG. Correct = +10. 12 rounds.

export const TOTAL_ROUNDS = 12;

export interface CardHoldEmSettings { dummy: boolean; }

export interface CardHoldEmState {
  rngSeed: number;
  round: number;
  hand: [number, number] | null;
  prediction: "strong" | "weak" | null;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
  isStrong: boolean;
}

export type CardHoldEmAction = { type: "predict"; choice: "strong" | "weak" } | { type: "next" };

export function pokerRank(c: number): number {
  // 2..10 -> 2..10, J=11, Q=12, K=13, A=14
  const r = c % 13;
  if (r <= 8) return r + 2;
  if (r === 9) return 11;
  if (r === 10) return 12;
  if (r === 11) return 13;
  return 14; // A
}
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function dealHand(rng: () => number): [number, number] {
  const a = Math.floor(rng() * 52);
  let b = Math.floor(rng() * 52);
  while (b === a) b = Math.floor(rng() * 52);
  return [a, b];
}

export function isStrongHand(hand: [number, number]): boolean {
  const r1 = pokerRank(hand[0]);
  const r2 = pokerRank(hand[1]);
  if (r1 === r2) return true;
  return r1 + r2 >= 18;
}

export function initialState(seed: number, _s: CardHoldEmSettings): CardHoldEmState {
  return {
    rngSeed: seed,
    round: 1,
    hand: null,
    prediction: null,
    score: 0,
    phase: "predict",
    lastWin: false,
    isStrong: false,
  };
}

export function reducer(state: CardHoldEmState, action: CardHoldEmAction): CardHoldEmState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = dealHand(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const strong = isStrongHand(hand);
    const win = (strong && action.choice === "strong") || (!strong && action.choice === "weak");
    const isLast = state.round >= TOTAL_ROUNDS;
    return {
      ...state,
      rngSeed: nextSeed,
      hand,
      prediction: action.choice,
      score: state.score + (win ? 10 : 0),
      lastWin: win,
      isStrong: strong,
      phase: isLast ? "done" : "result",
    };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, hand: null, prediction: null, phase: "predict", lastWin: false, isStrong: false };
  }
  return state;
}

export function isTerminal(state: CardHoldEmState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
