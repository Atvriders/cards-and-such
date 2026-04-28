import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;

export interface DiceBullseyeSettings { dummy: boolean; }

export interface DiceBullseyeState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type DiceBullseyeAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["3","4","5","6"];

export function initialState(seed: number, _settings: DiceBullseyeSettings): DiceBullseyeState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: DiceBullseyeState, action: DiceBullseyeAction): DiceBullseyeState {
  if (state.phase === "done") return state;
  if (action.type === "go") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const choice = action.choice;
    const r = 1 + Math.floor(rng()*6);
    const target = parseInt(choice, 10);
    const diff = Math.abs(r - target);
    let points = 0;
    if (diff === 0) points = 30;
    else if (diff === 1) points = 15;
    else if (diff === 2) points = 5;
    const display = "🎲 " + r + " (target " + target + ", off " + diff + ")";
    const win = points > 0;
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

export function isTerminal(state: DiceBullseyeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
