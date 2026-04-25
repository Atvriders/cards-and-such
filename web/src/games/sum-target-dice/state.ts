import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Sum Target: Roll 3 dice. Target is announced before roll.
// Score = 50 if you exactly match target, else max(0, 30 - |sum - target|*5).
// 8 rounds with different targets.

export interface SumTargetSettings {
  rounds: "5" | "8" | "12";
}

export interface SumTargetState {
  round: number;
  maxRounds: number;
  target: number;
  dice: [number, number, number];
  held: [boolean, boolean, boolean];
  rerollsLeft: number;
  rolledOnce: boolean;
  roundScore: number;
  totalScore: number;
  phase: "rolling" | "scored" | "gameover";
  rngSeed: number;
}

export type SumTargetAction =
  | { type: "roll" }
  | { type: "toggleHold"; idx: 0 | 1 | 2 }
  | { type: "score" }
  | { type: "next" };

function makeTarget(rng: () => number): number {
  return Math.floor(rng() * 12) + 5; // targets 5-16
}

function rollDice(rng: () => number, held: [boolean, boolean, boolean], prev: [number, number, number]): [number, number, number] {
  return [
    held[0] ? prev[0] : Math.floor(rng() * 6) + 1,
    held[1] ? prev[1] : Math.floor(rng() * 6) + 1,
    held[2] ? prev[2] : Math.floor(rng() * 6) + 1,
  ];
}

export function initialState(seed: number, settings: SumTargetSettings): SumTargetState {
  const rng = mulberry32(seed);
  const target = makeTarget(rng);
  const dice: [number, number, number] = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
  return {
    round: 1, maxRounds: parseInt(settings.rounds, 10),
    target, dice, held: [false, false, false], rerollsLeft: 2,
    rolledOnce: true, roundScore: 0, totalScore: 0,
    phase: "rolling", rngSeed: Math.floor(rng() * 2 ** 31),
  };
}

export function reducer(state: SumTargetState, action: SumTargetAction): SumTargetState {
  if (state.phase === "gameover") return state;
  if (action.type === "toggleHold") {
    if (state.rerollsLeft === 0) return state;
    const held: [boolean, boolean, boolean] = [...state.held] as [boolean, boolean, boolean];
    held[action.idx] = !held[action.idx];
    return { ...state, held };
  }
  if (action.type === "roll") {
    if (state.rerollsLeft === 0) return state;
    const rng = mulberry32(state.rngSeed);
    const dice = rollDice(rng, state.held, state.dice);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, dice, rerollsLeft: state.rerollsLeft - 1, held: [false, false, false], rngSeed: nextSeed };
  }
  if (action.type === "score") {
    if (state.phase !== "rolling") return state;
    const sum = state.dice[0] + state.dice[1] + state.dice[2];
    const diff = Math.abs(sum - state.target);
    const pts = diff === 0 ? 50 : Math.max(0, 30 - diff * 5);
    const totalScore = state.totalScore + pts;
    const phase = state.round >= state.maxRounds ? "gameover" : "scored";
    return { ...state, roundScore: pts, totalScore, phase };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const rng = mulberry32(state.rngSeed);
    const target = makeTarget(rng);
    const dice: [number, number, number] = [Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1, Math.floor(rng() * 6) + 1];
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, round: state.round + 1, target, dice, held: [false, false, false], rerollsLeft: 2, rolledOnce: true, roundScore: 0, phase: "rolling", rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: SumTargetState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.totalScore } : null;
}
