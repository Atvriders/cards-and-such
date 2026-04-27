import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_DRAWS = 16;
export interface ThreeTriosSettings { dummy: boolean; }
export interface ThreeTriosState { rngSeed: number; drawn: number; hand: number[]; score: number; matches: number; phase: "playing" | "done"; lastCard: number | null; }
export type ThreeTriosAction = { type: "draw" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function rankIndex(c: number): number { return c%13; } // 0=2,1=3,...,12=A
export function initialState(seed: number, _s: ThreeTriosSettings): ThreeTriosState {
  return { rngSeed:seed, drawn:0, hand:[], score:0, matches:0, phase:"playing", lastCard:null };
}
function scoreCard(card: number, state: ThreeTriosState): { points: number; matched: boolean } {
  // count occurrences in hand BEFORE this card to detect triples
  const r = rankIndex(card);
  const same = state.hand.filter(c => rankIndex(c) === r).length;
  if (same === 2) return { points: 60, matched: true }; // 3rd of a kind
  if (same >= 3) return { points: 30, matched: false }; // additional same rank
  return { points: 0, matched: false };
}
export function reducer(state: ThreeTriosState, action: ThreeTriosAction): ThreeTriosState {
  if (state.phase==="done") return state;
  if (action.type==="draw") {
    const rng=mulberry32(state.rngSeed);
    const card=Math.floor(rng()*52);
    const nextSeed=Math.floor(rng()*2**31);
    const drawn=state.drawn+1;
    const { points, matched } = scoreCard(card, state);
    const newHand=[...state.hand, card];
    const phase: "playing"|"done" = drawn>=TOTAL_DRAWS?"done":"playing";
    return { ...state, rngSeed:nextSeed, drawn, hand:newHand, score:state.score+points, matches:state.matches+(matched?1:0), phase, lastCard:card };
  }
  return state;
}
export function isTerminal(state: ThreeTriosState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
