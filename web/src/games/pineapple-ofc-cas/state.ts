import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface PineappleOfcCasSettings { dummy: boolean; }
export interface PineappleOfcCasState { rngSeed: number; round: number; you: number[]; cpu: number[]; phase: "see" | "scored" | "done"; score: number; pts: number; result: string; }
export type PineappleOfcCasAction = { type: "play" } | { type: "fold" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["♠","♥","♦","♣"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function rankOf(c: number): number { return c % 13; }
function rankWeight(c: number): number { return rankOf(c) === 0 ? 13 : rankOf(c); }
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } }
}

export function initialState(seed: number, _s: PineappleOfcCasSettings): PineappleOfcCasState {
  const rng = mulberry32(seed); const used = new Set<number>();
  const you = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
  const cpu = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
  const next = Math.floor(rng() * 2 ** 31);
  return { rngSeed: next, round: 1, you, cpu, phase: "see", score: 0, pts: 0, result: "" };
}
export function reducer(state: PineappleOfcCasState, action: PineappleOfcCasAction): PineappleOfcCasState {
  if (state.phase === "done") return state;
  if (action.type === "fold") {
    if (state.phase !== "see") return state;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, pts: 0, result: "Folded.", phase: isLast ? "done" : "scored" };
  }
  if (action.type === "play") {
    if (state.phase !== "see") return state;
    const yourSum = state.you.reduce((a, c) => a + rankWeight(c), 0);
    const cpuSum = state.cpu.reduce((a, c) => a + rankWeight(c), 0);
    let pts = 0; let result = "";
    if (yourSum > cpuSum) { pts = 14; result = `You win (${yourSum} vs ${cpuSum})`; }
    else if (yourSum === cpuSum) { pts = 5; result = `Tie (${yourSum})`; }
    else { pts = 0; result = `CPU wins (${cpuSum} vs ${yourSum})`; }
    // bonus: high cards
    const yourMax = Math.max(...state.you.map(rankWeight));
    if (yourMax === 13) pts += 3;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>();
    const you = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
    const cpu = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
    const next = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: next, round: state.round + 1, you, cpu, phase: "see", pts: 0, result: "" };
  }
  return state;
}
export function isTerminal(state: PineappleOfcCasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
