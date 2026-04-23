// Numberlink (Arukone) puzzles
// Grid with pairs of numbers; draw paths connecting each pair.
// All paths must fill the entire grid; paths don't cross.
// Each color appears EXACTLY twice in endpoints; solution fills ALL cells.

export interface NumberlinkPuzzle {
  size: number;
  /** endpoint[idx] = color (1+), or 0 if not an endpoint */
  endpoints: number[];
  /** solution[idx] = color for every cell — no 0s */
  solution: number[];
}

function mk(size: number, endpoints: number[], solution: number[]): NumberlinkPuzzle {
  return { size, endpoints, solution };
}

// All puzzles hand-verified: each color appears exactly twice in endpoints,
// solution fills all cells, and each color's cells form a connected path.

export const PUZZLES: NumberlinkPuzzle[] = [
  // Puzzle 1: 5×5, 5 colors — one color per row
  mk(5,
    [1,0,0,0,1, 2,0,0,0,2, 3,0,0,0,3, 4,0,0,0,4, 5,0,0,0,5],
    [1,1,1,1,1, 2,2,2,2,2, 3,3,3,3,3, 4,4,4,4,4, 5,5,5,5,5]
  ),

  // Puzzle 2: 5×5, 4 colors — verified connected paths
  // 1: row 0 (left→right)
  // 2: col 0 rows 1-4 + row 4 cols 1-4 (L-shape, 8 cells)
  // 3: col 4 rows 1-3 (3 cells)
  // 4: inner 3×3 rows 1-3 cols 1-3 (9 cells)
  mk(5,
    [1,0,0,0,1, 2,4,0,0,3, 0,0,0,0,0, 0,0,0,4,3, 2,0,0,0,0],
    [1,1,1,1,1, 2,4,4,4,3, 2,4,4,4,3, 2,4,4,4,3, 2,2,2,2,2]
  ),

  // Puzzle 3: 6×6, 3 colors — concentric squares
  // 1: outer ring (endpoints at corners (0,0) and (5,5))
  // 2: middle ring (endpoints at (1,1) and (4,4))
  // 3: inner 2×2 (endpoints at (2,2) and (3,3))
  mk(6,
    [1,0,0,0,0,0, 0,2,0,0,0,0, 0,0,3,0,0,0, 0,0,0,3,0,0, 0,0,0,0,2,0, 0,0,0,0,0,1],
    [1,1,1,1,1,1, 1,2,2,2,2,1, 1,2,3,3,2,1, 1,2,3,3,2,1, 1,2,2,2,2,1, 1,1,1,1,1,1]
  ),

  // Puzzle 4: 5×5, 3 colors — column-based paths
  // 1: col 0 (top to bottom)
  // 2: col 4 (top to bottom)
  // 3: cols 1-3 (fill middle 3 columns)
  mk(5,
    [1,0,3,0,2, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 1,0,3,0,2],
    [1,3,3,3,2, 1,3,3,3,2, 1,3,3,3,2, 1,3,3,3,2, 1,3,3,3,2]
  ),

  // Puzzle 5: 6×6, 4 colors — quadrant design
  // 1: top-left 3×3 (endpoints at (0,0) and (2,1))
  // 2: top-right 3×3 (endpoints at (0,3) and (2,4))
  // 3: bottom-left 3×3 (endpoints at (3,1) and (5,0))
  // 4: bottom-right 3×3 (endpoints at (3,4) and (5,3))
  mk(6,
    [1,0,0,2,0,0, 0,0,0,0,0,0, 0,1,0,0,2,0, 0,3,0,0,4,0, 0,0,0,0,0,0, 3,0,0,4,0,0],
    [1,1,1,2,2,2, 1,1,1,2,2,2, 1,1,1,2,2,2, 3,3,3,4,4,4, 3,3,3,4,4,4, 3,3,3,4,4,4]
  ),
];
