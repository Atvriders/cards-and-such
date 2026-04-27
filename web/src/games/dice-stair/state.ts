import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 6;

export interface DiceStairSettings { dummy: boolean; }

export interface DiceStairState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  phase: "rolling" | "result" | "done";
  lastPts: number;
}

export type DiceStairAction = { type: "roll" } | { type: "next" };

export function longestStair(dice: number[]): number {
  const set = new Set(dice);
  let best = 0; let cur = 0;
  for (let v = 1; v <= 6; v++) {
    if (set.has(v)) { cur += 1; best = Math.max(best, cur); }
    else { cur = 0; }
  }
  return best;
}

export function initialState(seed: number, _settings: DiceStairSettings): DiceStairState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, phase: "rolling", lastPts: 0 };
}

export function reducer(state: DiceStairState, action: DiceStairAction): DiceStairState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < 5; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const stair = longestStair(dice);
    let pts = 0;
    if (stair >= 5) pts = 100;
    else if (stair === 4) pts = 50;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], phase: "rolling", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceStairState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
