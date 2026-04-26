import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Roll 2 dice; score triple if both show 6, double if both show same, normal otherwise.
export interface DiceSpikeRollSettings { rounds: "10" | "20"; }
export interface DiceSpikeRollState {
  rngSeed: number; dice: [number,number] | null; score: number;
  round: number; maxRounds: number; phase: "waiting" | "result" | "gameover"; lastPts: number; lastMulti: number;
}
export type DiceSpikeRollAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, settings: DiceSpikeRollSettings): DiceSpikeRollState {
  const rng = mulberry32(seed);
  return { rngSeed: Math.floor(rng() * 2 ** 31), dice: null, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "waiting", lastPts: 0, lastMulti: 1 };
}

export function reducer(state: DiceSpikeRollState, action: DiceSpikeRollAction): DiceSpikeRollState {
  if (state.phase === "gameover") return state;
  if (action.type === "roll" && state.phase === "waiting") {
    const rng = mulberry32(state.rngSeed);
    const d1 = Math.floor(rng() * 6) + 1;
    const d2 = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const base = d1 + d2;
    const multi = (d1 === 6 && d2 === 6) ? 3 : (d1 === d2 ? 2 : 1);
    const pts = base * multi;
    const done = state.round >= state.maxRounds;
    return { ...state, dice: [d1,d2], lastPts: pts, lastMulti: multi, score: state.score + pts, rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, dice: null, round: state.round + 1, phase: "waiting" };
  }
  return state;
}

export function isTerminal(state: DiceSpikeRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
