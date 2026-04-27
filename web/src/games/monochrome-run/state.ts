import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Monochrome Run: Draw 12 cards. Each consecutive same-color streak scores points equal to the streak
// length. Best streak is rewarded — total score equals sum of (streakLen) for each streak >= 2.
// Encourages long color runs.

export const TOTAL_DRAWS = 12;

export interface MonochromeRunSettings { dummy: boolean; }

export interface MonochromeRunState {
  rngSeed: number;
  drawn: number;
  history: number[];
  currentColor: "red" | "black" | null;
  currentStreak: number;
  bestStreak: number;
  score: number;
  lastCard: number | null;
  phase: "drawing" | "done";
}

export type MonochromeRunAction = { type: "draw" };

export function suitOf(c: number): number { return Math.floor(c / 13); }
export function isRed(c: number): boolean { const s = suitOf(c); return s === 1 || s === 2; }
export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}

export function initialState(seed: number, _settings: MonochromeRunSettings): MonochromeRunState {
  return { rngSeed: seed, drawn: 0, history: [], currentColor: null, currentStreak: 0, bestStreak: 0, score: 0, lastCard: null, phase: "drawing" };
}

export function reducer(state: MonochromeRunState, action: MonochromeRunAction): MonochromeRunState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const color: "red" | "black" = isRed(c) ? "red" : "black";
    let streak = state.currentStreak;
    let curColor: "red" | "black" | null = state.currentColor;
    let score = state.score;
    if (curColor === color) {
      streak += 1;
      score += 1; // award 1 point per continuation card
    } else {
      streak = 1;
      curColor = color;
    }
    const bestStreak = Math.max(state.bestStreak, streak);
    const drawn = state.drawn + 1;
    const phase = drawn >= TOTAL_DRAWS ? "done" : "drawing";
    return { ...state, rngSeed: nextSeed, drawn, history: [...state.history, c], currentColor: curColor, currentStreak: streak, bestStreak, score, lastCard: c, phase };
  }
  return state;
}

export function isTerminal(state: MonochromeRunState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
