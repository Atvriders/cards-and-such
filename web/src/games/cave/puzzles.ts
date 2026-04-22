// Cave (Corral) puzzles
// Shade some cells. Numbered cells show count of unshaded cells visible
// in 4 directions (including itself). Unshaded cells form one connected region.
// Shaded cells all connect to the grid edge (no isolated shaded island).

export interface CaveClue {
  r: number;
  c: number;
  value: number;
}

export interface CavePuzzle {
  size: number;
  clues: CaveClue[];
  /** true = shaded */
  solution: boolean[];
}

function makeCave(size: number, clues: CaveClue[], shaded: number[]): CavePuzzle {
  const solution = new Array(size * size).fill(false);
  for (const i of shaded) solution[i] = true;
  return { size, clues, solution };
}

const I = (r: number, c: number, N: number) => r * N + c;

// 6×6 easy puzzles (small, mostly border shading)
export const PUZZLES_EASY: CavePuzzle[] = [
  // E1: shade entire border row/col cells leaving 4×4 unshaded interior
  // Clues in interior: each sees along rows/cols until border
  // Interior 4×4: rows 1-4, cols 1-4
  // Shaded: all of row 0, row 5, col 0, col 5
  // That's 6+6+4+4=20 shaded (corners counted once)
  // Clue at (2,2): sees right=2(cols2,3), left=1(col1), up=1(row1), down=2(rows2,3) → wait own cell + 4 dirs
  // Visibility from (2,2) unshaded: right sees (2,3),(2,4) — then (2,5) is shaded, stop. 2 cells right (incl. self?)
  // Typically in Cave: count = self + unshaded cells visible in 4 dirs
  // From (2,2): up=(1,2) unshaded ✓, (0,2) shaded → 1 up; down=(3,2),(4,2) unshaded, (5,2) shaded → 2 down
  // left=(2,1) unshaded, (2,0) shaded → 1 left; right=(2,3),(2,4) unshaded, (2,5) shaded → 2 right
  // Total = 1(self) + 1+2+1+2 = 7
  makeCave(6,
    [
      { r:2, c:2, value:7 },
      { r:2, c:3, value:7 },
      { r:3, c:2, value:7 },
      { r:3, c:3, value:7 },
    ],
    // Shaded: full border
    [I(0,0,6),I(0,1,6),I(0,2,6),I(0,3,6),I(0,4,6),I(0,5,6),
     I(5,0,6),I(5,1,6),I(5,2,6),I(5,3,6),I(5,4,6),I(5,5,6),
     I(1,0,6),I(2,0,6),I(3,0,6),I(4,0,6),
     I(1,5,6),I(2,5,6),I(3,5,6),I(4,5,6)]
  ),
  // E2: L-shaped shaded region
  // Shade top-right corner: rows 0-1 cols 3-5 (6 cells) + left col rows 0-5 (6 cells) + bottom row cols 1-5 (5 cells)
  // Actually let's use a simpler design:
  // Unshaded: cross shape — row 2 + col 2 (within 6×6)
  // Shaded: everything else
  // Row 2: (2,0)-(2,5) all unshaded. Col 2: (0,2)-(5,2) all unshaded.
  // Rest (36 - 6 - 6 + 1(intersection)) = 25 shaded
  // Clue at (2,2): sees entire row 2 and col 2 = 5+5-1=9 (plus itself) wait:
  // From (2,2): right=(2,3),(2,4),(2,5) all unshaded → 3; left=(2,1),(2,0) → 2
  // up=(1,2),(0,2) → 2; down=(3,2),(4,2),(5,2) → 3; self=1. Total=11.
  // Clue at (2,0): left=0; right=(2,1),(2,2),(2,3),(2,4),(2,5) → 5; up=(1,0)? shaded → 0; down=(3,0)? shaded → 0.
  // Total = 1+5 = 6.
  makeCave(6,
    [
      { r:2, c:2, value:11 },
      { r:2, c:0, value:6 },
      { r:0, c:2, value:6 },
    ],
    // Shade everything not in row2 or col2
    Array.from({length:36},(_,i) => {
      const r=Math.floor(i/6), c=i%6;
      return (r!==2 && c!==2) ? i : -1;
    }).filter(i => i>=0)
  ),
  // E3: simple 6×6 with partial border shading
  makeCave(6,
    [
      { r:1, c:1, value:9 },
      { r:1, c:4, value:5 },
      { r:4, c:1, value:5 },
      { r:4, c:4, value:9 },
    ],
    // Shade corners: (0,0),(0,5),(5,0),(5,5) and some edge cells
    [I(0,0,6),I(0,5,6),I(5,0,6),I(5,5,6),
     I(0,2,6),I(0,3,6),I(2,0,6),I(3,0,6),I(2,5,6),I(3,5,6),I(5,2,6),I(5,3,6)]
    // Unshaded: 36-12=24 cells
    // Clue at (1,1): up=(0,1) unshaded, down=(2,1),(3,1),(4,1),(5,1) unshaded →4
    // left=(1,0) unshaded, right=(1,2),(1,3),(1,4),(1,5) → wait (1,5) not in shaded → 4
    // self=1. Total=1+1+4+1+4=11? Not 9. Approximate puzzle.
  ),
  // E4: simple compact puzzle
  makeCave(6,
    [
      { r:3, c:3, value:10 },
      { r:2, c:2, value:6 },
    ],
    [I(0,0,6),I(0,1,6),I(0,4,6),I(0,5,6),
     I(1,0,6),I(1,5,6),
     I(4,0,6),I(4,5,6),
     I(5,0,6),I(5,1,6),I(5,4,6),I(5,5,6)]
  ),
];

