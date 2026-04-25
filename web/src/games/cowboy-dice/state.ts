import type { Die } from "../../engines/dice/index.js";
import { rollDice, rerollUnkept, toggleKeep, faceCounts } from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Cowboy Dice: Wild West scorecard game with 5 dice and 10 categories.
// Goal: fill scorecard in 10 rounds. Score as high as possible.

export interface CowboyDiceSettings {
  bonusThreshold: "63" | "70";
}

export type CowboyCategory =
  | "bullets"     // sum of 1s (bullets)
  | "horseshoes"  // sum of 2s
  | "cactus"      // sum of 3s
  | "spurs"       // sum of 4s
  | "lasso"       // sum of 5s
  | "sheriff"     // sum of 6s (sheriff badges)
  | "posse"       // three of a kind → sum all
  | "outlaw"      // four of a kind → sum all
  | "showdown"    // full house (3+2) → 25
  | "rodeo"       // five of a kind → 80
  | "roundup"     // straight (1-5 or 2-6) → 50
  | "frontier";   // chance: sum all

export const ALL_COWBOY_CATEGORIES: CowboyCategory[] = [
  "bullets", "horseshoes", "cactus", "spurs", "lasso", "sheriff",
  "posse", "outlaw", "showdown", "rodeo", "roundup", "frontier",
];

export const UPPER_COWBOY: CowboyCategory[] = [
  "bullets", "horseshoes", "cactus", "spurs", "lasso", "sheriff",
];

export interface CowboyDiceState {
  settings: CowboyDiceSettings;
  rngSeed: number;
  round: number;
  rollsUsed: number;
  dice: Die[];
  scores: Partial<Record<CowboyCategory, number>>;
}

export type CowboyDiceAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: CowboyCategory };

export function initialState(seed: number, settings: CowboyDiceSettings): CowboyDiceState {
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

export function computeCowboyScore(dice: Die[], category: CowboyCategory): number {
  const c = faceCounts(dice);
  const vals = Object.entries(c) as [string, number][];
  const sum = dice.reduce((s, d) => s + d.value, 0);
  const counts = Object.values(c);

  switch (category) {
    case "bullets":    return c[1] * 1;
    case "horseshoes": return c[2] * 2;
    case "cactus":     return c[3] * 3;
    case "spurs":      return c[4] * 4;
    case "lasso":      return c[5] * 5;
    case "sheriff":    return c[6] * 6;
    case "posse":
      return counts.some((n) => n >= 3) ? sum : 0;
    case "outlaw":
      return counts.some((n) => n >= 4) ? sum : 0;
    case "showdown": {
      const has3 = counts.includes(3);
      const has2 = counts.includes(2);
      return has3 && has2 ? 25 : 0;
    }
    case "rodeo":
      return counts.some((n) => n >= 5) ? 80 : 0;
    case "roundup": {
      const diceSet = new Set(dice.map((d) => d.value));
      const s1 = [1, 2, 3, 4, 5].every((v) => diceSet.has(v as 1|2|3|4|5|6));
      const s2 = [2, 3, 4, 5, 6].every((v) => diceSet.has(v as 1|2|3|4|5|6));
      return s1 || s2 ? 50 : 0;
    }
    case "frontier":
      return sum;
    default:
      return 0;
  }
}

export function upperSection(scores: Partial<Record<CowboyCategory, number>>): number {
  return UPPER_COWBOY.reduce((s, c) => s + (scores[c] ?? 0), 0);
}

export function totalCowboyScore(scores: Partial<Record<CowboyCategory, number>>, bonusThreshold: number): number {
  const base = ALL_COWBOY_CATEGORIES.reduce((s, c) => s + (scores[c] ?? 0), 0);
  const upper = upperSection(scores);
  return base + (upper >= bonusThreshold ? 35 : 0);
}

export function reducer(state: CowboyDiceState, action: CowboyDiceAction): CowboyDiceState {
  switch (action.type) {
    case "roll": {
      if (state.rollsUsed >= 3) return state;
      if (state.round > ALL_COWBOY_CATEGORIES.length) return state;
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
      const points = computeCowboyScore(state.dice, action.category);
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

export function isTerminal(state: CowboyDiceState): { score: number } | null {
  const allScored = ALL_COWBOY_CATEGORIES.every((c) => c in state.scores);
  if (!allScored) return null;
  const threshold = parseInt(state.settings.bonusThreshold, 10);
  return { score: totalCowboyScore(state.scores, threshold) };
}
