import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Face Flip: 12 rounds. Predict if next card flipped is a face card (J, Q, K) or not.
// Win = +10. Face cards: 12/52 (~23%). So "not face" is the safer pick.
export const TOTAL_ROUNDS = 12;
export interface FaceFlipSettings { dummy: boolean; }
export interface FaceFlipState {
  rngSeed: number;
  round: number;
  prediction: "face" | "notface" | null;
  card: number | null;
  isFace: boolean;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
}
export type FaceFlipAction = { type: "predict"; choice: "face" | "notface" } | { type: "next" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function isFaceCard(c: number): boolean { const r = c % 13; return r === 9 || r === 10 || r === 11; }
export function initialState(seed: number, _settings: FaceFlipSettings): FaceFlipState {
  return { rngSeed: seed, round: 1, prediction: null, card: null, isFace: false, score: 0, phase: "predict", lastWin: false };
}
export function reducer(state: FaceFlipState, action: FaceFlipAction): FaceFlipState {
  if (state.phase === "done") return state;
  if (action.type === "predict" && state.phase === "predict") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const face = isFaceCard(c);
    const win = (action.choice === "face" && face) || (action.choice === "notface" && !face);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, card: c, isFace: face, score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, round: state.round + 1, prediction: null, card: null, isFace: false, phase: "predict", lastWin: false };
  }
  return state;
}
export function isTerminal(state: FaceFlipState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
