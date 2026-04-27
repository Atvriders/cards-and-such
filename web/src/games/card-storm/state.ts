import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 8;
export interface CardStormSettings { dummy: boolean; }
export interface CardStormState { rngSeed: number; round: number; hand: number[]; storm: boolean; score: number; phase: "playing" | "scored" | "done"; lastPts: number; }
export type CardStormAction = { type: "lock" } | { type: "next" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function rankValue(c: number): number { const r=c%13; if(r<=8) return r+2; if(r===9) return 11; if(r===10) return 12; if(r===11) return 13; return 14; }
function deal4(rng: () => number): number[] { const used=new Set<number>(); const out: number[] = []; while(out.length<4){const c=Math.floor(rng()*52); if(!used.has(c)){used.add(c); out.push(c);}} return out; }
export function initialState(seed: number, _s: CardStormSettings): CardStormState {
  const rng = mulberry32(seed);
  const hand = deal4(rng);
  const stormChance = rng();
  const storm = stormChance < 0.4;
  const finalHand = storm ? deal4(rng) : hand;
  const nextSeed = Math.floor(rng()*2**31);
  return { rngSeed: nextSeed, round: 1, hand: finalHand, storm, score: 0, phase: "playing", lastPts: 0 };
}
export function reducer(state: CardStormState, action: CardStormAction): CardStormState {
  if (state.phase === "done") return state;
  if (action.type === "lock" && state.phase === "playing") {
    const sum = state.hand.reduce((a,c) => a + rankValue(c), 0);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, score: state.score + sum, phase: isLast ? "done" : "scored", lastPts: sum };
  }
  if (action.type === "next" && state.phase === "scored") {
    const rng = mulberry32(state.rngSeed);
    const hand = deal4(rng);
    const stormChance = rng();
    const storm = stormChance < 0.4;
    const finalHand = storm ? deal4(rng) : hand;
    const nextSeed = Math.floor(rng()*2**31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, hand: finalHand, storm, phase: "playing", lastPts: 0 };
  }
  return state;
}
export function isTerminal(s: CardStormState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
