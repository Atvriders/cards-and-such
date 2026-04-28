import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 3;
export interface DragonwoodCaptureSettings { dummy: boolean; }
export interface DragonwoodCaptureState {
  rngSeed: number;
  round: number;
  you: number[];
  foe: number[];
  target: number;
  lastPts: number;
  score: number;
  phase: "rolling" | "scored" | "done";
}
export type DragonwoodCaptureAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: DragonwoodCaptureSettings): DragonwoodCaptureState {
  return { rngSeed: seed, round: 1, you: [], foe: [], target: 0, lastPts: 0, score: 0, phase: "rolling" };
}
export function scoreRound(yourSum: number, target: number): number {
  if (yourSum >= target) return target;
  return 0;
}
export function reducer(state: DragonwoodCaptureState, action: DragonwoodCaptureAction): DragonwoodCaptureState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const you: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) you.push(1 + Math.floor(rng() * 6));
    // Foe dice rolled too for "vs" feel
    const foe: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) foe.push(1 + Math.floor(rng() * 6));
    const target = 5 + Math.floor(rng() * 11); // 5..15
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreRound(you.reduce((a,b)=>a+b,0), target);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, you, foe, target, lastPts: pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, you: [], foe: [], target: 0, lastPts: 0, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: DragonwoodCaptureState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
