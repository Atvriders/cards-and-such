import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceFlushRollSettings { rounds: "5" | "10" | "15"; }
export interface DiceFlushRollState {
  settings: DiceFlushRollSettings;
  rng: () => number;
  dice: number[];  // 5 dice
  kept: boolean[];
  rollsLeft: number;
  score: number;
  round: number;
  totalRounds: number;
  phase: "rolling" | "scored" | "gameover";
}
export type DiceFlushRollAction =
  | { type: "toggleKeep"; index: number }
  | { type: "reroll" }
  | { type: "score" };

function rollDice(rng: () => number, count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(rng() * 6) + 1);
}

export function scoreFlush(dice: number[]): number {
  const counts = new Map<number, number>();
  for (const d of dice) counts.set(d, (counts.get(d) ?? 0) + 1);
  const max = Math.max(...counts.values());
  if (max === 5) return 50;
  if (max === 4) return 30;
  if (max === 3) return 15;
  if (max === 2) return 5;
  return 0;
}

export function initialState(seed: number, settings: DiceFlushRollSettings): DiceFlushRollState {
  const rng = mulberry32(seed);
  return { settings, rng, dice: rollDice(rng, 5), kept: [false, false, false, false, false], rollsLeft: 2, score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), phase: "rolling" };
}

export function reducer(state: DiceFlushRollState, action: DiceFlushRollAction): DiceFlushRollState {
  if (state.phase === "gameover") return state;
  switch (action.type) {
    case "toggleKeep": {
      if (state.phase !== "rolling" || state.rollsLeft === 0) return state;
      const kept = [...state.kept];
      kept[action.index] = !kept[action.index];
      return { ...state, kept };
    }
    case "reroll": {
      if (state.rollsLeft === 0) return state;
      const rng = state.rng;
      const dice = state.dice.map((d, i) => state.kept[i] ? d : (Math.floor(rng() * 6) + 1));
      const rollsLeft = state.rollsLeft - 1;
      return { ...state, rng, dice, rollsLeft };
    }
    case "score": {
      const pts = scoreFlush(state.dice);
      const newScore = state.score + pts;
      const nextRound = state.round + 1;
      const rng = state.rng;
      if (nextRound > state.totalRounds) return { ...state, score: newScore, phase: "gameover" };
      return { ...state, rng, dice: rollDice(rng, 5), kept: [false,false,false,false,false], rollsLeft: 2, score: newScore, round: nextRound, phase: "rolling" };
    }
    default: return state;
  }
}

export function isTerminal(state: DiceFlushRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
