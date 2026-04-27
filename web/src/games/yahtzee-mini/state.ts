import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Yahtzee Mini: 6 rounds. Each round = 3 rolls of 5 dice. After roll, you can keep dice; final roll triggers scoring.
// Combo scoring: 5-of-kind=80, 4-of-kind=40, 3-of-kind=20, two pair=15, pair=10, else sum/2 floored.
export const TOTAL_ROUNDS = 6;
export interface YahtzeeMiniSettings { dummy: boolean; }
export interface YahtzeeMiniState { rngSeed: number; round: number; rollsLeft: number; dice: number[]; held: boolean[]; score: number; phase: "rolling" | "scored" | "done"; lastPts: number; }
export type YahtzeeMiniAction = { type: "roll" } | { type: "toggle"; index: number } | { type: "score" } | { type: "next" };
function rollDice(rng: () => number, dice: number[], held: boolean[]): number[] {
  return dice.map((d, i) => held[i] ? d : 1 + Math.floor(rng() * 6));
}
export function comboScore(dice: number[]): number {
  const counts = new Map<number, number>();
  for (const d of dice) counts.set(d, (counts.get(d) || 0) + 1);
  const vals = [...counts.values()].sort((a,b)=>b-a);
  if (vals[0] === 5) return 80;
  if (vals[0] === 4) return 40;
  if (vals[0] === 3 && vals[1] === 2) return 25; // full house
  if (vals[0] === 3) return 20;
  if (vals[0] === 2 && vals[1] === 2) return 15;
  if (vals[0] === 2) return 10;
  return Math.floor(dice.reduce((a,b)=>a+b,0) / 2);
}
export function initialState(seed: number, _s: YahtzeeMiniSettings): YahtzeeMiniState {
  const rng = mulberry32(seed);
  const dice = [0,0,0,0,0].map(() => 1 + Math.floor(rng() * 6));
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, rollsLeft: 2, dice, held: [false,false,false,false,false], score: 0, phase: "rolling", lastPts: 0 };
}
export function reducer(state: YahtzeeMiniState, action: YahtzeeMiniAction): YahtzeeMiniState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.rollsLeft <= 0) return state;
    const rng = mulberry32(state.rngSeed);
    const dice = rollDice(rng, state.dice, state.held);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, dice, rollsLeft: state.rollsLeft - 1 };
  }
  if (action.type === "toggle") {
    if (state.phase !== "rolling") return state;
    const held = state.held.slice();
    held[action.index] = !held[action.index];
    return { ...state, held };
  }
  if (action.type === "score") {
    if (state.phase !== "rolling") return state;
    const pts = comboScore(state.dice);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed);
    const dice = [0,0,0,0,0].map(() => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, rollsLeft: 2, dice, held: [false,false,false,false,false], phase: "rolling", lastPts: 0 };
  }
  return state;
}
export function isTerminal(state: YahtzeeMiniState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
