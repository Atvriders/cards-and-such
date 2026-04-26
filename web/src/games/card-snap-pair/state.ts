import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardSnapPairSettings { rounds: "10" | "20"; }
export interface CardSnapPairState {
  rngSeed: number; card1: number | null; card2: number | null; score: number;
  round: number; maxRounds: number; phase: "waiting" | "revealed" | "gameover"; matched: boolean;
}
export type CardSnapPairAction = { type: "snap" } | { type: "next" };

export function rankName(c: number): string { return ["2","3","4","5","6","7","8","9","10","J","Q","K","A"][c % 13]!; }
export function suitName(c: number): string { return ["♠","♥","♦","♣"][Math.floor(c / 13)]!; }

export function initialState(seed: number, settings: CardSnapPairSettings): CardSnapPairState {
  const rng = mulberry32(seed);
  return { rngSeed: Math.floor(rng() * 2 ** 31), card1: null, card2: null, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "waiting", matched: false };
}

export function reducer(state: CardSnapPairState, action: CardSnapPairAction): CardSnapPairState {
  if (state.phase === "gameover") return state;
  if (action.type === "snap" && state.phase === "waiting") {
    const rng = mulberry32(state.rngSeed);
    const c1 = Math.floor(rng() * 52);
    const c2 = Math.floor(rng() * 52);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const matched = (c1 % 13) === (c2 % 13);
    const pts = matched ? 20 : 5;
    const done = state.round >= state.maxRounds;
    return { ...state, card1: c1, card2: c2, matched, score: state.score + pts, rngSeed: nextSeed, phase: done ? "gameover" : "revealed" };
  }
  if (action.type === "next" && state.phase === "revealed") {
    return { ...state, card1: null, card2: null, matched: false, round: state.round + 1, phase: "waiting" };
  }
  return state;
}

export function isTerminal(state: CardSnapPairState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
