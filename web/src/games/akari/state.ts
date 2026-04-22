import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES_EASY, PUZZLES_MEDIUM, PUZZLES_HARD } from "./puzzles.js";
import type { AkariPuzzle } from "./puzzles.js";

export type { AkariPuzzle };

export interface AkariSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface AkariState {
  settings: AkariSettings;
  puzzle: AkariPuzzle;
  /** true = player placed a bulb here */
  bulbs: boolean[];
  won: boolean;
  moves: number;
}

export type AkariAction =
  | { type: "toggleBulb"; idx: number }
  | { type: "reset" };

/** Returns set of illuminated cell indices given current bulb placement */
export function computeIlluminated(puzzle: AkariPuzzle, bulbs: boolean[]): Set<number> {
  const { size, grid } = puzzle;
  const lit = new Set<number>();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      if (!bulbs[idx]) continue;
      // illuminate in all 4 directions
      lit.add(idx);
      // up
      for (let dr = r - 1; dr >= 0; dr--) {
        if (grid[dr * size + c] !== null) break;
        lit.add(dr * size + c);
      }
      // down
      for (let dr = r + 1; dr < size; dr++) {
        if (grid[dr * size + c] !== null) break;
        lit.add(dr * size + c);
      }
      // left
      for (let dc = c - 1; dc >= 0; dc--) {
        if (grid[r * size + dc] !== null) break;
        lit.add(r * size + dc);
      }
      // right
      for (let dc = c + 1; dc < size; dc++) {
        if (grid[r * size + dc] !== null) break;
        lit.add(r * size + dc);
      }
    }
  }
  return lit;
}

/** Returns indices of bulbs that see each other (invalid) */
export function computeConflicts(puzzle: AkariPuzzle, bulbs: boolean[]): Set<number> {
  const { size, grid } = puzzle;
  const conflicts = new Set<number>();

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      if (!bulbs[idx]) continue;
      // Check right
      for (let dc = c + 1; dc < size; dc++) {
        const nIdx = r * size + dc;
        if (grid[nIdx] !== null) break;
        if (bulbs[nIdx]) { conflicts.add(idx); conflicts.add(nIdx); }
      }
      // Check down
      for (let dr = r + 1; dr < size; dr++) {
        const nIdx = dr * size + c;
        if (grid[nIdx] !== null) break;
        if (bulbs[nIdx]) { conflicts.add(idx); conflicts.add(nIdx); }
      }
    }
  }
  return conflicts;
}

export function checkWon(puzzle: AkariPuzzle, bulbs: boolean[]): boolean {
  const { size, grid } = puzzle;

  // No conflicts
  if (computeConflicts(puzzle, bulbs).size > 0) return false;

  // All white cells illuminated
  const lit = computeIlluminated(puzzle, bulbs);
  for (let i = 0; i < size * size; i++) {
    if (grid[i] === null && !lit.has(i)) return false;
  }

  // Wall number constraints satisfied
  const dirs: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid[r * size + c];
      if (v === null || v === -1) continue;
      let count = 0;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (bulbs[nr * size + nc]) count++;
      }
      if (count !== v) return false;
    }
  }

  return true;
}

export function initialState(seed: number, settings: AkariSettings): AkariState {
  const rng = mulberry32(seed);
  const pool = settings.difficulty === "easy" ? PUZZLES_EASY
    : settings.difficulty === "medium" ? PUZZLES_MEDIUM
    : PUZZLES_HARD;
  const puzzle = pool[Math.floor(rng() * pool.length)]!;
  return {
    settings,
    puzzle,
    bulbs: new Array(puzzle.size * puzzle.size).fill(false),
    won: false,
    moves: 0,
  };
}

export function reducer(state: AkariState, action: AkariAction): AkariState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggleBulb": {
      const { idx } = action;
      if (state.puzzle.grid[idx] !== null) return state; // wall cell
      const newBulbs = state.bulbs.slice();
      newBulbs[idx] = !newBulbs[idx];
      const won = checkWon(state.puzzle, newBulbs);
      return { ...state, bulbs: newBulbs, won, moves: state.moves + 1 };
    }
    case "reset":
      return {
        ...state,
        bulbs: new Array(state.puzzle.size * state.puzzle.size).fill(false),
        won: false,
        moves: 0,
      };
    default:
      return state;
  }
}

export function isTerminal(state: AkariState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
