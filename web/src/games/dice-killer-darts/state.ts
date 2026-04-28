import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 20;
export const DIE_COUNT = 3;
export const START_LIVES = 5;

export interface DiceKillerDartsSettings { dummy: boolean; }

export interface DiceKillerDartsState {
  rngSeed: number;
  round: number;
  dice: number[] | null;
  score: number;
  lives: number;
  lastPts: number;
  hit: boolean;
  phase: "rolling" | "rolled" | "done";
}

export type DiceKillerDartsAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceKillerDartsSettings): DiceKillerDartsState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, lives: START_LIVES, lastPts: 0, hit: false, phase: "rolling" };
}

export function reducer(state: DiceKillerDartsState, action: DiceKillerDartsAction): DiceKillerDartsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const dice: number[] = [];
    for (let i = 0; i < DIE_COUNT; i++) dice.push(1 + Math.floor(rng() * 6));
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = dice.reduce((a, b) => a + b, 0);
    const hit = dice.includes(6);
    let newScore = state.score;
    let newLives = state.lives;
    let pts = 0;
    if (hit) {
      newLives = state.lives - 1;
    } else {
      pts = sum;
      newScore = state.score + sum;
    }
    const dead = newLives <= 0;
    const isLast = state.round >= TOTAL_ROUNDS || dead;
    return { ...state, rngSeed: nextSeed, dice, score: newScore, lives: Math.max(0, newLives), lastPts: pts, hit, phase: isLast ? "done" : "rolled" };
  }
  if (action.type === "next") {
    if (state.phase !== "rolled") return state;
    return { ...state, round: state.round + 1, dice: null, lastPts: 0, hit: false, phase: "rolling" };
  }
  return state;
}

export function isTerminal(state: DiceKillerDartsState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score + state.lives * 20 };
}
