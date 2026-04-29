import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 5;
export interface GSettings { dummy: boolean; }
export interface GState { rngSeed: number; round: number; hand: number[]; phase: "play" | "scored" | "done"; melds: number[][]; score: number; pts: number; deadwood: number; result: string; }
export type GAction = { type: "score" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["\u2660","\u2665","\u2666","\u2663"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function rankOf(c: number): number { return c % 13; }
function cardValue(c: number): number {
  const r = rankOf(c);
  if (r === 0) return 1;
  if (r >= 10) return 10;
  return r + 1;
}
function deal(rng: () => number, n: number): number[] {
  const u = new Set<number>(); const out: number[] = [];
  while (out.length < n) { const c = Math.floor(rng() * 52); if (!u.has(c)) { u.add(c); out.push(c); } }
  return out;
}
function autoMeld(hand: number[]): { melds: number[][]; remaining: number[] } {
  const cards = [...hand];
  const melds: number[][] = [];
  const byRank: Record<number, number[]> = {};
  for (const c of cards) { const r = c % 13; (byRank[r] = byRank[r] || []).push(c); }
  for (const k of Object.keys(byRank)) {
    const arr = byRank[parseInt(k)]!;
    if (arr.length >= 3) { melds.push(arr); for (const c of arr) cards.splice(cards.indexOf(c), 1); }
  }
  const bySuit: Record<number, number[]> = {};
  for (const c of cards) { const s = Math.floor(c / 13); (bySuit[s] = bySuit[s] || []).push(c); }
  for (const k of Object.keys(bySuit)) {
    const arr = bySuit[parseInt(k)]!.sort((a, b) => (a % 13) - (b % 13));
    let run: number[] = [];
    for (const c of arr) {
      if (run.length === 0 || c % 13 === run[run.length - 1]! % 13 + 1) run.push(c);
      else {
        if (run.length >= 3) { melds.push([...run]); for (const x of run) cards.splice(cards.indexOf(x), 1); }
        run = [c];
      }
    }
    if (run.length >= 3) { melds.push([...run]); for (const x of run) cards.splice(cards.indexOf(x), 1); }
  }
  return { melds, remaining: cards };
}

export function initialState(seed: number, _s: GSettings): GState {
  const rng = mulberry32(seed); const hand = deal(rng, 11);
  const next = Math.floor(rng() * 2 ** 31);
  return { rngSeed: next, round: 1, hand, phase: "play", melds: [], score: 0, pts: 0, deadwood: 0, result: "" };
}
export function reducer(state: GState, action: GAction): GState {
  if (state.phase === "done") return state;
  if (action.type === "score") {
    if (state.phase !== "play") return state;
    const { melds, remaining } = autoMeld(state.hand);
    const deadwood = remaining.reduce((a, c) => a + cardValue(c), 0);
    let pts = 0; let result = "";
    for (const m of melds) pts += 20 + (m.length - 3) * 5;
    if (melds.length === 0) { pts = Math.max(0, 5 - Math.floor(deadwood / 5)); result = `No melds (deadwood ${deadwood})`; }
    else { result = `${melds.length} meld${melds.length === 1 ? "" : "s"} \u2014 deadwood ${deadwood}`; }
    if (remaining.length === 0) { pts += 25; result += " \u00b7 Classic Canasta!"; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, melds, pts, deadwood, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const hand = deal(rng, 11);
    const next = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: next, round: state.round + 1, hand, melds: [], pts: 0, deadwood: 0, result: "", phase: "play" };
  }
  return state;
}
export function isTerminal(state: GState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
