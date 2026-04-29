import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 15;
export interface PontoonCasSettings { dummy: boolean; }
export interface PontoonCasState { rngSeed: number; round: number; cardA: number | null; cardB: number | null; cardC: number | null; phase: "ready" | "scored" | "done"; score: number; pts: number; result: string; }
export type PontoonCasAction = { type: "play" } | { type: "next" };
export function cardName(c: number): string { const r = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s = ["♠","♥","♦","♣"]; return r[c % 13]! + s[Math.floor(c / 13)]!; }
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }
function rankOf(c: number): number { return c % 13; }
function drawCard(rng: () => number, used: Set<number>): number { while (true) { const c = Math.floor(rng() * 52); if (!used.has(c)) { used.add(c); return c; } } }

export function initialState(seed: number, _s: PontoonCasSettings): PontoonCasState {
  return { rngSeed: seed, round: 1, cardA: null, cardB: null, cardC: null, phase: "ready", score: 0, pts: 0, result: "" };
}
export function reducer(state: PontoonCasState, action: PontoonCasAction): PontoonCasState {
  if (state.phase === "done") return state;
  if (action.type === "play") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const used = new Set<number>();
    const a = drawCard(rng, used);
    const b = drawCard(rng, used);
    const c = drawCard(rng, used);
    const ra = rankOf(a), rb = rankOf(b), rc = rankOf(c);
    let pts = 0; let result = "";
    const total = ra + rb + rc;
    const youHand = ra + rc;
    const dealerHand = rb + Math.floor(rng() * 5);
    if (ra === rb && rb === rc) { pts = 50; result = `Trips bonus! +${pts}`; }
    else if (ra === rb || rb === rc || ra === rc) { pts = 20; result = `Pair +${pts}`; }
    else if (total >= 25) { pts = 30; result = `High roll +${pts}`; }
    else if (youHand > dealerHand) { pts = 18; result = `You win +${pts}`; }
    else if (youHand === dealerHand) { pts = 6; result = `Push +${pts}`; }
    else { pts = 0; result = "Lose"; }
    const next = Math.floor(rng() * 2 ** 31);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: next, cardA: a, cardB: b, cardC: c, pts, result, score: state.score + pts, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    return { ...state, round: state.round + 1, cardA: null, cardB: null, cardC: null, pts: 0, result: "", phase: "ready" };
  }
  return state;
}
export function isTerminal(state: PontoonCasState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
