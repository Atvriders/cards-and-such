import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DicePortalSettings { dummy: boolean; }
export interface DicePortalState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null;
  score: number;
  phase: "roll" | "scored" | "done";
  lastPts: number;
}
export type DicePortalAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DicePortalSettings): DicePortalState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "roll", lastPts: 0 };
}
function scoreFor(a: number, b: number, _round: number): number {
  // Portal opens on doubles (bonus +30); else sum * 2.
  if (a === b) return 30 + a * 2;
  return (a + b) * 2;
}
export function reducer(state: DicePortalState, action: DicePortalAction): DicePortalState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreFor(a, b, state.round);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b], score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: null, phase: "roll", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: DicePortalState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
