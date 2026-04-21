import type { Die, DieFace } from "../../engines/dice/index.js";
import {
  rollDice,
  rerollUnkept,
  toggleKeep,
  scoreOfAKindUpper,
  faceCounts,
} from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type GeneralaCategory =
  | "ones" | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "straight" | "fullHouse" | "fourOfAKind" | "generala";

export const ALL_GENERALA_CATEGORIES: GeneralaCategory[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "straight", "fullHouse", "fourOfAKind", "generala",
];

export interface GeneralaSettings { dummy: boolean }

export interface GeneralaState {
  settings: GeneralaSettings;
  rngSeed: number;
  round: number;        // 1..10
  rollsUsed: number;    // 0..3
  dice: Die[];
  scores: Partial<Record<GeneralaCategory, number>>;
  instantWin: boolean;  // generala on first roll
}

export type GeneralaAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: GeneralaCategory };

export function initialState(seed: number, settings: GeneralaSettings): GeneralaState {
  return {
    settings,
    rngSeed: seed,
    round: 1,
    rollsUsed: 0,
    dice: Array.from({ length: 5 }, () => ({ value: 1 as DieFace, kept: false })),
    scores: {},
    instantWin: false,
  };
}

function advanceSeed(seed: number): { rng: () => number; nextSeed: number } {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), nextSeed };
}

export function computeGeneralaScore(dice: Die[], cat: GeneralaCategory, rollsUsed: number): number {
  const c = faceCounts(dice);
  const set = new Set(dice.map((d) => d.value));
  switch (cat) {
    case "ones":   return scoreOfAKindUpper(dice, 1);
    case "twos":   return scoreOfAKindUpper(dice, 2);
    case "threes": return scoreOfAKindUpper(dice, 3);
    case "fours":  return scoreOfAKindUpper(dice, 4);
    case "fives":  return scoreOfAKindUpper(dice, 5);
    case "sixes":  return scoreOfAKindUpper(dice, 6);
    case "straight":
      return [1,2,3,4,5].every((v) => set.has(v as DieFace)) ? 25 : 0;
    case "fullHouse": {
      const counts = Object.values(c).filter((n) => n > 0);
      return counts.includes(3) && counts.includes(2) ? 35 : 0;
    }
    case "fourOfAKind":
      return Object.values(c).some((n) => n >= 4) ? 45 : 0;
    case "generala":
      // First roll = instant win 60 pts
      return Object.values(c).some((n) => n >= 5) ? (rollsUsed === 1 ? 60 : 60) : 0;
  }
}

export function totalGeneralaScore(scores: Partial<Record<GeneralaCategory, number>>): number {
  return ALL_GENERALA_CATEGORIES.reduce((s, cat) => s + (scores[cat] ?? 0), 0);
}

export function reducer(state: GeneralaState, action: GeneralaAction): GeneralaState {
  if (state.instantWin) return state;

  switch (action.type) {
    case "roll": {
      if (state.rollsUsed >= 3) return state;
      const { rng, nextSeed } = advanceSeed(state.rngSeed);
      const newDice = state.rollsUsed === 0
        ? rollDice(5, rng)
        : rerollUnkept(state.dice, rng);
      const newRollsUsed = state.rollsUsed + 1;

      // Check for instant win: generala on first roll
      const c = faceCounts(newDice);
      const isGenerala = Object.values(c).some((n) => n >= 5);
      const instantWin = newRollsUsed === 1 && isGenerala;

      return {
        ...state,
        rngSeed: nextSeed,
        rollsUsed: newRollsUsed,
        dice: newDice,
        instantWin,
      };
    }
    case "toggleKeep": {
      if (state.rollsUsed === 0 || state.rollsUsed >= 3) return state;
      return { ...state, dice: toggleKeep(state.dice, action.index) };
    }
    case "score": {
      if (state.rollsUsed === 0) return state;
      if (action.category in state.scores) return state;
      const points = computeGeneralaScore(state.dice, action.category, state.rollsUsed);
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

export function isTerminal(state: GeneralaState): { score: number } | null {
  if (state.instantWin) return { score: totalGeneralaScore(state.scores) + 60 };
  if (!ALL_GENERALA_CATEGORIES.every((cat) => cat in state.scores)) return null;
  return { score: totalGeneralaScore(state.scores) };
}
