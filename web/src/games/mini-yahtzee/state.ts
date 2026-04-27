import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export const CATEGORIES = ["Ones","Twos","Threes","Fours","Fives","Sixes","3 of a Kind","4 of a Kind","Full House","Sm Straight","Lg Straight","Yahtzee","Chance"] as const;
export interface MiniYahtzeeSettings { dummy: boolean; }
export interface MiniYahtzeeState { rngSeed: number; dice: number[]; rollsLeft: number; held: boolean[]; scoreboard: (number | null)[]; phase: "rolling" | "scoring" | "done"; score: number; }
export type MiniYahtzeeAction = { type: "roll" } | { type: "toggle"; idx: number } | { type: "place"; cat: number };
function rollDice(rng: () => number, held: boolean[], dice: number[]): number[] {
  return dice.map((d, i) => held[i] ? d : 1 + Math.floor(rng()*6));
}
export function scoreCategory(cat: number, dice: number[]): number {
  const counts: Record<number, number> = {}; for (const d of dice) counts[d] = (counts[d]||0)+1;
  const sum = dice.reduce((a,b)=>a+b,0);
  if (cat <= 5) { const face = cat + 1; return (counts[face]||0) * face; }
  if (cat === 6) { return Object.values(counts).some(v=>v>=3) ? sum : 0; }
  if (cat === 7) { return Object.values(counts).some(v=>v>=4) ? sum : 0; }
  if (cat === 8) { const vals = Object.values(counts).sort((a,b)=>b-a); return vals[0]===3 && vals[1]===2 ? 25 : 0; }
  if (cat === 9) { const u = new Set(dice); for (const start of [1,2,3]) { let ok=true; for (let i=0;i<4;i++) if (!u.has(start+i)) { ok=false; break; } if (ok) return 30; } return 0; }
  if (cat === 10) { const u = new Set(dice); for (const start of [1,2]) { let ok=true; for (let i=0;i<5;i++) if (!u.has(start+i)) { ok=false; break; } if (ok) return 40; } return 0; }
  if (cat === 11) { return Object.values(counts).some(v=>v===5) ? 50 : 0; }
  if (cat === 12) { return sum; }
  return 0;
}
export function initialState(seed: number, _s: MiniYahtzeeSettings): MiniYahtzeeState {
  return { rngSeed: seed, dice: [1,1,1,1,1], rollsLeft: 3, held: [false,false,false,false,false], scoreboard: Array(13).fill(null), phase: "rolling", score: 0 };
}
export function reducer(state: MiniYahtzeeState, action: MiniYahtzeeAction): MiniYahtzeeState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.rollsLeft <= 0) return state;
    const rng = mulberry32(state.rngSeed); const dice = rollDice(rng, state.held, state.dice); const next = Math.floor(rng()*2**31);
    const rollsLeft = state.rollsLeft - 1;
    return { ...state, rngSeed: next, dice, rollsLeft, phase: rollsLeft === 0 ? "scoring" : "rolling" };
  }
  if (action.type === "toggle") {
    if (state.phase !== "rolling") return state;
    const held = [...state.held]; held[action.idx] = !held[action.idx];
    return { ...state, held };
  }
  if (action.type === "place") {
    if (state.scoreboard[action.cat] !== null) return state;
    const pts = scoreCategory(action.cat, state.dice);
    const newBoard = [...state.scoreboard]; newBoard[action.cat] = pts;
    const newScore = state.score + pts;
    const allFilled = newBoard.every(v => v !== null);
    return { ...state, scoreboard: newBoard, score: newScore, dice: [1,1,1,1,1], held: [false,false,false,false,false], rollsLeft: 3, phase: allFilled ? "done" : "rolling" };
  }
  return state;
}
export function isTerminal(state: MiniYahtzeeState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
