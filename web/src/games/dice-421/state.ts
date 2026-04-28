import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 3;

export interface Dice421Settings { dummy: boolean; }

export interface Dice421State {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type Dice421Action = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: Dice421Settings): Dice421State {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: Dice421State, action: Dice421Action): Dice421State {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const sortedD = [...d].sort((a,b)=>a-b);
    const counts = [0,0,0,0,0,0,0]; for (const x of d) counts[x] = (counts[x] ?? 0) + 1;
    const max = Math.max(...counts);
    const sum = d.reduce((a,b)=>a+b,0);
    const is421 = sortedD.join(",") === "1,2,4";
    const s0 = sortedD[0] ?? 0; const s1 = sortedD[1] ?? 0; const s2 = sortedD[2] ?? 0;
    const consec = s1 === s0+1 && s2 === s1+1;
    let pts = 0; let msg = "";
    if (is421) { pts = 80; msg = "421! +80"; }
    else if (max === 3 && counts[1] === 3) { pts = 70; msg = "Aces! +70"; }
    else if (max === 3) { const f = counts.indexOf(3); pts = 60; msg = "Trip " + f + "s +" + pts; }
    else if (consec) { pts = 40; msg = "Suite +40"; }
    else if (counts[1] === 2) { const odd = s2; pts = 25 + odd*5; msg = "Aces+" + odd + " +" + pts; }
    else if (max === 2) { pts = sum * 2; msg = "Pair sum×2 +" + pts; }
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

export function isTerminal(state: Dice421State): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
