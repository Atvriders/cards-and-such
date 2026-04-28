import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 30;
export const DICE_COUNT = 2;

export interface SkunkDiceSettings { dummy: boolean; }

export interface SkunkDiceState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type SkunkDiceAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: SkunkDiceSettings): SkunkDiceState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: SkunkDiceState, action: SkunkDiceAction): SkunkDiceState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const d0 = d[0] ?? 0; const d1 = d[1] ?? 0;
    let pts = 0; let msg = "";
    if (d0 === 1 && d1 === 1) { pts = 0; msg = "Skunked! Wipe!"; state = { ...state, score: 0 }; }
    else if (d0 === 1 || d1 === 1) { pts = 0; msg = "Column wipe — 0"; }
    else { pts = d0 + d1; msg = "+" + pts; }
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: SkunkDiceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
