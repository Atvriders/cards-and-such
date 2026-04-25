import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Pyramid Roll: Roll dice to fill a "pyramid" — each level needs a specific minimum sum.
// Level 1 needs sum >= 3, level 2 >= 6, level 3 >= 9. Each die can only be used once.

export interface DicePyramidRollSettings { levels: "3" | "5"; }

export interface DicePyramidRollState {
  dice: number[];
  usedDice: boolean[];
  level: number;
  maxLevels: number;
  levelTargets: number[];
  score: number;
  phase: "rolling" | "assigning" | "scored" | "gameover";
  rngSeed: number;
  lastLevelPts: number;
}

export type DicePyramidRollAction =
  | { type: "roll" }
  | { type: "assign"; diceIndex: number }
  | { type: "next" };

export function initialState(seed: number, settings: DicePyramidRollSettings): DicePyramidRollState {
  const rng = mulberry32(seed);
  const maxLevels = parseInt(settings.levels, 10);
  const levelTargets = Array.from({ length: maxLevels }, (_, i) => (i + 1) * 3);
  const dice = Array.from({ length: 6 }, () => Math.floor(rng() * 6) + 1);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { dice, usedDice: Array(6).fill(false), level: 0, maxLevels, levelTargets, score: 0, phase: "rolling", rngSeed: nextSeed, lastLevelPts: 0 };
}

export function reducer(state: DicePyramidRollState, action: DicePyramidRollAction): DicePyramidRollState {
  if (state.phase === "gameover") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = state.usedDice.map((used, i) => used ? state.dice[i]! : Math.floor(rng() * 6) + 1);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, dice, rngSeed: nextSeed, phase: "assigning" };
  }
  if (action.type === "assign") {
    if (state.phase !== "assigning") return state;
    if (state.usedDice[action.diceIndex]) return state;
    const target = state.levelTargets[state.level]!;
    const val = state.dice[action.diceIndex]!;
    const success = val >= target;
    const pts = success ? 10 + val : 0;
    const newUsed = state.usedDice.map((u, i) => i === action.diceIndex ? true : u);
    const nextLevel = state.level + 1;
    const phase = nextLevel >= state.maxLevels ? "gameover" : "scored";
    return { ...state, usedDice: newUsed, score: state.score + pts, level: nextLevel, lastLevelPts: pts, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DicePyramidRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
