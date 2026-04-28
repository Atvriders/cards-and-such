import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface CardRouletteSettings { dummy: boolean; }

export interface CardRouletteState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type CardRouletteAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["Red","Black","Face","Number"];

export function initialState(seed: number, _settings: CardRouletteSettings): CardRouletteState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: CardRouletteState, action: CardRouletteAction): CardRouletteState {
  if (state.phase === "done") return state;
  if (action.type === "go") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const choice = action.choice;
    const c = Math.floor(rng()*52);
    const suits = ["♠","♥","♦","♣"];
    const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    const sIdx = Math.floor(c/13);
    const rIdx = c % 13;
    const display = ranks[rIdx]! + suits[sIdx]!;
    const isRed = sIdx === 1 || sIdx === 2;
    const isFace = rIdx >= 9 && rIdx <= 11; // J,Q,K
    let win = false; let points = 0;
    if (choice === "Red") { win = isRed; points = win ? 10 : 0; }
    else if (choice === "Black") { win = !isRed; points = win ? 10 : 0; }
    else if (choice === "Face") { win = isFace; points = win ? 20 : 0; }
    else { win = !isFace; points = win ? 5 : 0; }
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

export function isTerminal(state: CardRouletteState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
