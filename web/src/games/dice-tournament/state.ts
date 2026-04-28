import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 5;

export interface DiceTournamentSettings { dummy: boolean; }

export interface DiceTournamentState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type DiceTournamentAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["Roll"];

export function initialState(seed: number, _settings: DiceTournamentSettings): DiceTournamentState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: DiceTournamentState, action: DiceTournamentAction): DiceTournamentState {
  if (state.phase === "done") return state;
  if (action.type === "go") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const choice = action.choice;
    void choice;
    const a = 1 + Math.floor(rng()*6);
    const b = 1 + Math.floor(rng()*6);
    const c1 = 1 + Math.floor(rng()*6);
    const c2 = 1 + Math.floor(rng()*6);
    const youSum = a + b;
    const cpuSum = c1 + c2;
    const display = "You: 🎲" + a + "+🎲" + b + " (" + youSum + ")  CPU: 🎲" + c1 + "+🎲" + c2 + " (" + cpuSum + ")";
    const win = youSum > cpuSum;
    const stagePts = [10, 15, 20, 25, 30];
    const points = win ? (stagePts[state.round - 1] ?? 10) : 0;
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

export function isTerminal(state: DiceTournamentState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
