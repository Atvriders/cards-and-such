import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Farkle Mini: 8 rounds. Each round, roll dice. 1s = 100, 5s = 50.
// Risk re-rolling for more, or bank your round and move on.
// If a roll yields no 1s or 5s, you FARKLE and lose this round's bank.

export const TOTAL_ROUNDS = 8;
export const DICE_COUNT = 6;

export interface FarkleMiniSettings { dummy: boolean; }

export interface FarkleMiniState {
  rngSeed: number;
  round: number;
  dice: number[];
  remaining: number;
  roundBank: number;
  totalScore: number;
  phase: "rolling" | "decide" | "scored" | "done";
  lastFarkle: boolean;
}

export type FarkleMiniAction = { type: "roll" } | { type: "bank" } | { type: "next" };

function scoreOnesFives(dice: number[]): { pts: number; nonScoring: number[] } {
  let pts = 0;
  const non: number[] = [];
  for (const d of dice) {
    if (d === 1) pts += 100;
    else if (d === 5) pts += 50;
    else non.push(d);
  }
  return { pts, nonScoring: non };
}

function rollN(rng: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(1 + Math.floor(rng() * 6));
  return out;
}

export function initialState(seed: number, _settings: FarkleMiniSettings): FarkleMiniState {
  return { rngSeed: seed, round: 1, dice: [], remaining: DICE_COUNT, roundBank: 0, totalScore: 0, phase: "rolling", lastFarkle: false };
}

export function reducer(state: FarkleMiniState, action: FarkleMiniAction): FarkleMiniState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling" && state.phase !== "decide") return state;
    const rng = mulberry32(state.rngSeed);
    const rolled = rollN(rng, state.remaining);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { pts, nonScoring } = scoreOnesFives(rolled);
    if (pts === 0) {
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: nextSeed, dice: rolled, roundBank: 0, phase: isLast ? "done" : "scored", lastFarkle: true };
    }
    const remaining = nonScoring.length === 0 ? DICE_COUNT : nonScoring.length;
    const roundBank = state.roundBank + pts;
    return { ...state, rngSeed: nextSeed, dice: rolled, remaining, roundBank, phase: "decide", lastFarkle: false };
  }
  if (action.type === "bank") {
    if (state.phase !== "decide") return state;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, totalScore: state.totalScore + state.roundBank, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, dice: [], remaining: DICE_COUNT, roundBank: 0, phase: "rolling", lastFarkle: false };
  }
  return state;
}

export function isTerminal(state: FarkleMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.totalScore } : null;
}
