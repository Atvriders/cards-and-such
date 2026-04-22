// Shikaku puzzles
// Divide the grid into rectangles; each rectangle contains exactly one numbered
// cell whose value equals the rectangle's area.

export interface NumberedCell {
  r: number;
  c: number;
  value: number;
}

export interface ShikakuRect {
  r: number; c: number; // top-left corner
  h: number; w: number; // height and width
}

export interface ShikakuPuzzle {
  size: number;
  clues: NumberedCell[];
  solution: ShikakuRect[];
}

// All puzzles below have been hand-verified:
//  • Each rect's area (h×w) equals the clue value
//  • Every clue cell lies inside its assigned rect
//  • Rects tile the full grid without overlap or gap

// ─── 6×6 easy puzzles ───────────────────────────────────────────────────────

// E1: six 1×6 strips
//   (0,0)=6 → row 0
//   (1,0)=6, (1,3)=6 → rows 1-2 cols 0-2 / 3-5
//   (3,0)=6 → row 3
//   (4,0)=6, (4,3)=6 → rows 4-5 cols 0-2 / 3-5
const E1: ShikakuPuzzle = {
  size: 6,
  clues: [
    { r:0, c:0, value:6 },
    { r:1, c:0, value:6 }, { r:1, c:3, value:6 },
    { r:3, c:0, value:6 },
    { r:4, c:0, value:6 }, { r:4, c:3, value:6 },
  ],
  solution: [
    { r:0, c:0, h:1, w:6 },
    { r:1, c:0, h:2, w:3 }, { r:1, c:3, h:2, w:3 },
    { r:3, c:0, h:1, w:6 },
    { r:4, c:0, h:2, w:3 }, { r:4, c:3, h:2, w:3 },
  ],
};

// E2: mixed sizes
//   (0,0)=3 → row 0 cols 0-2
//   (0,3)=3 → row 0 cols 3-5
//   (1,0)=6 → rows 1-2 cols 0-2
//   (1,4)=6 → rows 1-2 cols 3-5  [(1,4) ∈ cols 3-5 ✓]
//   (3,0)=12 → rows 3-5 cols 0-3  [(3,0) ∈ ✓, area=3×4=12 ✓]
//   (3,4)=6  → rows 3-5 cols 4-5  [(3,4) ∈ ✓, area=3×2=6 ✓]
const E2: ShikakuPuzzle = {
  size: 6,
  clues: [
    { r:0, c:0, value:3 }, { r:0, c:3, value:3 },
    { r:1, c:0, value:6 }, { r:1, c:4, value:6 },
    { r:3, c:0, value:12 }, { r:3, c:4, value:6 },
  ],
  solution: [
    { r:0, c:0, h:1, w:3 }, { r:0, c:3, h:1, w:3 },
    { r:1, c:0, h:2, w:3 }, { r:1, c:3, h:2, w:3 },
    { r:3, c:0, h:3, w:4 }, { r:3, c:4, h:3, w:2 },
  ],
};

// E3: 2×2 and 2×4 blocks
//   (0,0)=4 → rows 0-1 cols 0-1
//   (0,2)=8 → rows 0-1 cols 2-5  [(0,2) ∈ ✓, area=2×4=8 ✓]
//   (2,0)=8 → rows 2-3 cols 0-3  [(2,0) ∈ ✓]
//   (2,4)=4 → rows 2-3 cols 4-5
//   (4,0)=4 → rows 4-5 cols 0-1
//   (4,2)=8 → rows 4-5 cols 2-5  [(4,2) ∈ ✓]
const E3: ShikakuPuzzle = {
  size: 6,
  clues: [
    { r:0, c:0, value:4 }, { r:0, c:2, value:8 },
    { r:2, c:0, value:8 }, { r:2, c:4, value:4 },
    { r:4, c:0, value:4 }, { r:4, c:2, value:8 },
  ],
  solution: [
    { r:0, c:0, h:2, w:2 }, { r:0, c:2, h:2, w:4 },
    { r:2, c:0, h:2, w:4 }, { r:2, c:4, h:2, w:2 },
    { r:4, c:0, h:2, w:2 }, { r:4, c:2, h:2, w:4 },
  ],
};

