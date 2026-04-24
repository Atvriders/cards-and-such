// Corral (also called Bag) puzzles — 6×6 grid
// Rules:
//   - Draw a single closed loop along grid lines (passes through cell edges).
//   - All numbered cells must be inside the loop.
//   - Each number indicates how many cells inside the loop are visible from that cell
//     in straight lines (up, down, left, right) without leaving the loop interior,
//     including the cell itself.
//
// Simplified implementation: the player draws a loop; solution is compared directly.
// We reuse the edge-toggle approach (like castle-wall).

import type { Edge } from "../castle-wall/puzzles.js";
export type { Edge };

export interface CorralPuzzle {
  size: number;
  // Clue cells: number = count of cells visible along axes from inside
  clues: (number | null)[];
  solution: Edge[];
}

function c(size: number, clues: (number | null)[], solution: Edge[]): CorralPuzzle {
  return { size, clues, solution };
}

export const PUZZLES: CorralPuzzle[] = [
  // Puzzle 1 — 6×6, rectangular loop enclosing interior
  c(6,
    [null,null,null,null,null,null,
     null,   5,null,null,   5,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,   5,null,null,   5,null,
     null,null,null,null,null,null],
    // Border of columns 1-4, rows 1-4
    [
      [1,1,1,2],[1,2,1,3],[1,3,1,4],
      [1,4,2,4],[2,4,3,4],[3,4,4,4],
      [4,4,4,3],[4,3,4,2],[4,2,4,1],
      [4,1,3,1],[3,1,2,1],[2,1,1,1],
    ],
  ),
  // Puzzle 2 — 6×6, larger loop
  c(6,
    [null,null,null,null,null,null,
     null,null,   4,null,null,null,
     null,   4,null,null,null,null,
     null,null,null,null,   4,null,
     null,null,null,   4,null,null,
     null,null,null,null,null,null],
    // Outer 4-row rectangle rows 1-4, cols 1-4
    [
      [1,1,1,2],[1,2,1,3],[1,3,1,4],
      [1,4,2,4],[2,4,3,4],[3,4,4,4],
      [4,4,4,3],[4,3,4,2],[4,2,4,1],
      [4,1,3,1],[3,1,2,1],[2,1,1,1],
    ],
  ),
  // Puzzle 3 — 6×6
  c(6,
    [null,null,null,null,null,null,
     null,   3,null,null,   3,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,   3,null,null,   3,null,
     null,null,null,null,null,null],
    [
      [1,1,1,2],[1,2,1,3],[1,3,1,4],
      [1,4,2,4],[2,4,3,4],[3,4,4,4],
      [4,4,4,3],[4,3,4,2],[4,2,4,1],
      [4,1,3,1],[3,1,2,1],[2,1,1,1],
    ],
  ),
  // Puzzle 4 — 6×6 outer border loop
  c(6,
    [   6,null,null,null,null,   6,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
        6,null,null,null,null,   6],
    [
      [0,0,0,1],[0,1,0,2],[0,2,0,3],[0,3,0,4],[0,4,0,5],
      [0,5,1,5],[1,5,2,5],[2,5,3,5],[3,5,4,5],[4,5,5,5],
      [5,5,5,4],[5,4,5,3],[5,3,5,2],[5,2,5,1],[5,1,5,0],
      [5,0,4,0],[4,0,3,0],[3,0,2,0],[2,0,1,0],[1,0,0,0],
    ],
  ),
  // Puzzle 5 — 6×6 small inner loop
  c(6,
    [null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,null,   2,   2,null,null,
     null,null,   2,   2,null,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null],
    [
      [2,2,2,3],
      [2,3,3,3],
      [3,3,3,2],
      [3,2,2,2],
    ],
  ),
];
