import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Pickup: each round, roll 8 dice, target is a random face 1..6.
// Player taps each die that matches the target. +5 per correct pick. Submit advances round.

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 8;

export interface DicePickupSettings { dummy: boolean; }

export interface DicePickupState {
  rngSeed: number;
  round: number;
  target: number; // 1..6
  dice: number[]; // 8 face values
  picked: boolean[]; // 8 flags
  score: number;
  phase: "picking" | "result" | "done";
  lastPts: number;
}

export type DicePickupAction = { type: "pick"; index: number } | { type: "submit" } | { type: "next" };

export function initialState(seed: number, _settings: DicePickupSettings): DicePickupState {
  const rng = mulberry32(seed);
  const target = 1 + Math.floor(rng() * 6);
  const dice = Array.from({ length: DICE_COUNT }, () => 1 + Math.floor(rng() * 6));
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { rngSeed: nextSeed, round: 1, target, dice, picked: Array(DICE_COUNT).fill(false), score: 0, phase: "picking", lastPts: 0 };
}

export function reducer(state: DicePickupState, action: DicePickupAction): DicePickupState {
  if (state.phase === "done") return state;
  if (action.type === "pick") {
    if (state.phase !== "picking") return state;
    if (action.index < 0 || action.index >= state.dice.length) return state;
    const picked = [...state.picked];
    picked[action.index] = !picked[action.index];
    return { ...state, picked };
  }
  if (action.type === "submit") {
    if (state.phase !== "picking") return state;
    let pts = 0;
    for (let i = 0; i < state.dice.length; i++) {
      if (state.picked[i] && state.dice[i] === state.target) pts += 5;
      else if (state.picked[i] && state.dice[i] !== state.target) pts -= 2; // small penalty for wrong picks
    }
    pts = Math.max(0, pts);
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const rng = mulberry32(state.rngSeed);
    const target = 1 + Math.floor(rng() * 6);
    const dice = Array.from({ length: DICE_COUNT }, () => 1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    return { ...state, rngSeed: nextSeed, round: state.round + 1, target, dice, picked: Array(DICE_COUNT).fill(false), phase: "picking", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DicePickupState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
