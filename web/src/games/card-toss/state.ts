import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_CARDS = 12;
export interface CardTossSettings { dummy: boolean; }
export interface CardTossState { rngSeed: number; deck: number[]; idx: number; current: number | null; score: number; phase: "playing" | "done"; lastResult: string; }
export type CardTossAction = { type: "toss"; pile: "red" | "black" | "special" } | { type: "deal" };
export function cardName(c: number): string { const ranks=["2","3","4","5","6","7","8","9","10","J","Q","K","A"]; const suits=["♠","♥","♦","♣"]; return ranks[c%13]!+suits[Math.floor(c/13)]!; }
export function isRed(c: number): boolean { const s=Math.floor(c/13); return s===1||s===2; }
export function isFace(c: number): boolean { const r=c%13; return r>=9; } // J,Q,K,A are "special"
export function initialState(seed: number, _s: CardTossSettings): CardTossState {
  const rng = mulberry32(seed);
  const deck = Array.from({length:52},(_,i)=>i);
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j]!,deck[i]!];}
  const subset = deck.slice(0, TOTAL_CARDS);
  const nextSeed = Math.floor(rng()*2**31);
  return { rngSeed: nextSeed, deck: subset, idx: 0, current: subset[0]!, score: 0, phase: "playing", lastResult: "" };
}
export function reducer(state: CardTossState, action: CardTossAction): CardTossState {
  if (state.phase === "done") return state;
  if (action.type === "toss" && state.current !== null) {
    const c = state.current;
    let correct = false;
    if (action.pile === "special") correct = isFace(c);
    else if (action.pile === "red") correct = isRed(c) && !isFace(c);
    else correct = !isRed(c) && !isFace(c);
    const pts = correct ? 25 : 0;
    const nextIdx = state.idx + 1;
    if (nextIdx >= state.deck.length) {
      return { ...state, score: state.score + pts, current: null, idx: nextIdx, phase: "done", lastResult: correct ? "Correct!" : "Wrong" };
    }
    return { ...state, score: state.score + pts, current: state.deck[nextIdx]!, idx: nextIdx, lastResult: correct ? "Correct!" : "Wrong" };
  }
  return state;
}
export function isTerminal(s: CardTossState): { score: number } | null { return s.phase==="done" ? { score: s.score } : null; }
