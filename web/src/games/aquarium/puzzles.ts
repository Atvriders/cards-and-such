// Aquarium puzzles
// Grid divided into regions (aquariums). Water fills from bottom up within each region.
// Row/col clues = number of filled cells in that row/col.
// Rule: if any cell in an aquarium's row is filled, ALL cells in that aquarium
// at or below that row are also filled (water physics).

export interface AquariumPuzzle {
  size: number;
  /** region[idx] = aquarium ID (0-based) */
  region: number[];
  rowClues: number[];
  colClues: number[];
  /** solution: true = filled with water */
  solution: boolean[];
}

function makeAquarium(
  size: number,
  regionRows: number[][], // regionRows[regionId] = list of (r*size+c) indices
  filledCells: number[], // solution indices
): AquariumPuzzle {
  const region = new Array(size * size).fill(-1);
  for (let ri = 0; ri < regionRows.length; ri++) {
    for (const idx of regionRows[ri]!) region[idx] = ri;
  }
  const solution = new Array(size * size).fill(false);
  for (const i of filledCells) solution[i] = true;

  const rowClues = Array.from({ length: size }, (_, r) => {
    let count = 0;
    for (let c = 0; c < size; c++) if (solution[r * size + c]) count++;
    return count;
  });
  const colClues = Array.from({ length: size }, (_, c) => {
    let count = 0;
    for (let r = 0; r < size; r++) if (solution[r * size + c]) count++;
    return count;
  });

  return { size, region, rowClues, colClues, solution };
}

const I = (r: number, c: number, N: number) => r * N + c;

