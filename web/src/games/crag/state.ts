import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Crag: roll 3 dice, up to 3 rolls per turn. Score in 14 categories.
// Categories: 2-12 (sum), Crag (total=13 with pair), 13 (total=13), Pairs (1-6), 3 of a kind, Three in a row, high low, etc.
// We implement a simplified scoring card with 14 slots.

export interface CragSettings {
  placeholder?: boolean;
}

export type CragCategory =
  | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "odd-straight" | "even-straight" | "low-straight" | "high-straight"
  | "three-of-a-kind" | "crag" | "thirteen" | "any-thirteen" | "chance";

export const CRAG_CATEGORIES: CragCategory[] = [
  "twos", "threes", "fours", "fives", "sixes",
  "odd-straight", "even-straight", "low-straight", "high-straight",
  "three-of-a-kind", "crag", "thirteen", "any-thirteen", "chance",
];

export const CATEGORY_LABELS: Record<CragCategory, string> = {
  "twos": "Twos",
  "threes": "Threes",
  "fours": "Fours",
  "fives": "Fives",
  "sixes": "Sixes",
  "odd-straight": "Odd Straight (1-3-5)",
  "even-straight": "Even Straight (2-4-6)",
  "low-straight": "Low Straight (1-2-3)",
  "high-straight": "High Straight (4-5-6)",
  "three-of-a-kind": "Three of a Kind",
  "crag": "Crag (pair + 13)",
  "thirteen": "Thirteen (3 diff = 13)",
  "any-thirteen": "Any Thirteen",
  "chance": "Chance (sum)",
};

export type CragPhase = "preRoll" | "rolled" | "selectCategory" | "gameDone";

export interface CragState {
  settings: CragSettings;
  rngSeed: number;
  dice: number[];
  keptMask: boolean[];
  rollsLeft: number;
  scores: Partial<Record<CragCategory, number>>;
  totalScore: number;
  turnsLeft: number;
  phase: CragPhase;
}

export type CragAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "score"; category: CragCategory };

export function scoreCategory(dice: number[], cat: CragCategory): number {
  const sorted = [...dice].sort((a, b) => a - b);
  const sum = dice.reduce((a, b) => a + b, 0);
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  const vals = new Set(dice);

  switch (cat) {
    case "twos": return dice.filter((d) => d === 2).length * 2;
    case "threes": return dice.filter((d) => d === 3).length * 3;
    case "fours": return dice.filter((d) => d === 4).length * 4;
    case "fives": return dice.filter((d) => d === 5).length * 5;
    case "sixes": return dice.filter((d) => d === 6).length * 6;
    case "odd-straight": return vals.has(1) && vals.has(3) && vals.has(5) ? 20 : 0;
    case "even-straight": return vals.has(2) && vals.has(4) && vals.has(6) ? 20 : 0;
    case "low-straight": return (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) ? 20 : 0;
    case "high-straight": return (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6) ? 20 : 0;
    case "three-of-a-kind": return Object.values(counts).some((c) => c >= 3) ? 25 : 0;
    case "crag": {
      // Crag: sum=13 AND has a pair
      const hasPair = Object.values(counts).some((c) => c >= 2);
      return sum === 13 && hasPair ? 50 : 0;
    }
    case "thirteen": {
      // Three different values summing to 13
      const allDiff = Object.values(counts).every((c) => c === 1);
      return allDiff && sum === 13 ? 26 : 0;
    }
    case "any-thirteen": return sum === 13 ? 26 : 0;
    case "chance": return sum;
    default:
      return 0;
  }
}

export function initialState(seed: number, _settings: CragSettings): CragState {
  return {
    settings: _settings,
    rngSeed: seed,
    dice: [1, 1, 1],
    keptMask: [false, false, false],
    rollsLeft: 3,
    scores: {},
    totalScore: 0,
    turnsLeft: CRAG_CATEGORIES.length,
    phase: "preRoll",
  };
}

function advanceSeed(seed: number): { rng: () => number; newSeed: number } {
  const rng = mulberry32(seed);
  const newSeed = Math.floor(rng() * 2 ** 31);
  return { rng: mulberry32(seed), newSeed };
}

export function reducer(state: CragState, action: CragAction): CragState {
  if (state.phase === "gameDone") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll" && state.phase !== "rolled") return state;
      if (state.rollsLeft <= 0) return state;

      const { rng, newSeed } = advanceSeed(state.rngSeed);
      const newDice = state.dice.map((d, i) =>
        state.keptMask[i] ? d : Math.floor(rng() * 6) + 1,
      );

      return {
        ...state,
        rngSeed: newSeed,
        dice: newDice,
        rollsLeft: state.rollsLeft - 1,
        phase: "rolled",
      };
    }

    case "toggleKeep": {
      if (state.phase !== "rolled") return state;
      const { index } = action;
      if (index < 0 || index >= 3) return state;
      const newMask = [...state.keptMask];
      newMask[index] = !newMask[index];
      return { ...state, keptMask: newMask };
    }

    case "score": {
      if (state.phase !== "rolled") return state;
      if (state.scores[action.category] !== undefined) return state;

      const points = scoreCategory(state.dice, action.category);
      const newScores = { ...state.scores, [action.category]: points };
      const newTotal = state.totalScore + points;
      const newTurnsLeft = state.turnsLeft - 1;
      const done = newTurnsLeft === 0;

      return {
        ...state,
        scores: newScores,
        totalScore: newTotal,
        turnsLeft: newTurnsLeft,
        dice: [1, 1, 1],
        keptMask: [false, false, false],
        rollsLeft: 3,
        phase: done ? "gameDone" : "preRoll",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CragState): { score: number } | null {
  if (state.phase !== "gameDone") return null;
  return { score: state.totalScore };
}
