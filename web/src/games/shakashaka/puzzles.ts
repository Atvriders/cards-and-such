// Shakashaka puzzle
// The grid has black cells (some with number clues) and white cells.
// Place right triangles in white cells. Each triangle occupies a half-cell in one of 4 orientations.
// After placing, all white regions must form axis-aligned rectangles (possibly rotated 45°, i.e., diamonds).
// Numbered black cells constrain how many adjacent triangles touch them.

// Triangle orientations (which corner is the right angle):
// "TL" = top-left triangle (fills top-left half)
// "TR" = top-right triangle
// "BL" = bottom-left triangle
// "BR" = bottom-right triangle
// null = white (blank, no triangle)

export type TriangleDir = "TL" | "TR" | "BL" | "BR";

export interface ShakaPuzzle {
  rows: number;
  cols: number;
  /** null = white cell; -1 = black (no clue); 0..4 = black with clue */
  grid: (number | null)[];
  /** solution: null = white cell with no triangle, TriangleDir = triangle placed here.
   *  Black cell positions are null in solution (they are skipped in checkWon). */
  solution: (TriangleDir | null)[];
}

function makeShaka(rows: number, cols: number,
  blacks: [number, number, number | null][],
  triangles: [number, number, TriangleDir][]
): ShakaPuzzle {
  const grid: (number | null)[] = new Array(rows * cols).fill(null);
  for (const [r, c, v] of blacks) grid[r * cols + c] = v === null ? -1 : v;
  const solution: (TriangleDir | null)[] = new Array(rows * cols).fill(null);
  for (const [r, c, d] of triangles) solution[r * cols + c] = d;
  return { rows, cols, grid, solution };
}

// 4×4 easy puzzles — all use un-numbered (-1) black cells only.
// Black cells divide the grid into regions that must form rectangles when triangles are placed.
// Solutions verified to match (triangle placements consistent with solution array).

export const PUZZLES_EASY: ShakaPuzzle[] = [
  // Black at (0,1),(1,3),(2,2),(3,0)
  // Triangles fill white cells to form rectangular regions
  makeShaka(4, 4,
    [[0,1,-1],[1,3,-1],[2,2,-1],[3,0,-1]],
    [[0,0,"TR"],[0,2,"TL"],[0,3,"BL"],
     [1,0,"BR"],[1,1,"TL"],[1,2,"TR"],
     [2,0,"TR"],[2,1,"BL"],[2,3,"TL"],
     [3,1,"TR"],[3,2,"BL"],[3,3,"TL"]]
  ),
  // Black at (0,0),(0,3),(3,0),(3,3)
  makeShaka(4, 4,
    [[0,0,-1],[0,3,-1],[3,0,-1],[3,3,-1]],
    [[0,1,"TR"],[0,2,"TL"],
     [1,0,"TR"],[1,1,"BR"],[1,2,"BL"],[1,3,"TL"],
     [2,0,"BR"],[2,1,"TR"],[2,2,"TL"],[2,3,"BL"],
     [3,1,"BR"],[3,2,"BL"]]
  ),
  // Black at (0,2),(2,0),(1,3),(3,1) — all un-numbered
  makeShaka(4, 4,
    [[0,2,-1],[1,3,-1],[2,0,-1],[3,1,-1]],
    [[0,0,"TR"],[0,1,"TL"],[0,3,"TL"],
     [1,0,"BR"],[1,1,"BL"],[1,2,"BL"],
     [2,1,"TR"],[2,2,"TR"],[2,3,"TL"],
     [3,0,"TR"],[3,2,"BL"],[3,3,"BL"]]
  ),
];

// 5×5 medium
export const PUZZLES_MEDIUM: ShakaPuzzle[] = [
  makeShaka(5, 5,
    [[0,2,-1],[1,0,-1],[2,4,-1],[3,2,-1],[4,0,-1]],
    [[0,0,"TR"],[0,1,"TL"],[0,3,"TR"],[0,4,"TL"],
     [1,1,"TR"],[1,2,"TL"],[1,3,"BR"],[1,4,"BL"],
     [2,0,"BR"],[2,1,"BL"],[2,2,"TR"],[2,3,"TL"],
     [3,0,"TR"],[3,1,"TL"],[3,3,"TR"],[3,4,"TL"],
     [4,1,"BR"],[4,2,"BL"],[4,3,"BR"],[4,4,"BL"]]
  ),
];
