import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Streak: roll 1 die at a time. Track consecutive same-face streaks.
// When a streak of 3+ same faces breaks, score current best streak * 10. Then reset.
// Game ends after MAX_ROLLS rolls. Final score: best streak score earned + bonus.

export const MAX_ROLLS = 30;

export interface DiceStreakSettings { dummy: boolean; }

export interface DiceStreakState {
  rngSeed: number;
  rolls: number;
  current: number; // last face
  streak: number; // current run of same face
  bestStreak: number; // longest run achieved
  score: number;
  history: number[];
  phase: "rolling" | "done";
}

export type DiceStreakAction = { type: "roll" } | { type: "stop" };

export function initialState(seed: number, _settings: DiceStreakSettings): DiceStreakState {
  return { rngSeed: seed, rolls: 0, current: 0, streak: 0, bestStreak: 0, score: 0, history: [], phase: "rolling" };
}

export function reducer(state: DiceStreakState, action: DiceStreakAction): DiceStreakState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const face = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sameAsLast = face === state.current && state.current !== 0;
    const newStreak = sameAsLast ? state.streak + 1 : 1;
    let scoreDelta = 0;
    if (!sameAsLast && state.streak >= 3) {
      scoreDelta = state.streak * 10;
    }
    const newBest = Math.max(state.bestStreak, newStreak);
    const newRolls = state.rolls + 1;
    const newHistory = [...state.history, face];
    if (newRolls >= MAX_ROLLS) {
      // close any pending streak bonus
      const finalDelta = scoreDelta + (newStreak >= 3 ? newStreak * 10 : 0);
      return { ...state, rngSeed: nextSeed, rolls: newRolls, current: face, streak: newStreak, bestStreak: newBest, score: state.score + finalDelta, history: newHistory, phase: "done" };
    }
    return { ...state, rngSeed: nextSeed, rolls: newRolls, current: face, streak: newStreak, bestStreak: newBest, score: state.score + scoreDelta, history: newHistory };
  }
  if (action.type === "stop") {
    const finalDelta = state.streak >= 3 ? state.streak * 10 : 0;
    return { ...state, score: state.score + finalDelta, phase: "done" };
  }
  return state;
}

export function isTerminal(state: DiceStreakState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
