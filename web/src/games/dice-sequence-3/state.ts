import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceSequence3Settings { rounds: "5" | "10" | "15"; }
export interface DiceSequence3State {
  settings: DiceSequence3Settings;
  rng: () => number;
  dice: number[];   // 3 dice
  score: number;
  round: number;
  totalRounds: number;
  lastResult: string;
  phase: "playing" | "gameover";
}
export type DiceSequence3Action = { type: "roll" };

export function checkSequence(dice: number[]): boolean {
  const sorted = [...dice].sort((a, b) => a - b);
  return sorted[1]! - sorted[0]! === 1 && sorted[2]! - sorted[1]! === 1;
}

export function initialState(seed: number, settings: DiceSequence3Settings): DiceSequence3State {
  const rng = mulberry32(seed);
  const dice = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
  return { settings, rng, dice, score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), lastResult: "", phase: "playing" };
}

export function reducer(state: DiceSequence3State, action: DiceSequence3Action): DiceSequence3State {
  if (state.phase === "gameover") return state;
  if (action.type !== "roll") return state;
  const seq = checkSequence(state.dice);
  const allDiff = new Set(state.dice).size === 3;
  const pts = seq ? 30 : allDiff ? 5 : 0;
  const lastResult = seq ? "SEQUENCE! +30" : allDiff ? "All Different +5" : "No combo +0";
  const newScore = state.score + pts;
  const nextRound = state.round + 1;
  const rng = state.rng;
  if (nextRound > state.totalRounds) return { ...state, score: newScore, lastResult, phase: "gameover" };
  const dice = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
  return { ...state, rng, dice, score: newScore, round: nextRound, lastResult };
}

export function isTerminal(state: DiceSequence3State): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
