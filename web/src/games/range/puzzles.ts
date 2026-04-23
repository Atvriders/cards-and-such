// Range puzzle (inspired by Kurodoko / Range)
// Shade some cells black. Numbered cells remain white and see exactly N white cells
// in their 4 orthogonal directions (including themselves). Black cells cannot be
// adjacent to each other (no two black cells touch orthogonally). All white cells
// must remain connected.

export interface RangePuzzle {
  rows: number;
  cols: number;
  /** null = blank (shade or not); number = clue cell (always white, sees that many white cells 4-dir) */
  grid: (number | null)[];
  /** true = shaded black in solution */
  solution: boolean[];
}

function makePuzzle(rows: number, cols: number, clues: [number, number, number][], shaded: [number, number][]): RangePuzzle {
  const grid: (number | null)[] = new Array(rows * cols).fill(null);
  for (const [r, c, v] of clues) grid[r * cols + c] = v;
  const solution: boolean[] = new Array(rows * cols).fill(false);
  for (const [r, c] of shaded) solution[r * cols + c] = true;
  return { rows, cols, grid, solution };
}

// 5×5 easy — all clue values verified with Python
export const PUZZLES_EASY: RangePuzzle[] = [
  // Blacks at (0,2),(2,4),(4,2),(2,0)
  // Clue at (0,0)=3, (0,4)=3, (4,0)=3, (4,4)=3, (2,2)=5
  makePuzzle(5, 5,
    [[0,0,3],[0,4,3],[4,0,3],[4,4,3],[2,2,5]],
    [[0,2],[2,4],[4,2],[2,0]]
  ),
  // Blacks at (2,2) only
  // Clues: (0,2)=6, (2,0)=6, (2,4)=6, (4,2)=6
  makePuzzle(5, 5,
    [[0,2,6],[2,0,6],[2,4,6],[4,2,6]],
    [[2,2]]
  ),
  // Blacks at (0,4),(4,0),(2,2)
  // Clues: (0,0)=7, (0,2)=5, (2,0)=5, (2,4)=5, (4,2)=5, (4,4)=7
  makePuzzle(5, 5,
    [[0,0,7],[0,2,5],[2,0,5],[2,4,5],[4,2,5],[4,4,7]],
    [[0,4],[4,0],[2,2]]
  ),
];

// 6×6 medium — all clue values verified
export const PUZZLES_MEDIUM: RangePuzzle[] = [
  // Blacks at (0,1),(1,4),(3,1),(4,4),(2,3)
  // Clues: (0,3)=5, (3,5)=9, (5,0)=11, (5,5)=11
  // But 11 seems too high for a 6x6 (max possible is 11 from corner with no blacks: 1+5+5=11)
  // Use simpler clue set:
  makePuzzle(6, 6,
    [[1,0,9],[0,3,5],[3,5,9],[5,5,11]],
    [[0,1],[1,4],[3,1],[4,4],[2,3]]
  ),
  // Blacks at (1,0),(0,3),(3,5),(5,2),(2,2)
  // Clues: (0,1)=8, (3,2)=6, (5,0)=5, (5,4)=8
  makePuzzle(6, 6,
    [[0,1,8],[3,2,6],[5,0,5],[5,4,8]],
    [[1,0],[0,3],[3,5],[5,2],[2,2]]
  ),
];
