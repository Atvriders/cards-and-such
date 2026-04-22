import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { isValidWord, LETTER_POOL } from "./words.js";

export type BoggleSize = "4" | "5";

export interface BoggleSettings {
  size: BoggleSize;
  duration: "120" | "180" | "240";
}

export interface BoggleState {
  settings: BoggleSettings;
  grid: string[];          // flat array, row-major
  gridSize: number;        // 4 or 5
  currentPath: number[];   // indices of selected cells in current word
  foundWords: string[];    // accepted words found so far
  score: number;
  timeLeft: number;        // seconds remaining
  done: boolean;
  error: string | null;
}

export type BoggleAction =
  | { type: "tick" }
  | { type: "selectCell"; index: number }
  | { type: "submitWord" }
  | { type: "clearPath" };

/** Word score by length */
export function wordScore(len: number): number {
  if (len < 3) return 0;
  if (len <= 4) return 1;
  if (len === 5) return 2;
  if (len === 6) return 3;
  if (len === 7) return 5;
  return 11;
}

function generateGrid(size: number, rng: () => number): string[] {
  const pool = [...LETTER_POOL];
  const cells: string[] = [];
  for (let i = 0; i < size * size; i++) {
    const idx = Math.floor(rng() * pool.length);
    cells.push(pool[idx]!);
  }
  return cells;
}

/** Returns true if cells a and b are adjacent (including diagonals) in a size×size grid */
export function areAdjacent(a: number, b: number, size: number): boolean {
  const ar = Math.floor(a / size);
  const ac = a % size;
  const br = Math.floor(b / size);
  const bc = b % size;
  return Math.abs(ar - br) <= 1 && Math.abs(ac - bc) <= 1 && a !== b;
}

/** Check whether path forms a valid adjacency chain */
export function isValidPath(path: number[], size: number): boolean {
  if (path.length < 2) return true;
  for (let i = 1; i < path.length; i++) {
    if (!areAdjacent(path[i - 1]!, path[i]!, size)) return false;
    // No revisits
    if (path.slice(0, i).includes(path[i]!)) return false;
  }
  return true;
}

export function pathToWord(path: number[], grid: string[]): string {
  return path.map(i => grid[i]!).join("");
}

export function initialState(seed: number, settings: BoggleSettings): BoggleState {
  const rng = mulberry32(seed);
  const gridSize = parseInt(settings.size, 10);
  const duration = parseInt(settings.duration, 10);
  const grid = generateGrid(gridSize, rng);

  return {
    settings,
    grid,
    gridSize,
    currentPath: [],
    foundWords: [],
    score: 0,
    timeLeft: duration,
    done: false,
    error: null,
  };
}

export function reducer(state: BoggleState, action: BoggleAction): BoggleState {
  if (state.done) return state;

  switch (action.type) {
    case "tick": {
      const newTime = state.timeLeft - 1;
      if (newTime <= 0) {
        return { ...state, timeLeft: 0, done: true };
      }
      return { ...state, timeLeft: newTime };
    }

    case "selectCell": {
      const { index } = action;
      if (index < 0 || index >= state.grid.length) return state;

      const path = state.currentPath;

      // If already in path — trim back to that cell (retrace)
      const existingIdx = path.indexOf(index);
      if (existingIdx !== -1) {
        return { ...state, currentPath: path.slice(0, existingIdx + 1), error: null };
      }

      // Must be adjacent to last cell
      if (path.length > 0 && !areAdjacent(path[path.length - 1]!, index, state.gridSize)) {
        return { ...state, error: "Not adjacent" };
      }

      return { ...state, currentPath: [...path, index], error: null };
    }

    case "submitWord": {
      const { currentPath, grid, gridSize, foundWords } = state;
      if (currentPath.length < 3) {
        return { ...state, currentPath: [], error: "Too short (min 3 letters)" };
      }

      if (!isValidPath(currentPath, gridSize)) {
        return { ...state, currentPath: [], error: "Invalid path" };
      }

      const word = pathToWord(currentPath, grid);
      if (foundWords.includes(word)) {
        return { ...state, currentPath: [], error: "Already found" };
      }

      if (!isValidWord(word)) {
        return { ...state, currentPath: [], error: "Not a word" };
      }

      const pts = wordScore(word.length);
      return {
        ...state,
        foundWords: [...foundWords, word],
        score: state.score + pts,
        currentPath: [],
        error: null,
      };
    }

    case "clearPath":
      return { ...state, currentPath: [], error: null };

    default:
      return state;
  }
}

export function isTerminal(state: BoggleState): { score: number } | null {
  if (!state.done) return null;
  return { score: state.score };
}
