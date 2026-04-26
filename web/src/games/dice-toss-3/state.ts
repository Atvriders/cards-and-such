import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceToss3Settings { rounds: "10" | "20"; }
export interface DiceToss3State {
  rngSeed: number; dice: [number,number,number] | null; score: number;
  round: number; maxRounds: number; phase: "waiting" | "result" | "gameover"; lastPts: number;
}
export type DiceToss3Action = { type: "toss" } | { type: "next" };

export function initialState(seed: number, settings: DiceToss3Settings): DiceToss3State {
  const rng = mulberry32(seed);
  return { rngSeed: Math.floor(rng() * 2 ** 31), dice: null, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "waiting", lastPts: 0 };
}

export function reducer(state: DiceToss3State, action: DiceToss3Action): DiceToss3State {
  if (state.phase === "gameover") return state;
  if (action.type === "toss" && state.phase === "waiting") {
    const rng = mulberry32(state.rngSeed);
    const d1 = Math.floor(rng() * 6) + 1;
    const d2 = Math.floor(rng() * 6) + 1;
    const d3 = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = d1 + d2 + d3;
    const done = state.round >= state.maxRounds;
    return { ...state, dice: [d1,d2,d3], lastPts: pts, score: state.score + pts, rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, dice: null, round: state.round + 1, phase: "waiting" };
  }
  return state;
}

export function isTerminal(state: DiceToss3State): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
