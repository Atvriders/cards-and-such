import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Match Three Saga: match-3 with level objectives and combo multipliers.
// 6x6 grid, swap adjacent gems to match 3+. Each level has a target score.

export const COLS = 6;
export const ROWS = 6;
export const NUM_COLORS = 5;

export interface MatchThreeSagaSettings {
  levels: "3" | "5" | "7";
}

export type Cell = number | null;
export type Grid = Cell[][];

export interface MatchThreeSagaState {
  settings: MatchThreeSagaSettings;
  rngSeed: number;
  grid: Grid;
  score: number;
  level: number;
  maxLevels: number;
  targetScore: number;
  movesLeft: number;
  selected: [number, number] | null;
  comboChain: number;
  over: boolean;
  won: boolean;
  message: string;
}

export type MatchThreeSagaAction =
  | { type: "select"; row: number; col: number }
  | { type: "settle" };

function rngNext(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

function randomGem(rng: () => number): number {
  return Math.floor(rng() * NUM_COLORS);
}

function makeGrid(seed: number): { grid: Grid; nextSeed: number } {
  const rng = mulberry32(seed);
  let grid: Grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => randomGem(rng))
  );
  // Clear pre-existing matches
  for (let iter = 0; iter < 3; iter++) {
    const matched = findMatches(grid);
    if (matched.size === 0) break;
    for (const key of matched) {
      const [r, c] = key.split(",").map(Number);
      grid[r!]![c!] = randomGem(rng);
    }
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { grid, nextSeed };
}

function findMatches(grid: Grid): Set<string> {
  const matched = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 2; c++) {
      const v = grid[r]![c];
      if (v !== null && v === grid[r]![c + 1] && v === grid[r]![c + 2]) {
        matched.add(`${r},${c}`);
        matched.add(`${r},${c + 1}`);
        matched.add(`${r},${c + 2}`);
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 2; r++) {
      const v = grid[r]![c];
      if (v !== null && v === grid[r + 1]![c] && v === grid[r + 2]![c]) {
        matched.add(`${r},${c}`);
        matched.add(`${r + 1},${c}`);
        matched.add(`${r + 2},${c}`);
      }
    }
  }
  return matched;
}

function applyGravity(grid: Grid): Grid {
  const newGrid: Grid = grid.map((row) => [...row]);
  for (let c = 0; c < COLS; c++) {
    let bottom = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newGrid[r]![c] !== null) {
        newGrid[bottom]![c] = newGrid[r]![c]!;
        if (bottom !== r) newGrid[r]![c] = null;
        bottom--;
      }
    }
    while (bottom >= 0) {
      newGrid[bottom]![c] = null;
      bottom--;
    }
  }
  return newGrid;
}

function fillGrid(grid: Grid, seed: number): { grid: Grid; nextSeed: number } {
  const newGrid: Grid = grid.map((row) => [...row]);
  let s = seed;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newGrid[r]![c] === null) {
        const { val, next } = rngNext(s);
        s = next;
        newGrid[r]![c] = Math.floor(val * NUM_COLORS);
      }
    }
  }
  return { grid: newGrid, nextSeed: s };
}

function swap(grid: Grid, r1: number, c1: number, r2: number, c2: number): Grid {
  const newGrid: Grid = grid.map((row) => [...row]);
  const tmp: Cell = newGrid[r1]![c1] ?? null;
  newGrid[r1]![c1] = newGrid[r2]![c2] ?? null;
  newGrid[r2]![c2] = tmp;
  return newGrid;
}

function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

export function initialState(seed: number, settings: MatchThreeSagaSettings): MatchThreeSagaState {
  const maxLevels = parseInt(settings.levels, 10);
  const { grid, nextSeed } = makeGrid(seed);
  return {
    settings,
    rngSeed: nextSeed,
    grid,
    score: 0,
    level: 1,
    maxLevels,
    targetScore: 500,
    movesLeft: 20,
    selected: null,
    comboChain: 0,
    over: false,
    won: false,
    message: "Match 3 gems to score!",
  };
}

export function reducer(state: MatchThreeSagaState, action: MatchThreeSagaAction): MatchThreeSagaState {
  if (state.over) return state;

  switch (action.type) {
    case "select": {
      const { row, col } = action;
      if (!state.selected) {
        return { ...state, selected: [row, col] };
      }

      const [sr, sc] = state.selected;
      if (sr === row && sc === col) {
        return { ...state, selected: null };
      }

      if (!isAdjacent(sr, sc, row, col)) {
        return { ...state, selected: [row, col] };
      }

      // Attempt swap
      const swapped = swap(state.grid, sr, sc, row, col);
      const matches = findMatches(swapped);

      if (matches.size === 0) {
        // Invalid swap
        return { ...state, selected: null, message: "No match — try again!" };
      }

      // Clear matched cells
      const clearedGrid: Grid = swapped.map((r) => [...r]);
      for (const key of matches) {
        const [mr, mc] = key.split(",").map(Number);
        clearedGrid[mr!]![mc!] = null;
      }

      const comboChain = state.comboChain + 1;
      const scoreGained = matches.size * 10 * comboChain;
      const newScore = state.score + scoreGained;
      const newMovesLeft = state.movesLeft - 1;

      // Check level completion
      if (newScore >= state.targetScore) {
        const nextLevel = state.level + 1;
        if (nextLevel > state.maxLevels) {
          return {
            ...state,
            grid: clearedGrid,
            score: newScore,
            selected: null,
            over: true,
            won: true,
            message: "Congratulations! All levels cleared!",
          };
        }
        const { grid: newGrid, nextSeed } = makeGrid(state.rngSeed);
        return {
          ...state,
          rngSeed: nextSeed,
          grid: newGrid,
          score: newScore,
          level: nextLevel,
          targetScore: state.targetScore + 300 * nextLevel,
          movesLeft: 20,
          selected: null,
          comboChain: 0,
          message: `Level ${nextLevel}! Target: ${state.targetScore + 300 * nextLevel}`,
        };
      }

      const over = newMovesLeft <= 0 && newScore < state.targetScore;

      const withGravity = applyGravity(clearedGrid);
      const { grid: filledGrid, nextSeed } = fillGrid(withGravity, state.rngSeed);

      return {
        ...state,
        rngSeed: nextSeed,
        grid: filledGrid,
        score: newScore,
        movesLeft: newMovesLeft,
        selected: null,
        comboChain,
        over,
        won: false,
        message: matches.size >= 4
          ? `${matches.size} match! ${comboChain > 1 ? `x${comboChain} combo! ` : ""}+${scoreGained} pts`
          : `+${scoreGained} pts${comboChain > 1 ? ` (x${comboChain})` : ""}`,
      };
    }

    case "settle": {
      return state;
    }

    default:
      return state;
  }
}

export function isTerminal(state: MatchThreeSagaState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { findMatches };
