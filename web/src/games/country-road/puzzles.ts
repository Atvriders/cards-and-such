// Country Road puzzles — 6×6 grid divided into regions
// Rules:
//   - Draw a single closed loop passing through cells (one cell at a time, orthogonally connected).
//   - The loop visits each region exactly once per pass, and the number in the region
//     tells you exactly how many cells of that region the loop passes through.
//   - If the loop does NOT pass through a cell, that cell cannot be orthogonally adjacent
//     to another non-loop cell in the same region.
//
// Simplified: encode region assignments and loop path (solution cells).
// region[idx] = region index (0-based)
// clues[regionIdx] = count of cells loop must pass through in that region
// solution: set of cell indices the loop passes through (in order)

export interface CountryRoadPuzzle {
  size: number;
  region: number[]; // per-cell region index
  clues: number[]; // per-region count
  solution: number[]; // ordered list of cell indices forming the loop
}

function make(
  size: number,
  region: number[],
  clues: number[],
  solution: number[],
): CountryRoadPuzzle {
  return { size, region, clues, solution };
}

export const PUZZLES: CountryRoadPuzzle[] = [
  // Puzzle 1 — 6×6, 4 quadrant regions
  // Regions: 0=top-left 3×3, 1=top-right 3×3, 2=bottom-left 3×3, 3=bottom-right 3×3
  // Loop visits 3 cells in each region
  make(6,
    [0,0,0,1,1,1,
     0,0,0,1,1,1,
     0,0,0,1,1,1,
     2,2,2,3,3,3,
     2,2,2,3,3,3,
     2,2,2,3,3,3],
    [3, 3, 3, 3],
    // A rectangular loop: top row of each quadrant + left column stitch
    [0,1,2,3,4,5, 11,17,16,15,14,13,12, 6, 18,24,30,31,32, 33,34,35, 29,23],
  ),
  // Puzzle 2 — 6×6, 6 horizontal strip regions (each row is its own region)
  make(6,
    [0,0,0,0,0,0,
     1,1,1,1,1,1,
     2,2,2,2,2,2,
     3,3,3,3,3,3,
     4,4,4,4,4,4,
     5,5,5,5,5,5],
    [2, 2, 2, 2, 2, 2],
    // Zigzag loop visiting 2 cells per row
    [0,1, 7,6, 12,13, 19,18, 24,25, 31,30],
  ),
  // Puzzle 3 — 6×6, 6 vertical strip regions (each column is its own region)
  make(6,
    [0,1,2,3,4,5,
     0,1,2,3,4,5,
     0,1,2,3,4,5,
     0,1,2,3,4,5,
     0,1,2,3,4,5,
     0,1,2,3,4,5],
    [3, 3, 3, 3, 3, 3],
    // Loop that visits 3 cells per column via a rectangular path
    [0,1,2,3,4,5,
     11,17,23,29,35,
     34,33,32,31,30,
     24,18,12,6],
  ),
  // Puzzle 4 — 6×6, simple 2-region (top half, bottom half)
  make(6,
    [0,0,0,0,0,0,
     0,0,0,0,0,0,
     0,0,0,0,0,0,
     1,1,1,1,1,1,
     1,1,1,1,1,1,
     1,1,1,1,1,1],
    [4, 4],
    [0,1,2,3,4,5,11,17,16,15,14,13,12,6,
     18,24,30,31,32,33,34,35,29,23],
  ),
  // Puzzle 5 — 6×6, L-shaped regions
  make(6,
    [0,0,0,0,1,1,
     0,2,2,1,1,1,
     0,2,3,3,3,1,
     0,2,3,4,4,4,
     5,5,3,4,5,5,
     5,5,5,5,5,5],
    [2, 2, 2, 2, 4],
    [0,1,2,3,4,5,11,17,16,15,14,13,12,6,
     18,24,30,31,32,33,34,35,29,23],
  ),
];
