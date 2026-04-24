// Castle Wall puzzles — draw a single closed loop on a 6×6 grid
// Loop passes through edges between cells.
// Clue cells are either black (loop goes around) or white (loop goes through).
// White clue with direction arrow: the loop must pass through in that direction.
// Black clue with number: the loop must pass by exactly N sides of that cell.
// Simplified: we encode the solution as a set of edges.
//
// For implementation simplicity, we use a vertex-based loop on the 7×7 grid of corners.
// The player draws/removes edges between adjacent dots.
// solution is an array of edges in the format [r1,c1,r2,c2].

export type Edge = [number, number, number, number]; // row1,col1,row2,col2

export interface CastleWallPuzzle {
  size: number; // grid of cells (dots = size+1)
  // Black/white clue cells: [row, col, color, count]
  // color: "black" | "white"
  // count: number of sides the loop passes on (for black clues), or -1 if no count
  clues: { r: number; c: number; color: "black" | "white"; count: number }[];
  solution: Edge[];
}

function p(
  size: number,
  clues: { r: number; c: number; color: "black" | "white"; count: number }[],
  solution: Edge[],
): CastleWallPuzzle {
  return { size, clues, solution };
}

export const PUZZLES: CastleWallPuzzle[] = [
  // Puzzle 1 — 6×6 simple loop
  p(6,
    [
      { r: 0, c: 0, color: "black", count: 2 },
      { r: 0, c: 5, color: "black", count: 2 },
      { r: 5, c: 0, color: "black", count: 2 },
      { r: 5, c: 5, color: "black", count: 2 },
      { r: 2, c: 2, color: "white", count: -1 },
      { r: 3, c: 3, color: "white", count: -1 },
    ],
    // A rectangular loop along the border
    [
      [0,1,0,2],[0,2,0,3],[0,3,0,4],[0,4,0,5],
      [0,5,1,5],[1,5,2,5],[2,5,3,5],[3,5,4,5],[4,5,5,5],
      [5,5,5,4],[5,4,5,3],[5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],[3,0,2,0],[2,0,1,0],[1,0,0,0],
      [0,0,0,1],
    ],
  ),
  // Puzzle 2 — 6×6 inner rectangular loop
  p(6,
    [
      { r: 1, c: 1, color: "black", count: 2 },
      { r: 1, c: 4, color: "black", count: 2 },
      { r: 4, c: 1, color: "black", count: 2 },
      { r: 4, c: 4, color: "black", count: 2 },
    ],
    [
      [1,2,1,3],[1,3,1,4],
      [1,4,2,4],[2,4,3,4],[3,4,4,4],
      [4,4,4,3],[4,3,4,2],[4,2,4,1],
      [4,1,3,1],[3,1,2,1],[2,1,1,1],
      [1,1,1,2],
    ],
  ),
  // Puzzle 3 — 6×6 U-shape ish loop
  p(6,
    [
      { r: 0, c: 2, color: "white", count: -1 },
      { r: 0, c: 3, color: "white", count: -1 },
      { r: 5, c: 0, color: "black", count: 3 },
      { r: 5, c: 5, color: "black", count: 3 },
    ],
    [
      [0,2,0,3],[0,3,0,4],
      [0,4,1,4],[1,4,2,4],[2,4,3,4],[3,4,4,4],[4,4,5,4],[5,4,5,5],
      [5,5,5,4],[5,4,5,3],[5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],[3,0,2,0],[2,0,1,0],[1,0,0,0],
      [0,0,0,1],[0,1,0,2],
    ],
  ),
  // Puzzle 4 — 6×6
  p(6,
    [
      { r: 2, c: 0, color: "black", count: 1 },
      { r: 2, c: 5, color: "black", count: 1 },
      { r: 3, c: 0, color: "black", count: 1 },
      { r: 3, c: 5, color: "black", count: 1 },
    ],
    [
      [0,0,0,1],[0,1,0,2],[0,2,0,3],[0,3,0,4],[0,4,0,5],
      [0,5,1,5],[1,5,2,5],[2,5,3,5],[3,5,4,5],[4,5,5,5],
      [5,5,5,4],[5,4,5,3],[5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],[3,0,2,0],[2,0,1,0],[1,0,0,0],
      [0,0,0,0],[0,0,0,1], // repeat removed — rectangular border
    ],
  ),
  // Puzzle 5 — 6×6 diamond-like loop
  p(6,
    [
      { r: 0, c: 3, color: "white", count: -1 },
      { r: 3, c: 0, color: "white", count: -1 },
      { r: 3, c: 5, color: "white", count: -1 },
      { r: 5, c: 3, color: "white", count: -1 },
    ],
    [
      [0,3,1,3],[1,3,2,3],[2,3,3,3],
      [3,3,3,4],[3,4,3,5],
      [3,5,4,5],[4,5,5,5],
      [5,5,5,4],[5,4,5,3],
      [5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],
      [3,0,2,0],[2,0,1,0],[1,0,0,0],
      [0,0,0,1],[0,1,0,2],[0,2,0,3],
    ],
  ),
];
