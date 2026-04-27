import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Bunco Mini: 6 rounds. In round N, roll 3 dice. For each die showing N: +1 point.
// Three dice all showing N: +21 (Bunco!). Three dice all the same but not N: +5.
export const TOTAL_ROUNDS = 6;

export interface BuncoMiniSettings { dummy: boolean; }
export interface BuncoMiniState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  phase: "rolling" | "scored" | "done";
  lastPts: number;
  buncos: number;
}
export type BuncoMiniAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: BuncoMiniSettings): BuncoMiniState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, phase: "rolling", lastPts: 0, buncos: 0 };
}

export function scoreRound(dice: number[], target: number): { pts: number; bunco: boolean } {
  const matches = dice.filter(d => d === target).length;
  const allSame = dice[0] === dice[1] && dice[1] === dice[2];
  if (allSame && dice[0] === target) return { pts: 21, bunco: true };
  if (allSame) return { pts: 5, bunco: false };
  return { pts: matches, bunco: false };
}

export function reducer(state: BuncoMiniState, action: BuncoMiniAction): BuncoMiniState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = [0,1,2].map(() => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { pts, bunco } = scoreRound(dice, state.round);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice, score: state.score + pts, phase: isLast ? "done" : "scored", lastPts: pts, buncos: state.buncos + (bunco ? 1 : 0) };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [], phase: "rolling", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: BuncoMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
