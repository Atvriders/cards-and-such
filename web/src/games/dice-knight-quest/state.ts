import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 2;
export interface DiceKnightQuestSettings { dummy: boolean; }
export interface DiceKnightQuestState {
  rngSeed: number;
  round: number;
  rolls: number[];
  lastPts: number;
  score: number;
  phase: "rolling" | "scored" | "done";
}
export type DiceKnightQuestAction = { type: "roll" } | { type: "next" };
export function initialState(seed: number, _settings: DiceKnightQuestSettings): DiceKnightQuestState {
  return { rngSeed: seed, round: 1, rolls: [], lastPts: 0, score: 0, phase: "rolling" };
}
export function scoreRoll(rolls: number[]): number {
  return rolls.reduce((a,b)=>a+b,0);
}
export function reducer(state: DiceKnightQuestState, action: DiceKnightQuestAction): DiceKnightQuestState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const rolls: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) rolls.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = scoreRoll(rolls);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, rolls, lastPts: pts, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, rolls: [], lastPts: 0, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: DiceKnightQuestState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