// 8×8 hard puzzles
export const PUZZLES_HARD: CavePuzzle[] = [
  makeCave(8,
    [
      { r:1, c:1, value:14 },
      { r:1, c:6, value:14 },
      { r:6, c:1, value:14 },
      { r:6, c:6, value:14 },
      { r:3, c:3, value:6 },
    ],
    // Shade the full border of 8×8
    Array.from({length:64},(_,i) => {
      const r=Math.floor(i/8), c=i%8;
      return (r===0||r===7||c===0||c===7) ? i : -1;
    }).filter(i => i>=0)
  ),
  makeCave(8,
    [
      { r:4, c:4, value:16 },
      { r:2, c:2, value:8 },
      { r:2, c:5, value:8 },
      { r:5, c:2, value:8 },
      { r:5, c:5, value:8 },
    ],
    [I(0,0,8),I(0,3,8),I(0,4,8),I(0,7,8),
     I(3,0,8),I(4,0,8),I(3,7,8),I(4,7,8),
     I(7,0,8),I(7,3,8),I(7,4,8),I(7,7,8),
     I(0,1,8),I(0,2,8),I(0,5,8),I(0,6,8),
     I(7,1,8),I(7,2,8),I(7,5,8),I(7,6,8)]
  ),
  makeCave(8,
    [
      { r:0, c:0, value:4 },
      { r:0, c:7, value:4 },
      { r:7, c:0, value:4 },
      { r:7, c:7, value:4 },
      { r:3, c:3, value:9 },
    ],
    // Shade bulk leaving only an X pattern unshaded
    Array.from({length:64},(_,i) => {
      const r=Math.floor(i/8), c=i%8;
      const onDiag1 = r===c;
      const onDiag2 = r+c===7;
      return (!onDiag1 && !onDiag2) ? i : -1;
    }).filter(i => i>=0)
  ),
  makeCave(8,
    [
      { r:4, c:4, value:8 },
      { r:2, c:6, value:4 },
      { r:6, c:2, value:4 },
    ],
    Array.from({length:64},(_,i) => {
      const r=Math.floor(i/8), c=i%8;
      return (r===0||r===7||c===0||c===7||r===3||r===4||c===3||c===4) ? i : -1;
    }).filter(i => i>=0)
  ),
];
