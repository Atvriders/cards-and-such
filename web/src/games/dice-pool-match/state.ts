import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Pool Match: roll a pool of 5 dice, select which to keep.
// Goal: match a target pattern (e.g., three-of-a-kind, straight, etc.).
// 3 rolls per round, 5 rounds total.

export type TargetPattern = "threeOfAKind" | "fourOfAKind" | "fullHouse" | "straight" | "fiveOfAKind";

const PATTERNS: TargetPattern[] = [
  "threeOfAKind",
  "fullHouse",
  "fourOfAKind",
  "straight",
  "fiveOfAKind",
];

const PATTERN_LABELS: Record<TargetPattern, string> = {
  threeOfAKind: "Three of a Kind",
  fullHouse: "Full House",
  fourOfAKind: "Four of a Kind",
  straight: "Small Straight (1-5)",
  fiveOfAKind: "Five of a Kind",
};

const PATTERN_SCORES: Record<TargetPattern, number> = {
  threeOfAKind: 100,
  fullHouse: 150,
  fourOfAKind: 200,
  straight: 250,
  fiveOfAKind: 500,
};

export { PATTERN_LABELS, PATTERN_SCORES };

export interface DicePoolMatchState {
  rngSeed: number;
  dice: number[];        // 5 dice values
  kept: boolean[];       // which dice are locked
  rollsLeft: number;     // 0..3
  round: number;         // 1..5
  target: TargetPattern;
  roundScore: number;
  totalScore: number;
  gameOver: boolean;
}

export type DicePoolMatchAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: number };

function rollDice(rng: () => number, kept: boolean[], dice: number[]): number[] {
  return dice.map((v, i) => (kept[i] ? v : Math.floor(rng() * 6) + 1));
}

function checkPattern(dice: number[], pattern: TargetPattern): boolean {
  const sorted = [...dice].sort((a, b) => a - b);
  const counts = new Map<number, number>();
  for (const d of sorted) counts.set(d, (counts.get(d) ?? 0) + 1);
  const vals = [...counts.values()].sort((a, b) => b - a);
  switch (pattern) {
    case "threeOfAKind": return vals[0]! >= 3;
    case "fullHouse": return vals[0]! === 3 && vals[1] === 2;
    case "fourOfAKind": return vals[0]! >= 4;
    case "straight": return sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3 && sorted[3] === 4 && sorted[4] === 5;
    case "fiveOfAKind": return vals[0]! === 5;
  }
}

export function initialState(seed: number): DicePoolMatchState {
  const rng = mulberry32(seed);
  const dice = Array.from({ length: 5 }, () => Math.floor(rng() * 6) + 1);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    dice,
    kept: [false, false, false, false, false],
    rollsLeft: 2,
    round: 1,
    target: PATTERNS[0]!,
    roundScore: 0,
    totalScore: 0,
    gameOver: false,
  };
}

export function reducer(state: DicePoolMatchState, action: DicePoolMatchAction): DicePoolMatchState {
  if (state.gameOver) return state;

  if (action.type === "toggleKeep") {
    if (state.rollsLeft === 0) return state;
    const kept = [...state.kept];
    kept[action.index] = !kept[action.index];
    return { ...state, kept };
  }

  if (action.type === "roll") {
    if (state.rollsLeft === 0) return state;
    const rng = mulberry32(state.rngSeed);
    const dice = rollDice(rng, state.kept, state.dice);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rollsLeft = state.rollsLeft - 1;

    if (rollsLeft === 0) {
      // Score this round
      const hit = checkPattern(dice, state.target);
      const roundScore = hit ? PATTERN_SCORES[state.target] : 0;
      const totalScore = state.totalScore + roundScore;
      const nextRound = state.round + 1;
      const gameOver = nextRound > 5;
      const nextPattern = gameOver ? state.target : (PATTERNS[nextRound - 1] ?? state.target);
      return {
        ...state,
        rngSeed: nextSeed,
        dice,
        kept: [false, false, false, false, false],
        rollsLeft: gameOver ? 0 : 2,
        round: nextRound,
        target: nextPattern,
        roundScore,
        totalScore,
        gameOver,
      };
    }

    return { ...state, rngSeed: nextSeed, dice, rollsLeft };
  }

  return state;
}

export function isTerminal(state: DicePoolMatchState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.totalScore };
}
