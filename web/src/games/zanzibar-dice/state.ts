import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 3;

export interface ZanzibarDiceSettings { dummy: boolean; }

export interface ZanzibarDiceState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type ZanzibarDiceAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: ZanzibarDiceSettings): ZanzibarDiceState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: ZanzibarDiceState, action: ZanzibarDiceAction): ZanzibarDiceState {
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
    const isZanzibar = sortedD.join(",") === "1,4,6";
    const isStraight = sortedD.join(",") === "1,2,3" || sortedD.join(",") === "4,5,6";
    let pts = 0; let msg = "";
    if (isZanzibar) { pts = 80; msg = "ZANZIBAR! +80"; }
    else if (max === 3) {
      const face = counts.indexOf(3);
      pts = face === 1 ? 100 : face * 30;
      msg = "Triple " + face + "s +" + pts;
    }
    else if (isStraight) { pts = 50; msg = "Straight +50"; }
    else if (max === 2) { const pf = counts.indexOf(2); pts = pf * 5 + (sum - pf*2); msg = "Pair " + pf + "s +" + pts; }
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

export function isTerminal(state: ZanzibarDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
