import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 4;

export interface HogDiceSettings { dummy: boolean; }

export interface HogDiceState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type HogDiceAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: HogDiceSettings): HogDiceState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: HogDiceState, action: HogDiceAction): HogDiceState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const sum = d.reduce((a,b)=>a+b,0);
    let pts = 0; let msg = "";
    if (d.includes(1)) { pts = 0; msg = "Hog! Busted (1) — 0"; }
    else { pts = sum; msg = "+" + pts; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: HogDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
