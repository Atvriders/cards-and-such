import type { Die, DieFace } from "../../engines/dice/index.js";
import {
  rollDice,
  rerollUnkept,
  toggleKeep,
  scoreOfAKindUpper,
  faceCounts,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// In Kismet: 2, 4, 6 = even (red); 1, 3, 5 = odd (black)
export function isEven(face: DieFace): boolean {
  return face % 2 === 0;
}

export function isFlush(dice: Die[]): boolean {
  const allEven = dice.every((d) => isEven(d.value));
  const allOdd = dice.every((d) => !isEven(d.value));
  return allEven || allOdd;
}

export type Category =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "twoPair"
  | "threeOfAKind"
  | "flush"
  | "fullHouse"
  | "fourOfAKind"
  | "kismet"; // all 5 same color (flush of 5 same face = kismet)

export const ALL_CATEGORIES: Category[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "twoPair", "threeOfAKind", "flush", "fullHouse", "fourOfAKind", "kismet",
];

export const UPPER_CATEGORIES: Category[] = ["ones", "twos", "threes", "fours", "fives", "sixes"];

export interface KismetSettings {
  flushBonus: boolean;
}

export interface KismetState {
  settings: KismetSettings;
  rngSeed: number;
  round: number;
  rollsUsed: number;
  dice: Die[];
  scores: Partial<Record<Category, number>>;
}

export type KismetAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: Category };

export function initialState(seed: number, settings: KismetSettings): KismetState {
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

export function computeCategoryScore(dice: Die[], category: Category): number {
  const counts = faceCounts(dice);
  const countVals = Object.values(counts);
  const diceSum = dice.reduce((s, d) => s + d.value, 0);
  switch (category) {
    case "ones":   return scoreOfAKindUpper(dice, 1);
    case "twos":   return scoreOfAKindUpper(dice, 2);
    case "threes": return scoreOfAKindUpper(dice, 3);
    case "fours":  return scoreOfAKindUpper(dice, 4);
    case "fives":  return scoreOfAKindUpper(dice, 5);
    case "sixes":  return scoreOfAKindUpper(dice, 6);
    case "twoPair": {
      // Two different pairs
      const pairs = (Object.entries(counts) as [string, number][]).filter(([, c]) => c >= 2);
      return pairs.length >= 2 ? 25 : 0;
    }
    case "threeOfAKind":
      return countVals.some((c) => c >= 3) ? diceSum : 0;
    case "flush":
      return isFlush(dice) ? 35 : 0;
    case "fullHouse":
      return countVals.includes(3) && countVals.includes(2) ? diceSum + 15 : 0;
    case "fourOfAKind":
      return countVals.some((c) => c >= 4) ? diceSum + 25 : 0;
    case "kismet":
      // Kismet: all 5 same face (= 5-of-a-kind), must also be same color (trivially true)
      return countVals.some((c) => c >= 5) ? diceSum + 50 : 0;
  }
}

export function reducer(state: KismetState, action: KismetAction): KismetState {
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
      const points = computeCategoryScore(state.dice, action.category);
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

export function upperSectionSum(scores: Partial<Record<Category, number>>): number {
  return UPPER_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
}

export function totalScore(scores: Partial<Record<Category, number>>): number {
  const base = ALL_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
  const upper = upperSectionSum(scores);
  return base + (upper >= 63 ? 35 : 0);
}

export function isTerminal(state: KismetState): { score: number } | null {
  if (!ALL_CATEGORIES.every((cat) => cat in state.scores)) return null;
  return { score: totalScore(state.scores) };
}