// 6×6 easy puzzles
export const PUZZLES_EASY: AquariumPuzzle[] = [
  // E1: 3 vertical aquariums (cols 0-1, 2-3, 4-5)
  // Aquarium 0: cols 0-1 all rows → fill bottom 2 rows: rows 4-5 cols 0-1
  // Aquarium 1: cols 2-3 all rows → fill bottom 3 rows: rows 3-5 cols 2-3
  // Aquarium 2: cols 4-5 all rows → fill bottom 1 row: row 5 cols 4-5
  makeAquarium(6,
    [
      [I(0,0,6),I(1,0,6),I(2,0,6),I(3,0,6),I(4,0,6),I(5,0,6),I(0,1,6),I(1,1,6),I(2,1,6),I(3,1,6),I(4,1,6),I(5,1,6)],
      [I(0,2,6),I(1,2,6),I(2,2,6),I(3,2,6),I(4,2,6),I(5,2,6),I(0,3,6),I(1,3,6),I(2,3,6),I(3,3,6),I(4,3,6),I(5,3,6)],
      [I(0,4,6),I(1,4,6),I(2,4,6),I(3,4,6),I(4,4,6),I(5,4,6),I(0,5,6),I(1,5,6),I(2,5,6),I(3,5,6),I(4,5,6),I(5,5,6)],
    ],
    // Fill aquarium 0 rows 4-5, aquarium 1 rows 3-5, aquarium 2 row 5
    [I(4,0,6),I(5,0,6),I(4,1,6),I(5,1,6),
     I(3,2,6),I(4,2,6),I(5,2,6),I(3,3,6),I(4,3,6),I(5,3,6),
     I(5,4,6),I(5,5,6)]
  ),
  // E2: 2 horizontal aquariums (rows 0-2, rows 3-5) divided at col 3
  // Actually use L-shaped regions
  makeAquarium(6,
    [
      // Region 0: top-left 3x3
      [I(0,0,6),I(0,1,6),I(0,2,6),I(1,0,6),I(1,1,6),I(1,2,6),I(2,0,6),I(2,1,6),I(2,2,6)],
      // Region 1: top-right 3x3
      [I(0,3,6),I(0,4,6),I(0,5,6),I(1,3,6),I(1,4,6),I(1,5,6),I(2,3,6),I(2,4,6),I(2,5,6)],
      // Region 2: bottom-left 3x3
      [I(3,0,6),I(3,1,6),I(3,2,6),I(4,0,6),I(4,1,6),I(4,2,6),I(5,0,6),I(5,1,6),I(5,2,6)],
      // Region 3: bottom-right 3x3
      [I(3,3,6),I(3,4,6),I(3,5,6),I(4,3,6),I(4,4,6),I(4,5,6),I(5,3,6),I(5,4,6),I(5,5,6)],
    ],
    // Fill: region 0 rows 2-2 (bottom row of region), region 1 rows 1-2, region 2 rows 3-5, region 3 rows 4-5
    [I(2,0,6),I(2,1,6),I(2,2,6),  // R0 bottom row of 3x3 (relative row 2)
     I(1,3,6),I(1,4,6),I(1,5,6),I(2,3,6),I(2,4,6),I(2,5,6), // R1 rows 1-2
     I(3,0,6),I(3,1,6),I(3,2,6),I(4,0,6),I(4,1,6),I(4,2,6),I(5,0,6),I(5,1,6),I(5,2,6), // R2 all
     I(4,3,6),I(4,4,6),I(4,5,6),I(5,3,6),I(5,4,6),I(5,5,6)] // R3 rows 4-5
  ),
  // E3: 6 columns each their own aquarium
  makeAquarium(6,
    Array.from({length:6}, (_, c) => Array.from({length:6}, (_, r) => I(r,c,6))),
    // Fill each column to different heights
    [I(5,0,6),I(4,0,6),I(3,0,6), // col 0: 3 filled
     I(5,1,6),I(4,1,6), // col 1: 2 filled
     I(5,2,6),I(4,2,6),I(3,2,6),I(2,2,6), // col 2: 4 filled
     I(5,3,6), // col 3: 1 filled
     I(5,4,6),I(4,4,6),I(3,4,6),I(2,4,6),I(1,4,6), // col 4: 5 filled
     I(5,5,6),I(4,5,6),I(3,5,6)] // col 5: 3 filled
  ),
  // E4: 3 L-shaped aquariums
  makeAquarium(6,
    [
      // Region 0: top row + left col (L shape)
      [I(0,0,6),I(0,1,6),I(0,2,6),I(0,3,6),I(0,4,6),I(0,5,6),I(1,0,6),I(2,0,6),I(3,0,6),I(4,0,6),I(5,0,6)],
      // Region 1: rows 1-2, cols 1-5
      [I(1,1,6),I(1,2,6),I(1,3,6),I(1,4,6),I(1,5,6),I(2,1,6),I(2,2,6),I(2,3,6),I(2,4,6),I(2,5,6)],
      // Region 2: rows 3-5, cols 1-5
      [I(3,1,6),I(3,2,6),I(3,3,6),I(3,4,6),I(3,5,6),I(4,1,6),I(4,2,6),I(4,3,6),I(4,4,6),I(4,5,6),I(5,1,6),I(5,2,6),I(5,3,6),I(5,4,6),I(5,5,6)],
    ],
    // Fill region 0: rows 4-5 of col 0 + row 0 not filled (water from bottom)
    // Water physics: fill bottom of region within each row where water reaches
    // For region 0 (L-shape in col 0 rows 0-5 + row 0 cols 0-5):
    //   Water level at row 4 of col-0 portion: rows 4,5 of col 0 filled
    // For region 1 (rows 1-2, cols 1-5): fill row 2 only
    // For region 2 (rows 3-5, cols 1-5): fill rows 4-5
    [I(4,0,6),I(5,0,6),
     I(2,1,6),I(2,2,6),I(2,3,6),I(2,4,6),I(2,5,6),
     I(4,1,6),I(4,2,6),I(4,3,6),I(4,4,6),I(4,5,6),I(5,1,6),I(5,2,6),I(5,3,6),I(5,4,6),I(5,5,6)]
  ),
];

