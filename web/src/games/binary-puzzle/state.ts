import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BinaryPuzzleSettings {
  size: number;
}

export type BinaryCell = 0 | 1 | null; // null = empty (player must fill)

export interface BinaryPuzzleState {
  settings: BinaryPuzzleSettings;
  size: number;
  // Full solution grid
  solution: readonly (0 | 1)[];
  // Current player board: some cells pre-filled (clues), rest null
  board: readonly BinaryCell[];
  // Which cells are clues (locked)
  clues: readonly boolean[];
  won: boolean;
  movesMade: number;
}

export type BinaryPuzzleAction =
  | { type: "set"; index: number; value: 0 | 1 | null };

// Generate a valid binary puzzle solution
// Rules: no three same in a row, equal 0s and 1s per row/col, no two identical rows/cols
function generateSolution(rng: () => number, size: number): (0 | 1)[] | null {
  const grid = new Array<0 | 1 | null>(size * size).fill(null);

  function rowOk(r: number, upTo: number): boolean {
    let zeros = 0, ones = 0;
    let consecutive = 1;
    for (let c = 0; c <= upTo; c++) {
      const v = grid[r * size + c];
      if (v === null) continue;
      if (v === 0) zeros++; else ones++;
      if (zeros > size / 2 || ones > size / 2) return false;
      if (c > 0 && grid[r * size + c - 1] === v) {
        consecutive++;
        if (consecutive >= 3) return false;
      } else {
        consecutive = 1;
      }
    }
    return true;
  }

  function colOk(c: number, upToRow: number): boolean {
    let zeros = 0, ones = 0;
    let consecutive = 1;
    for (let r = 0; r <= upToRow; r++) {
      const v = grid[r * size + c];
      if (v === null) continue;
      if (v === 0) zeros++; else ones++;
      if (zeros > size / 2 || ones > size / 2) return false;
      if (r > 0 && grid[(r - 1) * size + c] === v) {
        consecutive++;
        if (consecutive >= 3) return false;
      } else {
        consecutive = 1;
      }
    }
    return true;
  }

  function solve(pos: number): boolean {
    if (pos === size * size) return true;
    const order: (0 | 1)[] = rng() > 0.5 ? [0, 1] : [1, 0];
    const r = Math.floor(pos / size);
    const c = pos % size;
    for (const v of order) {
      grid[pos] = v;
      if (rowOk(r, c) && colOk(c, r) && solve(pos + 1)) return true;
    }
    grid[pos] = null;
    return false;
  }

  if (solve(0)) return grid as (0 | 1)[];
  return null;
}

export function initialState(seed: number, settings: BinaryPuzzleSettings): BinaryPuzzleState {
  const rng = mulberry32(seed);
  const size = settings.size;
  let solution: (0 | 1)[] | null = null;
  let attempts = 0;
  while (!solution && attempts < 50) {
    solution = generateSolution(rng, size);
    attempts++;
  }
  if (!solution) {
    // Fallback simple valid grid
    solution = Array.from({ length: size * size }, (_, i) => {
      const r = Math.floor(i / size), c = i % size;
      return ((r + c) % 2) as 0 | 1;
    });
  }

  // Create clues: reveal ~40% of cells
  const clueCount = Math.floor(size * size * 0.4);
  const indices = Array.from({ length: size * size }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  const clueSet = new Set(indices.slice(0, clueCount));

  const board: BinaryCell[] = solution.map((v, i) => clueSet.has(i) ? v : null);
  const clues: boolean[] = solution.map((_, i) => clueSet.has(i));

  return {
    settings,
    size,
    solution,
    board,
    clues,
    won: false,
    movesMade: 0,
  };
}

function checkWon(board: readonly BinaryCell[], solution: readonly (0 | 1)[]): boolean {
  return board.every((v, i) => v === solution[i]);
}

export function reducer(state: BinaryPuzzleState, action: BinaryPuzzleAction): BinaryPuzzleState {
  if (state.won) return state;
  if (action.type !== "set") return state;
  const { index, value } = action;
  if (index < 0 || index >= state.board.length) return state;
  if (state.clues[index]) return state; // can't modify clues

  const newBoard = state.board.slice() as BinaryCell[];
  newBoard[index] = value;
  const won = value !== null && checkWon(newBoard, state.solution);
  return { ...state, board: newBoard, won, movesMade: state.movesMade + 1 };
}

export function isTerminal(state: BinaryPuzzleState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.movesMade * 5) };
}
