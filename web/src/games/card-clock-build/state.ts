import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
// 12 placements: Ace=1...Q=12. Score 10 per valid placement (rank matches slot).
export interface CardClockBuildSettings { dummy: boolean; }
export interface CardClockBuildState { rngSeed: number; deck: number[]; clock: (number|null)[]; pos: number; current: number | null; phase: "play" | "done"; score: number; }
export type CardClockBuildAction = { type: "draw" } | { type: "place"; slot: number } | { type: "skip" };
export function cardName(c:number):string { const r=["A","2","3","4","5","6","7","8","9","10","J","Q","K"]; const s=["♠","♥","♦","♣"]; return r[c%13]!+s[Math.floor(c/13)]!; }
export function isRed(c:number):boolean { const s=Math.floor(c/13); return s===1||s===2; }
// rank-to-slot: A=1...Q=12 (skip K). slot = rank+1 if rank<11 else if rank=11 (J) =>11, rank=10(10)=>10. Actually map: r%13: 0=A->1, 1..9=2..10, 10=J->11, 11=Q->12, 12=K-> none.
export function clockSlot(c:number): number | null { const r = c%13; if (r === 12) return null; if (r === 0) return 1; return r + 1; }
function shuffleDeck(rng:()=>number): number[] { const arr=Array.from({length:52},(_,i)=>i); for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1)); [arr[i],arr[j]]=[arr[j]!,arr[i]!];} return arr; }
export function initialState(seed: number, _s: CardClockBuildSettings): CardClockBuildState {
  const rng = mulberry32(seed); const deck = shuffleDeck(rng);
  return { rngSeed: seed, deck, clock: Array(13).fill(null), pos: 0, current: null, phase: "play", score: 0 };
}
function checkDone(state: CardClockBuildState): boolean {
  // done when 12 slots (1..12) filled OR deck exhausted
  let filled = 0; for (let i=1;i<=12;i++) if (state.clock[i] !== null) filled++;
  if (filled >= 12) return true;
  if (state.pos >= state.deck.length) return true;
  return false;
}
export function reducer(state: CardClockBuildState, action: CardClockBuildAction): CardClockBuildState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.current !== null) return state;
    if (state.pos >= state.deck.length) return { ...state, phase: "done" };
    const card = state.deck[state.pos]!;
    return { ...state, current: card, pos: state.pos + 1 };
  }
  if (action.type === "place") {
    if (state.current === null) return state;
    const slot = action.slot;
    if (slot < 1 || slot > 12) return state;
    if (state.clock[slot] !== null) return state;
    const correct = clockSlot(state.current);
    let pts = 0; if (correct === slot) pts = 10;
    const newClock = [...state.clock]; newClock[slot] = state.current;
    const next = { ...state, clock: newClock, current: null, score: state.score + pts };
    if (checkDone(next)) return { ...next, phase: "done" };
    return next;
  }
  if (action.type === "skip") {
    if (state.current === null) return state;
    const next = { ...state, current: null };
    if (checkDone(next)) return { ...next, phase: "done" };
    return next;
  }
  return state;
}
export function isTerminal(state: CardClockBuildState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
