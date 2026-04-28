import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 6;

export interface MaxiYatzySettings { dummy: boolean; }

export interface MaxiYatzyState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type MaxiYatzyAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: MaxiYatzySettings): MaxiYatzyState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: MaxiYatzyState, action: MaxiYatzyAction): MaxiYatzyState {
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
    const sortedD = [...d].sort((a,b)=>a-b).join(",");
    const big = sortedD === "1,2,3,4,5,6";
    const small = ["1,2,3,4,5","2,3,4,5,6"].some(p => sortedD.includes(p));
    const pairsCount = counts.filter(c => c === 2).length;
    const hasFour = counts.indexOf(4) >= 0;
    const hasTwo = counts.indexOf(2) >= 0;
    let pts = 0; let msg = "";
    if (max === 6) { pts = 100; msg = "Maxi Yatzy! +100"; }
    else if (max === 5) { pts = 60; msg = "Five of a kind! +60"; }
    else if (pairsCount === 3) { pts = 50; msg = "Castle! +50"; }
    else if (hasFour && hasTwo) { pts = 40; msg = "Tower! +40"; }
    else if (max === 4) { pts = 40; msg = "Four of a kind +40"; }
    else if (big) { pts = 30; msg = "Big Straight +30"; }
    else if (small) { pts = 25; msg = "Small Straight +25"; }
    else { pts = sum; msg = "Sum +" + pts; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: MaxiYatzyState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
