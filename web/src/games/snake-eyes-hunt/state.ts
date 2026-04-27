import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Snake Eyes Hunt: 20 rolls of 2 dice. +50 per snake eyes (1,1).
export const TOTAL_ROLLS = 20;
export interface SnakeEyesHuntSettings { dummy: boolean; }
export interface SnakeEyesHuntState { rngSeed: number; roll: number; dice: [number, number] | null; hits: number; score: number; phase: "rolling" | "result" | "done"; }
export type SnakeEyesHuntAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: SnakeEyesHuntSettings): SnakeEyesHuntState {
  return { rngSeed: seed, roll: 1, dice: null, hits: 0, score: 0, phase: "rolling" };
}
export function reducer(state: SnakeEyesHuntState, action: SnakeEyesHuntAction): SnakeEyesHuntState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = a === 1 && b === 1;
    const pts = win ? 50 : 0;
    const isLast = state.roll >= TOTAL_ROLLS;
    return { ...state, rngSeed: nextSeed, dice: [a, b], hits: state.hits + (win?1:0), score: state.score + pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, roll: state.roll + 1, dice: null, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: SnakeEyesHuntState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
