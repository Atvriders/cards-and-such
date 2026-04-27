import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Card Clutch: 8 normal rounds + 1 final clutch round (9 total). Each round you draw
// a card and predict HIGH or LOW relative to a midpoint card (rank 7-Ace = high, 2-6 = low).
// Normal: +10 win / 0 lose. Clutch: +50 win / -25 lose. Don't blow it!

export const NORMAL_ROUNDS = 8;
export const TOTAL_ROUNDS = 9;

export interface CardClutchSettings { dummy: boolean; }

export interface CardClutchState {
  rngSeed: number;
  round: number;
  prediction: "high" | "low" | null;
  card: number | null;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
  lastClutch: boolean;
}

export type CardClutchAction = { type: "predict"; choice: "high" | "low" } | { type: "next" };

export function rankOf(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2;     // 2..10
  if (r === 9) return 11;       // J
  if (r === 10) return 12;      // Q
  if (r === 11) return 13;      // K
  return 14;                    // A
}
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, _s: CardClutchSettings): CardClutchState {
  return {
    rngSeed: seed,
    round: 1,
    prediction: null,
    card: null,
    score: 0,
    phase: "predict",
    lastWin: false,
    lastClutch: false,
  };
}

export function reducer(state: CardClutchState, action: CardClutchAction): CardClutchState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const r = rankOf(c);
    const isHigh = r >= 8; // 8..14 are high
    const win = (isHigh && action.choice === "high") || (!isHigh && action.choice === "low");
    const isClutch = state.round === TOTAL_ROUNDS;
    const delta = win ? (isClutch ? 50 : 10) : (isClutch ? -25 : 0);
    return {
      ...state,
      rngSeed: nextSeed,
      prediction: action.choice,
      card: c,
      score: Math.max(0, state.score + delta),
      lastWin: win,
      lastClutch: isClutch,
      phase: "result",
    };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    return { ...state, round: state.round + 1, prediction: null, card: null, phase: "predict", lastWin: false, lastClutch: false };
  }
  return state;
}

export function isTerminal(state: CardClutchState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
