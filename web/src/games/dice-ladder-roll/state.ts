import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Roll a die each round; score climbs a "ladder" — each new roll must beat the previous to keep the streak alive.
export interface DiceLadderRollSettings { rounds: "10" | "20"; }
export interface DiceLadderRollState {
  rngSeed: number; lastRoll: number; currentDie: number | null; score: number; streak: number;
  round: number; maxRounds: number; phase: "waiting" | "result" | "gameover"; lastPts: number; streakBroken: boolean;
}
export type DiceLadderRollAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, settings: DiceLadderRollSettings): DiceLadderRollState {
  const rng = mulberry32(seed);
  return { rngSeed: Math.floor(rng() * 2 ** 31), lastRoll: 0, currentDie: null, score: 0, streak: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "waiting", lastPts: 0, streakBroken: false };
}

export function reducer(state: DiceLadderRollState, action: DiceLadderRollAction): DiceLadderRollState {
  if (state.phase === "gameover") return state;
  if (action.type === "roll" && state.phase === "waiting") {
    const rng = mulberry32(state.rngSeed);
    const d = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const beat = d > state.lastRoll;
    const newStreak = beat ? state.streak + 1 : 0;
    const pts = beat ? (d + newStreak * 2) : 0;
    const done = state.round >= state.maxRounds;
    return { ...state, currentDie: d, lastRoll: d, lastPts: pts, streakBroken: !beat, streak: newStreak, score: state.score + pts, rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, currentDie: null, round: state.round + 1, phase: "waiting" };
  }
  return state;
}

export function isTerminal(state: DiceLadderRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
