import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export interface DonutStackArcSettings { dummy: boolean; }
export interface DonutStackArcState { rngSeed: number; targets: number[]; roundIndex: number; score: number; phase: "aiming" | "result" | "done"; power: number; lastDiff: number; lastPts: number; }
export type DonutStackArcAction = { type: "setPower"; value: number } | { type: "throw" } | { type: "next" };

export function initialState(seed: number, _settings: DonutStackArcSettings): DonutStackArcState {
  const rng = mulberry32(seed);
  const targets = Array.from({ length: TOTAL_ROUNDS }, () => 30 + Math.floor(rng() * 50));
  return { rngSeed: seed, targets, roundIndex: 0, score: 0, phase: "aiming", power: 50, lastDiff: 0, lastPts: 0 };
}

export function reducer(state: DonutStackArcState, action: DonutStackArcAction): DonutStackArcState {
  if (action.type === "setPower" && state.phase === "aiming") return { ...state, power: Math.max(0, Math.min(100, action.value)) };
  if (action.type === "throw" && state.phase === "aiming") {
    const target = state.targets[state.roundIndex] ?? 50;
    const diff = Math.abs(state.power - target);
    const pts = Math.max(0, 100 - diff * 2);
    const done = state.roundIndex + 1 >= TOTAL_ROUNDS;
    return { ...state, lastDiff: diff, lastPts: pts, score: state.score + pts, phase: done ? "done" : "result" };
  }
  if (action.type === "next" && state.phase === "result") return { ...state, roundIndex: state.roundIndex + 1, phase: "aiming" };
  return state;
}

export function isTerminal(state: DonutStackArcState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
