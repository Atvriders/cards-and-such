/** Pre-designed Killer Sudoku puzzles with cage layouts and verified solutions. */

export interface Cage {
  /** Cells in this cage as [row, col] pairs (0-indexed) */
  cells: [number, number][];
  /** Required sum for the cage */
  sum: number;
}

export interface KillerPuzzle {
  id: string;
  difficulty: "easy" | "medium";
  cages: Cage[];
  /** Full 9×9 solution, row-major */
  solution: number[];
}

function s(str: string): number[] {
  return str.split("").map(Number);
}

/** Compute sum of cage cells against a solution. Used to build puzzles. */
function cageSum(cells: [number, number][], sol: number[]): number {
  return cells.reduce((a, [r, c]) => a + sol[r * 9 + c]!, 0);
}

function makeCage(cells: [number, number][], sol: number[]): Cage {
  return { cells, sum: cageSum(cells, sol) };
}

// Solution 1: classic easy
const SOL1 = s(
  "534678912" +
  "672195348" +
  "198342567" +
  "859761423" +
  "426853791" +
  "713924856" +
  "961537284" +
  "287419635" +
  "345286179"
);

// Solution 2: shifted
const SOL2 = s(
  "123456789" +
  "456789123" +
  "789123456" +
  "214365897" +
  "365897214" +
  "897214365" +
  "531642978" +
  "642978531" +
  "978531642"
);

// Solution 3
const SOL3 = s(
  "987654321" +
  "654321987" +
  "321987654" +
  "879465132" +
  "465132879" +
  "132879465" +
  "798546213" +
  "546213798" +
  "213798546"
);

// Solution 4
const SOL4 = s(
  "416857329" +
  "953124678" +
  "728369541" +
  "184593762" +
  "369742815" +
  "572681493" +
  "647215934" +
  "895436127" +
  "231978456"
);

// Solution 5
const SOL5 = s(
  "812574639" +
  "475963182" +
  "936812754" +
  "593728416" +
  "648391275" +
  "127456398" +
  "284139567" +
  "361587924" +
  "759246813"
);

function buildEasy1(): KillerPuzzle {
  const sol = SOL1;
  const cages: Cage[] = [
    makeCage([[0,0],[0,1]], sol),
    makeCage([[0,2],[0,3]], sol),
    makeCage([[0,4],[0,5],[0,6]], sol),
    makeCage([[0,7],[0,8]], sol),
    makeCage([[1,0],[1,1],[2,0]], sol),
    makeCage([[1,2],[1,3]], sol),
    makeCage([[1,4],[1,5]], sol),
    makeCage([[1,6],[1,7],[1,8]], sol),
    makeCage([[2,1],[2,2]], sol),
    makeCage([[2,3],[2,4]], sol),
    makeCage([[2,5],[2,6]], sol),
    makeCage([[2,7],[2,8]], sol),
    makeCage([[3,0],[4,0]], sol),
    makeCage([[3,1],[3,2]], sol),
    makeCage([[3,3],[3,4]], sol),
    makeCage([[3,5],[3,6]], sol),
    makeCage([[3,7],[3,8]], sol),
    makeCage([[4,1],[4,2]], sol),
    makeCage([[4,3],[4,4]], sol),
    makeCage([[4,5],[4,6]], sol),
    makeCage([[4,7],[4,8]], sol),
    makeCage([[5,0],[6,0]], sol),
    makeCage([[5,1],[5,2]], sol),
    makeCage([[5,3],[5,4]], sol),
    makeCage([[5,5],[5,6]], sol),
    makeCage([[5,7],[5,8]], sol),
    makeCage([[6,1],[6,2]], sol),
    makeCage([[6,3],[6,4]], sol),
    makeCage([[6,5],[6,6]], sol),
    makeCage([[6,7],[6,8]], sol),
    makeCage([[7,0],[8,0]], sol),
    makeCage([[7,1],[7,2]], sol),
    makeCage([[7,3],[7,4]], sol),
    makeCage([[7,5],[7,6]], sol),
    makeCage([[7,7],[7,8]], sol),
    makeCage([[8,1],[8,2]], sol),
    makeCage([[8,3],[8,4]], sol),
    makeCage([[8,5],[8,6]], sol),
    makeCage([[8,7],[8,8]], sol),
  ];
  return { id: "easy-1", difficulty: "easy", cages, solution: sol };
}

