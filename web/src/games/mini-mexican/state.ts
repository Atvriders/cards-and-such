import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Mini Mexican: 2 dice rolled. Score = special if 2-1 (Mexican = 100), doubles = 50, otherwise high*10+low.
export const TOTAL_ROUNDS = 8;
export interface MiniMexicanSettings { dummy: boolean; }
export interface MiniMexicanState { rngSeed: number; round: number; dice: [number, number] | null; phase: "ready" | "rolled" | "done"; score: number; pts: number; result: string; }
export type MiniMexicanAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: MiniMexicanSettings): MiniMexicanState {
  return { rngSeed: seed, round: 1, dice: null, phase: "ready", score: 0, pts: 0, result: "" };
}
export function reducer(state: MiniMexicanState, action: MiniMexicanAction): MiniMexicanState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed); const a = 1 + Math.floor(rng()*6); const b = 1 + Math.floor(rng()*6); const next = Math.floor(rng()*2**31);
    let pts = 0; let result = "";
    const sorted = [Math.max(a,b), Math.min(a,b)] as [number, number];
    if (sorted[0] === 2 && sorted[1] === 1) { pts = 100; result = "MEXICAN! +100"; }
    else if (a === b) { pts = 50; result = `Doubles ${a}-${a} +50`; }
    else { pts = sorted[0]*10 + sorted[1]; result = `${sorted[0]}-${sorted[1]} +${pts}`; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, dice: [a, b], pts, result, score: state.score + pts, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, phase: "ready", pts: 0, result: "" };
  }
  return state;
}
export function isTerminal(state: MiniMexicanState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
