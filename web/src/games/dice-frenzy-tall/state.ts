import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Frenzy Tall: 6 rounds. Each round you roll 5 dice. They must be arranged into
// ascending order: each die >= the previous. You can re-roll any subset once. Score
// 30 points if final stack is non-decreasing.

export const TOTAL_ROUNDS = 6;
export const STACK = 5;

export interface DiceFrenzyTallSettings { dummy: boolean; }

export interface DiceFrenzyTallState {
  rngSeed: number;
  round: number;
  dice: number[];
  selected: boolean[];
  rerollUsed: boolean;
  score: number;
  phase: "rolling" | "result" | "done";
  lastOk: boolean;
}

export type DiceFrenzyTallAction = { type: "toggle"; index: number } | { type: "reroll" } | { type: "lock" } | { type: "next" };

function rollDice(rng: () => number, n: number): number[] {
  return Array.from({ length: n }, () => 1 + Math.floor(rng() * 6));
}

function isAscending(d: number[]): boolean {
  for (let i = 1; i < d.length; i++) if (d[i]! < d[i - 1]!) return false;
  return true;
}

export function initialState(seed: number, _s: DiceFrenzyTallSettings): DiceFrenzyTallState {
  const rng = mulberry32(seed);
  const dice = rollDice(rng, STACK);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    round: 1,
    dice,
    selected: Array(STACK).fill(false),
    rerollUsed: false,
    score: 0,
    phase: "rolling",
    lastOk: false,
  };
}

export function reducer(state: DiceFrenzyTallState, action: DiceFrenzyTallAction): DiceFrenzyTallState {
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    if (state.phase !== "rolling") return state;
    const sel = [...state.selected];
    sel[action.index] = !sel[action.index];
    return { ...state, selected: sel };
  }
  if (action.type === "reroll") {
    if (state.phase !== "rolling" || state.rerollUsed) return state;
    if (!state.selected.some(s => s)) return state;
    const rng = mulberry32(state.rngSeed);
    const dice = state.dice.map((v, i) => state.selected[i] ? 1 + Math.floor(rng() * 6) : v);
    return {
      ...state,
      rngSeed: Math.floor(rng() * 2 ** 31),
      dice,
      selected: Array(STACK).fill(false),
      rerollUsed: true,
    };
  }
  if (action.type === "lock") {
    if (state.phase !== "rolling") return state;
    const ok = isAscending(state.dice);
    return { ...state, phase: "result", lastOk: ok, score: state.score + (ok ? 30 : 0) };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    const rng = mulberry32(state.rngSeed);
    const dice = rollDice(rng, STACK);
    return {
      ...state,
      rngSeed: Math.floor(rng() * 2 ** 31),
      round: state.round + 1,
      dice,
      selected: Array(STACK).fill(false),
      rerollUsed: false,
      phase: "rolling",
      lastOk: false,
    };
  }
  return state;
}

export function isTerminal(state: DiceFrenzyTallState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
