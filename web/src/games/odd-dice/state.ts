import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface OddDiceSettings {
  rounds: "3" | "5";
}

export interface OddDiceState {
  settings: OddDiceSettings;
  rngSeed: number;
  totalRounds: number;
  round: number;
  dice: number[]; // current 5 dice values (1-6)
  rollsLeft: number;
  roundScore: number;
  totalScore: number;
  done: boolean;
}

export type OddDiceAction =
  | { type: "roll" }        // roll all dice (first roll of round)
  | { type: "endRound" };   // lock score and move to next round

const DICE_COUNT = 5;
const ROLLS_PER_ROUND = 3;

function rollAllDice(seed: number): { dice: number[]; newSeed: number } {
  const rng = mulberry32(seed);
  const dice = Array.from({ length: DICE_COUNT }, () => Math.floor(rng() * 6) + 1);
  const newSeed = (rng() * 2 ** 31) >>> 0;
  return { dice, newSeed };
}

function sumOdds(dice: number[]): number {
  return dice.filter((d) => d % 2 !== 0).reduce((a, b) => a + b, 0);
}

export function initialState(seed: number, settings: OddDiceSettings): OddDiceState {
  return {
    settings,
    rngSeed: seed >>> 0,
    totalRounds: parseInt(settings.rounds, 10),
    round: 1,
    dice: [],
    rollsLeft: ROLLS_PER_ROUND,
    roundScore: 0,
    totalScore: 0,
    done: false,
  };
}

export function reducer(state: OddDiceState, action: OddDiceAction): OddDiceState {
  if (state.done) return state;

  if (action.type === "roll") {
    if (state.rollsLeft === 0) return state;
    const { dice, newSeed } = rollAllDice(state.rngSeed);
    const rollsLeft = state.rollsLeft - 1;
    const roundScore = sumOdds(dice);
    return {
      ...state,
      rngSeed: newSeed,
      dice,
      rollsLeft,
      roundScore,
    };
  }

  if (action.type === "endRound") {
    if (state.dice.length === 0) return state; // must roll at least once
    const newTotal = state.totalScore + state.roundScore;
    const newRound = state.round + 1;
    const done = newRound > state.totalRounds;
    return {
      ...state,
      totalScore: newTotal,
      round: done ? state.round : newRound,
      dice: [],
      rollsLeft: ROLLS_PER_ROUND,
      roundScore: 0,
      done,
    };
  }

  return state;
}

export function isTerminal(state: OddDiceState): { score: number } | null {
  if (!state.done) return null;
  return { score: state.totalScore };
}

export { DICE_COUNT, ROLLS_PER_ROUND, sumOdds };
