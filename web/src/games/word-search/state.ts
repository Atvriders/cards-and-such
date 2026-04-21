import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { getWords } from "./words.js";

export interface WordSearchSettings {
  size: "8" | "12" | "15";
  wordCount: "5" | "10" | "15";
}

export interface PlacedWord {
  word: string;
  row: number;
  col: number;
  dr: number; // direction row delta
  dc: number; // direction col delta
  found: boolean;
}

export interface WordSearchState {
  settings: WordSearchSettings;
  size: number;
  grid: readonly string[]; // row-major, uppercase letters
  placedWords: readonly PlacedWord[];
  selecting: { startRow: number; startCol: number } | null;
  won: boolean;
  movesMade: number;
}

export type WordSearchAction =
  | { type: "startSelect"; row: number; col: number }
  | { type: "endSelect"; row: number; col: number }
  | { type: "cancelSelect" };

// 8 directions: [dr, dc]
const DIRECTIONS: [number, number][] = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

function tryPlace(
  grid: string[],
  word: string,
  size: number,
  rng: () => number,
): { row: number; col: number; dr: number; dc: number } | null {
  const dirs = DIRECTIONS.slice().sort(() => rng() - 0.5);
  for (let attempt = 0; attempt < 100; attempt++) {
    const dr = dirs[attempt % dirs.length]![0];
    const dc = dirs[attempt % dirs.length]![1];
    const row = Math.floor(rng() * size);
    const col = Math.floor(rng() * size);
    // Check bounds
    const endRow = row + dr * (word.length - 1);
    const endCol = col + dc * (word.length - 1);
    if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
    // Check no conflicts
    let ok = true;
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const existing = grid[r * size + c];
      if (existing !== "." && existing !== word[i]) { ok = false; break; }
    }
    if (!ok) continue;
    // Place
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      grid[r * size + c] = word[i]!;
    }
    return { row, col, dr, dc };
  }
  return null;
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function initialState(seed: number, settings: WordSearchSettings): WordSearchState {
  const size = parseInt(settings.size, 10);
  const wordCount = parseInt(settings.wordCount, 10);
  const rng = mulberry32(seed);

  // Pick words that fit in the grid
  const allWords = getWords(wordCount * 3, rng).filter((w) => w.length <= size);
  const chosen = allWords.slice(0, wordCount);

  const grid: string[] = new Array(size * size).fill(".");

  const placedWords: PlacedWord[] = [];
  for (const word of chosen) {
    const placement = tryPlace(grid, word, size, rng);
    if (placement) {
      placedWords.push({ word, ...placement, found: false });
    }
  }

  // Fill remaining with random letters
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === ".") grid[i] = LETTERS[Math.floor(rng() * 26)]!;
  }

  return {
    settings,
    size,
    grid,
    placedWords,
    selecting: null,
    won: false,
    movesMade: 0,
  };
}

/** Get cells along a straight line from (r0,c0) to (r1,c1). Returns null if not straight. */
export function getLineCells(
  r0: number, c0: number, r1: number, c1: number,
): { row: number; col: number; dr: number; dc: number; length: number } | null {
  const dr = r1 - r0;
  const dc = c1 - c0;
  if (dr === 0 && dc === 0) return { row: r0, col: c0, dr: 0, dc: 0, length: 1 };
  // Must be horizontal, vertical, or diagonal (|dr|===|dc|)
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
  const normDr = dr === 0 ? 0 : dr / Math.abs(dr);
  const normDc = dc === 0 ? 0 : dc / Math.abs(dc);
  return { row: r0, col: c0, dr: normDr, dc: normDc, length: len };
}

export function reducer(state: WordSearchState, action: WordSearchAction): WordSearchState {
  if (state.won) return state;

  switch (action.type) {
    case "startSelect":
      return { ...state, selecting: { startRow: action.row, startCol: action.col } };

    case "cancelSelect":
      return { ...state, selecting: null };

    case "endSelect": {
      if (!state.selecting) return state;
      const { startRow, startCol } = state.selecting;
      const line = getLineCells(startRow, startCol, action.row, action.col);
      if (!line) return { ...state, selecting: null };

      // Extract selected string from grid
      let selected = "";
      for (let i = 0; i < line.length; i++) {
        const r = line.row + line.dr * i;
        const c = line.col + line.dc * i;
        if (r < 0 || r >= state.size || c < 0 || c >= state.size) { selected = ""; break; }
        selected += state.grid[r * state.size + c];
      }

      // Check if selected matches any unFound placedWord (forward or backward)
      const newPlaced = state.placedWords.map((pw) => {
        if (pw.found) return pw;
        if (selected === pw.word || selected === pw.word.split("").reverse().join("")) {
          // Verify same line position
          const fwd = selected === pw.word;
          const pr = fwd ? pw.row : pw.row + pw.dr * (pw.word.length - 1);
          const pc = fwd ? pw.col : pw.col + pw.dc * (pw.word.length - 1);
          const pdr = fwd ? pw.dr : -pw.dr;
          const pdc = fwd ? pw.dc : -pw.dc;
          if (pr === line.row && pc === line.col && pdr === line.dr && pdc === line.dc) {
            return { ...pw, found: true };
          }
        }
        return pw;
      });

      const won = newPlaced.every((pw) => pw.found);
      return {
        ...state,
        placedWords: newPlaced,
        selecting: null,
        won,
        movesMade: state.movesMade + 1,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WordSearchState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 10) };
}
