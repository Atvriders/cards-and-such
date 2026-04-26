import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CardPileTossSettings { rounds: "10" | "20"; }
export interface CardPileTossState {
  rngSeed: number; pile: number[]; score: number;
  round: number; maxRounds: number; phase: "aiming" | "result" | "gameover"; power: number; lastPts: number;
}
export type CardPileTossAction = { type: "setPower"; value: number } | { type: "toss" } | { type: "next" };

export function initialState(seed: number, settings: CardPileTossSettings): CardPileTossState {
  const rng = mulberry32(seed);
  const pile = Array.from({ length: 5 }, () => Math.floor(rng() * 52));
  return { rngSeed: Math.floor(rng() * 2 ** 31), pile, score: 0, round: 1, maxRounds: parseInt(settings.rounds, 10), phase: "aiming", power: 50, lastPts: 0 };
}

export function reducer(state: CardPileTossState, action: CardPileTossAction): CardPileTossState {
  if (state.phase === "gameover") return state;
  if (action.type === "setPower" && state.phase === "aiming") return { ...state, power: Math.max(0, Math.min(100, action.value)) };
  if (action.type === "toss" && state.phase === "aiming") {
    const rng = mulberry32(state.rngSeed);
    const newPile = Array.from({ length: 5 }, () => Math.floor(rng() * 52));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const target = 40 + Math.floor(rng() * 40);
    const diff = Math.abs(state.power - target);
    const pts = Math.max(0, 100 - diff * 2);
    const done = state.round >= state.maxRounds;
    return { ...state, pile: newPile, lastPts: pts, score: state.score + pts, rngSeed: nextSeed, phase: done ? "gameover" : "result" };
  }
  if (action.type === "next" && state.phase === "result") {
    return { ...state, round: state.round + 1, phase: "aiming" };
  }
  return state;
}

export function isTerminal(state: CardPileTossState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
