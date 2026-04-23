import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM } from "./puzzles.js";
import type { RikudoPuzzle } from "./puzzles.js";

export type { RikudoPuzzle };

export interface RikudoSettings {
  difficulty: "easy" | "medium";
}

export interface RikudoState {
  settings: RikudoSettings;
  puzzle: RikudoPuzzle;
  /** player-entered values; 0 = empty; mirrors puzzle.clues for pre-fills */
  values: number[];
  selected: number | null; // selected cell index
  won: boolean;
  moves: number;
}

export type RikudoAction =
  | { type: "selectCell"; idx: number }
  | { type: "enterValue"; value: number }
  | { type: "clearCell"; idx: number }
  | { type: "reset" };

const DIRS_4 = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;

export function areAdjacent(rows: number, cols: number, a: number, b: number): boolean {
  const ra = Math.floor(a / cols), ca = a % cols;
  const rb = Math.floor(b / cols), cb = b % cols;
  for (const [dr, dc] of DIRS_4) {
    if (ra + dr === rb && ca + dc === cb) return true;
  }
  return false;
}

export function checkWon(puzzle: RikudoPuzzle, values: number[]): boolean {
  const { rows, cols, n } = puzzle;
  // All cells filled with 1..n (each used exactly once)
  const seen = new Set<number>();
  for (let i = 0; i < n; i++) {
    const v = values[i]!;
    if (v < 1 || v > n || seen.has(v)) return false;
    seen.add(v);
  }
  // Consecutive numbers are adjacent
  const pos = new Array<number>(n + 1);
  for (let i = 0; i < n; i++) pos[values[i]!] = i;
  for (let k = 1; k < n; k++) {
    if (!areAdjacent(rows, cols, pos[k]!, pos[k + 1]!)) return false;
  }
  return true;
}

/** Cells that violate adjacency constraints (for highlighting) */
export function computeErrors(puzzle: RikudoPuzzle, values: number[]): Set<number> {
  const { rows, cols, n } = puzzle;
  const errs = new Set<number>();
  const pos = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const v = values[i]!;
    if (v >= 1 && v <= n) {
      if (pos.has(v)) { errs.add(i); errs.add(pos.get(v)!); }
      else pos.set(v, i);
    }
  }
  for (const [k, idx] of pos) {
    const next = k + 1;
    if (next <= n && pos.has(next) && !areAdjacent(rows, cols, idx, pos.get(next)!)) {
      errs.add(idx);
      errs.add(pos.get(next)!);
    }
  }
  return errs;
}

export function initialState(seed: number, settings: RikudoSettings): RikudoState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY : PUZZLES_MEDIUM;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    values: puzzle.clues.slice(),
    selected: null,
    won: false,
    moves: 0,
  };
}

export function reducer(state: RikudoState, action: RikudoAction): RikudoState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "selectCell": {
      const { idx } = action;
      if (state.puzzle.clues[idx]! > 0) return state; // clue cell, can't select
      return { ...state, selected: idx };
    }
    case "enterValue": {
      if (state.selected === null) return state;
      const idx = state.selected;
      if (state.puzzle.clues[idx]! > 0) return state;
      const newValues = state.values.slice();
      newValues[idx] = action.value;
      const won = checkWon(state.puzzle, newValues);
      return { ...state, values: newValues, won, moves: state.moves + 1 };
    }
    case "clearCell": {
      const { idx } = action;
      if (state.puzzle.clues[idx]! > 0) return state;
      const newValues = state.values.slice();
      newValues[idx] = 0;
      return { ...state, values: newValues, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        values: state.puzzle.clues.slice(),
        selected: null,
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: RikudoState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 10) };
}
