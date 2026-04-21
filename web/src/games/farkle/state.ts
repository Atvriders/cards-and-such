import type { Die, DieFace } from "../../engines/dice/index.js";
import {
  rollDice,
  scoreFarkleSelection,
  hasFarkleScoringOption,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface FarkleSettings {
  target: "5000" | "10000";
}

export interface FarkleTurn {
  diceRemaining: number;
  setAside: DieFace[];
  turnScore: number;
  phase: "preRoll" | "rolled" | "farkled";
}

export interface FarkleState {
  settings: FarkleSettings;
  rngSeed: number;
  bankedScore: number;
  turnsTaken: number;
  currentTurn: FarkleTurn;
  lastRoll: Die[];
  won: boolean;
}

export type FarkleAction =
  | { type: "roll" }
  | { type: "setAside"; indices: number[] }
  | { type: "bank" }
  | { type: "nextTurn" };

export function initialState(seed: number, settings: FarkleSettings): FarkleState {
  return {
    settings,
    rngSeed: seed,
    bankedScore: 0,
    turnsTaken: 0,
    currentTurn: {
      diceRemaining: 6,
      setAside: [],
      turnScore: 0,
      phase: "preRoll",
    },
    lastRoll: [],
    won: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function reducer(state: FarkleState, action: FarkleAction): FarkleState {
  if (state.won) return state;

  switch (action.type) {
    case "roll": {
      if (state.currentTurn.phase !== "preRoll") return state;

      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newRoll = rollDice(state.currentTurn.diceRemaining, rng);

      // Check for farkle (no scoring options)
      if (!hasFarkleScoringOption(newRoll)) {
        return {
          ...state,
          rngSeed: nextSeed,
          lastRoll: newRoll,
          currentTurn: {
            ...state.currentTurn,
            phase: "farkled",
          },
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        lastRoll: newRoll,
        currentTurn: {
          ...state.currentTurn,
          phase: "rolled",
        },
      };
    }

    case "setAside": {
      if (state.currentTurn.phase !== "rolled") return state;
      if (action.indices.length === 0) return state;

      // Validate indices
      const roll = state.lastRoll;
      if (action.indices.some((i) => i < 0 || i >= roll.length)) return state;
      // No duplicates
      if (new Set(action.indices).size !== action.indices.length) return state;

      const selectedValues = action.indices.map((i) => roll[i]!.value);
      const points = scoreFarkleSelection(selectedValues);
      if (points === 0) return state; // invalid selection

      const newSetAside = [...state.currentTurn.setAside, ...selectedValues];
      const newTurnScore = state.currentTurn.turnScore + points;
      // Remaining dice after set-aside
      const remaining = roll.length - action.indices.length;
      // Hot dice: if all dice used up, reset to 6
      const newDiceRemaining = remaining === 0 ? 6 : remaining;

      return {
        ...state,
        currentTurn: {
          diceRemaining: newDiceRemaining,
          setAside: newSetAside,
          turnScore: newTurnScore,
          phase: "preRoll",
        },
      };
    }

    case "bank": {
      if (state.currentTurn.phase !== "preRoll") return state;
      if (state.currentTurn.turnScore === 0) return state;

      const newBanked = state.bankedScore + state.currentTurn.turnScore;
      const newTurns = state.turnsTaken + 1;
      const target = parseInt(state.settings.target, 10);
      const won = newBanked >= target;

      return {
        ...state,
        bankedScore: newBanked,
        turnsTaken: newTurns,
        won,
        currentTurn: {
          diceRemaining: 6,
          setAside: [],
          turnScore: 0,
          phase: "preRoll",
        },
        lastRoll: [],
      };
    }

    case "nextTurn": {
      if (state.currentTurn.phase !== "farkled") return state;
      return {
        ...state,
        turnsTaken: state.turnsTaken + 1,
        currentTurn: {
          diceRemaining: 6,
          setAside: [],
          turnScore: 0,
          phase: "preRoll",
        },
        lastRoll: [],
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: FarkleState): { score: number } | null {
  if (!state.won) return null;
  // Fewer turns = higher score. Math.max(0, 1000 - turnsTaken)
  const score = Math.max(0, 1000 - state.turnsTaken);
  return { score };
}
