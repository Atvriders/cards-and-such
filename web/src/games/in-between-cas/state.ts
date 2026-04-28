import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export interface InBetweenCasSettings { dummy: boolean; }
export interface InBetweenCasState { rngSeed: number; round: number; left: number | null; right: number | null; middle: number | null; phase: "ready" | "scored" | "done"; score: number; pts: number; result: string; }
export type InBetweenCasAction = { type: "play" } | { type: "next" };

export function cardName(c: number): string {
  const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["♠","♥","♦","♣"];
  return r[c % 13]! + s[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function rankOf(c: number): number { return c % 13; }
function drawCard(rng: () => number, used: Set<number>): number {
  while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } }
}
export function initialState(seed: number, _s: InBetweenCasSettings): InBetweenCasState {
  return { rngSeed: seed, round: 1, left: null, right: null, middle: null, phase: "ready", score: 0, pts: 0, result: "" };
}
export function reducer(state: InBetweenCasState, action: InBetweenCasAction): InBetweenCasState {
  if (state.phase === "done") return state;
  if (action.type === "play") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>();
    const a = drawCard(rng, used); const b = drawCard(rng, used);
    const left = rankOf(a) <= rankOf(b) ? a : b;
    const right = rankOf(a) <= rankOf(b) ? b : a;
    const middle = drawCard(rng, used);
    const lo = rankOf(left); const hi = rankOf(right); const mid = rankOf(middle);
    const spread = hi - lo - 1;
    let pts = 0; let result = "";
    if (mid === lo || mid === hi) { pts = 0; result = "Post! (lose)"; }
    else if (mid > lo && mid < hi) {
      if (spread >= 9) pts = 5;
      else if (spread >= 5) pts = 12;
      else if (spread >= 2) pts = 20;
      else pts = 50;
      result = `In between! +${pts}`;
    } else { pts = 0; result = "Outside the spread"; }
    if (lo === hi) { pts = 6; result = `Pair (push) +${pts}`; }
    const next = Math.floor(rng() * 2 ** 31);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, left, right, middle, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, left: null, right: null, middle: null, pts: 0, result: "", phase: "ready" };
  }
  return state;
}
export function isTerminal(state: InBetweenCasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
