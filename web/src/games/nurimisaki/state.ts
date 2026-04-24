import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { NurimisakiPuzzle } from "./puzzles.js";

export type { NurimisakiPuzzle };

export interface NurimisakiSettings {
  difficulty: "easy" | "hard";
}

// 0=unknown, 1=white, 2=black
export interface NurimisakiState {
  settings: NurimisakiSettings;
  puzzle: NurimisakiPuzzle;
  cells: number[];
  won: boolean;
  moves: number;
}

export type NurimisakiAction =
  | { type: "toggleCell"; idx: number }
  | { type: "reset" };

const DIRS: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];

export function getWhiteNeighbours(cells: number[], size: number, r: number, c: number): number[] {
  const result: number[] = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
    if (cells[nr * size + nc] === 1) result.push(nr * size + nc);
  }
  return result;
}

export function checkWon(puzzle: NurimisakiPuzzle, cells: number[]): boolean {
  const { size, solution } = puzzle;
  if (cells.some(v => v === 0)) return false;
  // cells must match solution
  for (let i = 0; i < size * size; i++) {
    if ((cells[i] === 1) !== solution[i]) return false;
  }
  return true;
}

export function initialState(seed: number, settings: NurimisakiSettings): NurimisakiState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return {
    settings,
    puzzle,
    cells: new Array(puzzle.size * puzzle.size).fill(0),
    won: false,
    moves: 0,
  };
}

export function reducer(state: NurimisakiState, action: NurimisakiAction): NurimisakiState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggleCell": {
      const { idx } = action;
      // Clue cells must remain white — don't allow blackening them
      if (state.puzzle.clues[idx] !== null && state.cells[idx] !== 2) {
        // cycle: unknown->white only for clue cells
        const cells = state.cells.slice();
        cells[idx] = (cells[idx] ?? 0) === 0 ? 1 : 0;
        return { ...state, cells, moves: state.moves + 1 };
      }
      const cells = state.cells.slice();
      cells[idx] = ((cells[idx] ?? 0) + 1) % 3;
      const won = checkWon(state.puzzle, cells);
      return { ...state, cells, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        cells: new Array(state.puzzle.size * state.puzzle.size).fill(0),
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: NurimisakiState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 3) };
}
