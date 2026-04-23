// Kropki puzzles — 5×5 Latin square with dot constraints
// White dot: adjacent cells differ by 1
// Black dot: adjacent cells have 2:1 ratio
// No dot: neither constraint

export interface KropkiDot {
  r1: number; c1: number;
  r2: number; c2: number;
  kind: "white" | "black";
}

export interface KropkiPuzzle {
  size: number;
  /** solution[r*size+c] = value 1..size */
  solution: number[];
  dots: KropkiDot[];
  /** pre-filled given cells */
  givens: [number, number][];
}

/** Build a puzzle by deriving all valid dots from the solution */
function mk(size: number, sol: number[], givens: [number, number][]): KropkiPuzzle {
  const dots: KropkiDot[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Right neighbor
      if (c + 1 < size) {
        const a = sol[r * size + c]!;
        const b = sol[r * size + c + 1]!;
        if (Math.abs(a - b) === 1) {
          dots.push({ r1: r, c1: c, r2: r, c2: c + 1, kind: "white" });
        } else if (a === 2 * b || b === 2 * a) {
          dots.push({ r1: r, c1: c, r2: r, c2: c + 1, kind: "black" });
        }
        // else: no dot
      }
      // Down neighbor
      if (r + 1 < size) {
        const a = sol[r * size + c]!;
        const b = sol[(r + 1) * size + c]!;
        if (Math.abs(a - b) === 1) {
          dots.push({ r1: r, c1: c, r2: r + 1, c2: c, kind: "white" });
        } else if (a === 2 * b || b === 2 * a) {
          dots.push({ r1: r, c1: c, r2: r + 1, c2: c, kind: "black" });
        }
      }
    }
  }
  return { size, solution: sol, dots, givens };
}

// 5×5 Latin square solutions (verified valid)
export const PUZZLES: KropkiPuzzle[] = [
  // [1,2,3,4,5],[2,3,4,5,1],[3,4,5,1,2],[4,5,1,2,3],[5,1,2,3,4]
  mk(5,
    [1,2,3,4,5, 2,3,4,5,1, 3,4,5,1,2, 4,5,1,2,3, 5,1,2,3,4],
    [[0,0],[1,2],[2,4],[3,1],[4,3]]
  ),
  // [1,3,5,2,4],[2,4,1,3,5],[3,5,2,4,1],[4,1,3,5,2],[5,2,4,1,3]
  mk(5,
    [1,3,5,2,4, 2,4,1,3,5, 3,5,2,4,1, 4,1,3,5,2, 5,2,4,1,3],
    [[0,0],[0,4],[2,2],[4,0],[4,4]]
  ),
  // [2,4,1,3,5],[4,1,3,5,2],[1,3,5,2,4],[3,5,2,4,1],[5,2,4,1,3]
  mk(5,
    [2,4,1,3,5, 4,1,3,5,2, 1,3,5,2,4, 3,5,2,4,1, 5,2,4,1,3],
    [[0,1],[1,3],[2,0],[3,4],[4,2]]
  ),
  // [1,2,4,3,5],[3,5,2,4,1],[5,1,3,2,4],[2,4,1,5,3],[4,3,5,1,2]]
  mk(5,
    [1,2,4,3,5, 3,5,2,4,1, 5,1,3,2,4, 2,4,1,5,3, 4,3,5,1,2],
    [[0,0],[0,4],[2,2],[4,0],[4,4]]
  ),
  // [3,1,2,5,4],[1,2,4,3,5],[5,4,3,2,1],[2,5,1,4,3],[4,3,5,1,2]]
  mk(5,
    [3,1,2,5,4, 1,2,4,3,5, 5,4,3,2,1, 2,5,1,4,3, 4,3,5,1,2],
    [[0,0],[1,2],[2,4],[3,1],[4,3]]
  ),
];
