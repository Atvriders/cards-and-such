import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_HARD } from "./puzzles.js";
import type { AquariumPuzzle } from "./puzzles.js";

export type { AquariumPuzzle };

export interface AquariumSettings {
  difficulty: "easy" | "hard";
}

export type CellState = "empty" | "water" | "x";

export interface AquariumState {
  settings: AquariumSettings;
  puzzle: AquariumPuzzle;
  cells: CellState[];
  won: boolean;
  moves: number;
}

export type AquariumAction =
  | { type: "clickCell"; idx: number }
  | { type: "reset" };

export function checkWon(puzzle: AquariumPuzzle, cells: CellState[]): boolean {
  for (let i = 0; i < cells.length; i++) {
    const shouldBeFilled = puzzle.solution[i]!;
    if (shouldBeFilled && cells[i] !== "water") return false;
    if (!shouldBeFilled && cells[i] === "water") return false;
  }
  return true;
}

export function countWaterInRow(cells: CellState[], size: number, row: number): number {
  let count = 0;
  for (let c = 0; c < size; c++) if (cells[row * size + c] === "water") count++;
  return count;
}

export function countWaterInCol(cells: CellState[], size: number, col: number): number {
  let count = 0;
  for (let r = 0; r < size; r++) if (cells[r * size + col] === "water") count++;
  return count;
}

export function initialState(seed: number, settings: AquariumSettings): AquariumState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_HARD;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    cells: new Array(puzzle.size * puzzle.size).fill("empty") as CellState[],
    won: false,
    moves: 0,
  };
}

export function reducer(state: AquariumState, action: AquariumAction): AquariumState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "clickCell": {
      const newCells = state.cells.slice() as CellState[];
      const cur = newCells[action.idx]!;
      newCells[action.idx] = cur === "empty" ? "water" : cur === "water" ? "x" : "empty";
      const won = checkWon(state.puzzle, newCells);
      return { ...state, cells: newCells, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        cells: new Array(state.puzzle.size * state.puzzle.size).fill("empty") as CellState[],
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: AquariumState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 4) };
}
