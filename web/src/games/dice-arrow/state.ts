import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Arrow: 10 rounds. Each round, the game rolls until a 6 appears.
// Score: 60 - rolls*4, floored at 0. So fewer rolls = more points.

export const TOTAL_ROUNDS = 10;
export const TARGET_FACE = 6;

export interface DiceArrowSettings { dummy: boolean; }

export interface DiceArrowState {
  rngSeed: number;
  round: number;
  rolls: number[];
  score: number;
  lastPts: number;
  phase: "ready" | "scored" | "done";
}

export type DiceArrowAction = { type: "shoot" } | { type: "next" };

export function initialState(seed: number, _settings: DiceArrowSettings): DiceArrowState {
  return { rngSeed: seed, round: 1, rolls: [], score: 0, lastPts: 0, phase: "ready" };
}

export function shootScore(rolls: number): number {
  return Math.max(0, 60 - rolls * 4);
}

export function reducer(state: DiceArrowState, action: DiceArrowAction): DiceArrowState {
  if (state.phase === "done") return state;
  if (action.type === "shoot") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const rolls: number[] = [];
    for (let i = 0; i < 100; i++) {
      const d = 1 + Math.floor(rng() * 6);
      rolls.push(d);
      if (d === TARGET_FACE) break;
    }
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = shootScore(rolls.length);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, rolls, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, rolls: [], lastPts: 0, phase: "ready" };
  }
  return state;
}

export function isTerminal(state: DiceArrowState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
