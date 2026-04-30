import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { DieFace } from "../../engines/dice/index.js";

// Mini Shut the Box — tiles 1..9 begin open. Roll 2 dice; close any
// combination of open tiles summing to dice total. If no combo sums
// to your roll, game ends. Score = 100 if all closed (perfect), else
// 50 - (sum of remaining open) capped at 0.

export interface MiniShutBoxSettings { dummy: boolean; }

export interface MiniShutBoxState {
  rngSeed: number;
  open: boolean[];                // length 9; index 0 = tile "1"
  dice: [DieFace, DieFace] | null;
  sum: number;
  selected: number[];             // tile indices currently selected
  phase: "rolling" | "selecting" | "done";
  score: number;
  perfect: boolean;
}

export type MiniShutBoxAction =
  | { type: "roll" }
  | { type: "toggle"; idx: number }
  | { type: "submit" }
  | { type: "endgame" };

function canSatisfy(open: boolean[], target: number): boolean {
  const nums = open
    .map((o, i) => (o ? i + 1 : 0))
    .filter((n) => n > 0);
  function helper(rem: number, idx: number): boolean {
    if (rem === 0) return true;
    if (rem < 0 || idx >= nums.length) return false;
    return helper(rem - nums[idx]!, idx + 1) || helper(rem, idx + 1);
  }
  return helper(target, 0);
}

export function initialState(seed: number, _s: MiniShutBoxSettings): MiniShutBoxState {
  return {
    rngSeed: seed,
    open: [true, true, true, true, true, true, true, true, true],
    dice: null,
    sum: 0,
    selected: [],
    phase: "rolling",
    score: 0,
    perfect: false,
  };
}

function computeFinalScore(open: boolean[]): { score: number; perfect: boolean } {
  if (open.every((o) => !o)) return { score: 100, perfect: true };
  const remSum = open.reduce((acc, o, i) => (o ? acc + (i + 1) : acc), 0);
  return { score: Math.max(0, 50 - remSum), perfect: false };
}

export function reducer(state: MiniShutBoxState, action: MiniShutBoxAction): MiniShutBoxState {
  if (state.phase === "done") return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = (1 + Math.floor(rng() * 6)) as DieFace;
    const b = (1 + Math.floor(rng() * 6)) as DieFace;
    const next = Math.floor(rng() * 2 ** 31);
    const sum = a + b;
    if (!canSatisfy(state.open, sum)) {
      const { score, perfect } = computeFinalScore(state.open);
      return { ...state, rngSeed: next, dice: [a, b], sum, score, perfect, phase: "done" };
    }
    return { ...state, rngSeed: next, dice: [a, b], sum, selected: [], phase: "selecting" };
  }

  if (action.type === "toggle") {
    if (state.phase !== "selecting") return state;
    if (!state.open[action.idx]) return state;
    if (state.selected.includes(action.idx)) {
      return { ...state, selected: state.selected.filter((i) => i !== action.idx) };
    }
    return { ...state, selected: [...state.selected, action.idx] };
  }

  if (action.type === "submit") {
    if (state.phase !== "selecting") return state;
    const selSum = state.selected.reduce((a, i) => a + (i + 1), 0);
    if (selSum !== state.sum) return state;
    const newOpen = [...state.open];
    for (const i of state.selected) newOpen[i] = false;
    if (newOpen.every((o) => !o)) {
      const { score, perfect } = computeFinalScore(newOpen);
      return { ...state, open: newOpen, selected: [], dice: null, sum: 0, score, perfect, phase: "done" };
    }
    return { ...state, open: newOpen, selected: [], dice: null, sum: 0, phase: "rolling" };
  }

  if (action.type === "endgame") {
    const { score, perfect } = computeFinalScore(state.open);
    return { ...state, score, perfect, phase: "done" };
  }

  return state;
}

export function isTerminal(state: MiniShutBoxState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

// Helper exposed for UI/tests
export function selectionSum(selected: readonly number[]): number {
  return selected.reduce((acc, i) => acc + (i + 1), 0);
}

export { canSatisfy, computeFinalScore };
