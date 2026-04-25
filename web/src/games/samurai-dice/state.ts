import type { Die } from "../../engines/dice/index.js";
import { rollDice, rerollUnkept, toggleKeep, faceCounts } from "../../engines/dice/index.js";
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Samurai Dice: 8-round honor scoring game. 5 dice, bushido-themed categories.

export interface SamuraiDiceSettings {
  rounds: "6" | "8" | "10";
}

export type SamuraiCategory =
  | "honor"       // sum of highest single face ×3
  | "bushido"     // five of a kind → 100
  | "katana"      // large straight (1-5 or 2-6) → 70
  | "wakizashi"   // small straight (four consecutive) → 40
  | "dojo"        // four of a kind → face × 20
  | "clan"        // three of a kind → face × 10
  | "seppuku"     // full house → 35
  | "ronin";      // sum of all dice (chance)

export const ALL_SAMURAI_CATEGORIES: SamuraiCategory[] = [
  "honor", "bushido", "katana", "wakizashi", "dojo", "clan", "seppuku", "ronin",
];

export interface SamuraiDiceState {
  settings: SamuraiDiceSettings;
  rngSeed: number;
  round: number;
  rollsUsed: number;
  dice: Die[];
  scores: Partial<Record<SamuraiCategory, number>>;
}

export type SamuraiDiceAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: SamuraiCategory };

export function initialState(seed: number, settings: SamuraiDiceSettings): SamuraiDiceState {
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

export function computeSamuraiScore(dice: Die[], category: SamuraiCategory): number {
  const c = faceCounts(dice);
  const vals = Object.entries(c) as [string, number][];
  const counts = Object.values(c);
  const sum = dice.reduce((s, d) => s + d.value, 0);
  const faces = new Set(dice.map((d) => d.value));

  switch (category) {
    case "honor": {
      // Highest face that appears most; if tie pick higher face
      let bestFace = 0;
      let bestCount = 0;
      for (const [f, n] of vals) {
        const fv = parseInt(f);
        if (n > bestCount || (n === bestCount && fv > bestFace)) {
          bestFace = fv;
          bestCount = n;
        }
      }
      return bestFace * 3;
    }
    case "bushido":
      return counts.some((n) => n >= 5) ? 100 : 0;
    case "katana": {
      const s1 = [1, 2, 3, 4, 5].every((v) => faces.has(v as 1|2|3|4|5|6));
      const s2 = [2, 3, 4, 5, 6].every((v) => faces.has(v as 1|2|3|4|5|6));
      return s1 || s2 ? 70 : 0;
    }
    case "wakizashi": {
      const runs = [[1,2,3,4],[2,3,4,5],[3,4,5,6]];
      return runs.some((r) => r.every((v) => faces.has(v as 1|2|3|4|5|6))) ? 40 : 0;
    }
    case "dojo": {
      const quad = vals.find(([, n]) => n >= 4);
      return quad ? parseInt(quad[0]) * 20 : 0;
    }
    case "clan": {
      const triple = vals.find(([, n]) => n >= 3);
      return triple ? parseInt(triple[0]) * 10 : 0;
    }
    case "seppuku": {
      const has3 = counts.includes(3);
      const has2 = counts.includes(2);
      return has3 && has2 ? 35 : 0;
    }
    case "ronin":
      return sum;
  }
}

export function totalSamuraiScore(scores: Partial<Record<SamuraiCategory, number>>): number {
  return ALL_SAMURAI_CATEGORIES.reduce((s, c) => s + (scores[c] ?? 0), 0);
}

export function reducer(state: SamuraiDiceState, action: SamuraiDiceAction): SamuraiDiceState {
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
      const points = computeSamuraiScore(state.dice, action.category);
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

export function isTerminal(state: SamuraiDiceState): { score: number } | null {
  const maxRounds = parseInt(state.settings.rounds, 10);
  const scored = ALL_SAMURAI_CATEGORIES.filter((c) => c in state.scores).length;
  if (state.round > maxRounds || scored >= ALL_SAMURAI_CATEGORIES.length) {
    return { score: totalSamuraiScore(state.scores) };
  }
  return null;
}
