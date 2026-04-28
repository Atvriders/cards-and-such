import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 5;

export interface TripleYahtzeeSettings { dummy: boolean; }

export interface TripleYahtzeeState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type TripleYahtzeeAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: TripleYahtzeeSettings): TripleYahtzeeState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: TripleYahtzeeState, action: TripleYahtzeeAction): TripleYahtzeeState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const counts = [0,0,0,0,0,0,0]; for (const x of d) counts[x] = (counts[x] ?? 0) + 1;
    const max = Math.max(...counts);
    const sum = d.reduce((a,b)=>a+b,0);
    const has3 = counts.indexOf(3) >= 0;
    const has2 = counts.indexOf(2) >= 0;
    const sortedD = [...d].sort((a,b)=>a-b).join(",");
    const smallStraight = ["1,2,3,4","2,3,4,5","3,4,5,6"].some(s => sortedD.includes(s));
    const largeStraight = sortedD === "1,2,3,4,5" || sortedD === "2,3,4,5,6";
    let base = 0; let label = "";
    if (max === 5) { base = 50; label = "Yahtzee"; }
    else if (max === 4) { base = sum; label = "Four-of-a-kind"; }
    else if (largeStraight) { base = 40; label = "Large Straight"; }
    else if (smallStraight) { base = 30; label = "Small Straight"; }
    else if (has3 && has2) { base = 25; label = "Full House"; }
    else { base = sum; label = "Sum"; }
    const mult = state.round <= 4 ? 1 : state.round <= 8 ? 2 : 3;
    const pts = base * mult;
    const msg = label + " " + base + " ×" + mult + " = +" + pts;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: TripleYahtzeeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
