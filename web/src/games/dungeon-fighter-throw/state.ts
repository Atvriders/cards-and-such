import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 4;
export interface DungeonFighterThrowSettings { dummy: boolean; }
export interface DungeonFighterThrowState {
  rngSeed: number;
  round: number;
  rolls: number[];
  target: number;
  lastPts: number;
  score: number;
  phase: "rolling" | "scored" | "done";
}
export type DungeonFighterThrowAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _s: DungeonFighterThrowSettings): DungeonFighterThrowState {
  return { rngSeed: seed, round: 1, rolls: [], target: 9, lastPts: 0, score: 0, phase: "rolling" };
}
export function scoreRound(sum: number, target: number): number {
  const diff = Math.abs(sum - target);
  if (diff === 0) return 10;
  if (diff <= 1) return 5;
  if (diff <= 3) return 2;
  return 0;
}
export function reducer(state: DungeonFighterThrowState, action: DungeonFighterThrowAction): DungeonFighterThrowState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const rolls: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) rolls.push(1 + Math.floor(rng() * 6));
    const target = 8 + state.round;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = rolls.reduce((a,b)=>a+b,0);
    const pts = scoreRound(sum, target);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, rolls, target, lastPts: pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, rolls: [], target: 8 + state.round + 1, lastPts: 0, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: DungeonFighterThrowState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
