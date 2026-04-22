import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KenKenSettings {
  size: "4" | "5" | "6";
}

export type KenKenOp = "+" | "-" | "×" | "÷" | "=";

export interface Cage {
  cells: number[];   // indices into the N×N grid
  target: number;
  op: KenKenOp;
}

export interface KenKenPuzzle {
  size: number;
  cages: Cage[];
  /** solution[r*N+c] = digit 1..N */
  solution: number[];
}

export interface KenKenState {
  settings: KenKenSettings;
  puzzle: KenKenPuzzle;
  /** board[r*N+c] = 0 (empty) or 1..N */
  board: number[];
  selected: number | null;
  won: boolean;
  moves: number;
  errorCells: Set<number>;
}

export type KenKenAction =
  | { type: "selectCell"; idx: number }
  | { type: "enterDigit"; digit: number }
  | { type: "clearCell" };

// ---- Pre-designed puzzles ----

// 4×4 puzzles
const PUZZLES_4: KenKenPuzzle[] = [
  {
    size: 4,
    solution: [
      1, 2, 3, 4,
      2, 1, 4, 3,
      3, 4, 1, 2,
      4, 3, 2, 1,
    ],
    cages: [
      { cells: [0, 1], target: 3, op: "+" },       // 1+2=3
      { cells: [2, 3], target: 7, op: "+" },       // 3+4=7
      { cells: [4, 8], target: 1, op: "-" },       // 2-1? wait 2-1=1? idx4=2,idx8=3 => 3-2=1 ✓
      { cells: [5], target: 1, op: "=" },          // just 1
      { cells: [6, 7], target: 7, op: "+" },       // 4+3=7
      { cells: [9, 13], target: 1, op: "÷" },      // 4÷4? idx9=4,idx13=3 => 4/3 no. 4÷1? idx5=1 used.
      // Let me redo with cleaner cages
      // Actually just make clean cages:
      { cells: [10, 11], target: 3, op: "+" },
      { cells: [12, 13, 14, 15], target: 10, op: "+" },
    ],
  },
];

// Cleaner approach: define puzzles directly with verified cages

function makePuzzle4(solution: number[], cages: Cage[]): KenKenPuzzle {
  return { size: 4, solution, cages };
}
function makePuzzle5(solution: number[], cages: Cage[]): KenKenPuzzle {
  return { size: 5, solution, cages };
}
function makePuzzle6(solution: number[], cages: Cage[]): KenKenPuzzle {
  return { size: 6, solution, cages };
}

// Helper: idx for (r,c) in NxN grid
const I = (r: number, c: number, N: number) => r * N + c;

