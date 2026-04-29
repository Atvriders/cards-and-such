import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 6;
export const HAND_SIZE = 12;
export interface KonigrufenSettings { dummy: boolean; }
export interface KonigrufenState { rngSeed: number; round: number; phase: "ready" | "scored" | "done"; score: number; pts: number; result: string; wins: number; losses: number; tricksWon: number; tricksLost: number; }
export type KonigrufenAction = { type: "play" } | { type: "next" };

export function initialState(seed: number, _s: KonigrufenSettings): KonigrufenState {
  return { rngSeed: seed, round: 1, phase: "ready", score: 0, pts: 0, result: "", wins: 0, losses: 0, tricksWon: 0, tricksLost: 0 };
}
export function reducer(state: KonigrufenState, action: KonigrufenAction): KonigrufenState {
  if (state.phase === "done") return state;
  if (action.type === "play") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const next = Math.floor(rng() * 2 ** 31);
    // Simulate trick play across HAND_SIZE tricks
    let yourTricks = 0;
    for (let i = 0; i < HAND_SIZE; i++) {
      // 52% edge per trick
      if (rng() < 0.52) yourTricks++;
    }
    const cpuTricks = HAND_SIZE - yourTricks;
    const youWins = yourTricks > cpuTricks;
    let pts = 0; let result = "";
    let wins = state.wins, losses = state.losses;
    if (youWins) { pts = 20 + yourTricks * 2; wins++; result = `You took ${yourTricks}/${HAND_SIZE} tricks. +${pts}`; }
    else if (yourTricks === cpuTricks) { pts = 5; result = `Tied at ${yourTricks}-${cpuTricks}. +5`; }
    else { pts = Math.max(0, yourTricks); losses++; result = `CPU took ${cpuTricks}/${HAND_SIZE} tricks. +${pts}`; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, pts, result, score: state.score + pts, wins, losses, tricksWon: state.tricksWon + yourTricks, tricksLost: state.tricksLost + cpuTricks, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, phase: "ready", pts: 0, result: "" };
  }
  return state;
}
export function isTerminal(state: KonigrufenState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
