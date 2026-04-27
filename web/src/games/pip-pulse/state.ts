import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Pip Pulse: 12 rounds. Predict if next card flipped has pip > 7.
// Pip values: 2-10 face, J=11, Q=12, K=13, A=1.
// Cards >7: 8,9,10,J,Q,K = 6 ranks, 24 cards = ~46%. Cards <=7: 2,3,4,5,6,7,A = 7 ranks, 28 cards = ~54%.
// Win = +10.
export const TOTAL_ROUNDS = 12;
export interface PipPulseSettings { dummy: boolean; }
export interface PipPulseState {
  rngSeed: number;
  round: number;
  prediction: "high" | "low" | null;
  card: number | null;
  pip: number;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
}
export type PipPulseAction = { type: "predict"; choice: "high" | "low" } | { type: "next" };
export function pipValue(c: number): number {
  const r = c % 13;
  if (r <= 8) return r + 2;
  if (r === 9) return 11;
  if (r === 10) return 12;
  if (r === 11) return 13;
  return 1;
}
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function initialState(seed: number, _settings: PipPulseSettings): PipPulseState {
  return { rngSeed: seed, round: 1, prediction: null, card: null, pip: 0, score: 0, phase: "predict", lastWin: false };
}
export function reducer(state: PipPulseState, action: PipPulseAction): PipPulseState {
  if (state.phase === "done") return state;
  if (action.type === "predict" && state.phase === "predict") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pip = pipValue(c);
    const high = pip > 7;
    const win = (action.choice === "high" && high) || (action.choice === "low" && !high);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, card: c, pip, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, round: state.round + 1, prediction: null, card: null, pip: 0, phase: "predict", lastWin: false };
  }
  return state;
}
export function isTerminal(state: PipPulseState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
