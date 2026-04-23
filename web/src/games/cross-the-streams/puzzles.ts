// Cross the Streams puzzle
// Binary logic puzzle: each cell is either filled (black) or empty (white).
// Row and column clues specify "runs" of consecutive filled cells,
// but clues may also include wildcards (?) and "any block" (*).
// We use a simplified version: standard nonogram-style clues (no wildcards).
// The twist: some clue values are "?" (any positive run) giving extra deduction challenge.

// We implement with standard integer run-length clues for simplicity.
// A row/col clue like [3,1] means one run of 3 filled, gap, one run of 1 filled.

export interface CTSPuzzle {
  rows: number;
  cols: number;
  /** Clue groups per row. Each group is a run length (positive integer). */
  rowClues: number[][];
  /** Clue groups per column. */
  colClues: number[][];
  /** true = filled (black) in solution */
  solution: boolean[];
}

function makeCTS(rows: number, cols: number, sol: boolean[][]): CTSPuzzle {
  const flat = sol.flat();
  function runsOf(cells: boolean[]): number[] {
    const runs: number[] = [];
    let count = 0;
    for (const b of cells) {
      if (b) count++;
      else if (count > 0) { runs.push(count); count = 0; }
    }
    if (count > 0) runs.push(count);
    return runs.length > 0 ? runs : [0];
  }
  const rowClues = sol.map(row => runsOf(row));
  const colClues = Array.from({ length: cols }, (_, c) =>
    runsOf(Array.from({ length: rows }, (__, r) => sol[r]![c]!))
  );
  return { rows, cols, rowClues, colClues, solution: flat };
}

// 5×5 easy
export const PUZZLES_EASY: CTSPuzzle[] = [
  makeCTS(5, 5, [
    [true,  true,  false, false, false],
    [true,  true,  true,  false, false],
    [false, true,  true,  true,  false],
    [false, false, true,  true,  true],
    [false, false, false, true,  true],
  ]),
  makeCTS(5, 5, [
    [true,  false, true,  false, true],
    [false, true,  false, true,  false],
    [true,  false, true,  false, true],
    [false, true,  false, true,  false],
    [true,  false, true,  false, true],
  ]),
  makeCTS(5, 5, [
    [true,  true,  true,  true,  true],
    [true,  false, false, false, true],
    [true,  false, true,  false, true],
    [true,  false, false, false, true],
    [true,  true,  true,  true,  true],
  ]),
  makeCTS(5, 5, [
    [false, true,  true,  true,  false],
    [true,  false, false, false, true],
    [true,  false, false, false, true],
    [true,  false, false, false, true],
    [false, true,  true,  true,  false],
  ]),
];

// 6×6 medium
export const PUZZLES_MEDIUM: CTSPuzzle[] = [
  makeCTS(6, 6, [
    [true,  true,  false, false, true,  true],
    [true,  false, false, false, false, true],
    [false, false, true,  true,  false, false],
    [false, false, true,  true,  false, false],
    [true,  false, false, false, false, true],
    [true,  true,  false, false, true,  true],
  ]),
  makeCTS(6, 6, [
    [true,  true,  true,  false, false, false],
    [true,  false, true,  false, false, false],
    [true,  true,  true,  false, false, false],
    [false, false, false, true,  false, true],
    [false, false, false, true,  false, true],
    [false, false, false, true,  true,  true],
  ]),
];
