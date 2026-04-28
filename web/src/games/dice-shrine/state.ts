import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;

export interface DiceShrineSettings { dummy: boolean; }

export interface DiceShrineState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type DiceShrineAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["Bow","Pray","Offer"];

export function initialState(seed: number, _settings: DiceShrineSettings): DiceShrineState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: DiceShrineState, action: DiceShrineAction): DiceShrineState {
  if (state.phase === "done") return state;
  if (action.type === "go") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const choice = action.choice;
    let display = ""; let points = 0;
    if (choice === "Bow") {
      const r = 1 + Math.floor(rng()*6);
      display = "🎲 " + r;
      points = r;
    } else if (choice === "Pray") {
      const r = 1 + Math.floor(rng()*8);
      display = "🎲 " + r + " + 5 blessing";
      points = r + 5;
    } else {
      const r = 1 + Math.floor(rng()*12);
      display = "🎲 " + r + (r === 12 ? " ✨ vision!" : "");
      points = r === 12 ? 30 : r;
    }
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

export function isTerminal(state: DiceShrineState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
