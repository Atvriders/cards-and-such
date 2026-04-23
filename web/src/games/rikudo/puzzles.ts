// Rikudo puzzles — fill 1..N into empty cells so consecutive numbers are adjacent (4-dir)
// Pre-revealed cells are given as clues.
// IMPORTANT: solution must form a valid Hamiltonian path (all consecutive pairs adjacent)

export interface RikudoPuzzle {
  rows: number;
  cols: number;
  n: number; // = rows * cols
  /** value at each cell; 0 = empty (player fills), 1..N = pre-revealed */
  clues: number[];
  /** the full solved grid (1..N at every cell) */
  solution: number[];
}

function makePuzzle(rows: number, cols: number, solution: number[], revealIdx: number[]): RikudoPuzzle {
  const clues = new Array(rows * cols).fill(0);
  for (const i of revealIdx) clues[i] = solution[i]!;
  return { rows, cols, n: rows * cols, clues, solution };
}

// Helper: build solution from a path of (row,col) pairs
function pathToSol(rows: number, cols: number, path: [number, number][]): number[] {
  const sol = new Array(rows * cols).fill(0);
  for (let i = 0; i < path.length; i++) {
    const [r, c] = path[i]!;
    sol[r * cols + c] = i + 1;
  }
  return sol;
}

// 4×4 puzzles (N=16)
// Boustrophedon snake: row 0 L→R, row 1 R→L, row 2 L→R, row 3 R→L
const PATH_E1: [number,number][] = [
  [0,0],[0,1],[0,2],[0,3],
  [1,3],[1,2],[1,1],[1,0],
  [2,0],[2,1],[2,2],[2,3],
  [3,3],[3,2],[3,1],[3,0],
];

// Spiral path (verified)
const PATH_E2: [number,number][] = [
  [0,0],[0,1],[0,2],[0,3],
  [1,3],[2,3],[3,3],[3,2],[3,1],[3,0],
  [2,0],[1,0],[1,1],[1,2],[2,2],[2,1],
];

// Column-first snake: col 0 T→B, col 1 B→T, col 2 T→B, col 3 B→T
const PATH_E3: [number,number][] = [
  [0,0],[1,0],[2,0],[3,0],
  [3,1],[2,1],[1,1],[0,1],
  [0,2],[1,2],[2,2],[3,2],
  [3,3],[2,3],[1,3],[0,3],
];

// S-shape with interior meander
const PATH_E4: [number,number][] = [
  [0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],
  [2,3],[1,3],[0,3],[0,2],[0,1],
  [1,1],[2,1],[2,2],[1,2],
];

export const PUZZLES_EASY: RikudoPuzzle[] = [
  makePuzzle(4, 4, pathToSol(4, 4, PATH_E1), [0, 3, 4, 11, 12, 15]),
  makePuzzle(4, 4, pathToSol(4, 4, PATH_E2), [0, 3, 9, 12, 14, 15]),
  makePuzzle(4, 4, pathToSol(4, 4, PATH_E3), [0, 3, 4, 11, 12, 15]),
  makePuzzle(4, 4, pathToSol(4, 4, PATH_E4), [0, 3, 7, 10, 13, 15]),
];

// 5×5 puzzles (N=25)
// Boustrophedon snake
const PATH_M1: [number,number][] = [
  [0,0],[0,1],[0,2],[0,3],[0,4],
  [1,4],[1,3],[1,2],[1,1],[1,0],
  [2,0],[2,1],[2,2],[2,3],[2,4],
  [3,4],[3,3],[3,2],[3,1],[3,0],
  [4,0],[4,1],[4,2],[4,3],[4,4],
];

// Clockwise spiral 5×5
const PATH_M2: [number,number][] = [
  [0,0],[0,1],[0,2],[0,3],[0,4],
  [1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[4,0],
  [3,0],[2,0],[1,0],[1,1],[1,2],[1,3],
  [2,3],[3,3],[3,2],[3,1],[2,1],[2,2],
];

export const PUZZLES_MEDIUM: RikudoPuzzle[] = [
  makePuzzle(5, 5, pathToSol(5, 5, PATH_M1), [0, 4, 5, 9, 12, 15, 20, 24]),
  makePuzzle(5, 5, pathToSol(5, 5, PATH_M2), [0, 4, 12, 20, 24, 6, 18]),
];
