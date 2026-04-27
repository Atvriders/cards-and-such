import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Over Under: 10 rounds. Predict whether 2 dice will sum OVER or UNDER 7.
// 7 itself is a "push" -> 0 points (neither side wins).

export const TOTAL_ROUNDS = 10;

export interface OverUnderSettings { dummy: boolean; }

export interface OverUnderState {
  rngSeed: number;
  round: number;
  prediction: "over" | "under" | null;
  dice: [number, number] | null;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
  push: boolean;
}

export type OverUnderAction =
  | { type: "predict"; choice: "over" | "under" }
  | { type: "next" };

export function initialState(seed: number, _settings: OverUnderSettings): OverUnderState {
  return { rngSeed: seed, round: 1, prediction: null, dice: null, score: 0, phase: "predict", lastWin: false, push: false };
}

export function reducer(state: OverUnderState, action: OverUnderAction): OverUnderState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b;
    let win = false; let push = false;
    if (sum === 7) { push = true; }
    else if (action.choice === "over") win = sum > 7;
    else win = sum < 7;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, dice: [a, b], score: state.score + (win ? 10 : 0), phase: isLast ? "done" : "result", lastWin: win, push };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, dice: null, phase: "predict", lastWin: false, push: false };
  }
  return state;
}

export function isTerminal(state: OverUnderState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