export const PUZZLES: Record<string, KenKenPuzzle[]> = {
  "4": [
    // P4-1
    (() => {
      const N = 4;
      const sol = [
        1, 2, 3, 4,
        2, 1, 4, 3,
        3, 4, 2, 1,
        4, 3, 1, 2,
      ];
      // Verify: row0={1,2,3,4}✓ row1={2,1,4,3}✓ row2={3,4,2,1}✓ row3={4,3,1,2}✓
      // col0={1,2,3,4}✓ col1={2,1,4,3}✓ col2={3,4,2,1}✓ col3={4,3,1,2}✓
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(0,1,N)], target: 3, op: "+" },      // 1+2=3
        { cells: [I(0,2,N), I(1,2,N)], target: 1, op: "-" },      // 4-3=1
        { cells: [I(0,3,N), I(1,3,N)], target: 7, op: "+" },      // 4+3=7
        { cells: [I(1,0,N), I(2,0,N)], target: 1, op: "-" },      // 3-2=1
        { cells: [I(1,1,N)], target: 1, op: "=" },                 // 1
        { cells: [I(2,1,N), I(2,2,N)], target: 2, op: "÷" },      // 4÷2=2
        { cells: [I(2,3,N), I(3,3,N)], target: 3, op: "+" },      // 1+2=3
        { cells: [I(3,0,N), I(3,1,N)], target: 7, op: "+" },      // 4+3=7
        { cells: [I(3,2,N)], target: 1, op: "=" },                 // 1
      ];
      return makePuzzle4(sol, cages);
    })(),
    // P4-2
    (() => {
      const N = 4;
      const sol = [
        3, 4, 1, 2,
        1, 2, 4, 3,
        4, 1, 2, 3,
        2, 3, 3, 1, // wait col2: 1,4,2,3✓; row3: 2,3,3,1 has dup 3!
      ];
      // Fix: proper 4×4 Latin square
      // 3,4,1,2
      // 1,2,4,3
      // 4,1,2,3  -> col0:3,1,4,2✓ col1:4,2,1,3✓ col2:1,4,2,3✓ col3:2,3,3,1 dup!
      // row3 must have {1,2,3,4} not used in col. col0 used: 3,1,4, so row3col0=2; col1: 4,2,1, row3col1=3; col2: 1,4,2, row3col2=3 clash!
      // Let me use a known 4×4 Latin square:
      // 1,2,3,4
      // 2,3,4,1
      // 3,4,1,2
      // 4,1,2,3
      const sol2 = [
        1, 2, 3, 4,
        2, 3, 4, 1,
        3, 4, 1, 2,
        4, 1, 2, 3,
      ];
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(1,0,N)], target: 3, op: "+" },      // 1+2=3
        { cells: [I(0,1,N), I(0,2,N)], target: 1, op: "-" },      // 3-2=1
        { cells: [I(0,3,N), I(1,3,N)], target: 5, op: "+" },      // 4+1=5
        { cells: [I(1,1,N), I(1,2,N)], target: 7, op: "+" },      // 3+4=7
        { cells: [I(2,0,N), I(3,0,N)], target: 7, op: "+" },      // 3+4=7
        { cells: [I(2,1,N), I(2,2,N)], target: 4, op: "÷" },      // 4÷1=4? 4/1=4 yes. sol[I(2,1)]=4,sol[I(2,2)]=1
        { cells: [I(2,3,N), I(3,3,N)], target: 5, op: "+" },      // 2+3=5
        { cells: [I(3,1,N), I(3,2,N)], target: 3, op: "+" },      // 1+2=3
      ];
      return makePuzzle4(sol2, cages);
    })(),
    // P4-3
    (() => {
      const N = 4;
      const sol = [
        2, 1, 4, 3,
        1, 2, 3, 4,
        4, 3, 2, 1,
        3, 4, 1, 2,
      ];
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(1,0,N)], target: 3, op: "+" },
        { cells: [I(0,1,N)], target: 1, op: "=" },
        { cells: [I(0,2,N), I(0,3,N)], target: 1, op: "-" },
        { cells: [I(1,1,N), I(1,2,N)], target: 5, op: "+" },
        { cells: [I(1,3,N), I(2,3,N)], target: 5, op: "+" },
        { cells: [I(2,0,N), I(3,0,N)], target: 7, op: "+" },
        { cells: [I(2,1,N), I(2,2,N)], target: 6, op: "×" },      // 3×2=6
        { cells: [I(3,1,N), I(3,2,N), I(3,3,N)], target: 7, op: "+" }, // 4+1+2=7
      ];
      return makePuzzle4(sol, cages);
    })(),
    // P4-4
    (() => {
      const N = 4;
      const sol = [
        4, 3, 2, 1,
        3, 4, 1, 2,
        2, 1, 4, 3,
        1, 2, 3, 4,
      ];
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(0,1,N)], target: 7, op: "+" },
        { cells: [I(0,2,N), I(1,2,N)], target: 3, op: "+" },
        { cells: [I(0,3,N), I(1,3,N)], target: 3, op: "+" },
        { cells: [I(1,0,N), I(2,0,N)], target: 5, op: "+" },
        { cells: [I(1,1,N)], target: 4, op: "=" },
        { cells: [I(2,1,N), I(2,2,N)], target: 4, op: "×" },      // 1×4=4
        { cells: [I(2,3,N), I(3,3,N)], target: 7, op: "+" },
        { cells: [I(3,0,N), I(3,1,N), I(3,2,N)], target: 6, op: "+" },
      ];
      return makePuzzle4(sol, cages);
    })(),
  ],
  "5": [
    // P5-1
    (() => {
      const N = 5;
      const sol = [
        1, 2, 3, 4, 5,
        2, 3, 4, 5, 1,
        3, 4, 5, 1, 2,
        4, 5, 1, 2, 3,
        5, 1, 2, 3, 4,
      ];
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(1,0,N)], target: 3, op: "+" },
        { cells: [I(0,1,N), I(0,2,N)], target: 5, op: "+" },
        { cells: [I(0,3,N), I(0,4,N)], target: 9, op: "+" },
        { cells: [I(1,1,N), I(1,2,N)], target: 7, op: "+" },
        { cells: [I(1,3,N), I(2,3,N)], target: 6, op: "+" },
        { cells: [I(1,4,N), I(2,4,N)], target: 3, op: "+" },
        { cells: [I(2,0,N), I(3,0,N)], target: 7, op: "+" },
        { cells: [I(2,1,N), I(2,2,N)], target: 20, op: "×" },     // 4×5=20
        { cells: [I(3,1,N), I(4,1,N)], target: 6, op: "+" },
        { cells: [I(3,2,N), I(3,3,N)], target: 3, op: "+" },
        { cells: [I(3,4,N), I(4,4,N)], target: 7, op: "+" },
        { cells: [I(4,0,N)], target: 5, op: "=" },
        { cells: [I(4,2,N), I(4,3,N)], target: 5, op: "+" },
      ];
      return makePuzzle5(sol, cages);
    })(),
    // P5-2
    (() => {
      const N = 5;
      const sol = [
        5, 4, 3, 2, 1,
        4, 3, 2, 1, 5,
        3, 2, 1, 5, 4,
        2, 1, 5, 4, 3,
        1, 5, 4, 3, 2,
      ];
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(0,1,N)], target: 9, op: "+" },
        { cells: [I(0,2,N), I(1,2,N)], target: 5, op: "+" },
        { cells: [I(0,3,N), I(0,4,N)], target: 3, op: "+" },
        { cells: [I(1,0,N), I(2,0,N)], target: 7, op: "+" },
        { cells: [I(1,1,N)], target: 3, op: "=" },
        { cells: [I(1,3,N), I(1,4,N)], target: 6, op: "+" },
        { cells: [I(2,1,N), I(2,2,N)], target: 3, op: "+" },
        { cells: [I(2,3,N), I(3,3,N)], target: 9, op: "+" },
        { cells: [I(2,4,N), I(3,4,N)], target: 7, op: "+" },
        { cells: [I(3,0,N), I(4,0,N)], target: 3, op: "+" },
        { cells: [I(3,1,N), I(3,2,N)], target: 6, op: "+" },
        { cells: [I(4,1,N), I(4,2,N), I(4,3,N)], target: 12, op: "+" },
        { cells: [I(4,4,N)], target: 2, op: "=" },
      ];
      return makePuzzle5(sol, cages);
    })(),
    // P5-3
    (() => {
      const N = 5;
      const sol = [
        2, 5, 1, 3, 4,
        5, 4, 3, 1, 2,
        1, 3, 4, 2, 5,
        4, 2, 5, 3, 1, // wait check cols: col0:2,5,1,4,3 all diff✓ col1:5,4,3,2,1✓ col2:1,3,4,5,2✓ col3:3,1,2,3 dup!
        3, 1, 2, 4, 3, // nope
      ];
      // Use cyclic Latin square for 5:
      // row i: (i+0)%5+1, (i+1)%5+1, ...
      const sol2 = Array.from({length: 25}, (_, k) => {
        const r = Math.floor(k/5), c = k%5;
        return ((r + c) % 5) + 1;
      });
      // sol2 = cyclic(5,1): row i,col j = (i+j)%5+1
      // row0:1,2,3,4,5 row1:2,3,4,5,1 row2:3,4,5,1,2 row3:4,5,1,2,3 row4:5,1,2,3,4
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(0,1,N)], target: 3, op: "+" },   // 1+2=3
        { cells: [I(0,2,N), I(1,2,N)], target: 7, op: "+" },   // 3+4=7
        { cells: [I(0,3,N), I(0,4,N)], target: 9, op: "+" },   // 4+5=9
        { cells: [I(1,0,N), I(2,0,N)], target: 5, op: "+" },   // 2+3=5
        { cells: [I(1,1,N)], target: 3, op: "=" },              // 3
        { cells: [I(1,3,N), I(1,4,N)], target: 6, op: "+" },   // 5+1=6
        { cells: [I(2,1,N), I(2,2,N)], target: 9, op: "+" },   // 4+5=9
        { cells: [I(2,3,N), I(3,3,N)], target: 3, op: "+" },   // 1+2=3
        { cells: [I(2,4,N), I(3,4,N)], target: 5, op: "+" },   // 2+3=5
        { cells: [I(3,0,N), I(4,0,N)], target: 9, op: "+" },   // 4+5=9
        { cells: [I(3,1,N), I(3,2,N)], target: 6, op: "+" },   // 5+1=6
        { cells: [I(4,1,N), I(4,2,N)], target: 3, op: "+" },   // 1+2=3
        { cells: [I(4,3,N), I(4,4,N)], target: 7, op: "+" },   // 3+4=7
      ];
      return makePuzzle5(sol2, cages);
    })(),
    // P5-4
    (() => {
      const N = 5;
      const sol = Array.from({length: 25}, (_, k) => {
        const r = Math.floor(k/5), c = k%5;
        return ((r * 2 + c) % 5) + 1;
      });
      // row0: 1,2,3,4,5; row1: 3,4,5,1,2; row2: 5,1,2,3,4; row3: 2,3,4,5,1; row4: 4,5,1,2,3
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(1,0,N)], target: 4, op: "+" },
        { cells: [I(0,1,N), I(0,2,N)], target: 5, op: "+" },
        { cells: [I(0,3,N), I(0,4,N)], target: 9, op: "+" },
        { cells: [I(1,1,N), I(1,2,N)], target: 9, op: "+" },
        { cells: [I(1,3,N), I(2,3,N)], target: 4, op: "+" },
        { cells: [I(1,4,N), I(2,4,N)], target: 6, op: "+" },
        { cells: [I(2,0,N), I(3,0,N)], target: 7, op: "+" },
        { cells: [I(2,1,N), I(2,2,N)], target: 3, op: "+" },
        { cells: [I(3,1,N), I(3,2,N)], target: 7, op: "+" },
        { cells: [I(3,3,N), I(4,3,N)], target: 7, op: "+" },
        { cells: [I(3,4,N), I(4,4,N)], target: 4, op: "+" },
        { cells: [I(4,0,N)], target: 4, op: "=" },
        { cells: [I(4,1,N), I(4,2,N)], target: 6, op: "+" },
      ];
      return makePuzzle5(sol, cages);
    })(),
  ],
  "6": [
    // P6-1
    (() => {
      const N = 6;
      const sol = Array.from({length: 36}, (_, k) => {
        const r = Math.floor(k/6), c = k%6;
        return ((r + c) % 6) + 1;
      });
      // row0:1,2,3,4,5,6; row1:2,3,4,5,6,1; row2:3,4,5,6,1,2; ...
      // sol = cyclic(6,1): row r,col c = (r+c)%6+1
      // row0:1,2,3,4,5,6 row1:2,3,4,5,6,1 row2:3,4,5,6,1,2 row3:4,5,6,1,2,3 row4:5,6,1,2,3,4 row5:6,1,2,3,4,5
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(0,1,N)], target: 3, op: "+" },   // 1+2=3
        { cells: [I(0,2,N), I(0,3,N)], target: 7, op: "+" },   // 3+4=7
        { cells: [I(0,4,N), I(0,5,N)], target: 11, op: "+" },  // 5+6=11
        { cells: [I(1,0,N), I(2,0,N)], target: 5, op: "+" },   // 2+3=5
        { cells: [I(1,1,N), I(1,2,N)], target: 7, op: "+" },   // 3+4=7
        { cells: [I(1,3,N), I(1,4,N)], target: 11, op: "+" },  // 5+6=11
        { cells: [I(1,5,N), I(2,5,N)], target: 3, op: "+" },   // 1+2=3
        { cells: [I(2,1,N), I(2,2,N)], target: 9, op: "+" },   // 4+5=9
        { cells: [I(2,3,N), I(3,3,N)], target: 7, op: "+" },   // 6+1=7
        { cells: [I(2,4,N), I(3,4,N)], target: 3, op: "+" },   // 1+2=3
        { cells: [I(3,0,N), I(4,0,N)], target: 9, op: "+" },   // 4+5=9
        { cells: [I(3,1,N), I(3,2,N)], target: 11, op: "+" },  // 5+6=11
        { cells: [I(3,5,N), I(4,5,N)], target: 7, op: "+" },   // 3+4=7
        { cells: [I(4,1,N), I(4,2,N)], target: 7, op: "+" },   // 6+1=7
        { cells: [I(4,3,N), I(4,4,N)], target: 5, op: "+" },   // 2+3=5
        { cells: [I(5,0,N), I(5,1,N)], target: 7, op: "+" },   // 6+1=7
        { cells: [I(5,2,N), I(5,3,N)], target: 5, op: "+" },   // 2+3=5
        { cells: [I(5,4,N), I(5,5,N)], target: 9, op: "+" },   // 4+5=9
      ];
      return makePuzzle6(sol, cages);
    })(),
    // P6-2 (valid 6×6 Latin square — cyclic shift 2 is invalid for N=6)
    (() => {
      const N = 6;
      const sol = [
        1, 2, 3, 4, 5, 6,
        3, 4, 5, 6, 1, 2,
        5, 6, 1, 2, 3, 4,
        2, 1, 4, 3, 6, 5,
        4, 3, 6, 5, 2, 1,
        6, 5, 2, 1, 4, 3,
      ];
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(1,0,N)], target: 4, op: "+" },    // 1+3=4
        { cells: [I(0,1,N), I(0,2,N)], target: 5, op: "+" },    // 2+3=5
        { cells: [I(0,3,N), I(0,4,N)], target: 9, op: "+" },    // 4+5=9
        { cells: [I(0,5,N), I(1,5,N)], target: 8, op: "+" },    // 6+2=8
        { cells: [I(1,1,N), I(1,2,N)], target: 9, op: "+" },    // 4+5=9
        { cells: [I(1,3,N), I(1,4,N)], target: 7, op: "+" },    // 6+1=7
        { cells: [I(2,0,N), I(3,0,N)], target: 7, op: "+" },    // 5+2=7
        { cells: [I(2,1,N), I(2,2,N)], target: 7, op: "+" },    // 6+1=7
        { cells: [I(2,3,N), I(2,4,N)], target: 5, op: "+" },    // 2+3=5
        { cells: [I(2,5,N), I(3,5,N)], target: 9, op: "+" },    // 4+5=9
        { cells: [I(3,1,N), I(3,2,N)], target: 5, op: "+" },    // 1+4=5
        { cells: [I(3,3,N), I(3,4,N)], target: 9, op: "+" },    // 3+6=9
        { cells: [I(4,0,N), I(5,0,N)], target: 10, op: "+" },   // 4+6=10
        { cells: [I(4,1,N), I(4,2,N)], target: 9, op: "+" },    // 3+6=9
        { cells: [I(4,3,N), I(4,4,N)], target: 7, op: "+" },    // 5+2=7
        { cells: [I(4,5,N), I(5,5,N)], target: 4, op: "+" },    // 1+3=4
        { cells: [I(5,1,N), I(5,2,N)], target: 7, op: "+" },    // 5+2=7
        { cells: [I(5,3,N), I(5,4,N)], target: 5, op: "+" },    // 1+4=5
      ];
      return makePuzzle6(sol, cages);
    })(),
    // P6-3 (cyclic shift by 5 — coprime to 6, gives valid Latin square)
    (() => {
      const N = 6;
      const sol = Array.from({length: 36}, (_, k) => {
        const r = Math.floor(k/6), c = k%6;
        return ((r * 5 + c) % 6) + 1;
      });
      // row0:1,2,3,4,5,6 row1:6,1,2,3,4,5 row2:5,6,1,2,3,4 row3:4,5,6,1,2,3 row4:3,4,5,6,1,2 row5:2,3,4,5,6,1
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(0,1,N), I(1,0,N)], target: 9, op: "+" },   // 1+2+6=9
        { cells: [I(0,2,N), I(0,3,N)], target: 7, op: "+" },              // 3+4=7
        { cells: [I(0,4,N), I(0,5,N)], target: 11, op: "+" },             // 5+6=11
        { cells: [I(1,1,N), I(1,2,N)], target: 3, op: "+" },              // 1+2=3
        { cells: [I(1,3,N), I(2,3,N)], target: 5, op: "+" },              // 3+2=5
        { cells: [I(1,4,N), I(1,5,N)], target: 9, op: "+" },              // 4+5=9
        { cells: [I(2,0,N), I(3,0,N)], target: 9, op: "+" },              // 5+4=9
        { cells: [I(2,1,N), I(2,2,N)], target: 7, op: "+" },              // 6+1=7
        { cells: [I(2,4,N), I(2,5,N)], target: 7, op: "+" },              // 3+4=7
        { cells: [I(3,1,N), I(3,2,N)], target: 11, op: "+" },             // 5+6=11
        { cells: [I(3,3,N), I(3,4,N)], target: 3, op: "+" },              // 1+2=3
        { cells: [I(3,5,N), I(4,5,N)], target: 5, op: "+" },              // 3+2=5
        { cells: [I(4,0,N), I(4,1,N)], target: 7, op: "+" },              // 3+4=7
        { cells: [I(4,2,N), I(4,3,N)], target: 11, op: "+" },             // 5+6=11
        { cells: [I(4,4,N), I(5,4,N)], target: 7, op: "+" },              // 1+6=7
        { cells: [I(5,0,N), I(5,1,N)], target: 5, op: "+" },              // 2+3=5
        { cells: [I(5,2,N), I(5,3,N)], target: 9, op: "+" },              // 4+5=9
        { cells: [I(5,5,N)], target: 1, op: "=" },                        // 1
      ];
      return makePuzzle6(sol, cages);
    })(),
    // P6-4 (valid 6×6 Latin square — cyclic shift 4 is invalid for N=6)
    (() => {
      const N = 6;
      const sol = [
        2, 3, 4, 5, 6, 1,
        4, 5, 6, 1, 2, 3,
        6, 1, 2, 3, 4, 5,
        1, 2, 3, 4, 5, 6,
        3, 4, 5, 6, 1, 2,
        5, 6, 1, 2, 3, 4,
      ];
      const cages: Cage[] = [
        { cells: [I(0,0,N), I(0,1,N)], target: 5, op: "+" },    // 2+3=5
        { cells: [I(0,2,N), I(0,3,N)], target: 9, op: "+" },    // 4+5=9
        { cells: [I(0,4,N), I(0,5,N)], target: 7, op: "+" },    // 6+1=7
        { cells: [I(1,0,N), I(2,0,N)], target: 10, op: "+" },   // 4+6=10
        { cells: [I(1,1,N), I(1,2,N)], target: 11, op: "+" },   // 5+6=11
        { cells: [I(1,3,N), I(1,4,N)], target: 3, op: "+" },    // 1+2=3
        { cells: [I(1,5,N), I(2,5,N)], target: 8, op: "+" },    // 3+5=8
        { cells: [I(2,1,N), I(2,2,N)], target: 3, op: "+" },    // 1+2=3
        { cells: [I(2,3,N), I(2,4,N)], target: 7, op: "+" },    // 3+4=7
        { cells: [I(3,0,N), I(4,0,N)], target: 4, op: "+" },    // 1+3=4
        { cells: [I(3,1,N), I(3,2,N)], target: 5, op: "+" },    // 2+3=5
        { cells: [I(3,3,N), I(3,4,N)], target: 9, op: "+" },    // 4+5=9
        { cells: [I(3,5,N), I(4,5,N)], target: 8, op: "+" },    // 6+2=8
        { cells: [I(4,1,N), I(4,2,N)], target: 9, op: "+" },    // 4+5=9
        { cells: [I(4,3,N), I(4,4,N)], target: 7, op: "+" },    // 6+1=7
        { cells: [I(5,0,N), I(5,1,N)], target: 11, op: "+" },   // 5+6=11
        { cells: [I(5,2,N), I(5,3,N)], target: 3, op: "+" },    // 1+2=3
        { cells: [I(5,4,N), I(5,5,N)], target: 7, op: "+" },    // 3+4=7
      ];
      return makePuzzle6(sol, cages);
    })(),
  ],
};

