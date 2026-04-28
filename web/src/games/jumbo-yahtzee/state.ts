import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 6;

export interface JumboYahtzeeSettings { dummy: boolean; }

export interface JumboYahtzeeState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type JumboYahtzeeAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: JumboYahtzeeSettings): JumboYahtzeeState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: JumboYahtzeeState, action: JumboYahtzeeAction): JumboYahtzeeState {
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
    const longStraight = sortedD === "1,2,3,4,5,6";
    const fives = ["1,2,3,4,5","2,3,4,5,6"].some(p => sortedD.includes(p));
    let pts = 0; let msg = "";
    if (max === 6) { pts = 80; msg = "Jumbo Yahtzee! +80"; }
    else if (max === 5) { pts = 50; msg = "Five of a kind! +50"; }
    else if (longStraight) { pts = 50; msg = "Long Straight! +50"; }
    else if (max === 4) { pts = sum; msg = "Four of a kind +" + pts; }
    else if (fives) { pts = 40; msg = "Short Straight! +40"; }
    else if (has3 && has2) { pts = 30; msg = "Full House! +30"; }
    else if (max === 3) { pts = sum; msg = "Three of a kind +" + pts; }
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

export function isTerminal(state: JumboYahtzeeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
