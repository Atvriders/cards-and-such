import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;

export interface CardTowerFallSettings { dummy: boolean; }

export interface CardTowerFallState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type CardTowerFallAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["Stack","Bank"];

export function initialState(seed: number, _settings: CardTowerFallSettings): CardTowerFallState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: CardTowerFallState, action: CardTowerFallAction): CardTowerFallState {
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
    let win = false; let points = 0;
    if (choice === "Stack") {
      if (rIdx === 12) { win = false; points = 0; } // Ace -> collapse
      else { const val = rIdx === 9 ? 11 : rIdx === 10 ? 12 : rIdx === 11 ? 13 : rIdx + 2; win = true; points = val; }
    } else {
      win = true; points = 25;
    }
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

export function isTerminal(state: CardTowerFallState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
