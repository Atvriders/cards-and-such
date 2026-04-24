import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DropDeadSettings {
  dice: "5" | "7";
}

export interface DropDeadState {
  settings: DropDeadSettings;
  rngSeed: number;
  score: number;
  lastRoll: number[];
  /** Indices of dead dice (showing 2 or 5) from last roll */
  deadIndices: number[];
  activeDice: number;
  phase: "rolling" | "done";
}

export type DropDeadAction = { type: "roll" } | { type: "restart" };

function rollDiceArr(n: number, seed: number): { values: number[]; nextSeed: number } {
  let s = seed >>> 0;
  const values: number[] = [];
  for (let i = 0; i < n; i++) {
    const rng = mulberry32(s);
    const v1 = rng();
    const nextS = (Math.floor(v1 * 2 ** 31)) >>> 0;
    const rng2 = mulberry32(s);
    values.push(Math.floor(rng2() * 6) + 1);
    s = nextS;
  }
  return { values, nextSeed: s };
}

export function initialState(seed: number, settings: DropDeadSettings): DropDeadState {
  return {
    settings,
    rngSeed: seed >>> 0,
    score: 0,
    lastRoll: [],
    deadIndices: [],
    activeDice: Number(settings.dice),
    phase: "rolling",
  };
}

export function reducer(state: DropDeadState, action: DropDeadAction): DropDeadState {
  switch (action.type) {
    case "roll": {
      if (state.phase === "done") return state;

      const { values, nextSeed } = rollDiceArr(state.activeDice, state.rngSeed);
      const deadIdx: number[] = [];
      for (let i = 0; i < values.length; i++) {
        if (values[i] === 2 || values[i] === 5) deadIdx.push(i);
      }

      const anyDead = deadIdx.length > 0;
      // If no dead dice, add sum to score
      const rollSum = anyDead ? 0 : values.reduce((a, b) => a + b, 0);
      const newScore = state.score + rollSum;
      const newActive = state.activeDice - deadIdx.length;
      const done = newActive <= 0;

      return {
        ...state,
        rngSeed: nextSeed,
        score: newScore,
        lastRoll: values,
        deadIndices: deadIdx,
        activeDice: done ? 0 : newActive,
        phase: done ? "done" : "rolling",
      };
    }

    case "restart": {
      return initialState(state.rngSeed, state.settings);
    }

    default:
      return state;
  }
}

export function isTerminal(state: DropDeadState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
