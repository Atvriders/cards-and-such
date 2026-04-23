// Domino Placement puzzles
// A standard set of 28 dominoes (0-0 through 6-6) placed on a 7×8 grid.
// Grid shows numbers (0-6); player finds which cells form each domino pair.

export interface DominoPuzzle {
  rows: number;
  cols: number;
  /** The number grid (values 0-6) */
  grid: number[];
  /**
   * solution[idx] = domino ID (0-27). Adjacent cells with same ID form a domino.
   * dominoId(lo,hi) = lo*(13-lo)/2 + hi (standard ordering)
   */
  solution: number[];
}

// All puzzles use horizontal domino pairs, 4 per row, 7 rows = 28 dominoes total.
// Each puzzle scrambles the order of the 28 dominoes differently.

// Puzzle 1: dominos in standard order (0-0, 0-1, ..., 6-6)
export const PUZZLES: DominoPuzzle[] = [
  {
    rows: 7, cols: 8,
    grid: [0,0,0,1,0,2,0,3, 0,4,0,5,0,6,1,1, 1,2,1,3,1,4,1,5, 1,6,2,2,2,3,2,4, 2,5,2,6,3,3,3,4, 3,5,3,6,4,4,4,5, 4,6,5,5,5,6,6,6],
    solution: [0,0,1,1,2,2,3,3, 4,4,5,5,6,6,7,7, 8,8,9,9,10,10,11,11, 12,12,13,13,14,14,15,15, 16,16,17,17,18,18,19,19, 20,20,21,21,22,22,23,23, 24,24,25,25,26,26,27,27],
  },
  // Puzzle 2: shifted by 7 (rotate ordering)
  {
    rows: 7, cols: 8,
    grid: [1,1,1,2,1,3,1,4, 1,5,1,6,2,2,2,3, 2,4,2,5,2,6,3,3, 3,4,3,5,3,6,4,4, 4,5,4,6,5,5,5,6, 6,6,0,0,0,1,0,2, 0,3,0,4,0,5,0,6],
    solution: [7,7,8,8,9,9,10,10, 11,11,12,12,13,13,14,14, 15,15,16,16,17,17,18,18, 19,19,20,20,21,21,22,22, 23,23,24,24,25,25,26,26, 27,27,0,0,1,1,2,2, 3,3,4,4,5,5,6,6],
  },
  // Puzzle 3: shifted by 14
  {
    rows: 7, cols: 8,
    grid: [2,2,2,3,2,4,2,5, 2,6,3,3,3,4,3,5, 3,6,4,4,4,5,4,6, 5,5,5,6,6,6,0,0, 0,1,0,2,0,3,0,4, 0,5,0,6,1,1,1,2, 1,3,1,4,1,5,1,6],
    solution: [13,13,14,14,15,15,16,16, 17,17,18,18,19,19,20,20, 21,21,22,22,23,23,24,24, 25,25,26,26,27,27,0,0, 1,1,2,2,3,3,4,4, 5,5,6,6,7,7,8,8, 9,9,10,10,11,11,12,12],
  },
];
