import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice 100 Target: Roll one die at a time and add to your running total.
// Stop before you bust 100. Closer to 100 = more points (without going over).
// Score = total if <= 100, else 0. 5 rounds. Best aggregate wins.

export interface Dice100TargetSettings { rounds: "3" | "5" | "7"; }

export interface Dice100TargetState {
  round: number;
  maxRounds: number;
  total: number;
  lastRoll: number | null;
  roundScore: number;
  totalScore: number;
  rolls: number;
  phase: "rolling" | "scored" | "bust" | "gameover";
  rngSeed: number;
}

export type Dice100TargetAction =
  | { type: "roll" }
  | { type: "stop" }
  | { type: "next" };

export function initialState(seed: number, settings: Dice100TargetSettings): Dice100TargetState {
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), total: 0, lastRoll: null, roundScore: 0, totalScore: 0, rolls: 0, phase: "rolling", rngSeed: seed };
}

export function reducer(state: Dice100TargetState, action: Dice100TargetAction): Dice100TargetState {
  if (state.phase === "gameover") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const die = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const newTotal = state.total + die;
    if (newTotal > 100) {
      const phase = state.round >= state.maxRounds ? "gameover" : "bust";
      return { ...state, total: newTotal, lastRoll: die, roundScore: 0, totalScore: state.totalScore, rolls: state.rolls + 1, phase, rngSeed: nextSeed };
    }
    return { ...state, total: newTotal, lastRoll: die, rolls: state.rolls + 1, rngSeed: nextSeed };
  }
  if (action.type === "stop") {
    if (state.phase !== "rolling" || state.total === 0) return state;
    const roundScore = state.total;
    const phase = state.round >= state.maxRounds ? "gameover" : "scored";
    return { ...state, roundScore, totalScore: state.totalScore + roundScore, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "scored" && state.phase !== "bust") return state;
    return { ...state, round: state.round + 1, total: 0, lastRoll: null, roundScore: 0, rolls: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: Dice100TargetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.totalScore } : null;
}