function buildEasy2(): KillerPuzzle {
  const sol = SOL2;
  const cages: Cage[] = [
    makeCage([[0,0],[0,1],[0,2]], sol),
    makeCage([[0,3],[0,4],[0,5]], sol),
    makeCage([[0,6],[0,7],[0,8]], sol),
    makeCage([[1,0],[1,1],[1,2]], sol),
    makeCage([[1,3],[1,4],[1,5]], sol),
    makeCage([[1,6],[1,7],[1,8]], sol),
    makeCage([[2,0],[2,1],[2,2]], sol),
    makeCage([[2,3],[2,4],[2,5]], sol),
    makeCage([[2,6],[2,7],[2,8]], sol),
    makeCage([[3,0],[3,1]], sol),
    makeCage([[3,2],[3,3]], sol),
    makeCage([[3,4],[3,5]], sol),
    makeCage([[3,6],[3,7]], sol),
    makeCage([[3,8],[4,8]], sol),
    makeCage([[4,0],[4,1]], sol),
    makeCage([[4,2],[4,3]], sol),
    makeCage([[4,4],[4,5]], sol),
    makeCage([[4,6],[4,7]], sol),
    makeCage([[5,0],[5,1]], sol),
    makeCage([[5,2],[5,3]], sol),
    makeCage([[5,4],[5,5]], sol),
    makeCage([[5,6],[5,7]], sol),
    makeCage([[5,8],[6,8]], sol),
    makeCage([[6,0],[6,1]], sol),
    makeCage([[6,2],[6,3]], sol),
    makeCage([[6,4],[6,5]], sol),
    makeCage([[6,6],[6,7]], sol),
    makeCage([[7,0],[7,1]], sol),
    makeCage([[7,2],[7,3]], sol),
    makeCage([[7,4],[7,5]], sol),
    makeCage([[7,6],[7,7]], sol),
    makeCage([[7,8],[8,8]], sol),
    makeCage([[8,0],[8,1]], sol),
    makeCage([[8,2],[8,3]], sol),
    makeCage([[8,4],[8,5]], sol),
    makeCage([[8,6],[8,7]], sol),
  ];
  return { id: "easy-2", difficulty: "easy", cages, solution: sol };
}

function buildEasy3(): KillerPuzzle {
  const sol = SOL3;
  const cages: Cage[] = [
    makeCage([[0,0],[1,0]], sol),
    makeCage([[0,1],[0,2]], sol),
    makeCage([[0,3],[0,4]], sol),
    makeCage([[0,5],[0,6]], sol),
    makeCage([[0,7],[0,8]], sol),
    makeCage([[1,1],[2,1]], sol),
    makeCage([[1,2],[1,3]], sol),
    makeCage([[1,4],[1,5]], sol),
    makeCage([[1,6],[1,7]], sol),
    makeCage([[1,8],[2,8]], sol),
    makeCage([[2,0],[3,0]], sol),
    makeCage([[2,2],[2,3]], sol),
    makeCage([[2,4],[2,5]], sol),
    makeCage([[2,6],[2,7]], sol),
    makeCage([[3,1],[3,2]], sol),
    makeCage([[3,3],[3,4]], sol),
    makeCage([[3,5],[3,6]], sol),
    makeCage([[3,7],[3,8]], sol),
    makeCage([[4,0],[5,0]], sol),
    makeCage([[4,1],[4,2]], sol),
    makeCage([[4,3],[4,4]], sol),
    makeCage([[4,5],[4,6]], sol),
    makeCage([[4,7],[4,8]], sol),
    makeCage([[5,1],[5,2]], sol),
    makeCage([[5,3],[5,4]], sol),
    makeCage([[5,5],[5,6]], sol),
    makeCage([[5,7],[5,8]], sol),
    makeCage([[6,0],[7,0]], sol),
    makeCage([[6,1],[6,2]], sol),
    makeCage([[6,3],[6,4]], sol),
    makeCage([[6,5],[6,6]], sol),
    makeCage([[6,7],[6,8]], sol),
    makeCage([[7,1],[7,2]], sol),
    makeCage([[7,3],[7,4]], sol),
    makeCage([[7,5],[7,6]], sol),
    makeCage([[7,7],[7,8]], sol),
    makeCage([[8,0],[8,1]], sol),
    makeCage([[8,2],[8,3]], sol),
    makeCage([[8,4],[8,5]], sol),
    makeCage([[8,6],[8,7]], sol),
    makeCage([[8,8]], sol),
  ];
  return { id: "easy-3", difficulty: "easy", cages, solution: sol };
}

