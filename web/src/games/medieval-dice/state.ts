import type { Die } from "../../engines/dice/index.js";
import { rollDice, rerollUnkept, toggleKeep, faceCounts } from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Medieval Dice: 8-round scoring game with 4 dice and castle-themed categories.

export interface MedievalDiceSettings {
  rounds: "6" | "8" | "10";
}

export type MedievalCategory =
  | "peasants"    // sum of 1s and 2s
  | "knights"     // sum of 3s and 4s
  | "siege"       // four of a kind → 60
  | "catapult"    // three of a kind → face × 15
  | "moat"        // all even → 50
  | "tower"       // all odd → 50
  | "castle"      // two pairs → sum of paired dice
  | "rampage";    // sum of all dice

export const ALL_MEDIEVAL_CATEGORIES: MedievalCategory[] = [
  "peasants", "knights", "siege", "catapult", "moat", "tower", "castle", "rampage",
];

export interface MedievalDiceState {
  settings: MedievalDiceSettings;
  rngSeed: number;
  round: number;
  rollsUsed: number;
  dice: Die[];
  scores: Partial<Record<MedievalCategory, number>>;
}

export type MedievalDiceAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: MedievalCategory };

export function initialState(seed: number, settings: MedievalDiceSettings): MedievalDiceState {
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
    ],
    scores: {},
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function computeMedievalScore(dice: Die[], category: MedievalCategory): number {
  const c = faceCounts(dice);
  const vals = Object.entries(c) as [string, number][];
  const sum = dice.reduce((s, d) => s + d.value, 0);

  switch (category) {
    case "peasants":
      return dice.filter((d) => d.value <= 2).reduce((s, d) => s + d.value, 0);
    case "knights":
      return dice.filter((d) => d.value === 3 || d.value === 4).reduce((s, d) => s + d.value, 0);
    case "siege": {
      const quad = vals.find(([, n]) => n >= 4);
      return quad ? 60 : 0;
    }
    case "catapult": {
      const triple = vals.find(([, n]) => n >= 3);
      return triple ? parseInt(triple[0]) * 15 : 0;
    }
    case "moat":
      return dice.every((d) => d.value % 2 === 0) ? 50 : 0;
    case "tower":
      return dice.every((d) => d.value % 2 === 1) ? 50 : 0;
    case "castle": {
      const counts = Object.values(c);
      const pairs = counts.filter((n) => n >= 2);
      if (pairs.length >= 2) {
        // sum the two pairs (take the two faces with highest count pair values)
        const pairFaces = vals.filter(([, n]) => n >= 2).map(([f]) => parseInt(f));
        return pairFaces.slice(0, 2).reduce((s, f) => s + f * 2, 0);
      }
      return 0;
    }
    case "rampage":
      return sum;
  }
}

export function reducer(state: MedievalDiceState, action: MedievalDiceAction): MedievalDiceState {
  const maxRounds = parseInt(state.settings.rounds, 10);

  switch (action.type) {
    case "roll": {
      if (state.rollsUsed >= 3) return state;
      if (state.round > maxRounds) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice =
        state.rollsUsed === 0
          ? rollDice(4, rng)
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
      const points = computeMedievalScore(state.dice, action.category);
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

export function totalMedievalScore(scores: Partial<Record<MedievalCategory, number>>): number {
  return ALL_MEDIEVAL_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
}

export function isTerminal(state: MedievalDiceState): { score: number } | null {
  const maxRounds = parseInt(state.settings.rounds, 10);
  const scored = ALL_MEDIEVAL_CATEGORIES.filter((c) => c in state.scores).length;
  if (state.round > maxRounds || scored >= ALL_MEDIEVAL_CATEGORIES.length) {
    return { score: totalMedievalScore(state.scores) };
  }
  return null;
}
