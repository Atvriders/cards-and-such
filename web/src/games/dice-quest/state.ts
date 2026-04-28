import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;

export interface DiceQuestSettings { dummy: boolean; }

export interface DiceQuestState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type DiceQuestAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["Forest","Cave","Mountain"];

export function initialState(seed: number, _settings: DiceQuestSettings): DiceQuestState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: DiceQuestState, action: DiceQuestAction): DiceQuestState {
  if (state.phase === "done") return state;
  if (action.type === "go") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const choice = action.choice;
    let display = ""; let points = 0;
    if (choice === "Forest") {
      const r = 1 + Math.floor(rng()*6);
      points = r * 2;
      display = "🌲 " + r + "×2 = " + points;
    } else if (choice === "Cave") {
      const r = 1 + Math.floor(rng()*8);
      const bonus = r <= 4 ? 3 : 0;
      points = r + bonus;
      display = "🕳 " + r + (bonus ? " +" + bonus : "");
    } else {
      const r = 1 + Math.floor(rng()*10);
      points = r;
      display = "⛰ " + r;
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

export function isTerminal(state: DiceQuestState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
