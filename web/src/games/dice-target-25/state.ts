import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Target 25: Roll up to 5 dice (with rerolls). Goal is to get a sum as close to 25 as possible.

export interface DiceTarget25Settings { dice: "3" | "5"; }

export interface DiceTarget25State {
  dice: number[];
  kept: boolean[];
  rollsLeft: number;
  target: number;
  score: number;
  round: number;
  maxRounds: number;
  phase: "rolling" | "scored" | "gameover";
  rngSeed: number;
}

export type DiceTarget25Action =
  | { type: "roll" }
  | { type: "toggle"; index: number }
  | { type: "score" }
  | { type: "next" };

export function initialState(seed: number, settings: DiceTarget25Settings): DiceTarget25State {
  const rng = mulberry32(seed);
  const numDice = parseInt(settings.dice, 10);
  const dice = Array.from({ length: numDice }, () => Math.floor(rng() * 6) + 1);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { dice, kept: Array(numDice).fill(false), rollsLeft: 2, target: 25, score: 0, round: 1, maxRounds: 5, phase: "rolling", rngSeed: nextSeed };
}

export function reducer(state: DiceTarget25State, action: DiceTarget25Action): DiceTarget25State {
  if (state.phase === "gameover") return state;
  if (action.type === "toggle") {
    if (state.phase !== "rolling" || state.rollsLeft === 2) return state; // can only keep after 1st roll
    const kept = state.kept.map((k, i) => i === action.index ? !k : k);
    return { ...state, kept };
  }
  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.rollsLeft <= 0) return state;
    const rng = mulberry32(state.rngSeed);
    const dice = state.dice.map((d, i) => state.kept[i] ? d : Math.floor(rng() * 6) + 1);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const rollsLeft = state.rollsLeft - 1;
    return { ...state, dice, rollsLeft, rngSeed: nextSeed };
  }
  if (action.type === "score") {
    if (state.phase !== "rolling") return state;
    const sum = state.dice.reduce((a, b) => a + b, 0);
    const diff = Math.abs(sum - state.target);
    const pts = Math.max(0, 50 - diff * 5);
    return { ...state, score: state.score + pts, phase: "scored" };
  }
  if (action.type === "next") {
    if (state.phase !== "scored") return state;
    const nextRound = state.round + 1;
    if (nextRound > state.maxRounds) return { ...state, phase: "gameover" };
    const rng = mulberry32(state.rngSeed);
    const numDice = state.dice.length;
    const dice = Array.from({ length: numDice }, () => Math.floor(rng() * 6) + 1);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, dice, kept: Array(numDice).fill(false), rollsLeft: 2, round: nextRound, phase: "rolling", rngSeed: nextSeed };
  }
  return state;
}

export function isTerminal(state: DiceTarget25State): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
