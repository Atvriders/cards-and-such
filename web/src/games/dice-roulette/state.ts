import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Roulette: 10 rounds. Player picks a sum bucket: low (3-6), mid (7-10), high (11-14), boom (15-18).
// Roll 3 dice. Match bucket = +10. Exact 7 mid is double = +20. Exact 18 boom = +30.

export const TOTAL_ROUNDS = 10;
export type Bucket = "low" | "mid" | "high" | "boom";

export interface DiceRouletteSettings { dummy: boolean; }

export interface DiceRouletteState {
  rngSeed: number;
  round: number;
  bet: Bucket | null;
  dice: [number, number, number] | null;
  sum: number;
  score: number;
  phase: "betting" | "result" | "done";
  lastPts: number;
}

export type DiceRouletteAction = { type: "bet"; bucket: Bucket } | { type: "next" };

export function bucketOf(sum: number): Bucket {
  if (sum <= 6) return "low";
  if (sum <= 10) return "mid";
  if (sum <= 14) return "high";
  return "boom";
}

export function initialState(seed: number, _settings: DiceRouletteSettings): DiceRouletteState {
  return { rngSeed: seed, round: 1, bet: null, dice: null, sum: 0, score: 0, phase: "betting", lastPts: 0 };
}

export function reducer(state: DiceRouletteState, action: DiceRouletteAction): DiceRouletteState {
  if (state.phase === "done") return state;
  if (action.type === "bet") {
    if (state.phase !== "betting") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = a + b + c;
    const actualBucket = bucketOf(sum);
    let pts = 0;
    if (actualBucket === action.bucket) {
      pts = 10;
      if (sum === 7 && action.bucket === "mid") pts = 20;
      else if (sum === 18 && action.bucket === "boom") pts = 30;
    }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, bet: action.bucket, dice: [a, b, c], sum, score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, bet: null, dice: null, sum: 0, phase: "betting", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceRouletteState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