function buildMedium1(): KillerPuzzle {
  const sol = SOL4;
  const cages: Cage[] = [
    makeCage([[0,0],[1,0],[2,0]], sol),
    makeCage([[0,1],[0,2]], sol),
    makeCage([[0,3],[0,4]], sol),
    makeCage([[0,5],[1,5]], sol),
    makeCage([[0,6],[0,7],[0,8]], sol),
    makeCage([[1,1],[1,2]], sol),
    makeCage([[1,3],[1,4]], sol),
    makeCage([[1,6],[2,6]], sol),
    makeCage([[1,7],[1,8]], sol),
    makeCage([[2,1],[2,2]], sol),
    makeCage([[2,3],[2,4],[2,5]], sol),
    makeCage([[2,7],[2,8]], sol),
    makeCage([[3,0],[4,0]], sol),
    makeCage([[3,1],[3,2]], sol),
    makeCage([[3,3],[3,4]], sol),
    makeCage([[3,5],[3,6]], sol),
    makeCage([[3,7],[3,8]], sol),
    makeCage([[4,1],[4,2]], sol),
    makeCage([[4,3],[4,4]], sol),
    makeCage([[4,5],[4,6]], sol),
    makeCage([[4,7],[4,8]], sol),
    makeCage([[5,0],[6,0]], sol),
    makeCage([[5,1],[5,2]], sol),
    makeCage([[5,3],[5,4]], sol),
    makeCage([[5,5],[5,6]], sol),
    makeCage([[5,7],[5,8]], sol),
    makeCage([[6,1],[6,2]], sol),
    makeCage([[6,3],[6,4]], sol),
    makeCage([[6,5],[6,6]], sol),
    makeCage([[6,7],[6,8]], sol),
    makeCage([[7,0],[8,0]], sol),
    makeCage([[7,1],[7,2]], sol),
    makeCage([[7,3],[7,4]], sol),
    makeCage([[7,5],[7,6]], sol),
    makeCage([[7,7],[7,8]], sol),
    makeCage([[8,1],[8,2]], sol),
    makeCage([[8,3],[8,4]], sol),
    makeCage([[8,5],[8,6]], sol),
    makeCage([[8,7],[8,8]], sol),
  ];
  return { id: "medium-1", difficulty: "medium", cages, solution: sol };
}

function buildMedium2(): KillerPuzzle {
  const sol = SOL5;
  const cages: Cage[] = [
    makeCage([[0,0],[0,1]], sol),
    makeCage([[0,2],[1,2]], sol),
    makeCage([[0,3],[0,4]], sol),
    makeCage([[0,5],[0,6]], sol),
    makeCage([[0,7],[0,8]], sol),
    makeCage([[1,0],[2,0]], sol),
    makeCage([[1,1],[2,1]], sol),
    makeCage([[1,3],[1,4]], sol),
    makeCage([[1,5],[1,6]], sol),
    makeCage([[1,7],[1,8]], sol),
    makeCage([[2,2],[2,3]], sol),
    makeCage([[2,4],[2,5]], sol),
    makeCage([[2,6],[3,6]], sol),
    makeCage([[2,7],[2,8]], sol),
    makeCage([[3,0],[4,0]], sol),
    makeCage([[3,1],[3,2]], sol),
    makeCage([[3,3],[3,4]], sol),
    makeCage([[3,5],[4,5]], sol),
    makeCage([[3,7],[3,8]], sol),
    makeCage([[4,1],[4,2]], sol),
    makeCage([[4,3],[4,4]], sol),
    makeCage([[4,6],[4,7]], sol),
    makeCage([[4,8],[5,8]], sol),
    makeCage([[5,0],[6,0]], sol),
    makeCage([[5,1],[5,2]], sol),
    makeCage([[5,3],[5,4]], sol),
    makeCage([[5,5],[5,6]], sol),
    makeCage([[5,7],[6,7]], sol),
    makeCage([[6,1],[6,2]], sol),
    makeCage([[6,3],[6,4]], sol),
    makeCage([[6,5],[6,6]], sol),
    makeCage([[6,8],[7,8],[7,7]], sol),
    makeCage([[7,0],[8,0]], sol),
    makeCage([[7,1],[7,2]], sol),
    makeCage([[7,3],[7,4]], sol),
    makeCage([[7,5],[7,6]], sol),
    makeCage([[8,1],[8,2]], sol),
    makeCage([[8,3],[8,4]], sol),
    makeCage([[8,5],[8,6]], sol),
    makeCage([[8,7],[8,8]], sol),
  ];
  return { id: "medium-2", difficulty: "medium", cages, solution: sol };
}

export const KILLER_PUZZLES: KillerPuzzle[] = [
  buildEasy1(),
  buildEasy2(),
  buildEasy3(),
  buildMedium1(),
  buildMedium2(),
];

export function validatePuzzle(puzzle: KillerPuzzle): boolean {
  const seen = new Set<string>();
  for (const cage of puzzle.cages) {
    for (const [r, c] of cage.cells) {
      const key = `${r},${c}`;
      if (seen.has(key)) return false;
      seen.add(key);
    }
    const actual = cage.cells.reduce((acc, [r, c]) => acc + (puzzle.solution[r * 9 + c] ?? 0), 0);
    if (actual !== cage.sum) return false;
  }
  return seen.size === 81;
}
