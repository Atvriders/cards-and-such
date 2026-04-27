import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Cee-lo with 3 dice. Win conditions:
// - 4-5-6: instant win, +50.
// - Triple X-X-X: +30.
// - Pair plus odd die "point": +(point*2). 1-1-2 -> 4 pts, 6-6-5 -> 10 pts.
// - 1-2-3: instant loss, 0.
// - Otherwise: 0.
export const TOTAL_ROUNDS = 10;
export interface MiniCeeLoSettings { dummy: boolean; }
export interface MiniCeeLoState { rngSeed: number; round: number; dice: [number, number, number] | null; phase: "ready" | "rolled" | "done"; score: number; pts: number; result: string; }
export type MiniCeeLoAction = { type: "roll" } | { type: "next" };
export function evaluateRoll(d: [number, number, number]): { pts: number; result: string } {
  const s = [...d].sort((a,b)=>a-b);
  if (s[0]===4 && s[1]===5 && s[2]===6) return { pts: 50, result: "4-5-6 WIN +50" };
  if (s[0]===1 && s[1]===2 && s[2]===3) return { pts: 0, result: "1-2-3 — bust 0" };
  if (s[0]===s[1] && s[1]===s[2]) return { pts: 30, result: `Triple ${s[0]}s +30` };
  if (s[0]===s[1]) return { pts: s[2]!*2, result: `Pair ${s[0]}s, point ${s[2]} +${s[2]!*2}` };
  if (s[1]===s[2]) return { pts: s[0]!*2, result: `Pair ${s[1]}s, point ${s[0]} +${s[0]!*2}` };
  return { pts: 0, result: "No score 0" };
}
export function initialState(seed: number, _s: MiniCeeLoSettings): MiniCeeLoState {
  return { rngSeed: seed, round: 1, dice: null, phase: "ready", score: 0, pts: 0, result: "" };
}
export function reducer(state: MiniCeeLoState, action: MiniCeeLoAction): MiniCeeLoState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed); const a = 1+Math.floor(rng()*6), b = 1+Math.floor(rng()*6), c = 1+Math.floor(rng()*6); const next = Math.floor(rng()*2**31);
    const dice = [a, b, c] as [number, number, number];
    const { pts, result } = evaluateRoll(dice);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, dice, pts, result, score: state.score + pts, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, phase: "ready", pts: 0, result: "" };
  }
  return state;
}
export function isTerminal(state: MiniCeeLoState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
