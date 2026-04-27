import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 5;
export const STAGES = 5;
export interface DiceRelayMiniSettings { dummy: boolean; }
export interface DiceRelayMiniState { rngSeed: number; round: number; stage: number; dice: [number, number] | null; score: number; phase: "rolling" | "scored" | "done"; lastPts: number; }
export type DiceRelayMiniAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: DiceRelayMiniSettings): DiceRelayMiniState {
  return { rngSeed: seed, round: 1, stage: 0, dice: null, score: 0, phase: "rolling", lastPts: 0 };
}
export function reducer(state: DiceRelayMiniState, action: DiceRelayMiniAction): DiceRelayMiniState {
  if (state.phase === "done") return state;
  if (action.type === "roll" && state.phase === "rolling") {
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng()*6);
    const b = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng()*2**31);
    const sum = a + b;
    // each stage needs sum >= stage+5
    const target = state.stage + 5; // stage 0:5, 1:6, ..., 4:9
    const success = sum >= target;
    const pts = success ? 20 : 0;
    let stage = state.stage;
    if (success) stage = Math.min(state.stage + 1, STAGES - 1);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b], stage, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next" && state.phase === "scored") {
    return { ...state, round: state.round + 1, dice: null, phase: "rolling", lastPts: 0 };
  }
  return state;
}
export function isTerminal(s: DiceRelayMiniState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
