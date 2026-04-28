import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface CardTraceSettings { dummy: boolean; }

export interface CardTraceState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type CardTraceAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["Higher","Lower"];

export function initialState(seed: number, _settings: CardTraceSettings): CardTraceState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: CardTraceState, action: CardTraceAction): CardTraceState {
  if (state.phase === "done") return state;
  if (action.type === "go") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const choice = action.choice;
    const c = Math.floor(rng()*52);
    const suits = ["♠","♥","♦","♣"];
    const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    const rIdx = c % 13;
    const display = ranks[rIdx]! + suits[Math.floor(c/13)]!;
    let win = false;
    if (rIdx === 5) { win = false; } // 7
    else if (choice === "Higher") win = rIdx > 5;
    else win = rIdx < 5;
    const points = win ? 10 : 0;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, score: state.score + points, phase: isLast ? "done" : "result", display, lastChoice: choice, lastWin: win, lastPts: points };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: CardTraceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
