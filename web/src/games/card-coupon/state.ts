import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_DRAWS = 10;
export interface CardCouponSettings { dummy: boolean; }
export interface CardCouponState { rngSeed: number; drawIdx: number; score: number; phase: "playing" | "done"; lastCard: number | null; lastValue: number; }
export type CardCouponAction = { type: "draw" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function rawValue(c: number): number { const r=c%13; if(r<=8) return r+2; if(r===9) return 11; if(r===10) return 12; if(r===11) return 13; return 1; }
export function couponValue(c: number): number { return Math.max(0, rawValue(c) - 1); }
export function initialState(seed: number, _s: CardCouponSettings): CardCouponState {
  return { rngSeed: seed, drawIdx: 0, score: 0, phase: "playing", lastCard: null, lastValue: 0 };
}
export function reducer(state: CardCouponState, action: CardCouponAction): CardCouponState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng()*52);
    const nextSeed = Math.floor(rng()*2**31);
    const v = couponValue(c);
    const drawIdx = state.drawIdx + 1;
    const phase = drawIdx >= TOTAL_DRAWS ? "done" : "playing";
    // We want LOWER totals to be better. So score in this game = 100 - sum (or 0 if sum > 100).
    // Easier: score points equal to (12 - couponValue) per draw. Low cards = high points.
    const pts = Math.max(0, 12 - v);
    return { ...state, rngSeed: nextSeed, drawIdx, score: state.score + pts, phase, lastCard: c, lastValue: v };
  }
  return state;
}
export function isTerminal(s: CardCouponState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
