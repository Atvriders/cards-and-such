import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { UNRULY_PUZZLES } from "./puzzles.js";
import type { UnrulyPuzzle } from "./puzzles.js";

export interface UnrulySettings {
  size: "6" | "8" | "10";
}

export interface UnrulyState {
  puzzle: UnrulyPuzzle;
  current: number[]; // 0=empty, 1=black, 2=white
  errorCells: number[];
  movesMade: number;
  won: boolean;
  settings: UnrulySettings;
}

export type UnrulyAction =
  | { type: "toggle"; index: number }; // cycles 0->1->2->0

export function computeUnrulyErrors(current: number[], n: number): number[] {
  const errors = new Set<number>();
  const half = n / 2;

  for (let r = 0; r < n; r++) {
    const row = current.slice(r * n, r * n + n);
    // No 3 consecutive
    for (let c = 0; c < n - 2; c++) {
      const a = row[c]!, b = row[c + 1]!, d = row[c + 2]!;
      if (a !== 0 && a === b && b === d) {
        errors.add(r * n + c);
        errors.add(r * n + c + 1);
        errors.add(r * n + c + 2);
      }
    }
    // Row balance violation if all filled
    const filled = row.filter((v) => v !== 0);
    if (filled.length === n) {
      const ones = filled.filter((v) => v === 1).length;
      if (ones !== half) row.forEach((_, c) => errors.add(r * n + c));
    }
  }

  for (let c = 0; c < n; c++) {
    const col = Array.from({ length: n }, (_, r) => current[r * n + c]!);
    for (let r = 0; r < n - 2; r++) {
      const a = col[r]!, b = col[r + 1]!, d = col[r + 2]!;
      if (a !== 0 && a === b && b === d) {
        errors.add(r * n + c);
        errors.add((r + 1) * n + c);
        errors.add((r + 2) * n + c);
      }
    }
    const filled = col.filter((v) => v !== 0);
    if (filled.length === n) {
      const ones = filled.filter((v) => v === 1).length;
      if (ones !== half) col.forEach((_, r) => errors.add(r * n + c));
    }
  }

  return [...errors];
}

function checkWon(current: number[], solution: number[]): boolean {
  return current.length === solution.length && current.every((v, i) => v === solution[i]);
}

export function initialState(seed: number, settings: UnrulySettings): UnrulyState {
  const rng = mulberry32(seed);
  const n = parseInt(settings.size, 10) as 6 | 8 | 10;
  const pool = UNRULY_PUZZLES.filter((p) => p.size === n);
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    puzzle,
    current: puzzle.given.slice(),
    errorCells: [],
    movesMade: 0,
    won: false,
    settings,
  };
}

export function reducer(state: UnrulyState, action: UnrulyAction): UnrulyState {
  switch (action.type) {
    case "toggle": {
      const { index } = action;
      if (state.puzzle.given[index] !== 0) return state; // given cell locked
      const next = state.current.slice();
      next[index] = ((next[index]! % 3) + 1) % 3; // 0->1->2->0 but we want 0->1->2->0
      // Actually cycle: 0->1, 1->2, 2->0
      next[index] = next[index] === 0 ? 1 : next[index] === 1 ? 2 : 0;
      // Simpler: if current is 0, set 1; if 1, set 2; if 2, set 0
      const prev = state.current[index]!;
      next[index] = prev === 0 ? 1 : prev === 1 ? 2 : 0;
      const n = state.puzzle.size;
      const errorCells = computeUnrulyErrors(next, n);
      const won = checkWon(next, state.puzzle.solution);
      return { ...state, current: next, errorCells, movesMade: state.movesMade + 1, won };
    }
    default:
      return state;
  }
}

export function isTerminal(state: UnrulyState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 3) };
}
