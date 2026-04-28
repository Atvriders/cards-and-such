import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export interface DiceMusicMiniSettings { dummy: boolean; }
export interface DiceMusicMiniState { rngSeed: number; round: number; rolls: number[]; score: number; phase: "rolling" | "done"; lastPts: number; lastRoll: number; }
export type DiceMusicMiniAction = { type: "roll" } | { type: "reset" };
export function pointsFor(roll: number): number {
  return roll;
}
export function initialState(seed: number, _settings: DiceMusicMiniSettings): DiceMusicMiniState {
  return { rngSeed: seed, round: 0, rolls: [], score: 0, phase: "rolling", lastPts: 0, lastRoll: 0 };
}
export function reducer(state: DiceMusicMiniState, action: DiceMusicMiniAction): DiceMusicMiniState {
  if (state.phase === "done" && action.type !== "reset") return state;
  if (action.type === "roll") {
    if (state.round >= TOTAL_ROUNDS) return state;
    const rng = mulberry32(state.rngSeed);
    const roll = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = pointsFor(roll);
    const round = state.round + 1;
    const phase: "rolling"|"done" = round >= TOTAL_ROUNDS ? "done" : "rolling";
    return { ...state, rngSeed: nextSeed, round, rolls: [...state.rolls, roll], score: state.score + pts, phase, lastPts: pts, lastRoll: roll };
  }
  if (action.type === "reset") {
    return initialState(state.rngSeed, { dummy:false });
  }
  return state;
}
export function isTerminal(state: DiceMusicMiniState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
