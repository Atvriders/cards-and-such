import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { generateSolution, removeClues, CELLS_TO_REMOVE } from "./puzzles.js";

export type Cell = number; // 0 = empty, 1-9 = filled

export interface SudokuSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface SudokuState {
  given: readonly Cell[];      // length 81; givens are non-zero, player can't change
  solution: readonly Cell[];   // length 81; the full solved board used for hints
  current: readonly Cell[];    // length 81; player's entries + givens
  selected: number | null;     // 0..80 (index into the grid), or null
  errorCells: readonly number[]; // indices that currently violate a rule
  movesMade: number;
  hintsUsed: number;
  won: boolean;
  settings: SudokuSettings;
}

export type SudokuAction =
  | { type: "select"; index: number | null }
  | { type: "enter"; digit: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | { type: "hint" };

/** Compute which cells are in conflict (duplicate digit in same row/col/box). */
export function computeErrorCells(current: readonly Cell[]): readonly number[] {
  const errors = new Set<number>();

  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number>(); // digit -> first index
    for (let c = 0; c < 9; c++) {
      const idx = r * 9 + c;
      const val = current[idx]!;
      if (val === 0) continue;
      if (seen.has(val)) {
        errors.add(seen.get(val)!);
        errors.add(idx);
      } else {
        seen.set(val, idx);
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number>();
    for (let r = 0; r < 9; r++) {
      const idx = r * 9 + c;
      const val = current[idx]!;
      if (val === 0) continue;
      if (seen.has(val)) {
        errors.add(seen.get(val)!);
        errors.add(idx);
      } else {
        seen.set(val, idx);
      }
    }
  }

  // 3×3 boxes
  for (let boxR = 0; boxR < 3; boxR++) {
    for (let boxC = 0; boxC < 3; boxC++) {
      const seen = new Map<number, number>();
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const r = boxR * 3 + dr;
          const c = boxC * 3 + dc;
          const idx = r * 9 + c;
          const val = current[idx]!;
          if (val === 0) continue;
          if (seen.has(val)) {
            errors.add(seen.get(val)!);
            errors.add(idx);
          } else {
            seen.set(val, idx);
          }
        }
      }
    }
  }

  return [...errors];
}

function checkWon(current: readonly Cell[], errorCells: readonly number[]): boolean {
  if (errorCells.length !== 0) return false;
  return current.every((v) => v !== 0);
}

export function initialState(seed: number, settings: SudokuSettings): SudokuState {
  const rng = mulberry32(seed);
  const solution = generateSolution(rng);
  const toRemove = CELLS_TO_REMOVE[settings.difficulty];
  const given = removeClues(solution, toRemove, rng);
  const current = given.slice();

  return {
    given,
    solution,
    current,
    selected: null,
    errorCells: [],
    movesMade: 0,
    hintsUsed: 0,
    won: false,
    settings,
  };
}

export function reducer(state: SudokuState, action: SudokuAction): SudokuState {
  switch (action.type) {
    case "select": {
      return { ...state, selected: action.index };
    }

    case "enter": {
      const { selected } = state;
      if (selected === null) return state;
      if (state.given[selected] !== 0) return state; // can't overwrite givens

      const newCurrent = state.current.slice();
      newCurrent[selected] = action.digit;

      const errorCells = computeErrorCells(newCurrent);
      const won = checkWon(newCurrent, errorCells);

      return {
        ...state,
        current: newCurrent,
        errorCells,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    case "hint": {
      // Find the first empty non-given cell and fill with the solution's digit.
      // Each hint counts as extra moves. No limit in v1.
      const idx = state.current.findIndex((v, i) => v === 0 && state.given[i] === 0);
      if (idx === -1) return state; // nothing to hint

      const newCurrent = state.current.slice();
      newCurrent[idx] = state.solution[idx]!;

      const errorCells = computeErrorCells(newCurrent);
      const won = checkWon(newCurrent, errorCells);

      return {
        ...state,
        current: newCurrent,
        errorCells,
        selected: idx,
        hintsUsed: state.hintsUsed + 1,
        movesMade: state.movesMade + 1,
        won,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SudokuState): { score: number } | null {
  if (!state.won) return null;
  const score = Math.max(100, 1000 - state.movesMade * 5 - state.hintsUsed * 50);
  return { score };
}
