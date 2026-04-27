import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Roll & Write: 6 rounds. Each round roll 4 dice. Place each die in one of 4 categories.
// Categories: "ones" (sum of 1s), "evens" (sum of even faces), "odds" (sum of odd faces), "high" (sum of 4+ faces).
// Once a category is filled in a round it gets that die value as score contribution. Each round's category caps at one die per category.
// To simplify: each round you pick one category to score (sum of dice that match the category criterion).
// Categories: small (sum of 1-3 faces), big (sum of 4-6 faces), evens (2/4/6), odds (1/3/5).
// Each category may be scored AT MOST once per game (across 6 rounds, with 4 categories — so 2 rounds will be wasted, scoring 0).
// Choose wisely!

export const TOTAL_ROUNDS = 6;
export type Category = "small" | "big" | "evens" | "odds";
export const CATEGORIES: Category[] = ["small","big","evens","odds"];

export interface RollAndWriteSettings { dummy: boolean; }
export interface RollAndWriteState {
  rngSeed: number;
  round: number;
  dice: number[];
  used: Record<Category, boolean>;
  score: number;
  phase: "rolling" | "choosing" | "done";
  lastPts: number;
  lastCat: Category | null;
}
export type RollAndWriteAction = { type: "roll" } | { type: "choose"; cat: Category };

export function categoryScore(dice: number[], cat: Category): number {
  if (cat === "small") return dice.filter(d => d <= 3).reduce((a, b) => a + b, 0);
  if (cat === "big") return dice.filter(d => d >= 4).reduce((a, b) => a + b, 0);
  if (cat === "evens") return dice.filter(d => d % 2 === 0).reduce((a, b) => a + b, 0);
  return dice.filter(d => d % 2 === 1).reduce((a, b) => a + b, 0);
}

export function initialState(seed: number, _settings: RollAndWriteSettings): RollAndWriteState {
  return { rngSeed: seed, round: 1, dice: [], used: { small:false, big:false, evens:false, odds:false }, score: 0, phase: "rolling", lastPts: 0, lastCat: null };
}

export function reducer(state: RollAndWriteState, action: RollAndWriteAction): RollAndWriteState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = [0, 1, 2, 3].map(() => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, dice, phase: "choosing" };
  }
  if (action.type === "choose") {
    if (state.phase !== "choosing") return state;
    const used = { ...state.used };
    let pts = 0;
    if (!used[action.cat]) { pts = categoryScore(state.dice, action.cat); used[action.cat] = true; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, used, score: state.score + pts, phase: isLast ? "done" : "rolling", round: state.round + 1, dice: [], lastPts: pts, lastCat: action.cat };
  }
  return state;
}

export function isTerminal(state: RollAndWriteState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
