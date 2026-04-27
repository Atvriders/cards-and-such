import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_BATTLES = 12;
export interface MiniWarSettings { dummy: boolean; }
export interface MiniWarState { rngSeed: number; battle: number; you: number | null; cpu: number | null; phase: "ready" | "result" | "done"; wins: number; losses: number; ties: number; score: number; }
export type MiniWarAction = { type: "battle" } | { type: "next" };
export function cardName(c:number):string { const r=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function rankOf(c:number):number { return c%13; }
function pick2(rng:()=>number): [number, number] {
  const u = new Set<number>();
  function p() { while (true) { const c = Math.floor(rng()*52); if (!u.has(c)) { u.add(c); return c; } } }
  return [p(), p()];
}
export function initialState(seed: number, _s: MiniWarSettings): MiniWarState {
  return { rngSeed: seed, battle: 1, you: null, cpu: null, phase: "ready", wins: 0, losses: 0, ties: 0, score: 0 };
}
export function reducer(state: MiniWarState, action: MiniWarAction): MiniWarState {
  if (state.phase === "done") return state;
  if (action.type === "battle") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed); const [you, cpu] = pick2(rng); const next = Math.floor(rng()*2**31);
    let wins = state.wins, losses = state.losses, ties = state.ties, pts = 0;
    if (rankOf(you) > rankOf(cpu)) { wins++; pts = 10; }
    else if (rankOf(you) < rankOf(cpu)) { losses++; }
    else { ties++; pts = 3; }
    const isLast = state.battle >= TOTAL_BATTLES;
    return { ...state, rngSeed: next, you, cpu, wins, losses, ties, score: state.score + pts, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, battle: state.battle + 1, you: null, cpu: null, phase: "ready" };
  }
  return state;
}
export function isTerminal(state: MiniWarState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