// ---- Validation helpers ----

export function cageValue(cells: number[], board: number[], op: KenKenOp): number | null {
  const vals = cells.map((i) => board[i]!);
  if (vals.some((v) => v === 0)) return null; // not all filled
  switch (op) {
    case "+": return vals.reduce((a, b) => a + b, 0);
    case "×": return vals.reduce((a, b) => a * b, 1);
    case "-": {
      const s = Math.max(...vals) - vals.filter((v, i) => i > 0 || vals.length === 1 ? true : true).reduce((a, b, i) => i === 0 ? b : a, 0);
      // For 2-cell cages: |a - b|
      return Math.abs(vals[0]! - vals[1]!);
    }
    case "÷": {
      const mx = Math.max(...vals);
      const rest = vals.filter((_, i) => i !== vals.indexOf(mx));
      const d = rest.reduce((a, b) => a * b, 1);
      return d === 0 ? null : mx / d;
    }
    case "=": return vals[0]!;
    default: return null;
  }
}

function computeErrors(board: number[], puzzle: KenKenPuzzle): Set<number> {
  const { size, cages } = puzzle;
  const errors = new Set<number>();

  // Check cages
  for (const cage of cages) {
    const vals = cage.cells.map((i) => board[i]!).filter((v) => v > 0);
    if (vals.length === 0) continue;
    const allFilled = cage.cells.every((i) => board[i]! > 0);
    const val = cageValue(cage.cells, board, cage.op);
    if (allFilled && val !== cage.target) {
      for (const i of cage.cells) errors.add(i);
    }
  }

  // Check rows
  for (let r = 0; r < size; r++) {
    const seen = new Map<number, number>();
    for (let c = 0; c < size; c++) {
      const idx = r * size + c;
      const v = board[idx]!;
      if (v === 0) continue;
      if (seen.has(v)) {
        errors.add(seen.get(v)!);
        errors.add(idx);
      } else {
        seen.set(v, idx);
      }
    }
  }

  // Check cols
  for (let c = 0; c < size; c++) {
    const seen = new Map<number, number>();
    for (let r = 0; r < size; r++) {
      const idx = r * size + c;
      const v = board[idx]!;
      if (v === 0) continue;
      if (seen.has(v)) {
        errors.add(seen.get(v)!);
        errors.add(idx);
      } else {
        seen.set(v, idx);
      }
    }
  }

  return errors;
}

