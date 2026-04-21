import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Three hardcoded valid solved 9x9 Sudoku boards.
 * Board 0: the "base" band-shift pattern.
 * Board 1: derived by swapping digits 1↔2 in board 0.
 * Board 2: derived by swapping digits 1↔3 in board 0.
 */
export const BASE_SOLUTIONS: readonly (readonly number[])[] = [
  // Board 0
  [
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    4, 5, 6, 7, 8, 9, 1, 2, 3,
    7, 8, 9, 1, 2, 3, 4, 5, 6,
    2, 3, 4, 5, 6, 7, 8, 9, 1,
    5, 6, 7, 8, 9, 1, 2, 3, 4,
    8, 9, 1, 2, 3, 4, 5, 6, 7,
    3, 4, 5, 6, 7, 8, 9, 1, 2,
    6, 7, 8, 9, 1, 2, 3, 4, 5,
    9, 1, 2, 3, 4, 5, 6, 7, 8,
  ],
  // Board 1: swap digits 1↔2
  [
    2, 1, 3, 4, 5, 6, 7, 8, 9,
    4, 5, 6, 7, 8, 9, 2, 1, 3,
    7, 8, 9, 2, 1, 3, 4, 5, 6,
    1, 3, 4, 5, 6, 7, 8, 9, 2,
    5, 6, 7, 8, 9, 2, 1, 3, 4,
    8, 9, 2, 1, 3, 4, 5, 6, 7,
    3, 4, 5, 6, 7, 8, 9, 2, 1,
    6, 7, 8, 9, 2, 1, 3, 4, 5,
    9, 2, 1, 3, 4, 5, 6, 7, 8,
  ],
  // Board 2: swap digits 1↔3
  [
    3, 2, 1, 4, 5, 6, 7, 8, 9,
    4, 5, 6, 7, 8, 9, 3, 2, 1,
    7, 8, 9, 3, 2, 1, 4, 5, 6,
    2, 1, 4, 5, 6, 7, 8, 9, 3,
    5, 6, 7, 8, 9, 3, 2, 1, 4,
    8, 9, 3, 2, 1, 4, 5, 6, 7,
    1, 4, 5, 6, 7, 8, 9, 3, 2,
    6, 7, 8, 9, 3, 2, 1, 4, 5,
    9, 3, 2, 1, 4, 5, 6, 7, 8,
  ],
] as const;

function swapRows(grid: number[], r1: number, r2: number): number[] {
  const g = grid.slice();
  for (let c = 0; c < 9; c++) {
    const tmp = g[r1 * 9 + c]!;
    g[r1 * 9 + c] = g[r2 * 9 + c]!;
    g[r2 * 9 + c] = tmp;
  }
  return g;
}

function swapCols(grid: number[], c1: number, c2: number): number[] {
  const g = grid.slice();
  for (let r = 0; r < 9; r++) {
    const tmp = g[r * 9 + c1]!;
    g[r * 9 + c1] = g[r * 9 + c2]!;
    g[r * 9 + c2] = tmp;
  }
  return g;
}

function swapRowBands(grid: number[], b1: number, b2: number): number[] {
  let g = grid.slice();
  for (let i = 0; i < 3; i++) {
    g = swapRows(g, b1 * 3 + i, b2 * 3 + i);
  }
  return g;
}

function swapColStacks(grid: number[], s1: number, s2: number): number[] {
  let g = grid.slice();
  for (let i = 0; i < 3; i++) {
    g = swapCols(g, s1 * 3 + i, s2 * 3 + i);
  }
  return g;
}

function permuteDigits(grid: number[], perm: number[]): number[] {
  // perm[i] = new digit for old digit i+1 (1-indexed)
  return grid.map((v) => perm[v - 1]!);
}

/** Pick a random permutation of [0..n-1] using the provided rng. */
function randomPerm(n: number, rng: () => number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Generate a shuffled solution board from a base solution using a seeded RNG.
 * Transformations applied: row swaps within bands, col swaps within stacks,
 * band swaps, stack swaps, digit permutation.
 */
export function generateSolution(rng: () => number): number[] {
  const baseIndex = Math.floor(rng() * BASE_SOLUTIONS.length);
  let grid = BASE_SOLUTIONS[baseIndex]!.slice();

  // Swap rows within each band
  for (let band = 0; band < 3; band++) {
    const rows = randomPerm(3, rng);
    const base = band * 3;
    // Apply row permutation by sequential swaps
    grid = swapRows(grid, base + 0, base + rows[0]!);
    grid = swapRows(grid, base + 1, base + rows[1]!);
  }

  // Swap cols within each stack
  for (let stack = 0; stack < 3; stack++) {
    const cols = randomPerm(3, rng);
    const base = stack * 3;
    grid = swapCols(grid, base + 0, base + cols[0]!);
    grid = swapCols(grid, base + 1, base + cols[1]!);
  }

  // Swap row bands
  const bandPerm = randomPerm(3, rng);
  grid = swapRowBands(grid, 0, bandPerm[0]!);
  grid = swapRowBands(grid, 1, bandPerm[1]!);

  // Swap col stacks
  const stackPerm = randomPerm(3, rng);
  grid = swapColStacks(grid, 0, stackPerm[0]!);
  grid = swapColStacks(grid, 1, stackPerm[1]!);

  // Permute digits 1-9
  const digitPerm = randomPerm(9, rng).map((d) => d + 1); // digits 1-9
  grid = permuteDigits(grid, digitPerm);

  return grid;
}

/** Remove cells from a solved grid to create a puzzle. Returns the given (puzzle) array. */
export function removeClues(
  solution: number[],
  toRemove: number,
  rng: () => number,
): number[] {
  // NOTE: Removing cells at random may not guarantee a unique solution,
  // but is acceptable for a casual game — any valid completed board wins.
  const given = solution.slice();
  const indices = randomPerm(81, rng);
  for (let i = 0; i < toRemove && i < 81; i++) {
    given[indices[i]!] = 0;
  }
  return given;
}

/** Number of cells to remove per difficulty. */
export const CELLS_TO_REMOVE: Record<"easy" | "medium" | "hard", number> = {
  easy: 40,
  medium: 50,
  hard: 58,
};
