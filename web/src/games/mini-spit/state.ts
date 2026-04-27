import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// Mini Spit: each round you get 6 cards. Tap each card whose rank equals (top - 1), (top + 1), or top mod 13 wraps, on top of a center pile (one of 13 ranks).
// Initial top card is given. You score 5 per valid play; 5 rounds.
export const TOTAL_ROUNDS = 5;
export interface MiniSpitSettings { dummy: boolean; }
export interface MiniSpitState { rngSeed: number; round: number; hand: (number|null)[]; top: number; phase: "play" | "scored" | "done"; score: number; ptsThisRound: number; }
export type MiniSpitAction = { type: "play"; idx: number } | { type: "end" } | { type: "next" };
export function cardName(c:number):string { const r=["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function rankOf(c:number):number { return c%13; }
function deal(rng:()=>number, n:number, used: Set<number>): number[] { const out:number[]=[]; while(out.length<n){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function isPlayable(top: number, card: number): boolean {
  const tr = rankOf(top); const cr = rankOf(card);
  return cr === (tr+1) % 13 || cr === (tr+12) % 13;
}
export function initialState(seed: number, _s: MiniSpitSettings): MiniSpitState {
  const rng = mulberry32(seed); const used = new Set<number>(); const top = deal(rng, 1, used)[0]!; const hand = deal(rng, 6, used); const next = Math.floor(rng()*2**31);
  return { rngSeed: next, round: 1, hand, top, phase: "play", score: 0, ptsThisRound: 0 };
}
export function reducer(state: MiniSpitState, action: MiniSpitAction): MiniSpitState {
  if (state.phase === "done") return state;
  if (action.type === "play") {
    if (state.phase !== "play") return state;
    const card = state.hand[action.idx]; if (card === null || card === undefined) return state;
    if (!isPlayable(state.top, card)) return state;
    const newHand = [...state.hand]; newHand[action.idx] = null;
    const ptsThisRound = state.ptsThisRound + 5;
    return { ...state, hand: newHand, top: card, ptsThisRound, score: state.score + 5 };
  }
  if (action.type === "end") {
    if (state.phase !== "play") return state;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, phase: isLast ? "done" : "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed); const used = new Set<number>(); const top = deal(rng, 1, used)[0]!; const hand = deal(rng, 6, used); const next = Math.floor(rng()*2**31);
    return { ...state, rngSeed: next, round: state.round+1, hand, top, phase: "play", ptsThisRound: 0 };
  }
  return state;
}
export function isTerminal(state: MiniSpitState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
