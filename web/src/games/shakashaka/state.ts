import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM } from "./puzzles.js";
import type { ShakaPuzzle, TriangleDir } from "./puzzles.js";

export type { ShakaPuzzle, TriangleDir };

export interface ShakaSettings {
  difficulty: "easy" | "medium";
}

export interface ShakaState {
  settings: ShakaSettings;
  puzzle: ShakaPuzzle;
  /** Player-placed triangles; undefined = not placed */
  triangles: (TriangleDir | null | undefined)[];
  selectedDir: TriangleDir;
  won: boolean;
  moves: number;
}

export type ShakaAction =
  | { type: "selectDir"; dir: TriangleDir }
  | { type: "placeTri"; idx: number }
  | { type: "clearTri"; idx: number }
  | { type: "reset" };

export const ALL_DIRS: TriangleDir[] = ["TL", "TR", "BL", "BR"];

/** Count triangles adjacent to a black cell (4-dir) */
export function countAdjacentTriangles(puzzle: ShakaPuzzle, triangles: (TriangleDir | null | undefined)[], r: number, c: number): number {
  const { rows, cols } = puzzle;
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]] as const;
  let count = 0;
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
    const t = triangles[nr * cols + nc];
    if (t !== null && t !== undefined) count++;
  }
  return count;
}

export function checkWon(puzzle: ShakaPuzzle, triangles: (TriangleDir | null | undefined)[]): boolean {
  const { rows, cols, grid, solution } = puzzle;
  // Must exactly match solution
  for (let i = 0; i < rows * cols; i++) {
    if (grid[i] !== null) continue; // skip black cells
    const placed = triangles[i] === undefined ? null : triangles[i];
    if (placed !== solution[i]) return false;
  }
  // Numbered black cells: check adjacency count
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = grid[r * cols + c];
      if (v !== null && v !== undefined && v >= 0) { // numbered black cell
        if (countAdjacentTriangles(puzzle, triangles, r, c) !== v) return false;
      }
    }
  }
  return true;
}

export function initialState(seed: number, settings: ShakaSettings): ShakaState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_MEDIUM;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    triangles: new Array(puzzle.rows * puzzle.cols).fill(undefined),
    selectedDir: "TL",
    won: false,
    moves: 0,
  };
}

export function reducer(state: ShakaState, action: ShakaAction): ShakaState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "selectDir":
      return { ...state, selectedDir: action.dir };
    case "placeTri": {
      const { idx } = action;
      if (state.puzzle.grid[idx] !== null) return state; // black cell
      const newTris = state.triangles.slice();
      newTris[idx] = state.selectedDir;
      const won = checkWon(state.puzzle, newTris);
      return { ...state, triangles: newTris, won, moves: state.moves + 1 };
    }
    case "clearTri": {
      const { idx } = action;
      if (state.puzzle.grid[idx] !== null) return state;
      const newTris = state.triangles.slice();
      newTris[idx] = undefined;
      return { ...state, triangles: newTris, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        triangles: new Array(state.puzzle.rows * state.puzzle.cols).fill(undefined),
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: ShakaState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 10) };
}
