import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 12;
export const PAYOUTS: number[] = [0,12,30,90];
export const CHOICES: string[] = ["No 4 (+0)","One 4 (+12)","Two 4s (+30)","Three 4s (+90)"];
export interface TaiSaiBoSettings { dummy: boolean; }
export interface TaiSaiBoState {
  rngSeed: number;
  round: number;
  dice: [number, number, number] | null;
  lastIdx: number | null;
  score: number;
  phase: "rolling" | "result" | "done";
}
export type TaiSaiBoAction =
  | { type: "roll" }
  | { type: "next" };
export function initialState(seed: number, _settings: TaiSaiBoSettings): TaiSaiBoState {
  return { rngSeed: seed, round: 1, dice: null, lastIdx: null, score: 0, phase: "rolling" };
}
export function reducer(state: TaiSaiBoState, action: TaiSaiBoAction): TaiSaiBoState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6); const b = 1 + Math.floor(rng() * 6); const c = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const idx = (()=>{ let count=0; const pick=4; if (a===pick) count++; if (b===pick) count++; if (c===pick) count++; return count; })();
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
export function isTerminal(state: TaiSaiBoState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
