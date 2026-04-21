import type { Die, DieFace } from "../../engines/dice/index.js";
import { rollDice } from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BuncoSettings { dummy: boolean }

export type BuncoPhase = "preRoll" | "rolled" | "roundOver" | "gameOver";

export interface BuncoState {
  settings: BuncoSettings;
  rngSeed: number;
  round: number;       // 1..6 (target face = round)
  roundScore: number;  // accumulated in current round
  totalScore: number;  // across all rounds
  dice: Die[];
  phase: BuncoPhase;
  lastRollScore: number; // points from last roll
  roundScores: number[]; // score each round achieved
}

export type BuncoAction =
  | { type: "roll" }
  | { type: "nextRound" };

export function initialState(seed: number, settings: BuncoSettings): BuncoState {
  return {
    settings,
    rngSeed: seed,
    round: 1,
    roundScore: 0,
    totalScore: 0,
    dice: Array.from({ length: 3 }, () => ({ value: 1 as DieFace, kept: false })),
    phase: "preRoll",
    lastRollScore: 0,
    roundScores: [],
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function scoreRoll(dice: Die[], targetFace: DieFace): number {
  const matching = dice.filter((d) => d.value === targetFace).length;
  const allSame = dice.every((d) => d.value === dice[0]!.value);
  if (matching === 3) return 21; // Bunco
  if (allSame && matching === 0) return 5; // 3-of-a-kind non-matching
  return matching; // 1 pt per matching die
}

export function reducer(state: BuncoState, action: BuncoAction): BuncoState {
  if (state.phase === "gameOver") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll" && state.phase !== "rolled") return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice = rollDice(3, rng);
      const target = state.round as DieFace;
      const pts = scoreRoll(newDice, target);
      const newRoundScore = state.roundScore + pts;

      // Round ends when score reaches 21 or roll gives 0 and round started
      // Simple rule: round ends when cumulative hits >= 21 OR pts == 0
      const roundDone = newRoundScore >= 21 || pts === 0;

      if (roundDone) {
        const newRoundScores = [...state.roundScores, newRoundScore];
        const newTotalScore = state.totalScore + newRoundScore;
        const isLastRound = state.round >= 6;
        return {
          ...state,
          rngSeed: nextSeed,
          dice: newDice,
          lastRollScore: pts,
          roundScore: newRoundScore,
          totalScore: newTotalScore,
          roundScores: newRoundScores,
          phase: isLastRound ? "gameOver" : "roundOver",
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        dice: newDice,
        lastRollScore: pts,
        roundScore: newRoundScore,
        phase: "rolled",
      };
    }

    case "nextRound": {
      if (state.phase !== "roundOver") return state;
      return {
        ...state,
        round: state.round + 1,
        roundScore: 0,
        lastRollScore: 0,
        dice: Array.from({ length: 3 }, () => ({ value: 1 as DieFace, kept: false })),
        phase: "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BuncoState): { score: number } | null {
  if (state.phase !== "gameOver") return null;
  return { score: state.totalScore };
}
