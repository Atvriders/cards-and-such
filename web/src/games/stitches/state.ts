import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM } from "./puzzles.js";
import type { StitchPuzzle } from "./puzzles.js";

export type { StitchPuzzle };

export interface StitchSettings {
  difficulty: "easy" | "medium";
}

export interface StitchState {
  settings: StitchSettings;
  puzzle: StitchPuzzle;
  /** Set of active stitches as "idx1,idx2" strings (idx1 < idx2) */
  stitches: Set<string>;
  won: boolean;
  moves: number;
}

export type StitchAction =
  | { type: "toggleStitch"; a: number; b: number }
  | { type: "reset" };

export function stitchKey(a: number, b: number): string {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

export function isCrossRegion(puzzle: StitchPuzzle, a: number, b: number): boolean {
  return puzzle.regions[a] !== puzzle.regions[b];
}

export function areAdjacent4(cols: number, a: number, b: number): boolean {
  const ra = Math.floor(a / cols), ca = a % cols;
  const rb = Math.floor(b / cols), cb = b % cols;
  return (ra === rb && Math.abs(ca - cb) === 1) || (ca === cb && Math.abs(ra - rb) === 1);
}

export function computeRowCounts(puzzle: StitchPuzzle, stitches: Set<string>): number[] {
  const { rows, cols } = puzzle;
  const counts = new Array(rows).fill(0);
  for (const key of stitches) {
    const [as, bs] = key.split(",");
    const a = parseInt(as!), b = parseInt(bs!);
    const ra = Math.floor(a / cols), rb = Math.floor(b / cols);
    counts[ra]++;
    if (ra !== rb) counts[rb]++;
  }
  return counts;
}

export function computeColCounts(puzzle: StitchPuzzle, stitches: Set<string>): number[] {
  const { cols } = puzzle;
  const counts = new Array(cols).fill(0);
  for (const key of stitches) {
    const [as, bs] = key.split(",");
    const a = parseInt(as!), b = parseInt(bs!);
    const ca = a % cols, cb = b % cols;
    counts[ca]++;
    if (ca !== cb) counts[cb]++;
  }
  return counts;
}

export function checkWon(puzzle: StitchPuzzle, stitches: Set<string>): boolean {
  const solKeys = new Set(puzzle.solution.map(([a, b]) => stitchKey(a, b)));
  if (stitches.size !== solKeys.size) return false;
  for (const k of stitches) {
    if (!solKeys.has(k)) return false;
  }
  return true;
}

export function initialState(seed: number, settings: StitchSettings): StitchState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_MEDIUM;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return { settings, puzzle, stitches: new Set(), won: false, moves: 0 };
}

export function reducer(state: StitchState, action: StitchAction): StitchState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggleStitch": {
      const { a, b } = action;
      if (!areAdjacent4(state.puzzle.cols, a, b)) return state;
      if (!isCrossRegion(state.puzzle, a, b)) return state;
      const key = stitchKey(a, b);
      const newStitches = new Set(state.stitches);
      if (newStitches.has(key)) newStitches.delete(key);
      else newStitches.add(key);
      const won = checkWon(state.puzzle, newStitches);
      return { ...state, stitches: newStitches, won, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, stitches: new Set(), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: StitchState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 10) };
}
