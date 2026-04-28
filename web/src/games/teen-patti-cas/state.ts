import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface TeenPattiCasSettings { dummy: boolean; }
export interface TeenPattiCasState { rngSeed: number; round: number; you: number[]; cpu: number[]; phase: "see" | "scored" | "done"; score: number; pts: number; result: string; rank: string; }
export type TeenPattiCasAction = { type: "play" } | { type: "fold" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["♠","♥","♦","♣"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function rankOf(c: number): number { return c % 13; }
function suitOf(c: number): number { return Math.floor(c / 13); }
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } }
}
function classifyHand(cards: number[]): { tier: number; name: string } {
  const ranks = cards.map(rankOf).sort((a, b) => a - b);
  const suits = cards.map(suitOf);
  const allSameRank = ranks[0] === ranks[1] && ranks[1] === ranks[2];
  const flush = suits[0] === suits[1] && suits[1] === suits[2];
  const seq = ranks[1] === ranks[0]! + 1 && ranks[2] === ranks[1]! + 1;
  if (allSameRank) return { tier: 6, name: "Trail" };
  if (flush && seq) return { tier: 5, name: "Pure Sequence" };
  if (seq) return { tier: 4, name: "Sequence" };
  if (flush) return { tier: 3, name: "Colour" };
  if (ranks[0] === ranks[1] || ranks[1] === ranks[2]) return { tier: 2, name: "Pair" };
  return { tier: 1, name: "High Card" };
}

export function initialState(seed: number, _s: TeenPattiCasSettings): TeenPattiCasState {
  const rng = mulberry32(seed); const used = new Set<number>();
  const you = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
  const cpu = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
  const next = Math.floor(rng() * 2 ** 31);
  return { rngSeed: next, round: 1, you, cpu, phase: "see", score: 0, pts: 0, result: "", rank: classifyHand(you).name };
}
export function reducer(state: TeenPattiCasState, action: TeenPattiCasAction): TeenPattiCasState {
  if (state.phase === "done") return state;
  if (action.type === "fold") {
    if (state.phase !== "see") return state;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, pts: 0, result: "Folded.", phase: isLast ? "done" : "scored" };
  }
  if (action.type === "play") {
    if (state.phase !== "see") return state;
    const yourClass = classifyHand(state.you);
    const cpuClass = classifyHand(state.cpu);
    let pts = 0; let result = "";
    let bonus = 0;
    if (yourClass.tier === 6) bonus = 60;
    else if (yourClass.tier === 5) bonus = 35;
    else if (yourClass.tier === 4) bonus = 22;
    else if (yourClass.tier === 3) bonus = 18;
    else if (yourClass.tier === 2) bonus = 16;
    else bonus = 12;
    if (yourClass.tier > cpuClass.tier) { pts = bonus; result = `You win with ${yourClass.name}!`; }
    else if (yourClass.tier === cpuClass.tier) {
      const yMax = Math.max(...state.you.map(rankOf));
      const cMax = Math.max(...state.cpu.map(rankOf));
      if (yMax > cMax) { pts = bonus; result = `You win on high card (${yourClass.name})`; }
      else if (yMax === cMax) { pts = 6; result = `Tie (${yourClass.name})`; }
      else { pts = 0; result = `CPU wins (${cpuClass.name})`; }
    } else { pts = 0; result = `CPU wins with ${cpuClass.name}`; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>();
    const you = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
    const cpu = [drawCard(rng, used), drawCard(rng, used), drawCard(rng, used)];
    const next = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: next, round: state.round + 1, you, cpu, phase: "see", pts: 0, result: "", rank: classifyHand(you).name };
  }
  return state;
}
export function isTerminal(state: TeenPattiCasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
