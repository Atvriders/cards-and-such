import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Spinner: 30 rolls of 1 die. Bet on each roll: high (4-6), low (1-3), or even.
// +5 if correct.

export const TOTAL_ROLLS = 30;

export interface DiceSpinnerSettings { dummy: boolean; }

export type Bet = "high" | "low" | "even";

export interface DiceSpinnerState {
  rngSeed: number;
  rollNo: number;
  lastBet: Bet | null;
  lastFace: number | null;
  score: number;
  phase: "betting" | "result" | "done";
  lastWin: boolean;
}

export type DiceSpinnerAction = { type: "bet"; choice: Bet } | { type: "next" };

export function initialState(seed: number, _settings: DiceSpinnerSettings): DiceSpinnerState {
  return { rngSeed: seed, rollNo: 1, lastBet: null, lastFace: null, score: 0, phase: "betting", lastWin: false };
}

function check(bet: Bet, face: number): boolean {
  if (bet === "high") return face >= 4;
  if (bet === "low") return face <= 3;
  return face % 2 === 0;
}

export function reducer(state: DiceSpinnerState, action: DiceSpinnerAction): DiceSpinnerState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const face = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = check(action.choice, face);
    const isLast = state.rollNo >= TOTAL_ROLLS;
    return { ...state, rngSeed: nextSeed, lastBet: action.choice, lastFace: face, score: state.score + (win ? 5 : 0), phase: isLast ? "done" : "result", lastWin: win };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, rollNo: state.rollNo + 1, lastBet: null, lastFace: null, phase: "betting", lastWin: false };
  }
  return state;
}

export function isTerminal(state: DiceSpinnerState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
