import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface RollAndWriteProSettings {
  rounds: "8" | "10" | "12";
}

// Categories to fill in
export type Category =
  | "ones" | "twos" | "threes" | "fours" | "fives" | "sixes"
  | "threeOfAKind" | "fourOfAKind" | "fullHouse" | "smallStraight" | "largeStraight" | "yahtzee" | "chance";

export interface RollAndWriteProState {
  settings: RollAndWriteProSettings;
  rngSeed: number;
  round: number;
  totalRounds: number;
  dice: number[]; // 5 dice
  kept: boolean[];
  rollsLeft: number;
  scores: Record<Category, number | null>;
  totalScore: number;
  gameOver: boolean;
}

export type RollAndWriteProAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number }
  | { type: "scoreCategory"; category: Category }
  | { type: "restart" };

const ALL_CATEGORIES: Category[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "threeOfAKind", "fourOfAKind", "fullHouse", "smallStraight", "largeStraight", "yahtzee", "chance",
];

function rollAll(kept: boolean[], prev: number[], rng: () => number): number[] {
  return prev.map((d, i) => kept[i] ? d : Math.floor(rng() * 6) + 1);
}

function counts(dice: number[]): number[] {
  const c = Array(7).fill(0);
  for (const d of dice) c[d]++;
  return c;
}

export function scoreCategory(category: Category, dice: number[]): number {
  const c = counts(dice);
  const sum = dice.reduce((a, b) => a + b, 0);
  switch (category) {
    case "ones": return c[1]! * 1;
    case "twos": return c[2]! * 2;
    case "threes": return c[3]! * 3;
    case "fours": return c[4]! * 4;
    case "fives": return c[5]! * 5;
    case "sixes": return c[6]! * 6;
    case "threeOfAKind": return c.some(x => x >= 3) ? sum : 0;
    case "fourOfAKind": return c.some(x => x >= 4) ? sum : 0;
    case "fullHouse": return (c.some(x => x === 3) && c.some(x => x === 2)) ? 25 : 0;
    case "smallStraight": {
      const s = new Set(dice);
      return ([1,2,3,4].every(x => s.has(x)) || [2,3,4,5].every(x => s.has(x)) || [3,4,5,6].every(x => s.has(x))) ? 30 : 0;
    }
    case "largeStraight": {
      const sorted = [...new Set(dice)].sort((a, b) => a - b);
      return (sorted.length === 5 && sorted[4]! - sorted[0]! === 4) ? 40 : 0;
    }
    case "yahtzee": return c.some(x => x === 5) ? 50 : 0;
    case "chance": return sum;
  }
}

export function initialState(seed: number, settings: RollAndWriteProSettings): RollAndWriteProState {
  const rng = mulberry32(seed);
  const dice = Array.from({ length: 5 }, () => Math.floor(rng() * 6) + 1);
  const emptyScores: Record<Category, number | null> = {} as Record<Category, number | null>;
  for (const c of ALL_CATEGORIES) emptyScores[c] = null;
  return {
    settings,
    rngSeed: seed,
    round: 1,
    totalRounds: parseInt(settings.rounds, 10),
    dice,
    kept: Array(5).fill(false),
    rollsLeft: 2,
    scores: emptyScores,
    totalScore: 0,
    gameOver: false,
  };
}

export function reducer(state: RollAndWriteProState, action: RollAndWriteProAction): RollAndWriteProState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "toggleKeep") {
    if (state.rollsLeft === 0) return state;
    const kept = [...state.kept];
    kept[action.index] = !kept[action.index];
    return { ...state, kept };
  }

  if (action.type === "roll") {
    if (state.rollsLeft <= 0) return state;
    const rng = mulberry32(state.rngSeed + state.round * 100 + (3 - state.rollsLeft));
    const dice = rollAll(state.kept, state.dice, rng);
    return { ...state, dice, rollsLeft: state.rollsLeft - 1 };
  }

  if (action.type === "scoreCategory") {
    const { category } = action;
    if (state.scores[category] !== null) return state;
    const pts = scoreCategory(category, state.dice);
    const scores = { ...state.scores, [category]: pts };
    const totalScore = Object.values(scores).reduce<number>((acc, v) => acc + (v ?? 0), 0);

    const round = state.round + 1;
    const gameOver = round > state.totalRounds || ALL_CATEGORIES.every(c => scores[c] !== null);

    if (gameOver) return { ...state, scores, totalScore, round: state.round, gameOver: true };

    const rng = mulberry32(state.rngSeed + round * 100);
    const dice = Array.from({ length: 5 }, () => Math.floor(rng() * 6) + 1);
    return {
      ...state,
      scores,
      totalScore,
      round,
      dice,
      kept: Array(5).fill(false),
      rollsLeft: 2,
    };
  }

  return state;
}

export function isTerminal(state: RollAndWriteProState): { score: number } | null {
  if (!state.gameOver) return null;
  // Max possible Yahtzee score ≈ 375, normalize to 100
  return { score: Math.min(100, Math.round((state.totalScore / 375) * 100)) };
}
