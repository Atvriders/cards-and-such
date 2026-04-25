import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TripleDiceSettings {
  rounds: "5" | "7" | "10";
}

export interface TripleDiceState {
  settings: TripleDiceSettings;
  rngSeed: number;
  round: number;
  totalRounds: number;
  dice: [number, number, number];
  kept: [boolean, boolean, boolean];
  rollsLeft: number;
  roundScore: number;
  totalScore: number;
  roundOver: boolean;
  gameOver: boolean;
}

export type TripleDiceAction =
  | { type: "roll" }
  | { type: "toggleKeep"; index: 0 | 1 | 2 }
  | { type: "score" }
  | { type: "restart" };

function rollDice(kept: [boolean, boolean, boolean], prev: [number, number, number], rng: () => number): [number, number, number] {
  return [
    kept[0] ? prev[0] : Math.floor(rng() * 6) + 1,
    kept[1] ? prev[1] : Math.floor(rng() * 6) + 1,
    kept[2] ? prev[2] : Math.floor(rng() * 6) + 1,
  ] as [number, number, number];
}

function calcScore(dice: [number, number, number]): number {
  const [a, b, c] = dice;
  const sum = a + b + c;
  // Triple: all same → triple value × 10
  if (a === b && b === c) return a * 10;
  // Pair: two same → pair value × 3 + other
  if (a === b) return a * 3 + c;
  if (a === c) return a * 3 + b;
  if (b === c) return b * 3 + a;
  // Straight (1-2-3 or 4-5-6) → 25
  const sorted = [a, b, c].sort((x, y) => x - y);
  if ((sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) ||
      (sorted[0] === 4 && sorted[1] === 5 && sorted[2] === 6)) return 25;
  return sum;
}

export function initialState(seed: number, settings: TripleDiceSettings): TripleDiceState {
  const rng = mulberry32(seed);
  const dice = rollDice([false, false, false], [1, 1, 1], rng);
  return {
    settings,
    rngSeed: seed,
    round: 1,
    totalRounds: parseInt(settings.rounds, 10),
    dice,
    kept: [false, false, false],
    rollsLeft: 2,
    roundScore: 0,
    totalScore: 0,
    roundOver: false,
    gameOver: false,
  };
}

export function reducer(state: TripleDiceState, action: TripleDiceAction): TripleDiceState {
  if (action.type === "restart") {
    return initialState(state.rngSeed + 1, state.settings);
  }

  if (state.gameOver) return state;

  if (action.type === "toggleKeep") {
    if (state.roundOver || state.rollsLeft === 0) return state;
    const kept = [...state.kept] as [boolean, boolean, boolean];
    kept[action.index] = !kept[action.index];
    return { ...state, kept };
  }

  if (action.type === "roll") {
    if (state.rollsLeft <= 0 || state.roundOver) return state;
    const rng = mulberry32(state.rngSeed + state.round * 10 + (3 - state.rollsLeft));
    const dice = rollDice(state.kept, state.dice, rng);
    const rollsLeft = state.rollsLeft - 1;
    const roundOver = rollsLeft === 0;
    const roundScore = roundOver ? calcScore(dice) : 0;
    return {
      ...state,
      dice,
      rollsLeft,
      roundOver,
      roundScore,
    };
  }

  if (action.type === "score") {
    if (!state.roundOver) return state;
    const roundScore = calcScore(state.dice);
    const totalScore = state.totalScore + roundScore;
    const round = state.round + 1;
    const gameOver = round > state.totalRounds;
    if (gameOver) {
      return { ...state, totalScore, roundScore, gameOver };
    }
    const rng = mulberry32(state.rngSeed + round * 10);
    const dice = rollDice([false, false, false], [1, 1, 1], rng);
    return {
      ...state,
      round,
      dice,
      kept: [false, false, false],
      rollsLeft: 2,
      roundScore: 0,
      totalScore,
      roundOver: false,
    };
  }

  return state;
}

export function isTerminal(state: TripleDiceState): { score: number } | null {
  if (!state.gameOver) return null;
  // Normalize score: max theoretical ~300 per round (triple 6 = 60, 10 rounds)
  const maxScore = state.totalRounds * 60;
  return { score: Math.min(100, Math.round((state.totalScore / maxScore) * 100)) };
}
