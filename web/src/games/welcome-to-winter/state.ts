import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROW_COUNT = 3;
export const ROW_LEN = 5; // each row has 5 numbered slots
export const TOTAL_SLOTS = ROW_COUNT * ROW_LEN;
export const TOTAL_ROLLS = 12;
export const DIE_MAX = 12;

export interface WelcomeToWinterSettings { dummy: boolean; }
export interface WelcomeToWinterState {
  rngSeed: number;
  values: (number | null)[]; // length 15, slot value or null
  rolls: number;
  lastRoll: number | null;
  score: number;
  phase: "rolling" | "placing" | "done";
}
export type WelcomeToWinterAction =
  | { type: "roll" }
  | { type: "place"; index: number }
  | { type: "skip" }
  | { type: "reset" };

export function initialState(seed: number, _s: WelcomeToWinterSettings): WelcomeToWinterState {
  return {
    rngSeed: seed >>> 0,
    values: new Array(TOTAL_SLOTS).fill(null),
    rolls: 0,
    lastRoll: null,
    score: 0,
    phase: "rolling",
  };
}

// A slot is legal if (a) empty, (b) the row remains strictly ascending after placement.
export function legalAt(values: (number | null)[], index: number, roll: number): boolean {
  if (values[index] !== null) return false;
  const row = Math.floor(index / ROW_LEN);
  const col = index % ROW_LEN;
  // check left: any non-null left value < roll
  for (let c = 0; c < col; c++) {
    const v = values[row * ROW_LEN + c];
    if (v !== null && v >= roll) return false;
  }
  // check right: any non-null right value > roll
  for (let c = col + 1; c < ROW_LEN; c++) {
    const v = values[row * ROW_LEN + c];
    if (v !== null && v <= roll) return false;
  }
  return true;
}

export function placeValue(roll: number, idx: number, values: (number | null)[]): number {
  // Score: roll value + adjacency bonus if neighbor filled and consecutive.
  let v = roll;
  const col = idx % ROW_LEN;
  const row = Math.floor(idx / ROW_LEN);
  const left = col > 0 ? values[row * ROW_LEN + (col - 1)] : null;
  const right = col < ROW_LEN - 1 ? values[row * ROW_LEN + (col + 1)] : null;
  if (left !== null && roll - left === 1) v += 2;
  if (right !== null && right - roll === 1) v += 2;
  return v;
}

export function reducer(state: WelcomeToWinterState, action: WelcomeToWinterAction): WelcomeToWinterState {
  if (state.phase === "done") return state;
  if (action.type === "reset") return initialState(state.rngSeed, { dummy: false });
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const d = 1 + Math.floor(rng() * DIE_MAX);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed >>> 0, lastRoll: d, phase: "placing" };
  }
  if (action.type === "place") {
    if (state.phase !== "placing") return state;
    if (!legalAt(state.values, action.index, state.lastRoll ?? 0)) return state;
    const values = [...state.values];
    values[action.index] = state.lastRoll;
    const gain = placeValue(state.lastRoll ?? 0, action.index, state.values);
    const rolls = state.rolls + 1;
    const phase: "rolling" | "placing" | "done" =
      rolls >= TOTAL_ROLLS || values.every(v => v !== null) ? "done" : "rolling";
    return { ...state, values, rolls, score: state.score + gain, phase };
  }
  if (action.type === "skip") {
    if (state.phase !== "placing") return state;
    const rolls = state.rolls + 1;
    const phase: "rolling" | "placing" | "done" = rolls >= TOTAL_ROLLS ? "done" : "rolling";
    // small skip penalty so skip isn't free
    return { ...state, rolls, score: Math.max(0, state.score - 1), phase };
  }
  return state;
}

export function isTerminal(state: WelcomeToWinterState): { score: number } | null {
  if (state.phase !== "done") return null;
  let bonus = 0;
  // Each fully completed row: +6
  for (let r = 0; r < ROW_COUNT; r++) {
    let full = true;
    for (let c = 0; c < ROW_LEN; c++) if (state.values[r * ROW_LEN + c] === null) { full = false; break; }
    if (full) bonus += 6;
  }
  // Full board: +10
  if (state.values.every(v => v !== null)) bonus += 10;
  return { score: state.score + bonus };
}
