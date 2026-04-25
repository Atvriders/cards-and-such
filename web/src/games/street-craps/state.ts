import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Street Craps: simplified craps without all casino rules.
// Come-out roll: 7 or 11 = win. 2, 3, 12 = lose. Any other number = point.
// Once point is set: roll until you hit point (win) or 7 (lose).

export interface StreetCrapsSettings {
  rounds: "5" | "10" | "20";
}

export type ScPhase = "comeOut" | "point" | "roundDone" | "gameDone";
export type ScResult = "win" | "lose" | "pending";

export interface StreetCrapsState {
  settings: StreetCrapsSettings;
  rngSeed: number;
  lastRoll: number[];
  lastSum: number;
  point: number | null;
  roundResult: ScResult;
  roundsPlayed: number;
  totalRounds: number;
  wins: number;
  phase: ScPhase;
  rollHistory: number[];
}

export type StreetCrapsAction =
  | { type: "roll" }
  | { type: "nextRound" };

export function initialState(seed: number, settings: StreetCrapsSettings): StreetCrapsState {
  return {
    settings,
    rngSeed: seed,
    lastRoll: [],
    lastSum: 0,
    point: null,
    roundResult: "pending",
    roundsPlayed: 0,
    totalRounds: parseInt(settings.rounds, 10),
    wins: 0,
    phase: "comeOut",
    rollHistory: [],
  };
}

function advanceSeed(seed: number): { rng: () => number; newSeed: number } {
  const rng = mulberry32(seed);
  const newSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), newSeed };
}

export function reducer(state: StreetCrapsState, action: StreetCrapsAction): StreetCrapsState {
  if (state.phase === "gameDone") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "comeOut" && state.phase !== "point") return state;

      const { rng, newSeed } = advanceSeed(state.rngSeed);
      const d1 = Math.floor(rng() * 6) + 1;
      const d2 = Math.floor(rng() * 6) + 1;
      const sum = d1 + d2;
      const newHistory = [...state.rollHistory, sum];

      if (state.phase === "comeOut") {
        if (sum === 7 || sum === 11) {
          const newRounds = state.roundsPlayed + 1;
          return {
            ...state,
            rngSeed: newSeed,
            lastRoll: [d1, d2],
            lastSum: sum,
            roundResult: "win",
            wins: state.wins + 1,
            roundsPlayed: newRounds,
            rollHistory: newHistory,
            phase: newRounds >= state.totalRounds ? "gameDone" : "roundDone",
          };
        }
        if (sum === 2 || sum === 3 || sum === 12) {
          const newRounds = state.roundsPlayed + 1;
          return {
            ...state,
            rngSeed: newSeed,
            lastRoll: [d1, d2],
            lastSum: sum,
            roundResult: "lose",
            roundsPlayed: newRounds,
            rollHistory: newHistory,
            phase: newRounds >= state.totalRounds ? "gameDone" : "roundDone",
          };
        }
        // Set point
        return {
          ...state,
          rngSeed: newSeed,
          lastRoll: [d1, d2],
          lastSum: sum,
          point: sum,
          rollHistory: newHistory,
          phase: "point",
        };
      }

      // Phase = point
      if (sum === state.point) {
        const newRounds = state.roundsPlayed + 1;
        return {
          ...state,
          rngSeed: newSeed,
          lastRoll: [d1, d2],
          lastSum: sum,
          roundResult: "win",
          wins: state.wins + 1,
          roundsPlayed: newRounds,
          rollHistory: newHistory,
          phase: newRounds >= state.totalRounds ? "gameDone" : "roundDone",
        };
      }
      if (sum === 7) {
        const newRounds = state.roundsPlayed + 1;
        return {
          ...state,
          rngSeed: newSeed,
          lastRoll: [d1, d2],
          lastSum: sum,
          roundResult: "lose",
          roundsPlayed: newRounds,
          rollHistory: newHistory,
          phase: newRounds >= state.totalRounds ? "gameDone" : "roundDone",
        };
      }
      // Keep rolling
      return {
        ...state,
        rngSeed: newSeed,
        lastRoll: [d1, d2],
        lastSum: sum,
        rollHistory: newHistory,
      };
    }

    case "nextRound": {
      if (state.phase !== "roundDone") return state;
      return {
        ...state,
        lastRoll: [],
        lastSum: 0,
        point: null,
        roundResult: "pending",
        rollHistory: [],
        phase: "comeOut",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: StreetCrapsState): { score: number } | null {
  if (state.phase !== "gameDone") return null;
  return { score: Math.round((state.wins / state.totalRounds) * 1000) };
}
