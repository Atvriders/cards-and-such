import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Bowl: 10 frames. Each frame: roll 10 dice (simulating "pins"). A "knocked-down pin"
// is any die showing 4-6. Count knocked-down pins per frame. If all 10 are knocked = STRIKE (+10 bonus).

export const TOTAL_FRAMES = 10;
export const DICE_COUNT = 10;

export interface DiceBowlSettings { dummy: boolean; }

export interface DiceBowlState {
  rngSeed: number;
  frame: number;
  dice: number[];
  knocked: number;
  strike: boolean;
  pts: number;
  score: number;
  phase: "rolling" | "scored" | "done";
}

export type DiceBowlAction = { type: "roll" } | { type: "next" };

function rollDice(rng: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(1 + Math.floor(rng() * 6));
  return out;
}

export function initialState(seed: number, _settings: DiceBowlSettings): DiceBowlState {
  return { rngSeed: seed, frame: 1, dice: [], knocked: 0, strike: false, pts: 0, score: 0, phase: "rolling" };
}

export function reducer(state: DiceBowlState, action: DiceBowlAction): DiceBowlState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = rollDice(rng, DICE_COUNT);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const knocked = dice.filter(d => d >= 4).length;
    const strike = knocked >= 10;
    const pts = knocked + (strike ? 10 : 0);
    const isLast = state.frame >= TOTAL_FRAMES;
    return { ...state, rngSeed: nextSeed, dice, knocked, strike, pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, frame: state.frame + 1, dice: [], knocked: 0, strike: false, pts: 0, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceBowlState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
