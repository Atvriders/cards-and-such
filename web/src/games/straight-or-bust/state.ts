import type { Die, DieFace } from "../../engines/dice/index.js";
import { rollDice, rerollUnkept, toggleKeep } from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Straight or Bust: build a straight (1-2-3-4-5 or 2-3-4-5-6) with 5 dice.
// Each round: roll up to 3 times, keeping dice you want.
// Score: 1-2-3-4-5 straight = 150, 2-3-4-5-6 straight = 200, 1-2-3-4-5-6 (6 dice variant) skipped.
// If you achieve a straight in 1 roll = bonus 100 pts.
// If you achieve a straight in 2 rolls = bonus 50 pts.
// If no straight after 3 rolls = 0 pts for that round (BUST).
// Play 5, 7, or 10 rounds. Total score = sum of round scores.

export interface StraightOrBustSettings {
  rounds: "5" | "7" | "10";
}

export type RoundPhase = "preRoll" | "rolling" | "done";

export interface RoundResult {
  straight: boolean;
  score: number;
  rollsTaken: number;
}

export interface StraightOrBustState {
  settings: StraightOrBustSettings;
  rngSeed: number;
  round: number;
  rollsUsed: number;
  dice: Die[];
  roundResults: RoundResult[];
  phase: RoundPhase;
  totalScore: number;
  gameOver: boolean;
}

export type StraightOrBustAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "nextRound" };

export function initialState(seed: number, settings: StraightOrBustSettings): StraightOrBustState {
  return {
    settings,
    rngSeed: seed,
    round: 1,
    rollsUsed: 0,
    dice: [
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
      { value: 1, kept: false },
    ],
    roundResults: [],
    phase: "preRoll",
    totalScore: 0,
    gameOver: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function checkStraight(dice: Die[]): { straight: boolean; score: number } {
  const values = new Set(dice.map((d) => d.value));
  const low = [1, 2, 3, 4, 5].every((v) => values.has(v as DieFace));
  const high = [2, 3, 4, 5, 6].every((v) => values.has(v as DieFace));
  if (low) return { straight: true, score: 150 };
  if (high) return { straight: true, score: 200 };
  return { straight: false, score: 0 };
}

export function reducer(state: StraightOrBustState, action: StraightOrBustAction): StraightOrBustState {
  if (state.gameOver) return state;

  switch (action.type) {
    case "roll": {
      if (state.phase === "done") return state;
      if (state.rollsUsed >= 3) return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice =
        state.rollsUsed === 0
          ? rollDice(5, rng)
          : rerollUnkept(state.dice, rng);
      const newRollsUsed = state.rollsUsed + 1;

      const { straight, score } = checkStraight(newDice);

      // Bonus for fewer rolls
      let finalScore = 0;
      if (straight) {
        const bonus = newRollsUsed === 1 ? 100 : newRollsUsed === 2 ? 50 : 0;
        finalScore = score + bonus;
      }

      const roundDone = straight || newRollsUsed >= 3;

      if (roundDone) {
        const result: RoundResult = {
          straight,
          score: finalScore,
          rollsTaken: newRollsUsed,
        };
        return {
          ...state,
          rngSeed: nextSeed,
          dice: newDice,
          rollsUsed: newRollsUsed,
          phase: "done",
          roundResults: [...state.roundResults, result],
          totalScore: state.totalScore + finalScore,
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        dice: newDice,
        rollsUsed: newRollsUsed,
        phase: "rolling",
      };
    }

    case "toggleKeep": {
      if (state.phase !== "rolling" || state.rollsUsed === 0 || state.rollsUsed >= 3) return state;
      return { ...state, dice: toggleKeep(state.dice, action.index) };
    }

    case "nextRound": {
      if (state.phase !== "done") return state;
      const maxRounds = parseInt(state.settings.rounds, 10);
      const nextRound = state.round + 1;
      const gameOver = nextRound > maxRounds;
      return {
        ...state,
        round: nextRound,
        rollsUsed: 0,
        dice: state.dice.map((d) => ({ ...d, kept: false })),
        phase: "preRoll",
        gameOver,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: StraightOrBustState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.totalScore };
}
