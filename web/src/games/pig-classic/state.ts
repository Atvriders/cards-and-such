import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { DieFace } from "../../engines/dice/index.js";

// Pig Classic — solo race to 100. Roll 1 die, sum to turn-total.
// Roll a 1: turn-total wiped (pigged), turn ends. Bank: lock in turn-total.
// Up to 30 turns to reach 100.

export const TARGET = 100;
export const MAX_TURNS = 30;

export interface PigClassicSettings { dummy: boolean; }

export interface PigClassicState {
  rngSeed: number;
  turn: number;
  turnTotal: number;
  totalScore: number;
  lastRoll: DieFace | 0;     // 0 = no roll yet
  rollHistory: (DieFace)[];   // rolls this turn
  phase: "playing" | "done";
  lastWasOne: boolean;
  bestTurn: number;           // largest single-turn bank ever
}

export type PigClassicAction = { type: "roll" } | { type: "bank" };

export function initialState(seed: number, _settings: PigClassicSettings): PigClassicState {
  return {
    rngSeed: seed,
    turn: 1,
    turnTotal: 0,
    totalScore: 0,
    lastRoll: 0,
    rollHistory: [],
    phase: "playing",
    lastWasOne: false,
    bestTurn: 0,
  };
}

export function reducer(state: PigClassicState, action: PigClassicAction): PigClassicState {
  if (state.phase === "done") return state;

  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = (1 + Math.floor(rng() * 6)) as DieFace;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    if (r === 1) {
      const turn = state.turn + 1;
      const done = turn > MAX_TURNS;
      return {
        ...state,
        rngSeed: nextSeed,
        turnTotal: 0,
        lastRoll: r,
        rollHistory: [],
        lastWasOne: true,
        turn,
        phase: done ? "done" : "playing",
      };
    }
    return {
      ...state,
      rngSeed: nextSeed,
      turnTotal: state.turnTotal + r,
      lastRoll: r,
      rollHistory: [...state.rollHistory, r],
      lastWasOne: false,
    };
  }

  if (action.type === "bank") {
    if (state.turnTotal === 0) return state;
    const newScore = state.totalScore + state.turnTotal;
    const newBest = Math.max(state.bestTurn, state.turnTotal);
    if (newScore >= TARGET) {
      return {
        ...state,
        totalScore: newScore,
        turnTotal: 0,
        rollHistory: [],
        bestTurn: newBest,
        phase: "done",
      };
    }
    const turn = state.turn + 1;
    const done = turn > MAX_TURNS;
    return {
      ...state,
      totalScore: newScore,
      turnTotal: 0,
      rollHistory: [],
      bestTurn: newBest,
      turn,
      phase: done ? "done" : "playing",
    };
  }

  return state;
}

export function isTerminal(state: PigClassicState): { score: number } | null {
  return state.phase === "done" ? { score: state.totalScore } : null;
}
