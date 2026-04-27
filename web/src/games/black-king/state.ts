import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DRAWS = 12;
export const POINTS_PER_HIT = 25;

export interface BlackKingSettings { dummy: boolean; }

export interface BlackKingState {
  rngSeed: number;
  drawn: number[];
  hits: number;
  draws: number;
  score: number;
  phase: "drawing" | "done";
}

export type BlackKingAction = { type: "draw" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function isTarget(c: number): boolean {
  const r = c % 13;
  // ranks: 0=2,1=3,2=4,3=5,4=6,5=7,6=8,7=9,8=10,9=J,10=Q,11=K,12=A
  const targetRankIdx = 11;
  if (r !== targetRankIdx) return false;
  const s = Math.floor(c / 13);
  const allowed: number[] = [0,3];
  return allowed.includes(s);
}

export function initialState(seed: number, _settings: BlackKingSettings): BlackKingState {
  return { rngSeed: seed, drawn: [], hits: 0, draws: 0, score: 0, phase: "drawing" };
}

export function reducer(state: BlackKingState, action: BlackKingAction): BlackKingState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const hit = isTarget(c);
    const draws = state.draws + 1;
    const phase = draws >= TOTAL_DRAWS ? "done" : "drawing";
    return { ...state, rngSeed: nextSeed, drawn: [...state.drawn, c], hits: state.hits + (hit ? 1 : 0), draws, score: state.score + (hit ? POINTS_PER_HIT : 0), phase };
  }
  return state;
}

export function isTerminal(state: BlackKingState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
