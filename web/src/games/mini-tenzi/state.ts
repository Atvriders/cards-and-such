import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 5;
export const NUM_DICE = 10;
export const MAX_ROLLS = 20;
export interface MiniTenziSettings { dummy: boolean; }
export interface MiniTenziState { rngSeed: number; round: number; dice: number[]; held: boolean[]; rolls: number; target: number; phase: "play" | "scored" | "done"; score: number; ptsThisRound: number; }
export type MiniTenziAction = { type: "roll" } | { type: "toggle"; idx: number } | { type: "next" };
export function initialState(seed: number, _s: MiniTenziSettings): MiniTenziState {
  const rng = mulberry32(seed); const dice = Array.from({length:NUM_DICE},()=>1+Math.floor(rng()*6)); const next = Math.floor(rng()*2**31);
  const counts: Record<number, number> = {}; for (const d of dice) counts[d] = (counts[d]||0)+1;
  const target = Number(Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]![0]);
  return { rngSeed: next, round: 1, dice, held: dice.map(d=>d===target), rolls: 1, target, phase: "play", score: 0, ptsThisRound: 0 };
}
export function reducer(state: MiniTenziState, action: MiniTenziAction): MiniTenziState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "play") return state;
    if (state.rolls >= MAX_ROLLS) {
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, phase: isLast ? "done" : "scored" };
    }
    const rng = mulberry32(state.rngSeed); const dice = state.dice.map((d, i) => state.held[i] ? d : 1 + Math.floor(rng()*6)); const next = Math.floor(rng()*2**31);
    // auto-hold target hits
    const held = state.held.map((h, i) => h || dice[i] === state.target);
    const rolls = state.rolls + 1;
    if (held.every(h => h)) {
      const ptsThisRound = Math.max(5, 60 - rolls * 2);
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: next, dice, held, rolls, ptsThisRound, score: state.score + ptsThisRound, phase: isLast ? "done" : "scored" };
    }
    if (rolls >= MAX_ROLLS) {
      const isLast = state.round >= TOTAL_ROUNDS;
      return { ...state, rngSeed: next, dice, held, rolls, phase: isLast ? "done" : "scored" };
    }
    return { ...state, rngSeed: next, dice, held, rolls };
  }
  if (action.type === "toggle") {
    if (state.phase !== "play") return state;
    const held = [...state.held]; held[action.idx] = !held[action.idx];
    return { ...state, held };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const dice = Array.from({length:NUM_DICE},()=>1+Math.floor(rng()*6)); const next = Math.floor(rng()*2**31);
    const counts: Record<number, number> = {}; for (const d of dice) counts[d] = (counts[d]||0)+1;
    const target = Number(Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]![0]);
    return { ...state, rngSeed: next, round: state.round+1, dice, held: dice.map(d=>d===target), rolls: 1, target, phase: "play", ptsThisRound: 0 };
  }
  return state;
}
export function isTerminal(state: MiniTenziState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
