// Kings and Knights puzzles
// Place exactly the specified kings and knights on the board so none attacks each other.
// Pre-placed pieces are given as clues; player places the remaining ones.
// All solutions verified: no piece attacks any other.

export type PieceType = "K" | "N"; // King or Knight

export interface KKPiece {
  row: number;
  col: number;
  type: PieceType;
}

export interface KKPuzzle {
  size: number;
  kingsCount: number;
  knightsCount: number;
  /** Pre-placed pieces the player cannot move */
  clues: KKPiece[];
  /** Full solution including clues */
  solution: KKPiece[];
}

// King attacks all 8 neighbors (1 step)
export function kingAttacks(r: number, c: number, tr: number, tc: number): boolean {
  return Math.abs(r - tr) <= 1 && Math.abs(c - tc) <= 1 && !(r === tr && c === tc);
}

// Knight attacks L-shapes
export function knightAttacks(r: number, c: number, tr: number, tc: number): boolean {
  const dr = Math.abs(r - tr), dc = Math.abs(c - tc);
  return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
}

export function attacks(a: KKPiece, b: KKPiece): boolean {
  if (a.type === "K" && kingAttacks(a.row, a.col, b.row, b.col)) return true;
  if (b.type === "K" && kingAttacks(b.row, b.col, a.row, a.col)) return true;
  if (a.type === "N" && knightAttacks(a.row, a.col, b.row, b.col)) return true;
  if (b.type === "N" && knightAttacks(b.row, b.col, a.row, a.col)) return true;
  return false;
}

// 6×6 puzzles: 3 kings + 3 knights (all verified no-conflict)
export const PUZZLES_EASY: KKPuzzle[] = [
  // Kings: (0,0),(0,5),(5,2); Knights: (0,2),(0,3),(2,0)
  {
    size: 6,
    kingsCount: 3,
    knightsCount: 3,
    clues: [
      { row: 0, col: 0, type: "K" },
      { row: 0, col: 5, type: "K" },
    ],
    solution: [
      { row: 0, col: 0, type: "K" },
      { row: 0, col: 5, type: "K" },
      { row: 5, col: 2, type: "K" },
      { row: 0, col: 2, type: "N" },
      { row: 0, col: 3, type: "N" },
      { row: 2, col: 0, type: "N" },
    ],
  },
  // Kings: (0,1),(5,4); Knights: (0,3),(0,4),(0,5),(1,4)
  {
    size: 6,
    kingsCount: 2,
    knightsCount: 4,
    clues: [
      { row: 0, col: 1, type: "K" },
      { row: 5, col: 4, type: "K" },
    ],
    solution: [
      { row: 0, col: 1, type: "K" },
      { row: 5, col: 4, type: "K" },
      { row: 0, col: 3, type: "N" },
      { row: 0, col: 4, type: "N" },
      { row: 0, col: 5, type: "N" },
      { row: 1, col: 4, type: "N" },
    ],
  },
  // Kings: (0,0),(0,5),(5,2); Knights: (0,2),(0,3)
  {
    size: 6,
    kingsCount: 3,
    knightsCount: 2,
    clues: [
      { row: 0, col: 0, type: "K" },
      { row: 0, col: 2, type: "N" },
    ],
    solution: [
      { row: 0, col: 0, type: "K" },
      { row: 0, col: 5, type: "K" },
      { row: 5, col: 2, type: "K" },
      { row: 0, col: 2, type: "N" },
      { row: 0, col: 3, type: "N" },
    ],
  },
];

// 8×8 puzzles (all verified no-conflict)
export const PUZZLES_MEDIUM: KKPuzzle[] = [
  // Kings: (0,0),(0,4),(4,0),(7,7); Knights: (0,2),(0,6),(0,7),(1,7)
  {
    size: 8,
    kingsCount: 4,
    knightsCount: 4,
    clues: [
      { row: 0, col: 0, type: "K" },
      { row: 7, col: 7, type: "K" },
    ],
    solution: [
      { row: 0, col: 0, type: "K" },
      { row: 0, col: 4, type: "K" },
      { row: 4, col: 0, type: "K" },
      { row: 7, col: 7, type: "K" },
      { row: 0, col: 2, type: "N" },
      { row: 0, col: 6, type: "N" },
      { row: 0, col: 7, type: "N" },
      { row: 1, col: 7, type: "N" },
    ],
  },
  // Kings: (0,0),(7,7),(4,3); Knights: (0,2),(0,3),(0,4),(0,5),(0,6)
  {
    size: 8,
    kingsCount: 3,
    knightsCount: 5,
    clues: [
      { row: 0, col: 0, type: "K" },
      { row: 7, col: 7, type: "K" },
      { row: 0, col: 2, type: "N" },
    ],
    solution: [
      { row: 0, col: 0, type: "K" },
      { row: 7, col: 7, type: "K" },
      { row: 4, col: 3, type: "K" },
      { row: 0, col: 2, type: "N" },
      { row: 0, col: 3, type: "N" },
      { row: 0, col: 4, type: "N" },
      { row: 0, col: 5, type: "N" },
      { row: 0, col: 6, type: "N" },
    ],
  },
];
