import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Archery: roll 2 dice, combine to aim at a bullseye target.
// Difference of dice = ring hit (0=bullseye, 1-5=outer rings).
// Score based on how close to center.

export interface DiceArcheryState {
  rngSeed: number;
  arrowsRemaining: number;
  lastRoll: [number, number] | null;
  lastRing: number | null;  // 0=bullseye, 5=miss
  score: number;
  gameOver: boolean;
}

export type DiceArcheryAction = { type: "shoot" };

const RING_SCORE = [100, 80, 60, 40, 20, 0]; // ring 0..5

export function initialState(seed: number): DiceArcheryState {
  return {
    rngSeed: seed,
    arrowsRemaining: 6,
    lastRoll: null,
    lastRing: null,
    score: 0,
    gameOver: false,
  };
}

export function reducer(state: DiceArcheryState, action: DiceArcheryAction): DiceArcheryState {
  if (state.gameOver) return state;
  if (action.type !== "shoot") return state;
  const rng = mulberry32(state.rngSeed);
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const diff = Math.abs(d1 - d2);
  const ring = Math.min(diff, 5);
  const pts = RING_SCORE[ring] ?? 0;
  const arrowsRemaining = state.arrowsRemaining - 1;
  const gameOver = arrowsRemaining <= 0;
  return {
    ...state,
    rngSeed: nextSeed,
    arrowsRemaining,
    lastRoll: [d1, d2],
    lastRing: ring,
    score: state.score + pts,
    gameOver,
  };
}

export function isTerminal(state: DiceArcheryState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
