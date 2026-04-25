import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 5;

export type Phase = "roll" | "keep" | "score" | "done";

export interface DiceStackState {
  rngSeed: number;
  round: number;
  dice: number[];
  kept: boolean[];
  rollsLeft: number;
  scores: Record<string, number | null>;
  totalScore: number;
  phase: Phase;
  log: readonly string[];
}

export type DiceStackAction =
  | { type: "roll" }
  | { type: "toggleKeep"; idx: number }
  | { type: "scoreCategory"; category: string };

const CATEGORIES = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "threeOfKind", "fourOfKind", "fullHouse", "smallStraight", "largeStraight", "stack", "chance",
];

export function initialScores(): Record<string, number | null> {
  const s: Record<string, number | null> = {};
  for (const c of CATEGORIES) s[c] = null;
  return s;
}

function rollDie(rng: () => number): number {
  return Math.floor(rng() * 6) + 1;
}

export function calcCategory(category: string, dice: number[]): number {
  const counts: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) { counts[d] = (counts[d] ?? 0) + 1; }
  const sum = dice.reduce((a, b) => a + b, 0);

  if (category === "ones") return (counts[1] ?? 0) * 1;
  if (category === "twos") return (counts[2] ?? 0) * 2;
  if (category === "threes") return (counts[3] ?? 0) * 3;
  if (category === "fours") return (counts[4] ?? 0) * 4;
  if (category === "fives") return (counts[5] ?? 0) * 5;
  if (category === "sixes") return (counts[6] ?? 0) * 6;
  if (category === "threeOfKind") return counts.some(c => c >= 3) ? sum : 0;
  if (category === "fourOfKind") return counts.some(c => c >= 4) ? sum : 0;
  if (category === "fullHouse") return (counts.some(c => c === 3) && counts.some(c => c === 2)) ? 25 : 0;
  if (category === "smallStraight") {
    const vals = new Set(dice);
    const has = (n: number) => vals.has(n);
    return (has(1)&&has(2)&&has(3)&&has(4)) || (has(2)&&has(3)&&has(4)&&has(5)) || (has(3)&&has(4)&&has(5)&&has(6)) ? 30 : 0;
  }
  if (category === "largeStraight") {
    const sorted = [...new Set(dice)].sort();
    return (JSON.stringify(sorted) === "[1,2,3,4,5]" || JSON.stringify(sorted) === "[2,3,4,5,6]") ? 40 : 0;
  }
  if (category === "stack") return counts.some(c => c === 5) ? 50 : 0;
  if (category === "chance") return sum;
  return 0;
}

export function initialState(seed: number): DiceStackState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    round: 1,
    dice: [1, 1, 1, 1, 1],
    kept: [false, false, false, false, false],
    rollsLeft: 3,
    scores: initialScores(),
    totalScore: 0,
    phase: "roll",
    log: [],
  };
}

export function reducer(state: DiceStackState, action: DiceStackAction): DiceStackState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "roll": {
      if (state.rollsLeft <= 0 || state.phase === "score") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const newDice = state.dice.map((d, i) => state.kept[i] ? d : rollDie(rng));
      const newRolls = state.rollsLeft - 1;
      return {
        ...state,
        rngSeed: nextSeed,
        dice: newDice,
        rollsLeft: newRolls,
        phase: "keep",
        log: [...state.log, `Round ${state.round}: rolled [${newDice.join(",")}]`],
      };
    }

    case "toggleKeep": {
      if (state.phase !== "keep") return state;
      const newKept = [...state.kept];
      newKept[action.idx] = !newKept[action.idx];
      return { ...state, kept: newKept };
    }

    case "scoreCategory": {
      if (state.phase !== "keep" && state.phase !== "roll") return state;
      const cat = action.category;
      if (state.scores[cat] !== null) return state; // already scored
      const pts = calcCategory(cat, state.dice);
      const newScores = { ...state.scores, [cat]: pts };
      const newTotal = state.totalScore + pts;
      const newRound = state.round + 1;
      const allScored = Object.values(newScores).every(v => v !== null);
      const done = allScored || newRound > TOTAL_ROUNDS;
      return {
        ...state,
        scores: newScores,
        totalScore: newTotal,
        round: newRound,
        dice: [1, 1, 1, 1, 1],
        kept: [false, false, false, false, false],
        rollsLeft: 3,
        phase: done ? "done" : "roll",
        log: [...state.log, `Scored ${cat}: ${pts} pts`],
      };
    }
  }
}

export function isTerminal(state: DiceStackState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.totalScore / 300) * 100))) };
}
