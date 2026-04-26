import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export interface TacoTossSettings { dummy: boolean; }
export interface TacoTossState { rngSeed: number; targets: number[]; roundIndex: number; score: number; phase: "aiming" | "result" | "done"; power: number; lastDiff: number; lastPts: number; }
export type TacoTossAction = { type: "setPower"; value: number } | { type: "throw" } | { type: "next" };

export function initialState(seed: number, settings: TacoTossSettings): TacoTossState {
  const rng = mulberry32(seed);
  const targets = Array.from({ length: TOTAL_ROUNDS }, () => 65 + Math.floor(rng() * 40) - 20);
  return { rngSeed: seed, targets, roundIndex: 0, score: 0, phase: "aiming", power: 50, lastDiff: 0, lastPts: 0 };
}

export function reducer(state: TacoTossState, action: TacoTossAction): TacoTossState {
  if (action.type === "setPower" && state.phase === "aiming") return { ...state, power: Math.max(0, Math.min(100, action.value)) };
  if (action.type === "throw" && state.phase === "aiming") {
    const target = state.targets[state.roundIndex] ?? 65;
    const diff = Math.abs(state.power - target);
    const pts = Math.max(0, 100 - diff * 2);
    const done = state.roundIndex + 1 >= TOTAL_ROUNDS;
    return { ...state, lastDiff: diff, lastPts: pts, score: state.score + pts, phase: done ? "done" : "result" };
  }
  if (action.type === "next" && state.phase === "result") return { ...state, roundIndex: state.roundIndex + 1, phase: "aiming" };
  return state;
}

export function isTerminal(state: TacoTossState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
