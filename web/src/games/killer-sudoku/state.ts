import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { KILLER_PUZZLES } from "./puzzles.js";
import type { KillerPuzzle } from "./puzzles.js";

export interface KillerSudokuSettings {
  difficulty: "easy" | "medium";
}

export interface KillerSudokuState {
  puzzle: KillerPuzzle;
  /** Player's current entries. 0 = empty. */
  current: number[];
  selected: number | null;
  errorCells: number[];
  movesMade: number;
  won: boolean;
  settings: KillerSudokuSettings;
}

export type KillerSudokuAction =
  | { type: "select"; index: number | null }
  | { type: "enter"; digit: number };

export function computeErrors(current: number[], puzzle: KillerPuzzle): number[] {
  const errors = new Set<number>();

  // Row/col/box uniqueness (same as Sudoku)
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number>();
    for (let c = 0; c < 9; c++) {
      const idx = r * 9 + c;
      const v = current[idx]!;
      if (!v) continue;
      if (seen.has(v)) { errors.add(seen.get(v)!); errors.add(idx); }
      else seen.set(v, idx);
    }
  }
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number>();
    for (let r = 0; r < 9; r++) {
      const idx = r * 9 + c;
      const v = current[idx]!;
      if (!v) continue;
      if (seen.has(v)) { errors.add(seen.get(v)!); errors.add(idx); }
      else seen.set(v, idx);
    }
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Map<number, number>();
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const idx = (br * 3 + dr) * 9 + (bc * 3 + dc);
          const v = current[idx]!;
          if (!v) continue;
          if (seen.has(v)) { errors.add(seen.get(v)!); errors.add(idx); }
          else seen.set(v, idx);
        }
      }
    }
  }

  // Cage constraints: no repeats within cage, and if all filled, must equal sum
  for (const cage of puzzle.cages) {
    const indices = cage.cells.map(([r, c]) => r * 9 + c);
    const values = indices.map((i) => current[i]!).filter(Boolean);
    // No repeats within cage
    const cageSeen = new Map<number, number>();
    for (const idx of indices) {
      const v = current[idx]!;
      if (!v) continue;
      if (cageSeen.has(v)) { errors.add(cageSeen.get(v)!); errors.add(idx); }
      else cageSeen.set(v, idx);
    }
    // Sum violation if all filled
    if (values.length === cage.cells.length) {
      const total = values.reduce((a, b) => a + b, 0);
      if (total !== cage.sum) indices.forEach((i) => errors.add(i));
    }
  }

  return [...errors];
}

export function initialState(seed: number, settings: KillerSudokuSettings): KillerSudokuState {
  const rng = mulberry32(seed);
  const pool = KILLER_PUZZLES.filter((p) => p.difficulty === settings.difficulty);
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    puzzle,
    current: new Array(81).fill(0),
    selected: null,
    errorCells: [],
    movesMade: 0,
    won: false,
    settings,
  };
}

export function reducer(state: KillerSudokuState, action: KillerSudokuAction): KillerSudokuState {
  switch (action.type) {
    case "select":
      return { ...state, selected: action.index };
    case "enter": {
      const { selected } = state;
      if (selected === null) return state;
      const digit = Math.max(0, Math.min(9, action.digit));
      const next = state.current.slice();
      next[selected] = digit;
      const errorCells = computeErrors(next, state.puzzle);
      const won =
        errorCells.length === 0 &&
        next.every((v) => v !== 0) &&
        next.every((v, i) => v === state.puzzle.solution[i]);
      return { ...state, current: next, errorCells, movesMade: state.movesMade + 1, won };
    }
    default:
      return state;
  }
}

export function isTerminal(state: KillerSudokuState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 5) };
}
