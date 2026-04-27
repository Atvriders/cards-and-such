import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Even-Evens: 12 rounds. Each round draw 2 cards. If both are EVEN ranks, +20.
// Even ranks: 2,4,6,8,10,Q (rank values 2,4,6,8,10,12).

export const TOTAL_DRAWS = 12;

export interface EvenEvensSettings { dummy: boolean; }

export interface EvenEvensState {
  rngSeed: number;
  drawNumber: number;
  pair: [number, number] | null;
  score: number;
  phase: "ready" | "revealed" | "done";
  lastWin: boolean;
}

export type EvenEvensAction = { type: "draw" } | { type: "next" };

export function isEvenRank(c: number): boolean {
  // ranks 0..12 represent 2..A. Card value: 2=0, 3=1, ..., A=12. So rank "value" = (c%13)+2
  const v = (c % 13) + 2;
  return v % 2 === 0;
}

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

function drawTwo(rng: () => number): [number, number] {
  const a = Math.floor(rng() * 52);
  let b = Math.floor(rng() * 52);
  if (b === a) b = (b + 1) % 52;
  return [a, b];
}

export function initialState(seed: number, _settings: EvenEvensSettings): EvenEvensState {
  return { rngSeed: seed, drawNumber: 0, pair: null, score: 0, phase: "ready", lastWin: false };
}

export function reducer(state: EvenEvensState, action: EvenEvensAction): EvenEvensState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const pair = drawTwo(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = isEvenRank(pair[0]) && isEvenRank(pair[1]);
    const drawNumber = state.drawNumber + 1;
    const score = state.score + (win ? 20 : 0);
    const isLast = drawNumber >= TOTAL_DRAWS;
    return { ...state, rngSeed: nextSeed, pair, score, phase: isLast ? "done" : "revealed", drawNumber, lastWin: win };
  }
  if (action.type === "next") {
    if (state.phase !== "revealed") return state;
    return { ...state, phase: "ready", pair: null };
  }
  return state;
}

export function isTerminal(state: EvenEvensState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
