import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceSpinRollSettings { rounds: "10" | "20"; }
export interface DiceSpinRollState {
  rngSeed: number; dice: number[] | null; score: number;
  round: number; maxRounds: number; phase: "waiting" | "result" | "gameover"; lastPts: number; target: number;
}
export type DiceSpinRollAction = { type: "spin" } | { type: "next" };

export function initialState(seed: number, settings: DiceSpinRollSettings): DiceSpinRollState {
  const rng = mulberry32(seed);
  const target = 7 + Math.floor(rng() * 7); // target 7-13
  return { rngSeed: Math.floor(rng() * 2 ** 31), dice: null, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "waiting", lastPts: 0, target };
}

export function reducer(state: DiceSpinRollState, action: DiceSpinRollAction): DiceSpinRollState {
  if (state.phase === "gameover") return state;
  if (action.type === "spin" && state.phase === "waiting") {
    const rng = mulberry32(state.rngSeed);
    const d1 = Math.floor(rng() * 6) + 1;
    const d2 = Math.floor(rng() * 6) + 1;
    const d3 = Math.floor(rng() * 6) + 1;
    const nextTarget = 7 + Math.floor(rng() * 7);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = d1 + d2 + d3;
    const diff = Math.abs(sum - state.target);
    const pts = Math.max(0, 50 - diff * 10);
    const done = state.round >= state.maxRounds;
    return { ...state, dice: [d1,d2,d3], lastPts: pts, score: state.score + pts, target: nextTarget, rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, dice: null, round: state.round + 1, phase: "waiting" };
  }
  return state;
}

export function isTerminal(state: DiceSpinRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
