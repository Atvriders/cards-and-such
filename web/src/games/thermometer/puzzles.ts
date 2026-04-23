// Thermometer puzzle
// Grid has thermometers (sequences of cells from bulb to tip).
// Mercury fills from the bulb upward continuously.
// Row/column clues = total filled cells in that row/col.

export interface Thermometer {
  /** Cells in order from bulb (index 0) to tip (last), as [r,c] pairs */
  cells: [number, number][];
}

export interface ThermometerPuzzle {
  rows: number;
  cols: number;
  thermometers: Thermometer[];
  /** rowClues[r] = total filled cells in row r */
  rowClues: number[];
  /** colClues[c] = total filled cells in col c */
  colClues: number[];
  /** solution[r*cols+c] = true if filled */
  solution: boolean[];
}

function mk(
  rows: number,
  cols: number,
  therms: [number, number][][],
  solution: boolean[]
): ThermometerPuzzle {
  const thermometers: Thermometer[] = therms.map(cells => ({ cells }));
  const rowClues = new Array<number>(rows).fill(0);
  const colClues = new Array<number>(cols).fill(0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (solution[r * cols + c] === true) { rowClues[r]!++; colClues[c]!++; }
    }
  }
  return { rows, cols, thermometers, rowClues, colClues, solution };
}

// 6×6 puzzles
export const PUZZLES: ThermometerPuzzle[] = [
  // Puzzle 1 — 6×6
  mk(6, 6,
    [
      [[0,0],[1,0],[2,0],[3,0]], // vertical therm col 0
      [[0,1],[0,2],[0,3]],       // horizontal therm row 0
      [[1,5],[1,4],[1,3]],       // horizontal reversed therm
      [[2,1],[3,1],[4,1]],       // vertical therm
      [[2,2],[2,3],[2,4]],       // horizontal therm
      [[3,5],[4,5],[5,5]],       // vertical therm
      [[4,2],[5,2],[5,3]],       // L-shape therm
      [[4,3],[4,4],[5,4]],       // L-shape therm
      [[5,0],[5,1]],             // horizontal therm row 5
    ],
    // solution: build from filled = bottom of each therm
    [
      true, true,false,false,false,false,  // row 0: col0,col1
      true,false,false,false,false,false,  // row 1: col0
      true, true, true, true,false,false,  // row 2: col0,1,2,3
      true, true,false,false,false, true,  // row 3
      true, true, true, true,false, true,  // row 4
      true, true, true, true,false, true,  // row 5
    ]
  ),
  // Puzzle 2 — 6×6
  mk(6, 6,
    [
      [[5,0],[4,0],[3,0],[2,0]],  // vertical, bulb at bottom
      [[5,1],[5,2],[5,3]],        // horizontal bulb at left
      [[4,1],[3,1],[2,1]],        // vertical up
      [[4,2],[4,3],[4,4]],        // horizontal
      [[3,2],[2,2],[1,2]],        // vertical up
      [[3,3],[2,3],[1,3]],        // vertical up
      [[0,0],[0,1],[0,2]],        // horizontal row 0
      [[1,4],[2,4],[3,4],[4,5]],  // L-shape
      [[0,5],[1,5],[2,5]],        // vertical
    ],
    [
      true, true, true,false,false, true,  // row 0
      false,false, true, true,false, true,  // row 1
      true,false, true, true, true, true,  // row 2
      true, true, true, true, true,false,  // row 3
      true, true, true, true,false, true,  // row 4
      true, true, true,false,false,false,  // row 5
    ]
  ),
  // Puzzle 3 — 5×5
  mk(5, 5,
    [
      [[4,0],[3,0],[2,0],[1,0],[0,0]], // full col 0 vertical
      [[4,1],[4,2],[4,3]],             // horizontal bulb at left
      [[3,1],[3,2]],                   // horizontal
      [[2,1],[2,2],[2,3]],             // horizontal
      [[1,1],[1,2]],                   // horizontal
      [[0,1],[0,2],[0,3],[0,4]],       // horizontal row 0
      [[1,4],[2,4],[3,4]],             // vertical
      [[3,3],[4,4],[4,3]],             // L-shape
    ],
    [
      true, true, true, true, true,  // row 0 all filled
      true, true, true,false, true,  // row 1
      true, true, true,false, true,  // row 2
      true, true,false, true, true,  // row 3
      true, true, true, true,false,  // row 4
    ]
  ),
  // Puzzle 4 — 5×5
  mk(5, 5,
    [
      [[0,0],[1,0],[2,0]],
      [[0,1],[0,2],[0,3],[0,4]],
      [[1,1],[1,2],[1,3]],
      [[2,1],[3,1],[4,1]],
      [[2,2],[2,3],[2,4]],
      [[3,2],[4,2],[4,3]],
      [[3,3],[3,4],[4,4]],
      [[4,0],[3,0]],
    ],
    [
      true, true, true, true,false,
      true, true, true,false,false,
      true, true, true, true,false,
      true, true,false, true, true,
      true, true, true, true, true,
    ]
  ),
];
