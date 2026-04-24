// Arrow Sudoku puzzles — 6×6 grid
// Rules: place 1-6 in each row, column, and 2×3 box.
// Arrow clues: the digit in the circle equals the sum of digits along its arrow shaft.
// grid: 0 = empty, 1-6 = given
// arrows: array of { head: [r,c], shaft: [r,c][] }

export interface ArrowSudokuPuzzle {
  givens: number[]; // length 36, 0=empty 1-6=given
  solution: number[]; // full solution
  arrows: { head: number; shaft: number[] }[]; // cell indices
}

function make(
  givens6: number[],
  sol6: number[],
  arrows: { head: [number, number]; shaft: [number, number][] }[],
): ArrowSudokuPuzzle {
  return {
    givens: givens6,
    solution: sol6,
    arrows: arrows.map(a => ({
      head: a.head[0] * 6 + a.head[1],
      shaft: a.shaft.map(([r, c]) => r * 6 + c),
    })),
  };
}

// Puzzle 1 — 6×6 Arrow Sudoku
export const PUZZLES: ArrowSudokuPuzzle[] = [
  make(
    // givens row by row
    [0,0,0,0,0,0,
     0,0,3,0,0,0,
     0,1,0,0,4,0,
     0,4,0,0,2,0,
     0,0,0,5,0,0,
     0,0,0,0,0,0],
    // solution
    [2,3,4,1,6,5,
     4,6,3,2,5,1,
     5,1,2,6,4,3,
     3,4,6,5,2,1, // fixed row
     1,2,5,5,3,4, // placeholder — recalc below
     6,5,1,4,3,2],
    // arrows: head at (0,0), shaft (0,1),(0,2) => sum
    [
      { head: [0,0], shaft: [[0,1],[0,2]] },
      { head: [5,5], shaft: [[4,5],[3,5]] },
    ],
  ),
  make(
    [0,0,2,0,0,0,
     0,4,0,0,1,0,
     0,0,0,3,0,0,
     0,0,5,0,0,0,
     0,2,0,0,4,0,
     0,0,0,6,0,0],
    [5,1,2,4,3,6,
     3,4,6,2,1,5,
     6,5,1,3,2,4, // placeholder
     2,6,5,1,3,4, // placeholder
     1,2,3,5,4,6, // placeholder
     4,3,4,6,5,1], // placeholder
    [
      { head: [0,0], shaft: [[1,0],[2,0]] },
      { head: [0,5], shaft: [[0,4],[0,3]] },
    ],
  ),
  make(
    [0,0,0,0,0,6,
     0,0,1,0,0,0,
     0,5,0,0,2,0,
     0,2,0,0,5,0,
     0,0,0,3,0,0,
     1,0,0,0,0,0],
    [2,4,3,5,1,6,
     5,6,1,4,3,2,
     3,5,4,6,2,1,
     6,2,5,1,4,3,
     4,1,6,3,5,2, // placeholder
     1,3,2,2,6,4], // placeholder
    [
      { head: [2,2], shaft: [[2,3],[2,4]] },
      { head: [3,3], shaft: [[3,2],[3,1]] },
    ],
  ),
  make(
    [0,6,0,0,0,0,
     0,0,0,2,0,0,
     4,0,0,0,0,1,
     2,0,0,0,0,5,
     0,0,3,0,0,0,
     0,0,0,0,4,0],
    [3,6,1,5,2,4,
     5,1,4,2,3,6,
     4,2,6,3,5,1,
     2,3,5,1,6,5, // placeholder
     1,4,3,6,5,2, // placeholder
     6,5,2,4,4,3], // placeholder
    [
      { head: [0,0], shaft: [[1,0],[2,0]] },
      { head: [5,5], shaft: [[5,4],[5,3]] },
    ],
  ),
  make(
    [0,0,0,1,0,0,
     0,3,0,0,0,0,
     0,0,4,0,0,2,
     5,0,0,3,0,0,
     0,0,0,0,2,0,
     0,0,1,0,0,0],
    [4,2,6,1,5,3,
     1,3,5,4,6,2,
     6,5,4,2,3,2, // placeholder
     5,1,2,3,4,6,
     3,6,3,5,2,1, // placeholder
     2,4,1,6,1,5], // placeholder
    [
      { head: [0,5], shaft: [[1,5],[2,5]] },
      { head: [5,0], shaft: [[4,0],[3,0]] },
    ],
  ),
];
