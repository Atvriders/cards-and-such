import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DRAWS = 16;

export interface CardSnakeSettings { dummy: boolean; }

export interface CardSnakeState {
  rngSeed: number;
  drawn: number[];
  draws: number;
  currentRun: number;
  bestRun: number;
  score: number;
  phase: "drawing" | "done";
}

export type CardSnakeAction = { type: "draw" };

export function cardName(c: number): string {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits = ["♠","♥","♦","♣"];
  return ranks[c % 13]! + suits[Math.floor(c / 13)]!;
}
export function isRed(c: number): boolean { const s = Math.floor(c / 13); return s === 1 || s === 2; }

export function initialState(seed: number, _settings: CardSnakeSettings): CardSnakeState {
  return { rngSeed: seed, drawn: [], draws: 0, currentRun: 0, bestRun: 0, score: 0, phase: "drawing" };
}

export function reducer(state: CardSnakeState, action: CardSnakeAction): CardSnakeState {
  if (state.phase === "done") return state;
  if (action.type === "draw") {
    const rng = mulberry32(state.rngSeed);
    const c = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const last = state.drawn[state.drawn.length - 1];
    let currentRun: number;
    if (last === undefined) { currentRun = 1; }
    else if (isRed(c) !== isRed(last)) { currentRun = state.currentRun + 1; }
    else { currentRun = 1; }
    const bestRun = Math.max(state.bestRun, currentRun);
    const draws = state.draws + 1;
    const phase = draws >= TOTAL_DRAWS ? "done" : "drawing";
    const score = phase === "done" ? bestRun * 10 : state.score;
    return { ...state, rngSeed: nextSeed, drawn: [...state.drawn, c], draws, currentRun, bestRun, score, phase };
  }
  return state;
}

export function isTerminal(state: CardSnakeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