// E4: 2×3 blocks
//   Six 2×3 rects, clue in top-left corner of each
const E4: ShikakuPuzzle = {
  size: 6,
  clues: [
    { r:0, c:0, value:6 }, { r:0, c:3, value:6 },
    { r:2, c:0, value:6 }, { r:2, c:3, value:6 },
    { r:4, c:0, value:6 }, { r:4, c:3, value:6 },
  ],
  solution: [
    { r:0, c:0, h:2, w:3 }, { r:0, c:3, h:2, w:3 },
    { r:2, c:0, h:2, w:3 }, { r:2, c:3, h:2, w:3 },
    { r:4, c:0, h:2, w:3 }, { r:4, c:3, h:2, w:3 },
  ],
};

// ─── 8×8 hard puzzles ───────────────────────────────────────────────────────

// H1: row strips
const H1: ShikakuPuzzle = {
  size: 8,
  clues: [
    { r:0, c:0, value:8 },
    { r:1, c:0, value:8 }, { r:1, c:4, value:8 },
    { r:3, c:0, value:8 }, { r:3, c:4, value:8 },
    { r:5, c:0, value:8 }, { r:5, c:4, value:8 },
    { r:7, c:0, value:8 },
  ],
  solution: [
    { r:0, c:0, h:1, w:8 },
    { r:1, c:0, h:2, w:4 }, { r:1, c:4, h:2, w:4 },
    { r:3, c:0, h:2, w:4 }, { r:3, c:4, h:2, w:4 },
    { r:5, c:0, h:2, w:4 }, { r:5, c:4, h:2, w:4 },
    { r:7, c:0, h:1, w:8 },
  ],
};

// H2: 2×2 blocks in top half, 2×4 in bottom
const H2: ShikakuPuzzle = {
  size: 8,
  clues: [
    { r:0, c:0, value:4 }, { r:0, c:2, value:4 }, { r:0, c:4, value:4 }, { r:0, c:6, value:4 },
    { r:2, c:0, value:4 }, { r:2, c:2, value:4 }, { r:2, c:4, value:4 }, { r:2, c:6, value:4 },
    { r:4, c:0, value:8 }, { r:4, c:4, value:8 },
    { r:6, c:0, value:8 }, { r:6, c:4, value:8 },
  ],
  solution: [
    { r:0, c:0, h:2, w:2 }, { r:0, c:2, h:2, w:2 }, { r:0, c:4, h:2, w:2 }, { r:0, c:6, h:2, w:2 },
    { r:2, c:0, h:2, w:2 }, { r:2, c:2, h:2, w:2 }, { r:2, c:4, h:2, w:2 }, { r:2, c:6, h:2, w:2 },
    { r:4, c:0, h:2, w:4 }, { r:4, c:4, h:2, w:4 },
    { r:6, c:0, h:2, w:4 }, { r:6, c:4, h:2, w:4 },
  ],
};

// H3: four 4×4 quadrants
const H3: ShikakuPuzzle = {
  size: 8,
  clues: [
    { r:0, c:0, value:16 }, { r:0, c:4, value:16 },
    { r:4, c:0, value:16 }, { r:4, c:4, value:16 },
  ],
  solution: [
    { r:0, c:0, h:4, w:4 }, { r:0, c:4, h:4, w:4 },
    { r:4, c:0, h:4, w:4 }, { r:4, c:4, h:4, w:4 },
  ],
};

// H4: 2×4 blocks
const H4: ShikakuPuzzle = {
  size: 8,
  clues: [
    { r:0, c:0, value:8 }, { r:0, c:4, value:8 },
    { r:2, c:0, value:8 }, { r:2, c:4, value:8 },
    { r:4, c:0, value:8 }, { r:4, c:4, value:8 },
    { r:6, c:0, value:8 }, { r:6, c:4, value:8 },
  ],
  solution: [
    { r:0, c:0, h:2, w:4 }, { r:0, c:4, h:2, w:4 },
    { r:2, c:0, h:2, w:4 }, { r:2, c:4, h:2, w:4 },
    { r:4, c:0, h:2, w:4 }, { r:4, c:4, h:2, w:4 },
    { r:6, c:0, h:2, w:4 }, { r:6, c:4, h:2, w:4 },
  ],
};

export const SHIKAKU_PUZZLES: Record<string, ShikakuPuzzle[]> = {
  easy: [E1, E2, E3, E4],
  hard: [H1, H2, H3, H4],
};
