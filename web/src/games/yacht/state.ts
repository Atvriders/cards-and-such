import type { Die, DieFace } from "../../engines/dice/index.js";
import {
  rollDice,
  rerollUnkept,
  toggleKeep,
  scoreOfAKindUpper,
  faceCounts,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type YachtCategory =
  | "ones" | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "littleStraight" | "bigStraight" | "fourOfAKind" | "fullHouse" | "choice" | "yacht";

export const ALL_YACHT_CATEGORIES: YachtCategory[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "littleStraight", "bigStraight", "fourOfAKind", "fullHouse", "choice", "yacht",
];

export interface YachtSettings { dummy: boolean }

export interface YachtState {
  settings: YachtSettings;
  rngSeed: number;
  round: number;       // 1..12
  rollsUsed: number;   // 0..3
  dice: Die[];
  scores: Partial<Record<YachtCategory, number>>;
}

export type YachtAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: YachtCategory };

export function initialState(seed: number, settings: YachtSettings): YachtState {
  return {
    settings,
    rngSeed: seed,
    round: 1,
    rollsUsed: 0,
    dice: Array.from({ length: 5 }, () => ({ value: 1 as DieFace, kept: false })),
    scores: {},
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function computeYachtScore(dice: Die[], cat: YachtCategory): number {
  const c = faceCounts(dice);
  const total = dice.reduce((s, d) => s + d.value, 0);
  const vals = dice.map((d) => d.value);
  const set = new Set(vals);
  switch (cat) {
    case "ones":   return scoreOfAKindUpper(dice, 1);
    case "twos":   return scoreOfAKindUpper(dice, 2);
    case "threes": return scoreOfAKindUpper(dice, 3);
    case "fours":  return scoreOfAKindUpper(dice, 4);
    case "fives":  return scoreOfAKindUpper(dice, 5);
    case "sixes":  return scoreOfAKindUpper(dice, 6);
    case "littleStraight":
      return [1,2,3,4,5].every((v) => set.has(v as DieFace)) ? 30 : 0;
    case "bigStraight":
      return [2,3,4,5,6].every((v) => set.has(v as DieFace)) ? 30 : 0;
    case "fourOfAKind":
      return Object.values(c).some((n) => n >= 4) ? total : 0;
    case "fullHouse": {
      const counts = Object.values(c).filter((n) => n > 0);
      return counts.includes(3) && counts.includes(2) ? total : 0;
    }
    case "choice":
      return total;
    case "yacht":
      return Object.values(c).some((n) => n >= 5) ? 50 : 0;
  }
}

export function totalYachtScore(scores: Partial<Record<YachtCategory, number>>): number {
  return ALL_YACHT_CATEGORIES.reduce((s, cat) => s + (scores[cat] ?? 0), 0);
}

export function reducer(state: YachtState, action: YachtAction): YachtState {
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
      const points = computeYachtScore(state.dice, action.category);
      const newScores = { ...state.scores, [action.category]: points };
      return {
        ...state,
        scores: newScores,
        round: state.round + 1,
        rollsUsed: 0,
        dice: state.dice.map((d) => ({ ...d, kept: false })),
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: YachtState): { score: number } | null {
  if (!ALL_YACHT_CATEGORIES.every((cat) => cat in state.scores)) return null;
  return { score: totalYachtScore(state.scores) };
}
