import type { Die, DieFace } from "../../engines/dice/index.js";
import { rollDice, rerollUnkept, toggleKeep, faceCounts } from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CosmicDiceSettings {
  rounds: "5" | "7" | "10";
}

export type CosmicCategory =
  | "nebula"    // three of a kind → face × 30
  | "supernova" // four of a kind → face × 60
  | "blackhole" // all same face (5 of a kind) → 500
  | "galaxy"    // all different faces (no pairs) → 150
  | "comet"     // sequence of 5 (1-5 or 2-6) → 200
  | "asteroid"  // sum of all dice
  | "cosmos";   // full house → 100

export const ALL_COSMIC_CATEGORIES: CosmicCategory[] = [
  "nebula", "supernova", "blackhole", "galaxy", "comet", "asteroid", "cosmos",
];

export interface CosmicDiceState {
  settings: CosmicDiceSettings;
  rngSeed: number;
  round: number;
  rollsUsed: number;
  dice: Die[];
  scores: Partial<Record<CosmicCategory, number>>;
}

export type CosmicDiceAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: CosmicCategory };

export function initialState(seed: number, settings: CosmicDiceSettings): CosmicDiceState {
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
    scores: {},
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function computeCosmicScore(dice: Die[], category: CosmicCategory): number {
  const c = faceCounts(dice);
  const vals = Object.entries(c) as [string, number][];
  const counts = Object.values(c);
  const sum = dice.reduce((s, d) => s + d.value, 0);
  const faces = new Set(dice.map((d) => d.value));

  switch (category) {
    case "nebula": {
      const triple = vals.find(([, n]) => n >= 3);
      return triple ? parseInt(triple[0]) * 30 : 0;
    }
    case "supernova": {
      const quad = vals.find(([, n]) => n >= 4);
      return quad ? parseInt(quad[0]) * 60 : 0;
    }
    case "blackhole":
      return counts.some((n) => n >= 5) ? 500 : 0;
    case "galaxy":
      return faces.size === 5 ? 150 : 0;
    case "comet": {
      const diceSet = new Set(dice.map((d) => d.value));
      const seq1 = [1, 2, 3, 4, 5].every((v) => diceSet.has(v as DieFace));
      const seq2 = [2, 3, 4, 5, 6].every((v) => diceSet.has(v as DieFace));
      return seq1 || seq2 ? 200 : 0;
    }
    case "asteroid":
      return sum;
    case "cosmos": {
      const has3 = counts.includes(3);
      const has2 = counts.includes(2);
      return has3 && has2 ? 100 : 0;
    }
  }
}

export function reducer(state: CosmicDiceState, action: CosmicDiceAction): CosmicDiceState {
  const maxRounds = parseInt(state.settings.rounds, 10);

  switch (action.type) {
    case "roll": {
      if (state.rollsUsed >= 3) return state;
      if (state.round > maxRounds) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice =
        state.rollsUsed === 0
          ? rollDice(5, rng)
          : rerollUnkept(state.dice, rng);
      return { ...state, rngSeed: nextSeed, rollsUsed: state.rollsUsed + 1, dice: newDice };
    }

    case "toggleKeep": {
      if (state.rollsUsed === 0 || state.rollsUsed >= 3) return state;
      return { ...state, dice: toggleKeep(state.dice, action.index) };
    }

    case "score": {
      if (state.rollsUsed === 0) return state;
      if (action.category in state.scores) return state;
      const points = computeCosmicScore(state.dice, action.category);
      const newScores = { ...state.scores, [action.category]: points };
      const resetDice: Die[] = state.dice.map((d) => ({ ...d, kept: false }));
      return {
        ...state,
        scores: newScores,
        round: state.round + 1,
        rollsUsed: 0,
        dice: resetDice,
      };
    }

    default:
      return state;
  }
}

export function totalCosmicScore(scores: Partial<Record<CosmicCategory, number>>): number {
  return ALL_COSMIC_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
}

export function isTerminal(state: CosmicDiceState): { score: number } | null {
  const maxRounds = parseInt(state.settings.rounds, 10);
  const scoredCount = ALL_COSMIC_CATEGORIES.filter((c) => c in state.scores).length;
  if (state.round > maxRounds || scoredCount >= ALL_COSMIC_CATEGORIES.length) {
    return { score: totalCosmicScore(state.scores) };
  }
  return null;
}
