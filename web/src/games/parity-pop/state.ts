import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Parity Pop: 12 rounds. Predict if the next single die roll will be EVEN or ODD.
// +8 per correct prediction.

export const TOTAL_ROUNDS = 12;

export interface ParityPopSettings { dummy: boolean; }

export interface ParityPopState {
  rngSeed: number;
  round: number;
  prediction: "even" | "odd" | null;
  die: number | null;
  score: number;
  phase: "predict" | "result" | "done";
  lastWin: boolean;
}

export type ParityPopAction =
  | { type: "predict"; choice: "even" | "odd" }
  | { type: "next" };

export function initialState(seed: number, _settings: ParityPopSettings): ParityPopState {
  return { rngSeed: seed, round: 1, prediction: null, die: null, score: 0, phase: "predict", lastWin: false };
}

export function reducer(state: ParityPopState, action: ParityPopAction): ParityPopState {
  if (state.phase === "done") return state;
  if (action.type === "predict") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const die = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isEven = die % 2 === 0;
    const win = (action.choice === "even" && isEven) || (action.choice === "odd" && !isEven);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, prediction: action.choice, die, score: state.score + (win ? 8 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, prediction: null, die: null, phase: "predict", lastWin: false };
  }
  return state;
}

export function isTerminal(state: ParityPopState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
