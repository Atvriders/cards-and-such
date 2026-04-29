import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const TOTAL_ROUNDS = 10;
export const PAYOUTS: number[] = [5,10,15,25,30,50,100,0];
export const CHOICES: string[] = ["One Pair (+5)","Two Pair (+10)","Three of a Kind (+15)","Straight (+25)","Full House (+30)","Four of a Kind (+50)","Five of a Kind (+100)","High Card"];
export interface PokerDiceFiveSettings { dummy: boolean; }
export interface PokerDiceFiveState {
  rngSeed: number;
  round: number;
  dice: [number, number, number, number, number] | null;
  lastIdx: number | null;
  score: number;
  phase: "rolling" | "result" | "done";
}
export type PokerDiceFiveAction =
  | { type: "roll" }
  | { type: "next" };
export function initialState(seed: number, _settings: PokerDiceFiveSettings): PokerDiceFiveState {
  return { rngSeed: seed, round: 1, dice: null, lastIdx: null, score: 0, phase: "rolling" };
}
export function reducer(state: PokerDiceFiveState, action: PokerDiceFiveAction): PokerDiceFiveState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = []; for (let i=0;i<5;i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const idx = (()=>{ const counts: Record<number, number> = {}; for (const x of dice) counts[x]=(counts[x]||0)+1; const vals=Object.values(counts).sort((x,y)=>y-x); const sorted=[...dice].sort((x,y)=>x-y).join(""); if (vals[0]===5) return 6; if (vals[0]===4) return 5; if (vals[0]===3 && vals[1]===2) return 4; if (sorted==="12345"||sorted==="23456") return 3; if (vals[0]===3) return 2; if (vals[0]===2 && vals[1]===2) return 1; if (vals[0]===2) return 0; return 7; })();
    const payout = PAYOUTS[idx] ?? 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [dice[0]!,dice[1]!,dice[2]!,dice[3]!,dice[4]!], lastIdx: idx, score: state.score + payout, phase: isLast ? "done" : "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: null, lastIdx: null, phase: "rolling" };
  }
  return state;
}
export function isTerminal(state: PokerDiceFiveState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
