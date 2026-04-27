import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Mini Shut the Box: numbers 1..9 open. Roll 2 dice, close any combination of open numbers summing to dice total.
// Game ends when no valid combo possible OR all 9 closed. Score = 50 - (sum of remaining open).
export interface MiniShutBoxSettings { dummy: boolean; }
export interface MiniShutBoxState { rngSeed: number; open: boolean[]; dice: [number, number] | null; sum: number; selected: number[]; phase: "rolling" | "selecting" | "done"; score: number; }
export type MiniShutBoxAction = { type: "roll" } | { type: "toggle"; idx: number } | { type: "submit" } | { type: "endgame" };
function canSatisfy(open: boolean[], target: number): boolean {
  const nums = open.map((o, i) => o ? i + 1 : 0).filter(n => n > 0);
  function helper(rem: number, idx: number): boolean {
    if (rem === 0) return true;
    if (rem < 0 || idx >= nums.length) return false;
    return helper(rem - nums[idx]!, idx + 1) || helper(rem, idx + 1);
  }
  return helper(target, 0);
}
export function initialState(seed: number, _s: MiniShutBoxSettings): MiniShutBoxState {
  return { rngSeed: seed, open: [true,true,true,true,true,true,true,true,true], dice: null, sum: 0, selected: [], phase: "rolling", score: 0 };
}
export function reducer(state: MiniShutBoxState, action: MiniShutBoxAction): MiniShutBoxState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed); const a = 1 + Math.floor(rng()*6); const b = 1 + Math.floor(rng()*6); const next = Math.floor(rng()*2**31);
    const sum = a + b;
    if (!canSatisfy(state.open, sum)) {
      const remSum = state.open.reduce((acc, o, i) => o ? acc + (i+1) : acc, 0);
      const score = Math.max(0, 50 - remSum);
      return { ...state, rngSeed: next, dice: [a, b], sum, score, phase: "done" };
    }
    return { ...state, rngSeed: next, dice: [a, b], sum, selected: [], phase: "selecting" };
  }
  if (action.type === "toggle") {
    if (state.phase !== "selecting") return state;
    if (!state.open[action.idx]) return state;
    if (state.selected.includes(action.idx)) return { ...state, selected: state.selected.filter(i=>i!==action.idx) };
    return { ...state, selected: [...state.selected, action.idx] };
  }
  if (action.type === "submit") {
    if (state.phase !== "selecting") return state;
    const selSum = state.selected.reduce((a,i) => a + (i+1), 0);
    if (selSum !== state.sum) return state;
    const newOpen = [...state.open]; for (const i of state.selected) newOpen[i] = false;
    if (newOpen.every(o => !o)) {
      return { ...state, open: newOpen, score: 100, phase: "done" };
    }
    return { ...state, open: newOpen, selected: [], dice: null, sum: 0, phase: "rolling" };
  }
  if (action.type === "endgame") {
    const remSum = state.open.reduce((acc, o, i) => o ? acc + (i+1) : acc, 0);
    return { ...state, score: Math.max(0, 50 - remSum), phase: "done" };
  }
  return state;
}
export function isTerminal(state: MiniShutBoxState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
