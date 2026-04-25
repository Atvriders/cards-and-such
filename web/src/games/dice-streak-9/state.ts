import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Streak 9: Roll dice trying to build a streak of consecutive values (1-2-3-...).
// Each turn roll 2 dice. If either matches next needed value, add to streak. Miss = start over.

export interface DiceStreak9Settings { target: "5" | "9"; }

export interface DiceStreak9State {
  dice: [number, number];
  nextNeeded: number;
  streak: number;
  bestStreak: number;
  target: number;
  attempts: number;
  maxAttempts: number;
  score: number;
  phase: "rolling" | "gameover";
  rngSeed: number;
  lastHit: boolean | null;
}

export type DiceStreak9Action = { type: "roll" };

export function initialState(seed: number, settings: DiceStreak9Settings): DiceStreak9State {
  const rng = mulberry32(seed);
  const target = parseInt(settings.target, 10);
  const dice: [number, number] = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { dice, nextNeeded: 1, streak: 0, bestStreak: 0, target, attempts: 0, maxAttempts: 20, score: 0, phase: "rolling", rngSeed: nextSeed, lastHit: null };
}

export function reducer(state: DiceStreak9State, action: DiceStreak9Action): DiceStreak9State {
  if (state.phase === "gameover") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const dice: [number, number] = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const hit = dice[0] === state.nextNeeded || dice[1] === state.nextNeeded;
    let streak = hit ? state.streak + 1 : 0;
    let nextNeeded = hit ? (state.nextNeeded % 6) + 1 : 1;
    const score = state.score + (hit ? 10 * streak : 0);
    const bestStreak = Math.max(state.bestStreak, streak);
    const newAttempts = state.attempts + 1;
    const done = bestStreak >= state.target || newAttempts >= state.maxAttempts;
    return { ...state, dice, nextNeeded, streak, bestStreak, score, attempts: newAttempts, phase: done ? "gameover" : "rolling", rngSeed: nextSeed, lastHit: hit };
  }
  return state;
}

export function isTerminal(state: DiceStreak9State): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
