import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 4;
export interface QuarriorsDiceDeckbuildSettings { dummy: boolean; }
export interface QuarriorsDiceDeckbuildState {
  rngSeed: number;
  round: number;
  rolls: number[];
  bonus: number;
  lastPts: number;
  score: number;
  phase: "rolling" | "scored" | "done";
}
export type QuarriorsDiceDeckbuildAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: QuarriorsDiceDeckbuildSettings): QuarriorsDiceDeckbuildState {
  return { rngSeed: seed, round: 1, rolls: [], bonus: 0, lastPts: 0, score: 0, phase: "rolling" };
}
export function scoreRoll(rolls: number[]): { base: number; bonus: number } {
  const base = rolls.reduce((a,b)=>a+b,0);
  const allSame = rolls.length > 0 && rolls.every(r => r === rolls[0]);
  return { base, bonus: allSame ? 5 : 0 };
}
export function reducer(state: QuarriorsDiceDeckbuildState, action: QuarriorsDiceDeckbuildAction): QuarriorsDiceDeckbuildState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const rolls: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) rolls.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const { base, bonus } = scoreRoll(rolls);
    const total = base + bonus;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, rolls, bonus, lastPts: total, score: state.score + total, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, rolls: [], bonus: 0, lastPts: 0, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: QuarriorsDiceDeckbuildState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
