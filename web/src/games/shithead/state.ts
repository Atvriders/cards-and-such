import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 6;
export interface ShitheadSettings { dummy: boolean; }
export interface ShitheadState { rngSeed: number; round: number; you: number; cpu: number; phase: "ready" | "scored" | "done"; score: number; pts: number; result: string; wins: number; losses: number; }
export type ShitheadAction = { type: "play" } | { type: "next" };

function rngHand(rng: () => number, n: number): number[] {
  const u = new Set<number>(); const out: number[] = [];
  while (out.length < n) { const c = Math.floor(rng() * 52); if (!u.has(c)) { u.add(c); out.push(c); } }
  return out;
}

export function initialState(seed: number, _s: ShitheadSettings): ShitheadState {
  return { rngSeed: seed, round: 1, you: 7, cpu: 7, phase: "ready", score: 0, pts: 0, result: "", wins: 0, losses: 0 };
}
export function reducer(state: ShitheadState, action: ShitheadAction): ShitheadState {
  if (state.phase === "done") return state;
  if (action.type === "play") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const yourHand = rngHand(rng, 7);
    const cpuHand = rngHand(rng, 7);
    const yourLuck = yourHand.reduce((a, c) => a + (c % 13), 0);
    const cpuLuck = cpuHand.reduce((a, c) => a + (c % 13), 0);
    const next = Math.floor(rng() * 2 ** 31);
    const youWins = (yourLuck + Math.floor(rng() * 30)) >= cpuLuck;
    let pts = 0; let result = "";
    let wins = state.wins, losses = state.losses;
    if (youWins) { pts = 25 + Math.floor(rng() * 10); wins++; result = `You went out first! +${pts}`; }
    else { pts = 0; losses++; result = "CPU emptied first."; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, you: 7, cpu: 7, pts, result, score: state.score + pts, wins, losses, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, phase: "ready", pts: 0, result: "" };
  }
  return state;
}
export function isTerminal(state: ShitheadState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
