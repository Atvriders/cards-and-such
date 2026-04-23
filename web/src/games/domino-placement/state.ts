import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { PUZZLES } from "./puzzles.js";
import type { DominoPuzzle } from "./puzzles.js";
export type { DominoPuzzle };

export interface DominoSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface DominoState {
  settings: DominoSettings;
  puzzle: DominoPuzzle;
  /**
   * Player-placed boundaries: stored as set of "wall" keys.
   * For adjacent cells (r1,c1)-(r2,c2): key = "r1,c1-r2,c2" (normalized so smaller index first)
   */
  walls: Set<string>;
  won: boolean;
  moves: number;
}

export type DominoAction =
  | { type: "toggleWall"; idx1: number; idx2: number }
  | { type: "reset" };

function wallKey(idx1: number, idx2: number): string {
  return idx1 < idx2 ? `${idx1}-${idx2}` : `${idx2}-${idx1}`;
}

export function checkWon(puzzle: DominoPuzzle, walls: Set<string>): boolean {
  const { rows, cols, grid, solution } = puzzle;
  const total = rows * cols;
  // Build groups from walls: cells in same domino if no wall between them
  // Check each adjacent pair: if solution says they're same domino AND no wall between them -> ok
  // If solution says different domino AND wall between them -> ok

  // Build union-find from walls
  const parent = Array.from({ length: total }, (_, i) => i);
  function find(x: number): number {
    while (parent[x] !== x) { parent[x] = parent[parent[x]!]!; x = parent[x]!; }
    return x;
  }
  function union(a: number, b: number) { parent[find(a)] = find(b); }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      // Right neighbor
      if (c + 1 < cols) {
        const nIdx = idx + 1;
        if (!walls.has(wallKey(idx, nIdx))) union(idx, nIdx);
      }
      // Down neighbor
      if (r + 1 < rows) {
        const nIdx = (r + 1) * cols + c;
        if (!walls.has(wallKey(idx, nIdx))) union(idx, nIdx);
      }
    }
  }

  // Check each group is exactly a pair with the same domino solution
  const groups = new Map<number, number[]>();
  for (let i = 0; i < total; i++) {
    const root = find(i);
    const g = groups.get(root) ?? [];
    g.push(i);
    groups.set(root, g);
  }

  const usedIds = new Set<number>();
  for (const [, cells] of groups) {
    if (cells.length !== 2) return false;
    const [a, b] = cells;
    if (solution[a!] !== solution[b!]) return false;
    if (usedIds.has(solution[a!]!)) return false;
    usedIds.add(solution[a!]!);
  }

  return usedIds.size === 28;
}

export function initialState(seed: number, settings: DominoSettings): DominoState {
  const rng = mulberry32(seed);
  const puzzle = PUZZLES[Math.floor(rng() * PUZZLES.length)]!;
  return { settings, puzzle, walls: new Set(), won: false, moves: 0 };
}

export function reducer(state: DominoState, action: DominoAction): DominoState {
  if (state.won && action.type !== "reset") return state;
  switch (action.type) {
    case "toggleWall": {
      const { idx1, idx2 } = action;
      const key = wallKey(idx1, idx2);
      const newWalls = new Set(state.walls);
      if (newWalls.has(key)) newWalls.delete(key);
      else newWalls.add(key);
      const won = checkWon(state.puzzle, newWalls);
      return { ...state, walls: newWalls, won, moves: state.moves + 1 };
    }
    case "reset":
      return { ...state, walls: new Set(), won: false, moves: 0 };
    default:
      return state;
  }
}

export function isTerminal(state: DominoState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 3) };
}

export { wallKey };
