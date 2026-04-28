import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;

export interface CardShootoutSettings { dummy: boolean; }

export interface CardShootoutState {
  rngSeed: number;
  round: number;
  score: number;
  phase: "predict" | "result" | "done";
  display: string;
  lastChoice: string;
  lastWin: boolean;
  lastPts: number;
}

export type CardShootoutAction = { type: "go"; choice: string } | { type: "next" };

export const CHOICES: readonly string[] = ["Draw"];

export function initialState(seed: number, _settings: CardShootoutSettings): CardShootoutState {
  return { rngSeed: seed, round: 1, score: 0, phase: "predict", display: "", lastChoice: "", lastWin: false, lastPts: 0 };
}

export function reducer(state: CardShootoutState, action: CardShootoutAction): CardShootoutState {
  if (state.phase === "done") return state;
  if (action.type === "go") {
    if (state.phase !== "predict") return state;
    const rng = mulberry32(state.rngSeed);
    const choice = action.choice;
    const cP = Math.floor(rng()*52);
    const cC = Math.floor(rng()*52);
    const suits = ["♠","♥","♦","♣"];
    const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
    const display = "You: " + ranks[cP%13] + suits[Math.floor(cP/13)] + "  CPU: " + ranks[cC%13] + suits[Math.floor(cC/13)];
    void choice;
    const win = (cP % 13) > (cC % 13);
    const points = win ? 15 : 0;
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

export function isTerminal(state: CardShootoutState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
