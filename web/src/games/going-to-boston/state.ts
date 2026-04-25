import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface GoingToBostonSettings {
  rounds: "3" | "5" | "7";
}

export type GtbPhase = "preRoll" | "kept1" | "kept2" | "roundDone" | "gameDone";

export interface GoingToBostonState {
  settings: GoingToBostonSettings;
  rngSeed: number;
  round: number;
  totalRounds: number;
  totalScore: number;
  roundScore: number;
  keptDice: number[]; // dice kept so far this round (up to 2)
  currentRoll: number[]; // dice remaining in the current roll
  phase: GtbPhase;
}

export type GoingToBostonAction =
  | { type: "roll" }
  | { type: "nextRound" };

export function initialState(seed: number, settings: GoingToBostonSettings): GoingToBostonState {
  return {
    settings,
    rngSeed: seed,
    round: 1,
    totalRounds: parseInt(settings.rounds, 10),
    totalScore: 0,
    roundScore: 0,
    keptDice: [],
    currentRoll: [],
    phase: "preRoll",
  };
}

function rollN(n: number, rng: () => number): number[] {
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    result.push(Math.floor(rng() * 6) + 1);
  }
  return result;
}

function advanceSeed(seed: number): { rng: () => number; newSeed: number } {
  const rng = mulberry32(seed);
  const newSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), newSeed };
}

export function reducer(state: GoingToBostonState, action: GoingToBostonAction): GoingToBostonState {
  if (state.phase === "gameDone") return state;

  switch (action.type) {
    case "roll": {
      const { rng, newSeed } = advanceSeed(state.rngSeed);

      if (state.phase === "preRoll") {
        // First roll: roll 3 dice, keep the highest
        const dice = rollN(3, rng);
        const maxVal = Math.max(...dice);
        const remaining = dice.filter((v, i) => {
          // remove first occurrence of maxVal
          if (v === maxVal && dice.indexOf(maxVal) === i) return false;
          return true;
        });
        return {
          ...state,
          rngSeed: newSeed,
          keptDice: [maxVal],
          currentRoll: remaining,
          phase: "kept1",
        };
      }

      if (state.phase === "kept1") {
        // Second roll: roll 2 remaining dice, keep the highest
        const dice = rollN(2, rng);
        const maxVal = Math.max(...dice);
        return {
          ...state,
          rngSeed: newSeed,
          keptDice: [...state.keptDice, maxVal],
          currentRoll: dice.filter((v, i) => {
            if (v === maxVal && dice.indexOf(maxVal) === i) return false;
            return true;
          }),
          phase: "kept2",
        };
      }

      if (state.phase === "kept2") {
        // Third roll: roll 1 remaining die, keep it
        const dice = rollN(1, rng);
        const kept = dice[0]!;
        const finalKept = [...state.keptDice, kept];
        const roundScore = finalKept.reduce((a, b) => a + b, 0);
        const newTotal = state.totalScore + roundScore;
        const isLast = state.round >= state.totalRounds;

        return {
          ...state,
          rngSeed: newSeed,
          keptDice: finalKept,
          currentRoll: [],
          roundScore,
          totalScore: newTotal,
          phase: isLast ? "gameDone" : "roundDone",
        };
      }

      return state;
    }

    case "nextRound": {
      if (state.phase !== "roundDone") return state;
      return {
        ...state,
        round: state.round + 1,
        roundScore: 0,
        keptDice: [],
        currentRoll: [],
        phase: "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: GoingToBostonState): { score: number } | null {
  if (state.phase !== "gameDone") return null;
  return { score: state.totalScore };
}
