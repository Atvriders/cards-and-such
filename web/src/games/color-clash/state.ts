import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Color Clash: 6 rounds. Predict the dominant color of a 5-card draw.
// Choices: more-red (>=3 red), more-black (>=3 black). Exact tie impossible since 5 cards always favor one side.
// Wait, 5 is odd so always majority — perfect.
// Score: +30 correct, 0 wrong. Bonus +20 if all 5 same color.
export const TOTAL_ROUNDS = 6;

export interface ColorClashSettings { dummy: boolean; }
export interface ColorClashState {
  rngSeed: number;
  round: number;
  prediction: "red" | "black" | null;
  hand: number[];
  redCount: number;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
  bonus: boolean;
}
export type ColorClashAction = { type: "predict"; choice: "red" | "black" } | { type: "next" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function deal5(rng: () => number): number[] {
  const used = new Set<number>(); const out: number[] = [];
  while (out.length < 5) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); out.push(c); } }
  return out;
}

export function initialState(seed: number, _settings: ColorClashSettings): ColorClashState {
  return { rngSeed: seed, round: 1, prediction: null, hand: [], redCount: 0, score: 0, phase: "predict", lastWin: false, bonus: false };
}

export function reducer(state: ColorClashState, action: ColorClashAction): ColorClashState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const hand = deal5(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const redCount = hand.filter(isRed).length;
    const dominant: "red" | "black" = redCount >= 3 ? "red" : "black";
    const win = action.choice === dominant;
    const bonus = redCount === 5 || redCount === 0;
    const pts = (win ? 30 : 0) + (win && bonus ? 20 : 0);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, hand, redCount, score: state.score + pts, phase: isLast ? "done" : "result", lastWin: win, bonus: win && bonus };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, hand: [], redCount: 0, phase: "predict", lastWin: false, bonus: false };
  }
  return state;
}

export function isTerminal(state: ColorClashState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
