import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_HARD } from "./puzzles.js";
import type { YajilinPuzzle } from "./puzzles.js";

export type { YajilinPuzzle };
export type { Dir } from "./puzzles.js";

export interface YajilinSettings {
  difficulty: "easy" | "hard";
}

export type CellState = "empty" | "shaded" | "loop";

export interface YajilinState {
  settings: YajilinSettings;
  puzzle: YajilinPuzzle;
  /** Per-cell player mark */
  cells: CellState[];
  won: boolean;
  moves: number;
}

export type YajilinAction =
  | { type: "clickCell"; idx: number }
  | { type: "reset" };

/** Check if player's cell marks match the solution */
export function checkWon(puzzle: YajilinPuzzle, cells: CellState[]): boolean {
  const clueSet = new Set(puzzle.clues.map(c => c.idx));
  for (let i = 0; i < cells.length; i++) {
    if (clueSet.has(i)) continue; // clue cells don't count
    const shouldBeShaded = puzzle.shadedSolution[i]!;
    const shouldBeLoop = puzzle.loopSolution.includes(i);
    if (shouldBeShaded && cells[i] !== "shaded") return false;
    if (shouldBeLoop && cells[i] !== "loop") return false;
    if (!shouldBeShaded && !shouldBeLoop && cells[i] !== "empty") return false;
  }
  return true;
}

export function initialState(seed: number, settings: YajilinSettings): YajilinState {
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

export function reducer(state: YajilinState, action: YajilinAction): YajilinState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "clickCell": {
      const { idx } = action;
      // Clue cells can't be clicked
      if (state.puzzle.clues.some(c => c.idx === idx)) return state;
      const newCells = state.cells.slice() as CellState[];
      const cur = newCells[idx]!;
      // Cycle: empty → loop → shaded → empty
      newCells[idx] = cur === "empty" ? "loop" : cur === "loop" ? "shaded" : "empty";
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

export function isTerminal(state: YajilinState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 4) };
}
