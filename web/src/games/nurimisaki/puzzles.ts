// Nurimisaki puzzles — grid shading puzzle
// Rules:
//   - Each cell is black or white.
//   - White cells form a single connected group.
//   - No 2×2 area is entirely white.
//   - Every white "peninsula" (a white cell with exactly one white neighbour, i.e. a dead-end)
//     must have a circle clue. Circled cells must be peninsulas.
//   - Circles with a number N: the straight white corridor extending from that peninsula is exactly N cells long
//     (including the peninsula cell itself).
//
// Simplified encoding: 6×6 grid, solution + clue cells.
// clues[idx] = null (no clue), 0 (circle but no count), or a number N.
// solution: true=white, false=black.

export interface NurimisakiPuzzle {
  size: number;
  clues: (number | null)[];
  solution: boolean[];
}

function n(
  size: number,
  clues: (number | null)[],
  sol: boolean[],
): NurimisakiPuzzle {
  return { size, clues, solution: sol };
}

const T = true;
const F = false;

export const PUZZLES: NurimisakiPuzzle[] = [
  // Puzzle 1 — 6×6
  n(6,
    [null,null,null,null,null,null,
     null,   2,null,null,   2,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,   2,null,null,   2,null,
     null,null,null,null,null,null],
    [F,T,F,F,T,F,
     F,T,F,F,T,F,
     T,T,T,T,T,T,
     T,T,T,T,T,T,
     F,T,F,F,T,F,
     F,T,F,F,T,F]
  ),
  // Puzzle 2 — 6×6
  n(6,
    [2,null,null,null,null,2,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     2,null,null,null,null,2],
    [T,T,T,T,T,T,
     T,F,F,F,F,T,
     T,F,T,T,F,T,
     T,F,T,T,F,T,
     T,F,F,F,F,T,
     T,T,T,T,T,T]
  ),
  // Puzzle 3 — 6×6
  n(6,
    [null,null,   3,   3,null,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,null,   3,   3,null,null],
    [F,F,T,T,F,F,
     F,T,T,T,T,F,
     T,T,F,F,T,T,
     T,T,F,F,T,T,
     F,T,T,T,T,F,
     F,F,T,T,F,F]
  ),
  // Puzzle 4 — 6×6
  n(6,
    [null,null,null,null,null,null,
     null,   2,null,null,   2,null,
     null,null,null,null,null,null,
     null,null,null,null,null,null,
     null,   2,null,null,   2,null,
     null,null,null,null,null,null],
    [T,T,T,T,T,T,
     F,T,F,F,T,F,
     F,T,T,T,T,F,
     F,T,T,T,T,F,
     F,T,F,F,T,F,
     T,T,T,T,T,T]
  ),
  // Puzzle 5 — 6×6
  n(6,
    [2,null,null,null,null,2,
     null,null,null,null,null,null,
     null,null,   2,   2,null,null,
     null,null,   2,   2,null,null,
     null,null,null,null,null,null,
     2,null,null,null,null,2],
    [T,T,F,F,T,T,
     T,F,T,T,F,T,
     F,T,T,T,T,F,
     F,T,T,T,T,F,
     T,F,T,T,F,T,
     T,T,F,F,T,T]
  ),
];
