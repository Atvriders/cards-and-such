import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Twenty-Six — Choose a target number (1-6), roll 10 dice 13 times.
 * Count how many times your chosen number appears. Payout based on total hits.
 * Standard: 13 hits = break even. <8 or >20 big penalty. >25 jackpot.
 */

export interface TwentySixSettings {
  rounds: "1" | "3";
}

export interface TwentySixState {
  settings: TwentySixSettings;
  rngSeed: number;
  targetNumber: number | null;
  rolls: number[][];
  rollIndex: number;
  hitCount: number;
  payout: number;
  totalScore: number;
  roundsPlayed: number;
  phase: "chooseTarget" | "rolling" | "roundOver" | "done";
}

export type TwentySixAction =
  | { type: "chooseTarget"; num: number }
  | { type: "roll" }
  | { type: "nextRound" };

function rollTen(seed: number): { values: number[]; nextSeed: number } {
  let s = seed >>> 0;
  const values: number[] = [];
  for (let i = 0; i < 10; i++) {
    const rng = mulberry32(s);
    const v1 = rng();
    const ns = (Math.floor(v1 * 2 ** 31)) >>> 0;
    const rng2 = mulberry32(s);
    values.push(Math.floor(rng2() * 6) + 1);
    s = ns;
  }
  return { values, nextSeed: s };
}

function calcPayout(hits: number): number {
  if (hits >= 26) return 6;
  if (hits >= 25) return 4;
  if (hits >= 24) return 3;
  if (hits >= 22) return 2;
  if (hits >= 20) return 1;
  if (hits >= 14) return 0; // break even area
  if (hits >= 13) return 0;
  if (hits >= 10) return -1;
  if (hits >= 8) return -2;
  return -3;
}

export function initialState(seed: number, settings: TwentySixSettings): TwentySixState {
  return {
    settings,
    rngSeed: seed >>> 0,
    targetNumber: null,
    rolls: [],
    rollIndex: 0,
    hitCount: 0,
    payout: 0,
    totalScore: 0,
    roundsPlayed: 0,
    phase: "chooseTarget",
  };
}

export function reducer(state: TwentySixState, action: TwentySixAction): TwentySixState {
  switch (action.type) {
    case "chooseTarget": {
      if (state.phase !== "chooseTarget") return state;
      if (action.num < 1 || action.num > 6) return state;
      return { ...state, targetNumber: action.num, phase: "rolling" };
    }

    case "roll": {
      if (state.phase !== "rolling") return state;
      if (state.rollIndex >= 13) return state;
      const { values, nextSeed } = rollTen(state.rngSeed);
      const newRolls = [...state.rolls, values];
      const newHits = state.hitCount + values.filter((v) => v === state.targetNumber).length;
      const newRollIdx = state.rollIndex + 1;
      const done = newRollIdx >= 13;

      if (done) {
        const payout = calcPayout(newHits);
        return {
          ...state,
          rngSeed: nextSeed,
          rolls: newRolls,
          rollIndex: newRollIdx,
          hitCount: newHits,
          payout,
          totalScore: state.totalScore + payout,
          phase: "roundOver",
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        rolls: newRolls,
        rollIndex: newRollIdx,
        hitCount: newHits,
      };
    }

    case "nextRound": {
      if (state.phase !== "roundOver") return state;
      const newRoundsPlayed = state.roundsPlayed + 1;
      const maxRounds = Number(state.settings.rounds);
      if (newRoundsPlayed >= maxRounds) {
        return { ...state, roundsPlayed: newRoundsPlayed, phase: "done" };
      }
      return {
        ...state,
        targetNumber: null,
        rolls: [],
        rollIndex: 0,
        hitCount: 0,
        payout: 0,
        roundsPlayed: newRoundsPlayed,
        phase: "chooseTarget",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: TwentySixState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, state.totalScore + 50) }; // offset so 0 isn't confusing
}
