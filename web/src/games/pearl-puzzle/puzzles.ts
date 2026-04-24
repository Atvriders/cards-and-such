// Pearl Puzzle (Masyu variant) — 6×6 grid
// Rules:
//   - Draw a single closed loop through all pearl cells.
//   - Black pearl: the loop must turn at this cell, and must go straight through both neighbouring cells.
//   - White pearl: the loop must go straight through this cell, and must turn at least one adjacent cell.
// Solution: a list of edges forming the loop (same format as castle-wall).

import type { Edge } from "../castle-wall/puzzles.js";
export type { Edge };

export interface PearlPuzzle {
  size: number;
  // Pearls: null=empty, "black"=black pearl, "white"=white pearl
  pearls: (null | "black" | "white")[];
  solution: Edge[];
}

function p(size: number, pearls: (null | "black" | "white")[], solution: Edge[]): PearlPuzzle {
  return { size, pearls, solution };
}

const B = "black" as const;
const W = "white" as const;

export const PUZZLES: PearlPuzzle[] = [
  // Puzzle 1 — 6×6
  p(6,
    [null,null,null,null,null,null,
     null,B,   null,null,W,   null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,W,   null,null,B,   null,
     null,null,null,null,null,null],
    // Rectangular border loop
    [
      [0,0,0,1],[0,1,0,2],[0,2,0,3],[0,3,0,4],[0,4,0,5],
      [0,5,1,5],[1,5,2,5],[2,5,3,5],[3,5,4,5],[4,5,5,5],
      [5,5,5,4],[5,4,5,3],[5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],[3,0,2,0],[2,0,1,0],[1,0,0,0],
    ],
  ),
  // Puzzle 2 — 6×6
  p(6,
    [null,null,null,null,null,null,
     null,null,W,   null,null,null,
     null,B,   null,null,null,null,
     null,null,null,null,W,   null,
     null,null,null,B,   null,null,
     null,null,null,null,null,null],
    [
      [0,0,0,1],[0,1,0,2],[0,2,0,3],[0,3,0,4],[0,4,0,5],
      [0,5,1,5],[1,5,2,5],[2,5,3,5],[3,5,4,5],[4,5,5,5],
      [5,5,5,4],[5,4,5,3],[5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],[3,0,2,0],[2,0,1,0],[1,0,0,0],
    ],
  ),
  // Puzzle 3 — 6×6, inner loop
  p(6,
    [null,null,null,null,null,null,
     null,B,   null,null,B,   null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,B,   null,null,B,   null,
     null,null,null,null,null,null],
    [
      [1,1,1,2],[1,2,1,3],[1,3,1,4],
      [1,4,2,4],[2,4,3,4],[3,4,4,4],
      [4,4,4,3],[4,3,4,2],[4,2,4,1],
      [4,1,3,1],[3,1,2,1],[2,1,1,1],
    ],
  ),
  // Puzzle 4 — 6×6
  p(6,
    [B,   null,null,null,null,B,
     null,null,null,null,null,null,
     null,null,W,   W,   null,null,
     null,null,W,   W,   null,null,
     null,null,null,null,null,null,
     B,   null,null,null,null,B],
    [
      [0,0,0,1],[0,1,0,2],[0,2,0,3],[0,3,0,4],[0,4,0,5],
      [0,5,1,5],[1,5,2,5],[2,5,3,5],[3,5,4,5],[4,5,5,5],
      [5,5,5,4],[5,4,5,3],[5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],[3,0,2,0],[2,0,1,0],[1,0,0,0],
    ],
  ),
  // Puzzle 5 — 6×6
  p(6,
    [null,null,null,null,null,null,
     null,W,   null,null,W,   null,
     null,null,B,   B,   null,null,
     null,null,B,   B,   null,null,
     null,W,   null,null,W,   null,
     null,null,null,null,null,null],
    [
      [0,0,0,1],[0,1,0,2],[0,2,0,3],[0,3,0,4],[0,4,0,5],
      [0,5,1,5],[1,5,2,5],[2,5,3,5],[3,5,4,5],[4,5,5,5],
      [5,5,5,4],[5,4,5,3],[5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],[3,0,2,0],[2,0,1,0],[1,0,0,0],
    ],
  ),
];
