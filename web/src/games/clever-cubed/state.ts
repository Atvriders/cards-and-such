import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TRACK_COUNT = 4;
export const TRACK_LEN = 6;
export const TOTAL_CELLS = TRACK_COUNT * TRACK_LEN;
export const TOTAL_ROLLS = 10;
export const DIE_MAX = 6;

export interface CleverCubedSettings { dummy: boolean; }
export interface CleverCubedState {
  rngSeed: number;
  filled: boolean[]; // 4 tracks * 6 cells
  fillValues: number[];
  rolls: number;
  lastDice: number[]; // 5 dice each roll (Clever style)
  selectedDie: number | null; // index into lastDice picked this turn
  score: number;
  phase: "rolling" | "picking" | "placing" | "done";
}
export type CleverCubedAction =
  | { type: "roll" }
  | { type: "pick"; dieIdx: number }
  | { type: "place"; track: number }
  | { type: "skip" }
  | { type: "reset" };

export function initialState(seed: number, _s: CleverCubedSettings): CleverCubedState {
  return {
    rngSeed: seed >>> 0,
    filled: new Array(TOTAL_CELLS).fill(false),
    fillValues: new Array(TOTAL_CELLS).fill(0),
    rolls: 0,
    lastDice: [],
    selectedDie: null,
    score: 0,
    phase: "rolling",
  };
}

export function trackProgress(filled: boolean[], track: number): number {
  let n = 0;
  for (let i = 0; i < TRACK_LEN; i++) if (filled[track * TRACK_LEN + i]) n++;
  return n;
}

export function reducer(state: CleverCubedState, action: CleverCubedAction): CleverCubedState {
  if (state.phase === "done") return state;
  if (action.type === "reset") return initialState(state.rngSeed, { dummy: false });
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    let seed = state.rngSeed;
    const dice: number[] = [];
    for (let i = 0; i < 5; i++) {
      const rng = mulberry32(seed);
      dice.push(1 + Math.floor(rng() * DIE_MAX));
      seed = Math.floor(rng() * 2 ** 31);
    }
    return { ...state, rngSeed: seed >>> 0, lastDice: dice, selectedDie: null, phase: "picking" };
  }
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    if (action.dieIdx < 0 || action.dieIdx >= state.lastDice.length) return state;
    return { ...state, selectedDie: action.dieIdx, phase: "placing" };
  }
  if (action.type === "place") {
    if (state.phase !== "placing" || state.selectedDie === null) return state;
    const v = state.lastDice[state.selectedDie] ?? 0;
    const t = action.track;
    if (t < 0 || t >= TRACK_COUNT) return state;
    const progress = trackProgress(state.filled, t);
    if (progress >= TRACK_LEN) return state;
    const idx = t * TRACK_LEN + progress;
    const filled = [...state.filled];
    filled[idx] = true;
    const fillValues = [...state.fillValues];
    fillValues[idx] = v;
    // Score: value + chain bonus (consecutive same value)
    let bonus = 0;
    if (progress > 0 && state.fillValues[idx - 1] === v) bonus += 2;
    const rolls = state.rolls + 1;
    const phase: "rolling" | "picking" | "placing" | "done" =
      rolls >= TOTAL_ROLLS || filled.every(Boolean) ? "done" : "rolling";
    return { ...state, filled, fillValues, rolls, score: state.score + v + bonus, selectedDie: null, lastDice: [], phase };
  }
  if (action.type === "skip") {
    if (state.phase !== "picking" && state.phase !== "placing") return state;
    const rolls = state.rolls + 1;
    const phase: "rolling" | "picking" | "placing" | "done" = rolls >= TOTAL_ROLLS ? "done" : "rolling";
    return { ...state, rolls, selectedDie: null, lastDice: [], phase };
  }
  return state;
}

export function isTerminal(state: CleverCubedState): { score: number } | null {
  if (state.phase !== "done") return null;
  let bonus = 0;
  // Each track fully filled: +5
  for (let t = 0; t < TRACK_COUNT; t++) {
    if (trackProgress(state.filled, t) === TRACK_LEN) bonus += 5;
  }
  // All 4 tracks at least 3 cells: +6
  let allThree = true;
  for (let t = 0; t < TRACK_COUNT; t++) if (trackProgress(state.filled, t) < 3) { allThree = false; break; }
  if (allThree) bonus += 6;
  return { score: state.score + bonus };
}
