import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Dice Darts: classic 301 darts using dice.
// Roll 3 dice per turn, sum is your score reduction.
// Start at 301, count down to exactly 0.
// Must end on exact 0 (no busting below).

export interface DiceDartsState {
  rngSeed: number;
  score: number;       // starts at 301, count down
  turns: number;
  lastRoll: [number, number, number] | null;
  lastSum: number | null;
  busted: boolean;
  gameOver: boolean;
}

export type DiceDartsAction = { type: "throw" };

export function initialState(seed: number): DiceDartsState {
  return {
    rngSeed: seed,
    score: 301,
    turns: 0,
    lastRoll: null,
    lastSum: null,
    busted: false,
    gameOver: false,
  };
}

export function reducer(state: DiceDartsState, action: DiceDartsAction): DiceDartsState {
  if (state.gameOver) return state;
  if (action.type !== "throw") return state;
  const rng = mulberry32(state.rngSeed);
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  const d3 = Math.floor(rng() * 6) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const sum = d1 + d2 + d3;
  const newScore = state.score - sum;
  const busted = newScore < 0;
  const gameOver = newScore === 0;
  return {
    ...state,
    rngSeed: nextSeed,
    score: busted ? state.score : newScore,
    turns: state.turns + 1,
    lastRoll: [d1, d2, d3],
    lastSum: sum,
    busted,
    gameOver,
  };
}

export function isTerminal(state: DiceDartsState): { score: number } | null {
  if (!state.gameOver) return null;
  // Fewer turns = higher score
  return { score: Math.max(0, 1000 - state.turns * 50) };
}
