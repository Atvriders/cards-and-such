import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Odd-Odds: 12 rounds. Each round draw 2 cards. If both are ODD ranks, +20.
// Odd ranks: 3,5,7,9,J,K,A (rank values 3,5,7,9,11,13,14 — A is 14 which is even, so:)
// We treat: 3,5,7,9,J,K as odd values (3,5,7,9,11,13). A=14 is even.

export const TOTAL_DRAWS = 12;

export interface OddOddsSettings { dummy: boolean; }

export interface OddOddsState {
  rngSeed: number;
  drawNumber: number;
  pair: [number, number] | null;
  score: number;
  phase: "ready" | "revealed" | "done";
  lastWin: boolean;
}

export type OddOddsAction = { type: "draw" } | { type: "next" };

export function isOddRank(c: number): boolean {
  const v = (c % 13) + 2; // 2..14
  return v % 2 === 1;
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

export function initialState(seed: number, _settings: OddOddsSettings): OddOddsState {
  return { rngSeed: seed, drawNumber: 0, pair: null, score: 0, phase: "ready", lastWin: false };
}

export function reducer(state: OddOddsState, action: OddOddsAction): OddOddsState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    if (state.phase !== "ready") return state;
    const rng = mulberry32(state.rngSeed);
    const pair = drawTwo(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const win = isOddRank(pair[0]) && isOddRank(pair[1]);
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

export function isTerminal(state: OddOddsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
