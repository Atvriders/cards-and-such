import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const PAYOUTS: number[] = [0,5,12,30];
export const CHOICES: string[] = ["No targets","1 target (+5)","2 targets (+12)","3 targets (+30)"];
export interface Countdown321Settings { dummy: boolean; }
export interface Countdown321State {
  rngSeed: number;
  round: number;
  dice: [number, number, number] | null;
  lastIdx: number | null;
  score: number;
  phase: "rolling" | "result" | "done";
}
export type Countdown321Action =
  | { type: "roll" }
  | { type: "next" };
export function initialState(seed: number, _settings: Countdown321Settings): Countdown321State {
  return { rngSeed: seed, round: 1, dice: null, lastIdx: null, score: 0, phase: "rolling" };
}
export function reducer(state: Countdown321State, action: Countdown321Action): Countdown321State {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6); const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const idx = (()=>{ const has3=[a,b,c].includes(3); const has2=[a,b,c].includes(2); const has1=[a,b,c].includes(1); const cnt=(has3?1:0)+(has2?1:0)+(has1?1:0); return cnt; })();
    const payout = PAYOUTS[idx] ?? 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a,b,c], lastIdx: idx, score: state.score + payout, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: null, lastIdx: null, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: Countdown321State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
