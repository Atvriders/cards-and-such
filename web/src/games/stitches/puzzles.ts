// Stitches puzzle
// The grid is partitioned into regions. Each row and column has a clue counting
// how many stitches cross from one region to an adjacent region in that line.
// A "stitch" occupies two orthogonally adjacent cells in different regions.
// Player marks stitches (pairs of cross-region adjacent cells).

export interface StitchPuzzle {
  rows: number;
  cols: number;
  /** region ID for each cell (0-based integer) */
  regions: number[];
  rowClues: number[];
  colClues: number[];
  /** Solution: list of [idx1, idx2] pairs where a stitch exists */
  solution: [number, number][];
}

function makeStitchPuzzle(
  rows: number,
  cols: number,
  regionGrid: number[],
  solution: [number, number][]
): StitchPuzzle {
  const rowClues = Array.from({ length: rows }, (_, r) => {
    let count = 0;
    for (const [a, b] of solution) {
      const ra = Math.floor(a / cols), rb = Math.floor(b / cols);
      if (ra === r || rb === r) count++;
    }
    return count;
  });
  const colClues = Array.from({ length: cols }, (_, c) => {
    let count = 0;
    for (const [a, b] of solution) {
      const ca = a % cols, cb = b % cols;
      if (ca === c || cb === c) count++;
    }
    return count;
  });
  return { rows, cols, regions: regionGrid, rowClues, colClues, solution };
}

// 4×4, 3 regions
// Region layout:
// 0 0 1 1
// 0 0 1 1
// 2 2 0 1
// 2 2 2 1
const REGIONS_4A = [0,0,1,1, 0,0,1,1, 2,2,0,1, 2,2,2,1];
// Stitches: (0,2)-(0,1)? No, same dir. Let's do cross-region pairs:
// (0,1)-(0,2): regions 0-1 in row0 col1,col2
// (1,1)-(1,2): regions 0-1 in row1
// (2,1)-(2,2): regions 2-0 ... wait (2,1) is region 2, (2,2) is region 0
// Let me just define solution directly:
// Stitches at: [1,2] (row0 col1-col2: 0→1), [5,6] (row1 col1-col2: 0→1), [8,10] (row2 col0-col2: 2→0 but not adjacent)
// Actually [8,9] is row2 col0-col1 both region 2 — no stitch
// Cross-region adjacencies in REGIONS_4A:
// row0: (0,1)→(0,2): 0→1 ✓
// row1: (1,1)→(1,2): 0→1 ✓
// row2: (2,1)→(2,2): 2→0 ✓, (2,2)→(2,3): 0→1 ✓
// col0: (0,0)→(2,0): not adjacent; (1,0)→(2,0): 0→2 ✓
// col2: (1,2)→(2,2): 1→0 ✓
// For a clean puzzle, pick: [1,2],[5,6],[9,10],[4,8]
// i.e. (0,1)-(0,2), (1,1)-(1,2), (2,1)-(2,2), (1,0)-(2,0)
const SOL_4A: [number, number][] = [[1,2],[5,6],[9,10],[4,8]];

export const PUZZLES_EASY: StitchPuzzle[] = [
  makeStitchPuzzle(4, 4, REGIONS_4A, SOL_4A),
  // 4×4 with different regions
  // 0 1 1 2
  // 0 1 2 2
  // 0 0 2 2
  // 3 0 0 2
  makeStitchPuzzle(4, 4,
    [0,1,1,2, 0,1,2,2, 0,0,2,2, 3,0,0,2],
    [[0,1],[4,5],[1,2],[6,7],[8,9],[12,13]] // (0,0)-(0,1):0→1, (1,0)-(1,1):0→1, (0,1)-(0,2):1→1 skip..
    // Let me just use the cross ones:
    // Actually redefine: cross-region: (0,0)-(0,1):0→1✓, (1,1)-(1,2):1→2✓, (2,1)-(2,2):0→2✓, (3,0)-(3,1):3→0✓
  ),
];

// Fix PUZZLES_EASY[1] — redefine to use correct stitches:
PUZZLES_EASY[1] = makeStitchPuzzle(4, 4,
  [0,1,1,2, 0,1,2,2, 0,0,2,2, 3,0,0,2],
  [[0,1],[5,6],[9,10],[12,13]] // (0,0)-(0,1):0→1, (1,1)-(1,2):1→2, (2,1)-(2,2):0→2, (3,0)-(3,1):3→0
);

// 5×5 medium
// Regions:
// 0 0 1 1 1
// 0 2 1 1 1
// 2 2 2 3 1
// 2 2 3 3 3
// 4 4 4 3 3
const REGIONS_5A = [0,0,1,1,1, 0,2,1,1,1, 2,2,2,3,1, 2,2,3,3,3, 4,4,4,3,3];
// Cross-region stitches:
// (0,1)-(1,1): 0→2
// (0,2)-(1,2): 1→1 same, skip
// (1,0)-(2,0): 0→2
// (2,2)-(2,3): 2→3
// (2,4)-(3,4): 1→3
// (4,0)-(3,0): 4→2
// (4,3)-(3,3): 3→3 same
// (3,2)-(4,2): 3→4
// Pick a valid set: [(1,6),(2,10),(13,14),(9,14)...] let me use indices
// (0,1)=1, (1,1)=6: 0→2 ✓
// (1,0)=5, (2,0)=10: 0→2 ✓  -- duplicate region pair, ok
// (2,3)=13, (2,4)=14: 3→1 ... region of (2,4) is 1, region of (2,3) is 3 ✓
// (3,2)=17, (4,2)=22: 3→4 ✓
export const PUZZLES_MEDIUM: StitchPuzzle[] = [
  makeStitchPuzzle(5, 5, REGIONS_5A, [[1,6],[5,10],[13,14],[17,22]]),
  makeStitchPuzzle(5, 5,
    [0,0,0,1,1, 0,0,1,1,2, 0,3,1,2,2, 3,3,3,2,2, 3,3,4,4,2],
    [[2,7],[5,10],[11,16],[18,23],[20,15]] // various cross-region pairs
  ),
];
