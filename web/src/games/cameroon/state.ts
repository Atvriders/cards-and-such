import type { Die } from "../../engines/dice/index.js";
import {
  rollDice,
  rerollUnkept,
  toggleKeep,
  scoreOfAKindUpper,
  faceCounts,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Category =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "littleStraight"
  | "bigStraight"
  | "fullHouse"
  | "poker";

export const ALL_CATEGORIES: Category[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "littleStraight", "bigStraight", "fullHouse", "poker",
];

// Cameroon (5 of a kind) is a bonus, not a category — scored when a poker category is filled with 5-of-a-kind
export interface CameroonSettings {
  cameroonBonus: boolean;
}

export interface CameroonState {
  settings: CameroonSettings;
  rngSeed: number;
  round: number;
  rollsUsed: number;
  dice: Die[];
  scores: Partial<Record<Category, number>>;
  cameroonCount: number; // bonus 5-of-a-kind count
}

export type CameroonAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: Category };

export function initialState(seed: number, settings: CameroonSettings): CameroonState {
  return {
    settings,
    rngSeed: seed,
    round: 1,
    rollsUsed: 0,
    dice: Array.from({ length: 5 }, () => ({ value: 1 as const, kept: false })),
    scores: {},
    cameroonCount: 0,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function computeCategoryScore(dice: Die[], category: Category): number {
  const counts = faceCounts(dice);
  const vals = Object.values(counts);
  switch (category) {
    case "ones":   return scoreOfAKindUpper(dice, 1);
    case "twos":   return scoreOfAKindUpper(dice, 2);
    case "threes": return scoreOfAKindUpper(dice, 3);
    case "fours":  return scoreOfAKindUpper(dice, 4);
    case "fives":  return scoreOfAKindUpper(dice, 5);
    case "sixes":  return scoreOfAKindUpper(dice, 6);
    case "littleStraight": {
      const set = new Set(dice.map((d) => d.value));
      return [1,2,3,4,5].every((v) => set.has(v as never)) ? 15 : 0;
    }
    case "bigStraight": {
      const set = new Set(dice.map((d) => d.value));
      return [2,3,4,5,6].every((v) => set.has(v as never)) ? 20 : 0;
    }
    case "fullHouse":
      return vals.includes(3) && vals.includes(2) ? 30 : 0;
    case "poker":
      return vals.some((c) => c >= 4) ? 40 : 0;
  }
}

export function isCameroon(dice: Die[]): boolean {
  return Object.values(faceCounts(dice)).some((c) => c >= 5);
}

export function reducer(state: CameroonState, action: CameroonAction): CameroonState {
  switch (action.type) {
    case "roll": {
      if (state.rollsUsed >= 3) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice = state.rollsUsed === 0
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

      let points = computeCategoryScore(state.dice, action.category);
      let cameroonCount = state.cameroonCount;

      // Cameroon bonus: 5-of-a-kind while scoring (50 bonus if enabled)
      if (state.settings.cameroonBonus && isCameroon(state.dice)) {
        cameroonCount += 1;
        points += 50;
      }

      const newScores = { ...state.scores, [action.category]: points };
      return {
        ...state,
        scores: newScores,
        cameroonCount,
        round: state.round + 1,
        rollsUsed: 0,
        dice: state.dice.map((d) => ({ ...d, kept: false })),
      };
    }

    default:
      return state;
  }
}

export function totalScore(scores: Partial<Record<Category, number>>): number {
  return ALL_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
}

export function isTerminal(state: CameroonState): { score: number } | null {
  if (!ALL_CATEGORIES.every((cat) => cat in state.scores)) return null;
  return { score: totalScore(state.scores) };
}
