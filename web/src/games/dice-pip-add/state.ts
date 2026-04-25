import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Pip Add: A target sum is shown. Roll 3 dice and try to match the sum
// by choosing to ADD or SKIP each die's value to your running total.
// Score = 50 if you hit the target exactly. Within 2 = 20. Else 0. 8 rounds.

export interface DicePipAddSettings { rounds: "6" | "8" | "10"; }

export interface DicePipAddState {
  round: number;
  maxRounds: number;
  target: number;
  dice: [number, number, number];
  running: number;
  diceIdx: number;     // which die we're on (0, 1, 2)
  roundScore: number;
  totalScore: number;
  phase: "choosing" | "result" | "gameover";
  rngSeed: number;
}

export type DicePipAddAction =
  | { type: "add" }
  | { type: "skip" }
  | { type: "next" };

export function initialState(seed: number, settings: DicePipAddSettings): DicePipAddState {
  const rng = mulberry32(seed);
  const target = Math.floor(rng() * 12) + 5; // 5-16
  const dice: [number, number, number] = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
  return { round: 1, maxRounds: parseInt(settings.rounds, 10), target, dice, running: 0, diceIdx: 0, roundScore: 0, totalScore: 0, phase: "choosing", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: DicePipAddState, action: DicePipAddAction): DicePipAddState {
  if (state.phase === "gameover") return state;
  if (action.type === "add" || action.type === "skip") {
    if (state.phase !== "choosing") return state;
    const newRunning = action.type === "add" ? state.running + state.dice[state.diceIdx]! : state.running;
    const newIdx = state.diceIdx + 1;
    if (newIdx >= 3) {
      const diff = Math.abs(newRunning - state.target);
      const roundScore = diff === 0 ? 50 : diff <= 2 ? 20 : 0;
      const phase = state.round >= state.maxRounds ? "gameover" : "result";
      return { ...state, running: newRunning, diceIdx: newIdx, roundScore, totalScore: state.totalScore + roundScore, phase };
    }
    return { ...state, running: newRunning, diceIdx: newIdx };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const target = Math.floor(rng() * 12) + 5;
    const dice: [number, number, number] = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
    return { ...state, round: state.round + 1, target, dice, running: 0, diceIdx: 0, roundScore: 0, phase: "choosing", rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  return state;
}

export function isTerminal(state: DicePipAddState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.totalScore } : null;
}
