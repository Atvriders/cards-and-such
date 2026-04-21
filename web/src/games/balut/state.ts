import type { Die, DieFace } from "../../engines/dice/index.js";
import {
  rollDice,
  rerollUnkept,
  toggleKeep,
  scoreOfAKindUpper,
  faceCounts,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type BalutCategory =
  | "fours" | "fives" | "sixes" | "straight" | "fullHouse" | "choice" | "balut";

export const ALL_BALUT_CATEGORIES: BalutCategory[] = [
  "fours", "fives", "sixes", "straight", "fullHouse", "choice", "balut",
];

export interface BalutSettings { dummy: boolean }

export interface BalutState {
  settings: BalutSettings;
  rngSeed: number;
  round: number;       // 1..7
  rollsUsed: number;   // 0..3
  dice: Die[];
  scores: Partial<Record<BalutCategory, number>>;
  balutBonus: boolean; // true if balut was scored
}

export type BalutAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: BalutCategory };

export function initialState(seed: number, settings: BalutSettings): BalutState {
  return {
    settings,
    rngSeed: seed,
    round: 1,
    rollsUsed: 0,
    dice: Array.from({ length: 5 }, () => ({ value: 1 as DieFace, kept: false })),
    scores: {},
    balutBonus: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function computeBalutScore(dice: Die[], cat: BalutCategory): number {
  const c = faceCounts(dice);
  const total = dice.reduce((s, d) => s + d.value, 0);
  const set = new Set(dice.map((d) => d.value));
  switch (cat) {
    case "fours":  return scoreOfAKindUpper(dice, 4);
    case "fives":  return scoreOfAKindUpper(dice, 5);
    case "sixes":  return scoreOfAKindUpper(dice, 6);
    case "straight":
      return ([1,2,3,4,5].every((v) => set.has(v as DieFace)) ||
              [2,3,4,5,6].every((v) => set.has(v as DieFace))) ? 25 : 0;
    case "fullHouse": {
      const counts = Object.values(c).filter((n) => n > 0);
      return counts.includes(3) && counts.includes(2) ? total : 0;
    }
    case "choice":
      return total;
    case "balut":
      return Object.values(c).some((n) => n >= 5) ? total : 0;
  }
}

export function totalBalutScore(
  scores: Partial<Record<BalutCategory, number>>,
  balutBonus: boolean,
): number {
  const base = ALL_BALUT_CATEGORIES.reduce((s, cat) => s + (scores[cat] ?? 0), 0);
  return base + (balutBonus ? 20 : 0);
}

export function reducer(state: BalutState, action: BalutAction): BalutState {
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
      const points = computeBalutScore(state.dice, action.category);
      const newScores = { ...state.scores, [action.category]: points };
      const newBonus = state.balutBonus || (action.category === "balut" && points > 0);
      return {
        ...state,
        scores: newScores,
        balutBonus: newBonus,
        round: state.round + 1,
        rollsUsed: 0,
        dice: state.dice.map((d) => ({ ...d, kept: false })),
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: BalutState): { score: number } | null {
  if (!ALL_BALUT_CATEGORIES.every((cat) => cat in state.scores)) return null;
  return { score: totalBalutScore(state.scores, state.balutBonus) };
}
