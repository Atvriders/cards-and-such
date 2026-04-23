import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Snakes Race — simple 2-player dice race on a 20-square track.
// Roll 2d6 each turn, advance your token. Some squares are snake heads that send you back.
// First to reach or pass square 20 wins.

export const FINISH = 20;
export const NUM_SQUARES = FINISH + 1; // 0..20

export interface SnakesRaceSettings { dummy: boolean }

export interface SnakesRaceState {
  settings: SnakesRaceSettings;
  rngSeed: number;
  snakeSquares: readonly number[]; // squares that are snake heads (send back to 1)
  positions: readonly number[];    // [human, bot]
  dice: readonly number[];         // last roll [d1, d2]
  currentPlayer: number;
  phase: "rolling" | "result";
  winner: number | null;
}

export type SnakesRaceAction =
  | { type: "roll" }
  | { type: "confirm" };

function generateSnakes(rng: () => number): number[] {
  // Pick 4 snake squares from range 3..18 (not 0,1,2 or finish)
  const pool: number[] = Array.from({ length: 16 }, (_, i) => i + 3);
  const snakes: number[] = [];
  while (snakes.length < 4 && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    snakes.push(pool[idx]!);
    pool.splice(idx, 1);
  }
  return snakes.sort((a, b) => a - b);
}

export function initialState(seed: number, settings: SnakesRaceSettings): SnakesRaceState {
  const rng = mulberry32(seed);
  const snakeSquares = generateSnakes(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    rngSeed: nextSeed,
    snakeSquares,
    positions: [0, 0],
    dice: [],
    currentPlayer: 0,
    phase: "rolling",
    winner: null,
  };
}

function rollD6(rng: () => number): number {
  return Math.floor(rng() * 6) + 1;
}

function applySnake(pos: number, snakes: readonly number[]): number {
  if (snakes.includes(pos)) return 1; // bitten — go back to square 1
  return pos;
}

function advanceBot(state: SnakesRaceState): SnakesRaceState {
  if (state.currentPlayer !== 1 || state.winner !== null) return state;
  const rng = mulberry32(state.rngSeed);
  const d1 = rollD6(rng);
  const d2 = rollD6(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const pos = [...state.positions];
  pos[1] = Math.min(FINISH, pos[1]! + d1 + d2);
  pos[1] = applySnake(pos[1]!, state.snakeSquares);
  const winner = pos[1]! >= FINISH ? 1 : null;
  return {
    ...state,
    rngSeed: nextSeed,
    positions: pos,
    dice: [d1, d2],
    winner,
    currentPlayer: winner !== null ? 1 : 0,
    phase: "rolling",
  };
}

export function reducer(state: SnakesRaceState, action: SnakesRaceAction): SnakesRaceState {
  if (state.winner !== null) return state;

  if (action.type === "roll" && state.phase === "rolling" && state.currentPlayer === 0) {
    const rng = mulberry32(state.rngSeed);
    const d1 = rollD6(rng);
    const d2 = rollD6(rng);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pos = [...state.positions];
    pos[0] = Math.min(FINISH, pos[0]! + d1 + d2);
    pos[0] = applySnake(pos[0]!, state.snakeSquares);
    const winner = pos[0]! >= FINISH ? 0 : null;
    return {
      ...state,
      rngSeed: nextSeed,
      positions: pos,
      dice: [d1, d2],
      phase: "result",
      winner,
      currentPlayer: winner !== null ? 0 : 1,
    };
  }

  if (action.type === "confirm" && state.phase === "result") {
    if (state.winner !== null) return state;
    // Bot takes its turn
    const botState = { ...state, currentPlayer: 1, phase: "rolling" as const };
    const afterBot = advanceBot(botState);
    return afterBot;
  }

  return state;
}

export function isTerminal(state: SnakesRaceState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
