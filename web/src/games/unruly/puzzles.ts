/** Pre-designed Unruly (Binairo/Takuzu) puzzles.
 *  0 = empty, 1 = black, 2 = white
 *  Solutions are computer-verified valid.
 */

export interface UnrulyPuzzle {
  id: string;
  size: 6 | 8 | 10;
  /** Row-major, 0=empty, 1=black, 2=white */
  given: number[];
  solution: number[];
}

// ── 6×6 ──────────────────────────────────────────────────────────────────────
// Verified solutions via constraint solver
const SOL_6A = [1,2,1,2,1,2, 1,1,2,1,2,2, 2,1,1,2,2,1, 1,2,2,1,1,2, 2,1,2,1,2,1, 2,2,1,2,1,1];
const SOL_6B = [2,1,2,1,2,1, 1,1,2,1,2,2, 1,2,1,2,1,2, 2,1,1,2,2,1, 1,2,2,1,1,2, 2,2,1,2,1,1];
const SOL_6C = [1,1,2,1,2,2, 1,1,2,2,1,2, 2,2,1,1,2,1, 1,2,1,1,2,2, 2,1,2,2,1,1, 2,2,1,2,1,1];

// ── 8×8 ──────────────────────────────────────────────────────────────────────
const SOL_8A = [1,2,1,2,1,2,1,2, 1,1,2,1,2,1,2,2, 2,1,1,2,1,2,2,1, 1,2,1,1,2,2,1,2, 2,1,2,1,2,1,2,1, 2,2,1,2,1,2,1,1, 1,2,2,1,2,1,1,2, 2,1,2,2,1,1,2,1];
const SOL_8B = [2,1,2,1,2,1,2,1, 1,1,2,1,2,1,2,2, 1,2,1,2,1,2,1,2, 2,1,1,2,1,2,2,1, 1,2,2,1,2,1,1,2, 1,1,2,2,1,1,2,2, 2,2,1,1,2,2,1,1, 2,2,1,2,1,2,1,1];

// ── 10×10 ─────────────────────────────────────────────────────────────────────
const SOL_10A = [1,2,1,2,1,2,1,2,1,2, 1,1,2,1,1,2,2,1,2,2, 2,1,1,2,2,1,1,2,2,1, 1,2,1,1,2,1,2,2,1,2, 1,1,2,2,1,2,1,1,2,2, 2,1,2,1,1,2,2,1,2,1, 2,2,1,2,2,1,1,2,1,1, 1,2,2,1,2,1,2,1,1,2, 2,1,2,2,1,2,1,1,2,1, 2,2,1,1,2,1,2,2,1,1];

// Build given mask: keep ~30% of cells as givens
function makeGiven(sol: number[], keepIndices: number[]): number[] {
  const g = new Array(sol.length).fill(0);
  for (const i of keepIndices) g[i] = sol[i]!;
  return g;
}

export const UNRULY_PUZZLES: UnrulyPuzzle[] = [
  {
    id: "6x6-1",
    size: 6,
    solution: SOL_6A,
    given: makeGiven(SOL_6A, [0, 4, 8, 13, 17, 20, 25, 29, 32]),
  },
  {
    id: "6x6-2",
    size: 6,
    solution: SOL_6B,
    given: makeGiven(SOL_6B, [1, 5, 7, 12, 16, 21, 26, 30, 35]),
  },
  {
    id: "6x6-3",
    size: 6,
    solution: SOL_6C,
    given: makeGiven(SOL_6C, [0, 3, 9, 14, 18, 23, 27, 31, 34]),
  },
  {
    id: "8x8-1",
    size: 8,
    solution: SOL_8A,
    given: makeGiven(SOL_8A, [0, 3, 7, 9, 14, 19, 24, 29, 33, 38, 43, 48, 53, 58, 63]),
  },
  {
    id: "8x8-2",
    size: 8,
    solution: SOL_8B,
    given: makeGiven(SOL_8B, [1, 6, 10, 15, 20, 26, 31, 36, 41, 46, 51, 57, 62]),
  },
  {
    id: "10x10-1",
    size: 10,
    solution: SOL_10A,
    given: makeGiven(SOL_10A, [0, 4, 9, 12, 17, 22, 27, 31, 36, 41, 46, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99]),
  },
];

export function validateUnrulySolution(puzzle: UnrulyPuzzle): boolean {
  const n = puzzle.size;
  const sol = puzzle.solution;
  const half = n / 2;

  if (sol.length !== n * n) return false;
  if (!sol.every((v) => v === 1 || v === 2)) return false;

  // Check rows
  for (let r = 0; r < n; r++) {
    const row = sol.slice(r * n, r * n + n);
    const ones = row.filter((v) => v === 1).length;
    if (ones !== half) return false;
    for (let c = 0; c < n - 2; c++) {
      if (row[c] === row[c + 1] && row[c + 1] === row[c + 2]) return false;
    }
  }

  // Check cols
  for (let c = 0; c < n; c++) {
    const col = Array.from({ length: n }, (_, r) => sol[r * n + c]!);
    const ones = col.filter((v) => v === 1).length;
    if (ones !== half) return false;
    for (let r = 0; r < n - 2; r++) {
      if (col[r] === col[r + 1] && col[r + 1] === col[r + 2]) return false;
    }
  }

  // No duplicate rows
  const rowStrings = Array.from({ length: n }, (_, r) => sol.slice(r * n, r * n + n).join(""));
  if (new Set(rowStrings).size !== n) return false;

  // No duplicate cols
  const colStrings = Array.from({ length: n }, (_, c) =>
    Array.from({ length: n }, (_, r) => sol[r * n + c]).join("")
  );
  if (new Set(colStrings).size !== n) return false;

  return true;
}
