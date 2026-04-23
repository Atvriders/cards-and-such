import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { NumberlinkPuzzle } from "./puzzles.js";
export type { NumberlinkPuzzle };

export interface NumberlinkSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface NumberlinkState {
  settings: NumberlinkSettings;
  puzzle: NumberlinkPuzzle;
  /** Player's path assignment: paths[idx] = color or 0 */
  paths: number[];
  won: boolean;
  moves: number;
}

export type NumberlinkAction =
  | { type: "setPath"; idx: number; color: number }
  | { type: "clearPath"; color: number }
  | { type: "reset" };

export function checkWon(puzzle: NumberlinkPuzzle, paths: number[]): boolean {
  const { size, endpoints } = puzzle;
  // Every cell must be filled
  for (let i = 0; i < size * size; i++) {
    if (paths[i] === 0) return false;
  }
  // Each color must be continuous and connect its endpoints
  const colors = new Set(endpoints.filter(v => v > 0));
  for (const color of colors) {
    // Find all cells of this color
    const cells = paths.map((v, i) => v === color ? i : -1).filter(i => i >= 0);
    if (cells.length < 2) return false;
    // BFS connectivity
    const adj = (idx: number) => {
      const r = Math.floor(idx / size), c = idx % size;
      return [
        r > 0 ? (r-1)*size+c : -1,
        r < size-1 ? (r+1)*size+c : -1,
        c > 0 ? r*size+(c-1) : -1,
        c < size-1 ? r*size+(c+1) : -1,
      ].filter(n => n >= 0 && paths[n] === color);
    };
    const visited = new Set<number>([cells[0]!]);
    const queue = [cells[0]!];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const n of adj(cur)) {
        if (!visited.has(n)) { visited.add(n); queue.push(n); }
      }
    }
    if (visited.size !== cells.length) return false;
    // Endpoints match
    const endpts = endpoints.map((v, i) => v === color ? i : -1).filter(i => i >= 0);
    if (endpts.length !== 2) return false;
  }
  return true;
}

export function initialState(seed: number, settings: NumberlinkSettings): NumberlinkState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  // Pre-fill endpoints
  const paths = puzzle.endpoints.slice();
  return { settings, puzzle, paths, won: false, moves: 0 };
}

export function reducer(state: NumberlinkState, action: NumberlinkAction): NumberlinkState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "setPath": {
      const { idx, color } = action;
      // Don't allow overwriting endpoints
      if (state.puzzle.endpoints[idx] !== 0) return state;
      const newPaths = state.paths.slice();
      newPaths[idx] = color;
      const won = checkWon(state.puzzle, newPaths);
      return { ...state, paths: newPaths, won, moves: state.moves + 1 };
    }
    case "clearPath": {
      const { color } = action;
      const newPaths = state.paths.map((v, i) =>
        v === color && state.puzzle.endpoints[i] === 0 ? 0 : v
      );
      return { ...state, paths: newPaths, moves: state.moves + 1 };
    }
    case "reset": {
      return { ...state, paths: state.puzzle.endpoints.slice(), won: false, moves: 0 };
    }
    default:
      return state;
  }
}

export function isTerminal(state: NumberlinkState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 3) };
}
