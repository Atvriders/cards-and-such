import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Frenzy Mini: 8 rounds. Each round shows a target sum (30..40). Roll 10 dice.
// Player chooses a subset of dice to "lock in" (the sum of selected dice). Score
// 50 - |subset_sum - target|, clamped to 0.

export const TOTAL_ROUNDS = 8;
export const NUM_DICE = 10;

export interface DiceFrenzyMiniSettings { dummy: boolean; }

export interface DiceFrenzyMiniState {
  rngSeed: number;
  round: number;
  target: number;
  dice: number[];
  selected: boolean[];
  score: number;
  phase: "selecting" | "result" | "done";
  lastDelta: number;
  lastPts: number;
}

export type DiceFrenzyMiniAction = { type: "toggle"; index: number } | { type: "submit" } | { type: "next" };

function rollDice(rng: () => number, n: number): number[] {
  return Array.from({ length: n }, () => 1 + Math.floor(rng() * 6));
}

export function initialState(seed: number, _s: DiceFrenzyMiniSettings): DiceFrenzyMiniState {
  const rng = mulberry32(seed);
  const dice = rollDice(rng, NUM_DICE);
  const target = 30 + Math.floor(rng() * 11); // 30..40
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    round: 1,
    target,
    dice,
    selected: Array(NUM_DICE).fill(false),
    score: 0,
    phase: "selecting",
    lastDelta: 0,
    lastPts: 0,
  };
}

export function reducer(state: DiceFrenzyMiniState, action: DiceFrenzyMiniAction): DiceFrenzyMiniState {
  if (state.phase === "done") return state;
  if (action.type === "toggle") {
    if (state.phase !== "selecting") return state;
    const next = [...state.selected];
    next[action.index] = !next[action.index];
    return { ...state, selected: next };
  }
  if (action.type === "submit") {
    if (state.phase !== "selecting") return state;
    let sum = 0;
    for (let i = 0; i < NUM_DICE; i++) if (state.selected[i]) sum += state.dice[i]!;
    const delta = Math.abs(sum - state.target);
    const pts = Math.max(0, 50 - delta * 5);
    return { ...state, phase: "result", lastDelta: sum - state.target, lastPts: pts, score: state.score + pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    const rng = mulberry32(state.rngSeed);
    const dice = rollDice(rng, NUM_DICE);
    const target = 30 + Math.floor(rng() * 11);
    return {
      ...state,
      rngSeed: Math.floor(rng() * 2 ** 31),
      round: state.round + 1,
      target,
      dice,
      selected: Array(NUM_DICE).fill(false),
      phase: "selecting",
      lastDelta: 0,
      lastPts: 0,
    };
  }
  return state;
}

export function isTerminal(state: DiceFrenzyMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
