import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const NODE_COUNT = 12; // 12 nodes in a chain (Trek 12 theme)
export const TOTAL_ROLLS = 12;
export const DIE_MAX = 6;

export interface Trek12ArcticSettings { dummy: boolean; }
export interface Trek12ArcticState {
  rngSeed: number;
  values: (number | null)[]; // length 12
  rolls: number;
  lastDice: [number, number] | null; // 2 dice each turn
  score: number;
  phase: "rolling" | "choosing" | "done";
}
export type Trek12ArcticAction =
  | { type: "roll" }
  | { type: "place"; index: number; op: "sum" | "diff" | "max" | "min" }
  | { type: "skip" }
  | { type: "reset" };

export function initialState(seed: number, _s: Trek12ArcticSettings): Trek12ArcticState {
  return {
    rngSeed: seed >>> 0,
    values: new Array(NODE_COUNT).fill(null),
    rolls: 0,
    lastDice: null,
    score: 0,
    phase: "rolling",
  };
}

export function applyOp(d1: number, d2: number, op: "sum" | "diff" | "max" | "min"): number {
  if (op === "sum") return Math.min(12, d1 + d2);
  if (op === "diff") return Math.abs(d1 - d2);
  if (op === "max") return Math.max(d1, d2);
  return Math.min(d1, d2);
}

export function reducer(state: Trek12ArcticState, action: Trek12ArcticAction): Trek12ArcticState {
  if (state.phase === "done") return state;
  if (action.type === "reset") return initialState(state.rngSeed, { dummy: false });
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const d1 = 1 + Math.floor(rng() * DIE_MAX);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const rng2 = mulberry32(seed2);
    const d2 = 1 + Math.floor(rng2() * DIE_MAX);
    const nextSeed = Math.floor(rng2() * 2 ** 31);
    return { ...state, rngSeed: nextSeed >>> 0, lastDice: [d1, d2], phase: "choosing" };
  }
  if (action.type === "place") {
    if (state.phase !== "choosing" || !state.lastDice) return state;
    if (action.index < 0 || action.index >= NODE_COUNT) return state;
    if (state.values[action.index] !== null) return state;
    const v = applyOp(state.lastDice[0], state.lastDice[1], action.op);
    // Chain bonus: same as adjacent
    let bonus = 0;
    if (action.index > 0 && state.values[action.index - 1] === v) bonus += 3;
    if (action.index < NODE_COUNT - 1 && state.values[action.index + 1] === v) bonus += 3;
    const values = [...state.values];
    values[action.index] = v;
    const rolls = state.rolls + 1;
    const phase: "rolling" | "choosing" | "done" =
      rolls >= TOTAL_ROLLS || values.every(x => x !== null) ? "done" : "rolling";
    return { ...state, values, rolls, score: state.score + v + bonus, lastDice: null, phase };
  }
  if (action.type === "skip") {
    if (state.phase !== "choosing") return state;
    const rolls = state.rolls + 1;
    const phase: "rolling" | "choosing" | "done" = rolls >= TOTAL_ROLLS ? "done" : "rolling";
    return { ...state, rolls, lastDice: null, phase };
  }
  return state;
}

export function isTerminal(state: Trek12ArcticState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Bonus: longest run of identical adjacent values rewarded.
  let bonus = 0;
  let runVal: number | null = null;
  let runLen = 0;
  let bestRun = 0;
  for (const v of state.values) {
    if (v !== null && v === runVal) runLen++;
    else { runVal = v; runLen = 1; }
    if (runLen > bestRun) bestRun = runLen;
  }
  if (bestRun >= 3) bonus += bestRun * 2;
  // Full chain bonus
  if (state.values.every(v => v !== null)) bonus += 12;
  return { score: state.score + bonus };
}
