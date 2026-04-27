import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TARGET = 30;
export const SNAKES: Record<number, number> = { 12: 5, 18: 8, 24: 14 };
export const LADDERS: Record<number, number> = { 4: 11, 9: 20, 21: 28 };
export interface DiceSnakeLadderSettings { dummy: boolean; }
export interface DiceSnakeLadderState { rngSeed: number; pos: number; rolls: number; score: number; phase: "rolling" | "done"; lastRoll: number | null; lastEvent: string; }
export type DiceSnakeLadderAction = { type: "roll" };
export function initialState(seed: number, _s: DiceSnakeLadderSettings): DiceSnakeLadderState {
  return { rngSeed: seed, pos: 0, rolls: 0, score: 0, phase: "rolling", lastRoll: null, lastEvent: "" };
}
export function reducer(state: DiceSnakeLadderState, action: DiceSnakeLadderAction): DiceSnakeLadderState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng()*2**31);
    let pos = state.pos + r;
    let event = "";
    if (pos > TARGET) { pos = state.pos; event = "Bounce back"; }
    else if (LADDERS[pos] !== undefined) { event = `Ladder! ${pos}→${LADDERS[pos]}`; pos = LADDERS[pos]!; }
    else if (SNAKES[pos] !== undefined) { event = `Snake! ${pos}→${SNAKES[pos]}`; pos = SNAKES[pos]!; }
    const rolls = state.rolls + 1;
    let score = state.score;
    let phase: "rolling" | "done" = "rolling";
    if (pos >= TARGET) {
      // bonus: 100 - rolls*5
      score = Math.max(10, 100 - rolls * 5);
      phase = "done";
    }
    return { ...state, rngSeed: nextSeed, pos, rolls, score, phase, lastRoll: r, lastEvent: event };
  }
  return state;
}
export function isTerminal(s: DiceSnakeLadderState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