// 8×8 hard puzzles
export const PUZZLES_HARD: AquariumPuzzle[] = [
  // H1: 8 column aquariums filled to various heights
  makeAquarium(8,
    Array.from({length:8}, (_, c) => Array.from({length:8}, (_, r) => I(r,c,8))),
    [
      I(7,0,8),I(6,0,8),I(5,0,8),I(4,0,8), // col 0: 4
      I(7,1,8),I(6,1,8),I(5,1,8), // col 1: 3
      I(7,2,8),I(6,2,8),I(5,2,8),I(4,2,8),I(3,2,8), // col 2: 5
      I(7,3,8),I(6,3,8), // col 3: 2
      I(7,4,8),I(6,4,8),I(5,4,8),I(4,4,8),I(3,4,8),I(2,4,8), // col 4: 6
      I(7,5,8),I(6,5,8),I(5,5,8),I(4,5,8), // col 5: 4
      I(7,6,8),I(6,6,8),I(5,6,8),I(4,6,8),I(3,6,8),I(2,6,8),I(1,6,8), // col 6: 7
      I(7,7,8),I(6,7,8),I(5,7,8), // col 7: 3
    ]
  ),
  makeAquarium(8,
    [
      Array.from({length:32}, (_, i) => { const r=Math.floor(i/4), c=i%4; return I(r,c,8); }), // left half
      Array.from({length:32}, (_, i) => { const r=Math.floor(i/4), c=i%4+4; return I(r,c,8); }), // right half
    ],
    [
      // Left region fill to row 5 (rows 5-7): 3 rows * 4 cols = 12
      ...Array.from({length:12}, (_, i) => I(5+Math.floor(i/4), i%4, 8)),
      // Right region fill to row 6 (rows 6-7): 2 rows * 4 cols = 8
      ...Array.from({length:8}, (_, i) => I(6+Math.floor(i/4), i%4+4, 8)),
    ]
  ),
  makeAquarium(8,
    [
      // 4 vertical stripes of 2 cols each
      Array.from({length:16}, (_, i) => I(Math.floor(i/2), i%2, 8)),
      Array.from({length:16}, (_, i) => I(Math.floor(i/2), i%2+2, 8)),
      Array.from({length:16}, (_, i) => I(Math.floor(i/2), i%2+4, 8)),
      Array.from({length:16}, (_, i) => I(Math.floor(i/2), i%2+6, 8)),
    ],
    [
      // Region 0 cols 0-1: fill rows 4-7 → 8 cells
      ...Array.from({length:8}, (_, i) => I(4+Math.floor(i/2), i%2, 8)),
      // Region 1 cols 2-3: fill rows 5-7 → 6 cells
      ...Array.from({length:6}, (_, i) => I(5+Math.floor(i/2), i%2+2, 8)),
      // Region 2 cols 4-5: fill rows 3-7 → 10 cells
      ...Array.from({length:10}, (_, i) => I(3+Math.floor(i/2), i%2+4, 8)),
      // Region 3 cols 6-7: fill rows 6-7 → 4 cells
      ...Array.from({length:4}, (_, i) => I(6+Math.floor(i/2), i%2+6, 8)),
    ]
  ),
  makeAquarium(8,
    [
      // 4 horizontal bands
      Array.from({length:16}, (_, i) => I(Math.floor(i/8), i%8, 8)),
      Array.from({length:16}, (_, i) => I(Math.floor(i/8)+2, i%8, 8)),
      Array.from({length:16}, (_, i) => I(Math.floor(i/8)+4, i%8, 8)),
      Array.from({length:16}, (_, i) => I(Math.floor(i/8)+6, i%8, 8)),
    ],
    [
      // Region 0 rows 0-1: fill row 1 → 8 cells (water level at row 1)
      ...Array.from({length:8}, (_, c) => I(1, c, 8)),
      // Region 1 rows 2-3: fill both → 16 cells
      ...Array.from({length:16}, (_, i) => I(2+Math.floor(i/8), i%8, 8)),
      // Region 2 rows 4-5: fill row 5 → 8 cells
      ...Array.from({length:8}, (_, c) => I(5, c, 8)),
      // Region 3 rows 6-7: fill both → 16 cells
      ...Array.from({length:16}, (_, i) => I(6+Math.floor(i/8), i%8, 8)),
    ]
  ),
];
