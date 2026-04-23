// Battleship Solitaire puzzles
// Grid cells: 0=water, 1=ship segment
// Ships: pre-designed layouts. Row/col clues give count of ship segments in that line.
// Some cells are pre-revealed.

export interface BSPuzzle {
  size: number;
  rowClues: number[];  // ship segments in each row
  colClues: number[];  // ship segments in each column
  /** null = unknown; true = ship; false = water (pre-revealed) */
  revealed: (boolean | null)[];
  /** full solution: true=ship */
  solution: boolean[];
}

function makePuzzle(size: number, shipGrid: boolean[], revealIdx: number[]): BSPuzzle {
  const rowClues = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (__, c) => shipGrid[r * size + c]!).filter(Boolean).length
  );
  const colClues = Array.from({ length: size }, (_, c) =>
    Array.from({ length: size }, (__, r) => shipGrid[r * size + c]!).filter(Boolean).length
  );
  const revealed: (boolean | null)[] = new Array(size * size).fill(null);
  for (const i of revealIdx) revealed[i] = shipGrid[i]!;
  return { size, rowClues, colClues, revealed, solution: shipGrid };
}

function shipRow(size: number, ...rows: [number, number[]][]): boolean[] {
  const g = new Array(size * size).fill(false);
  for (const [r, cols] of rows) for (const c of cols) g[r * size + c] = true;
  return g;
}

// 6×6 puzzles
export const PUZZLES_EASY: BSPuzzle[] = [
  // Ships in rows: 0→[0,1,2], 2→[4,5], 4→[1], 5→[3,4]
  makePuzzle(6, shipRow(6,
    [0, [0,1,2]],
    [2, [4,5]],
    [4, [1]],
    [5, [3,4]]
  ), [0, 8, 24]),  // reveal (0,0)=ship, (1,2)=water, (4,0)=water
  // Ships: 1→[0,1], 3→[2,3,4], 5→[5]
  makePuzzle(6, shipRow(6,
    [1, [0,1]],
    [3, [2,3,4]],
    [5, [5]]
  ), [6, 20, 35]),
  // Ships: 0→[3], 1→[3], 2→[1,2,3], 4→[0,1], 5→[4]
  makePuzzle(6, shipRow(6,
    [0, [3]],
    [1, [3]],
    [2, [1,2,3]],
    [4, [0,1]],
    [5, [4]]
  ), [3, 9, 13]),
];

// 8×8 puzzles
export const PUZZLES_MEDIUM: BSPuzzle[] = [
  // 4-ship, 3-ship, 2-ship, 1-ship layout
  makePuzzle(8, shipRow(8,
    [0, [0,1,2,3]],
    [2, [6,7]],
    [4, [2,3,4]],
    [6, [0]],
    [7, [5,6,7]]
  ), [0, 22, 34, 48]),
  makePuzzle(8, shipRow(8,
    [0, [1,2,3,4]],
    [2, [0,1]],
    [3, [6,7]],
    [5, [3,4,5]],
    [7, [7]]
  ), [1, 16, 31, 47]),
];