function checkWon(board: number[], puzzle: KenKenPuzzle): boolean {
  if (board.some((v) => v === 0)) return false;
  return computeErrors(board, puzzle).size === 0;
}

export function initialState(seed: number, settings: KenKenSettings): KenKenState {
  const rng = mulberry32(seed);
  const pool = PUZZLES[settings.size]!;
  const idx = Math.floor(rng() * pool.length);
  const puzzle = pool[idx]!;
  const board = new Array(puzzle.size * puzzle.size).fill(0);

  return {
    settings,
    puzzle,
    board,
    selected: null,
    won: false,
    moves: 0,
    errorCells: new Set(),
  };
}

export function reducer(state: KenKenState, action: KenKenAction): KenKenState {
  if (state.won) return state;
  switch (action.type) {
    case "selectCell":
      return { ...state, selected: action.idx };
    case "enterDigit": {
      if (state.selected === null) return state;
      const d = action.digit;
      if (d < 1 || d > state.puzzle.size) return state;
      const newBoard = state.board.slice();
      newBoard[state.selected] = d;
      const errorCells = computeErrors(newBoard, state.puzzle);
      const won = checkWon(newBoard, state.puzzle);
      return { ...state, board: newBoard, errorCells, won, moves: state.moves + 1 };
    }
    case "clearCell": {
      if (state.selected === null) return state;
      const newBoard = state.board.slice();
      newBoard[state.selected] = 0;
      const errorCells = computeErrors(newBoard, state.puzzle);
      return { ...state, board: newBoard, errorCells, moves: state.moves + 1 };
    }
    default:
      return state;
  }
}

export function isTerminal(state: KenKenState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
