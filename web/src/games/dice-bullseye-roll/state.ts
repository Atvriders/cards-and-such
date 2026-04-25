import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DiceBullseyeRollSettings { rounds: "5" | "10" | "15"; }
export interface DiceBullseyeRollState {
  settings: DiceBullseyeRollSettings;
  rng: () => number;
  target: number;    // 2-12
  dice: [number, number];
  total: number;
  score: number;
  round: number;
  totalRounds: number;
  phase: "playing" | "gameover";
}
export type DiceBullseyeRollAction = { type: "roll" };

export function initialState(seed: number, settings: DiceBullseyeRollSettings): DiceBullseyeRollState {
  const rng = mulberry32(seed);
  const target = Math.floor(rng() * 11) + 2;
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  return { settings, rng, target, dice: [d1, d2], total: d1 + d2, score: 0, round: 1, totalRounds: parseInt(settings.rounds, 10), phase: "playing" };
}

export function reducer(state: DiceBullseyeRollState, action: DiceBullseyeRollAction): DiceBullseyeRollState {
  if (state.phase === "gameover") return state;
  if (action.type !== "roll") return state;
  const rng = state.rng;
  const hit = state.total === state.target;
  const dist = Math.abs(state.total - state.target);
  const pts = hit ? 20 : dist === 1 ? 10 : dist === 2 ? 5 : 0;
  const newScore = state.score + pts;
  const nextRound = state.round + 1;
  if (nextRound > state.totalRounds) return { ...state, score: newScore, phase: "gameover" };
  const target = Math.floor(rng() * 11) + 2;
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  return { ...state, rng, target, dice: [d1, d2], total: d1 + d2, score: newScore, round: nextRound };
}

export function isTerminal(state: DiceBullseyeRollState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
