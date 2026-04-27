import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Paddle: 10 rounds. Each round you "paddle" a die: choose Light, Medium, or Heavy
// hit. The die's roll determines outcome. Score:
//   Light:  +rolled
//   Medium: +rolled*2 if 4..6, else 0
//   Heavy:  +rolled*3 if 5..6, else -rolled (bounce-back penalty)

export const TOTAL_ROUNDS = 10;

export interface DicePaddleSettings { dummy: boolean; }

export interface DicePaddleState {
  rngSeed: number;
  round: number;
  pick: "light" | "medium" | "heavy" | null;
  roll: number | null;
  delta: number;
  score: number;
  phase: "picking" | "result" | "done";
}

export type DicePaddleAction = { type: "pick"; choice: "light" | "medium" | "heavy" } | { type: "next" };

export function initialState(seed: number, _s: DicePaddleSettings): DicePaddleState {
  return {
    rngSeed: seed,
    round: 1,
    pick: null,
    roll: null,
    delta: 0,
    score: 0,
    phase: "picking",
  };
}

export function reducer(state: DicePaddleState, action: DicePaddleAction): DicePaddleState {
  if (state.phase === "done") return state;
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let delta = 0;
    if (action.choice === "light") delta = r;
    else if (action.choice === "medium") delta = r >= 4 ? r * 2 : 0;
    else delta = r >= 5 ? r * 3 : -r;
    return {
      ...state,
      rngSeed: nextSeed,
      pick: action.choice,
      roll: r,
      delta,
      score: Math.max(0, state.score + delta),
      phase: "result",
    };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    return { ...state, round: state.round + 1, pick: null, roll: null, delta: 0, phase: "picking" };
  }
  return state;
}

export function isTerminal(state: DicePaddleState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
