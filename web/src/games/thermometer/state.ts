import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { ThermometerPuzzle } from "./puzzles.js";
export type { ThermometerPuzzle };

export interface ThermometerSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface ThermometerState {
  settings: ThermometerSettings;
  puzzle: ThermometerPuzzle;
  /** filled[r*cols+c] = true if mercury fills that cell */
  filled: boolean[];
  won: boolean;
  moves: number;
}

export type ThermometerAction =
  | { type: "setTherm"; thermIdx: number; fillCount: number }
  | { type: "reset" };

/**
 * Set how many cells of a thermometer are filled (from bulb).
 * fillCount=0 means empty, fillCount=therm.cells.length means fully filled.
 */
export function applyThermFill(
  puzzle: ThermometerPuzzle,
  filled: boolean[],
  thermIdx: number,
  fillCount: number
): boolean[] {
  const newFilled = filled.slice();
  const therm = puzzle.thermometers[thermIdx]!;
  for (let i = 0; i < therm.cells.length; i++) {
    const [r, c] = therm.cells[i]!;
    newFilled[r * puzzle.cols + c] = i < fillCount;
  }
  return newFilled;
}

export function checkWon(puzzle: ThermometerPuzzle, filled: boolean[]): boolean {
  const { rows, cols, rowClues, colClues } = puzzle;
  for (let r = 0; r < rows; r++) {
    let count = 0;
    for (let c = 0; c < cols; c++) {
      if (filled[r * cols + c]) count++;
    }
    if (count !== rowClues[r]) return false;
  }
  for (let c = 0; c < cols; c++) {
    let count = 0;
    for (let r = 0; r < rows; r++) {
      if (filled[r * cols + c]) count++;
    }
    if (count !== colClues[c]) return false;
  }
  return true;
}

export function initialState(seed: number, settings: ThermometerSettings): ThermometerState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    filled: new Array(puzzle.rows * puzzle.cols).fill(false),
    won: false,
    moves: 0,
  };
}

export function reducer(state: ThermometerState, action: ThermometerAction): ThermometerState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "setTherm": {
      const { thermIdx, fillCount } = action;
      const newFilled = applyThermFill(state.puzzle, state.filled, thermIdx, fillCount);
      const won = checkWon(state.puzzle, newFilled);
      return { ...state, filled: newFilled, won, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, filled: new Array(state.puzzle.rows * state.puzzle.cols).fill(false), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: ThermometerState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
