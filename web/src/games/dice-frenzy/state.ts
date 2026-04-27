import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Frenzy: 12 rolls of 6 dice. Each round, count number of matching pairs (i.e. for each face,
// floor(count/2) pairs). Award 5 points per pair.

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 6;

export interface DiceFrenzySettings { dummy: boolean; }

export interface DiceFrenzyState {
  rngSeed: number;
  round: number;
  dice: number[];
  pairs: number;
  pts: number;
  score: number;
  phase: "rolling" | "scored" | "done";
}

export type DiceFrenzyAction = { type: "roll" } | { type: "next" };

function rollDice(rng: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(1 + Math.floor(rng() * 6));
  return out;
}

function countPairs(dice: number[]): number {
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  let pairs = 0;
  for (const k of Object.keys(counts)) pairs += Math.floor(counts[Number(k)]! / 2);
  return pairs;
}

export function initialState(seed: number, _settings: DiceFrenzySettings): DiceFrenzyState {
  return { rngSeed: seed, round: 1, dice: [], pairs: 0, pts: 0, score: 0, phase: "rolling" };
}

export function reducer(state: DiceFrenzyState, action: DiceFrenzyAction): DiceFrenzyState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = rollDice(rng, DICE_COUNT);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pairs = countPairs(dice);
    const pts = pairs * 5;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, pairs, pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [], pairs: 0, pts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceFrenzyState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
