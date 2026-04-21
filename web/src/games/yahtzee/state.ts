import type { Die, DieFace } from "../../engines/dice/index.js";
import {
  rollDice,
  rerollUnkept,
  toggleKeep,
  scoreOfAKindUpper,
  scoreNOfAKind,
  scoreFullHouse,
  scoreSmallStraight,
  scoreLargeStraight,
  scoreYahtzee,
  scoreChance,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type Category =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "threeOfAKind"
  | "fourOfAKind"
  | "fullHouse"
  | "smallStraight"
  | "largeStraight"
  | "yahtzee"
  | "chance";

export const ALL_CATEGORIES: Category[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "threeOfAKind", "fourOfAKind", "fullHouse", "smallStraight", "largeStraight",
  "yahtzee", "chance",
];

export const UPPER_CATEGORIES: Category[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
];

export interface YahtzeeSettings {
  strictYahtzeeBonus: boolean;
}

export interface YahtzeeState {
  settings: YahtzeeSettings;
  rngSeed: number;
  round: number;        // 1..13
  rollsUsed: number;    // 0..3
  dice: Die[];          // 5 dice
  scores: Partial<Record<Category, number>>;
}

export type YahtzeeAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: Category };

export function initialState(seed: number, settings: YahtzeeSettings): YahtzeeState {
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
  // Consume one value to generate the nextSeed
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function computeCategoryScore(dice: Die[], category: Category): number {
  switch (category) {
    case "ones":   return scoreOfAKindUpper(dice, 1);
    case "twos":   return scoreOfAKindUpper(dice, 2);
    case "threes": return scoreOfAKindUpper(dice, 3);
    case "fours":  return scoreOfAKindUpper(dice, 4);
    case "fives":  return scoreOfAKindUpper(dice, 5);
    case "sixes":  return scoreOfAKindUpper(dice, 6);
    case "threeOfAKind":  return scoreNOfAKind(dice, 3);
    case "fourOfAKind":   return scoreNOfAKind(dice, 4);
    case "fullHouse":     return scoreFullHouse(dice);
    case "smallStraight": return scoreSmallStraight(dice);
    case "largeStraight": return scoreLargeStraight(dice);
    case "yahtzee":       return scoreYahtzee(dice);
    case "chance":        return scoreChance(dice);
  }
}

export function reducer(state: YahtzeeState, action: YahtzeeAction): YahtzeeState {
  switch (action.type) {
    case "roll": {
      if (state.rollsUsed >= 3) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      let newDice: Die[];
      if (state.rollsUsed === 0) {
        newDice = rollDice(5, rng);
      } else {
        newDice = rerollUnkept(state.dice, rng);
      }
      return { ...state, rngSeed: nextSeed, rollsUsed: state.rollsUsed + 1, dice: newDice };
    }

    case "toggleKeep": {
      if (state.rollsUsed === 0 || state.rollsUsed >= 3) return state;
      return { ...state, dice: toggleKeep(state.dice, action.index) };
    }

    case "score": {
      // Must have rolled at least once
      if (state.rollsUsed === 0) return state;
      // Category already used
      if (action.category in state.scores) {
        // Yahtzee bonus check: if strictYahtzeeBonus is true and this is a yahtzee roll
        // but the yahtzee category is already used, still allow scoring into another category
        return state;
      }

      let points = computeCategoryScore(state.dice, action.category);

      // Strict Yahtzee bonus: if current dice show yahtzee (all 5 same face)
      // and yahtzee category was already scored (and scored > 0), add 100 bonus
      if (state.settings.strictYahtzeeBonus && action.category !== "yahtzee") {
        const alreadyScoredYahtzee = "yahtzee" in state.scores && (state.scores["yahtzee"] ?? 0) > 0;
        if (alreadyScoredYahtzee && scoreYahtzee(state.dice) === 50) {
          points += 100;
        }
      }

      const newScores = { ...state.scores, [action.category]: points };

      // Reset for next round
      const nextRound = state.round + 1;
      const resetDice: Die[] = state.dice.map((d) => ({ ...d, kept: false }));

      return {
        ...state,
        scores: newScores,
        round: nextRound,
        rollsUsed: 0,
        dice: resetDice,
      };
    }

    default:
      return state;
  }
}

export function upperSectionSum(scores: Partial<Record<Category, number>>): number {
  return UPPER_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
}

export function totalScore(scores: Partial<Record<Category, number>>): number {
  const base = ALL_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
  const upper = upperSectionSum(scores);
  const bonus = upper >= 63 ? 35 : 0;
  return base + bonus;
}

export function isTerminal(state: YahtzeeState): { score: number } | null {
  const allScored = ALL_CATEGORIES.every((cat) => cat in state.scores);
  if (!allScored) return null;
  return { score: totalScore(state.scores) };
}
