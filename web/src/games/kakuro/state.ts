import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface KakuroSettings {
  difficulty: "easy" | "medium" | "hard";
}

// A cell is either black (isBlack=true, with optional clues) or white (player fills).
export interface KakuroCell {
  isBlack: boolean;
  /** Clue for cells going across (sum of run starting to the right). 0 = no clue. */
  acrossClue: number;
  /** Clue for cells going down (sum of run starting below). 0 = no clue. */
  downClue: number;
}

export interface KakuroPuzzle {
  rows: number;
  cols: number;
  cells: KakuroCell[];
  /** solution[r*cols+c] for white cells only (black cells = 0) */
  solution: number[];
}

export interface KakuroState {
  settings: KakuroSettings;
  puzzle: KakuroPuzzle;
  /** board[r*cols+c]: player-entered digit (0 = empty). Black cells always 0. */
  board: number[];
  selected: number | null;
  won: boolean;
  moves: number;
  errorCells: Set<number>;
}

export type KakuroAction =
  | { type: "selectCell"; idx: number }
  | { type: "enterDigit"; digit: number }
  | { type: "clearCell" };

// ---- Pre-designed puzzles ----

const EASY_PUZZLES: KakuroPuzzle[] = [
  // 6×6 easy puzzle #1
  {
    rows: 6,
    cols: 6,
    cells: [
      // row 0: all black, some with down/across clues
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 10 },
      { isBlack: true, acrossClue: 0, downClue: 15 },
      { isBlack: true, acrossClue: 0, downClue: 6 },
      { isBlack: true, acrossClue: 0, downClue: 12 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      // row 1: B, W, W, W, W, B
      { isBlack: true, acrossClue: 28, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      // row 2: B, W, W, W, W, B
      { isBlack: true, acrossClue: 20, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      // row 3: B, W, W, W, W, B
      { isBlack: true, acrossClue: 10, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      // row 4: all black
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      // row 5: all black
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
    ],
    solution: [
      0, 0, 0, 0, 0, 0,
      0, 9, 8, 6, 5, 0,  // across sum 28 = 9+8+6+5
      0, 1, 7, 3, 9, 0,  // across sum 20 = wait 1+7+3+9=20 ✓, but need col sums too
      0, 4, 2, 1, 3, 0,  // across sum 10 = 4+2+1+3=10 ✓
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ],
  },
  // puzzle 2
  {
    rows: 7,
    cols: 7,
    cells: [
      // row 0
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 3 },
      { isBlack: true, acrossClue: 0, downClue: 7 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 8 },
      { isBlack: true, acrossClue: 0, downClue: 5 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      // row 1
      { isBlack: true, acrossClue: 10, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 13, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      // row 2
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: false, acrossClue: 0, downClue: 0 },
      { isBlack: true, acrossClue: 0, downClue: 0 },
      // rows 3-6: all black
      ...Array(28).fill({ isBlack: true, acrossClue: 0, downClue: 0 }),
    ],
    solution: [
      0, 0, 0, 0, 0, 0, 0,
      0, 3, 7, 0, 8, 5, 0,
      0, 1, 6, 0, 2, 4, 0, // wait col sums: col1: 3+1=4? need col sum 3+? let me fix
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ],
  },
];

// Use a simpler approach: just use 4 well-crafted puzzles per difficulty
// Each puzzle has verified sums

function buildSimplePuzzle(
  rows: number,
  cols: number,
  layout: string[], // 'B' = black, 'W' = white, 'A:n' = black with across, 'D:n' = black with down, 'AD:a,d'
  solution: number[],
): KakuroPuzzle {
  const cells: KakuroCell[] = layout.map((token) => {
    if (token === "B") return { isBlack: true, acrossClue: 0, downClue: 0 };
    if (token === "W") return { isBlack: false, acrossClue: 0, downClue: 0 };
    if (token.startsWith("AD:")) {
      const [a, d] = token.slice(3).split(",").map(Number);
      return { isBlack: true, acrossClue: a!, downClue: d! };
    }
    if (token.startsWith("A:")) return { isBlack: true, acrossClue: Number(token.slice(2)), downClue: 0 };
    if (token.startsWith("D:")) return { isBlack: true, acrossClue: 0, downClue: Number(token.slice(2)) };
    return { isBlack: true, acrossClue: 0, downClue: 0 };
  });
  return { rows, cols, cells, solution };
}

// ---- All pre-designed puzzles ----
// Kakuro puzzle: each "run" is a maximal horizontal/vertical sequence of white cells
// The clue cell (black) to the left of a run shows the across sum
// The clue cell (black) above a run shows the down sum

// Easy: 6×6
// We'll store 4 puzzles per difficulty using a compact format
// Puzzle format: rows, cols, grid where each row is an array of cells
// B = black (no clue), W = white, clue cells are black with clue info

// For simplicity and correctness, we pre-design explicit small puzzles.
// Puzzle E1: 6 rows × 6 cols
//   . D:9  D:8  .    D:7  D:6
// A:17 W    W    .    W    W
//   .  W    W    .    W    W
//   .  .    .    A:3  W    W  -- row with only 2 whites at right
//   .  .    .    .    .    .
//   .  .    .    .    .    .
// solution whites at (1,1)=9,(1,2)=8,(1,4)=7,(1,5)=6,(2,1)=3,(2,2)=5,(2,4)=5,(2,5)=2,(3,4)=1,(3,5)=2 -- not clean

// Use verified compact puzzles
export const PUZZLES: Record<string, KakuroPuzzle[]> = {
  easy: [
    // E1: simple 5×5, 4 across runs, 4 down runs
    (() => {
      // Layout (5×5):
      // Row0: B      D:7    D:12   D:9    B
      // Row1: A:19   W      W      W      B -- wait 7+5+7=19? Let me use 1,2,3=clue
      // Row2: A:6    W      W      W      B
      // Row3: A:3    W      W      W      B -- oops only 3 whites but col sums must match
      // Row4: B      B      B      B      B
      // Col sums: col1 = rows1-3 = 3 cols, col2=3 cols, col3=3 cols
      // solution:
      //   col1: 9,3,5 -> down=7? 9+3+5=17 no
      // Let me use a very clean verified example:
      // 5×5:
      // Row0: B      D:16   D:10   D:9    B
      // Row1: A:35   W(9)   W(8)   W(7)   ?  -- only 3 whites if rightmost is B
      //   But 9+8+7=24 not 35. Let me just do 3 white + last is B
      // Actually let's do a simple T-shape: 2×2 white block
      // Minimal correct puzzle:
      // 4×4:
      // B     D:3   D:7    B
      // A:10  W(1)  W(9)   B -- 1+9=10 ✓; col sums: D:3=1+2=3✓, D:7=9+? need 2 rows
      // A:4   W(2)  W(2)   B -- wait no dup digits in col: col1 has 1,2 ok; col2 has 9,2? 9+2=11≠7
      // Fix: col2 must sum to 7, so 9+x=7 impossible (x would be negative)
      // Use: col1=1+2=3✓, col2=6+1=7✓
      // Row1: A:7  W(1)  W(6)  B  -- 1+6=7 ✓
      // Row2: A:3  W(2)  W(1)  B  -- 2+1=3 ✓ -- but col2 would have 6,1 = no dup ✓, col1 has 1,2 ✓
      // Let's do it:
      return buildSimplePuzzle(4, 4,
        [
          "B",    "D:3",  "D:7", "B",
          "A:7",  "W",    "W",   "B",
          "A:3",  "W",    "W",   "B",
          "B",    "B",    "B",   "B",
        ],
        [
          0, 0, 0, 0,
          0, 1, 6, 0,
          0, 2, 1, 0,
          0, 0, 0, 0,
        ],
      );
    })(),
    // E2: 5×5 with 4 runs
    (() => {
      // B    D:8   D:6   D:7   B
      // A:21 W(9)  W(8)  W(4)  B -- 9+8+4=21✓; col1=9+?, col2=8+?, col3=4+?
      // A:6  W(2)  W(1)  W(3)  B -- 2+1+3=6✓; col sums: 9+2=11≠8. nope
      // Fix: col1=D:9+2=11 need to match. Let's pick different.
      // D:3 means col sum = 3, so whites in col must sum to 3, with unique digits
      // 2 whites in col: only possibility for sum=3 is {1,2}
      // B    D:3   D:12  B
      // A:4  W(1)  W(3)  B -- 1+3=4✓
      // A:11 W(2)  W(9)  B -- 2+9=11✓; col1=1+2=3✓, col2=3+9=12✓
      return buildSimplePuzzle(4, 4,
        [
          "B",    "D:3",  "D:12", "B",
          "A:4",  "W",    "W",    "B",
          "A:11", "W",    "W",    "B",
          "B",    "B",    "B",    "B",
        ],
        [
          0, 0, 0,  0,
          0, 1, 3,  0,
          0, 2, 9,  0,
          0, 0, 0,  0,
        ],
      );
    })(),
    // E3: 5×5 L-shape
    (() => {
      // B    D:14  D:5   B     B
      // A:9  W(5)  W(4)  B     B
      // A:13 W(9)  W(1)  A:3   W -- wait this is getting complex
      // Keep it simple 4×4:
      // B     D:16  D:8   B
      // A:7   W(3)  W(4)  B  -- 3+4=7✓
      // A:17  W(9)  W(8)  B  -- 9+8=17✓; col1=3+9=12≠16. nope.
      // col1=D:16: 3+9+?=16 need 3 rows
      // 5 rows:
      // B      D:9   D:11   B
      // A:3    W(1)  W(2)   B   -- 1+2=3✓
      // A:7    W(4)  W(3)   B   -- 4+3=7✓; col1=1+4=5≠9
      // Ugh. Let me just pick values and compute clues.
      // 3 rows of whites, 2 cols:
      // values: (r1c1,r1c2)=(1,2), (r2c1,r2c2)=(4,3), (r3c1,r3c2)=(9,8)
      // across clues: 3, 7, 17
      // down clues: 1+4+9=14, 2+3+8=13
      return buildSimplePuzzle(5, 4,
        [
          "B",    "D:14",  "D:13", "B",
          "A:3",  "W",     "W",    "B",
          "A:7",  "W",     "W",    "B",
          "A:17", "W",     "W",    "B",
          "B",    "B",     "B",    "B",
        ],
        [
          0, 0, 0, 0,
          0, 1, 2, 0,
          0, 4, 3, 0,
          0, 9, 8, 0,
          0, 0, 0, 0,
        ],
      );
    })(),
    // E4: Cross shape
    (() => {
      // 2 across runs + 2 down runs, slightly larger
      // B      D:6   D:15   D:9   B
      // A:21   W(6)  W(7)   W(8)  B  -- 6+7+8=21✓
      // A:10   W(5)  W(4)   W(1)  B  -- wait dup: col2 has 7,4 ok, col3 has 8,1 ok
      //   but across: 5+4+1=10✓; col1=6+5=11≠6!
      // col1 must sum to 6: only option with 2 unique digits: {1,5},{2,4}
      // use (1,5): r1c1=1,r2c1=5; then row1: 1+?+?=across, row2: 5+?+?=across
      // row1: 1+9+8=18 -> across=18, col2=9+?, col3=8+?
      // row2: 5+3+7=15 -> across=15, col2=9+3=12, col3=8+7=15
      // D:col2=12, D:col3=15
      return buildSimplePuzzle(4, 5,
        [
          "B",    "D:6",  "D:12", "D:15",  "B",
          "A:18", "W",    "W",    "W",     "B",
          "A:15", "W",    "W",    "W",     "B",
          "B",    "B",    "B",    "B",     "B",
        ],
        [
          0, 0, 0, 0,  0,
          0, 1, 9, 8,  0,
          0, 5, 3, 7,  0,
          0, 0, 0, 0,  0,
        ],
      );
    })(),
  ],
  medium: [
    // M1: 6×6 with more runs
    (() => {
      // Layout:
      // B      D:7   D:6   B      D:8   D:9
      // A:13   W(7)  W(6)  A:17   W(8)  W(9)
      // A:6    W(1)  W(5)  A:5    W(2)  W(3)
      // B      B     B     B      B     B
      // col checks: col1=7+1=8≠7! nope.
      // Let me carefully: D:7 means col1 whites sum to 7 = 7+1=8. Nope.
      // values r1c1=3, r2c1=4 -> col1 sum=7✓
      // r1c2=4, r2c2=2 -> col2 sum=6✓
      // r1c4=5, r2c4=3 -> col4 sum=8✓
      // r1c5=6, r2c5=3 -> dup 3. use r2c5=4
      // Actually col5 sum=9: 6+? where ?<>6. r1c5=6,r2c5=3 -> 9✓, no dup✓
      // across: r1: 3+4=7(A:7), then A:17:5+... wait need sep across runs
      // Let me just make it correct:
      // B      D:7   D:6   B      D:11  D:9
      // A:7    W(3)  W(4)  A:11   W(5)  W(6)
      // A:6    W(4)  W(2)  A:9    W(6)  W(3)  -- col1: 3+4=7✓, col2: 4+2=6✓
      //   -- but row2 col4: 5, col5: 6; row3 col4: 6, col5: 3; col4 sum=11✓, col5 sum=9✓
      //   -- across r1: A:7=3+4=7✓; r2: A:7? oops A:11=5+6=11✓; r3: A:6=4+2=6✓; A:9=6+3=9✓
      // Wait row2col4=6 but row1col4=5, different, ✓. But within DOWN col4: 5+6=11, ✓.
      // Dup check col1: 3,4 ok. col2: 4,2 ok. col4: 5,6 ok. col5: 6,3 ok.
      // Across row1 has run [col1,col2]: 3,4 ok (no dup). Run [col4,col5]: 5,6 ok.
      // Across row2: [col1,col2]: 4,2 ok. [col4,col5]: 6,3 ok.
      return buildSimplePuzzle(4, 6,
        [
          "B",    "D:7",  "D:6",  "B",    "D:11", "D:9",
          "A:7",  "W",    "W",    "A:11", "W",    "W",
          "A:6",  "W",    "W",    "A:9",  "W",    "W",
          "B",    "B",    "B",    "B",    "B",    "B",
        ],
        [
          0, 0, 0, 0, 0,  0,
          0, 3, 4, 0, 5,  6,
          0, 4, 2, 0, 6,  3,
          0, 0, 0, 0, 0,  0,
        ],
      );
    })(),
    // M2: 5×5
    (() => {
      // B      D:6   D:10  D:3   B
      // A:19   W(6)  W(9)  W(4)  B  -- 6+9+4=19✓ no dup✓; col1=6+?, col2=9+?, col3=4+?
      // A:5    W(1)  W(3)  ?     B  -- col3 needs to sum to 3, only 1+2=3 or 3 alone
      //   but 3+x=3 means x=0 not allowed. so D:3 means only 1 white. row2col3=3 only.
      //   Wait if col3 has 2 whites: 4+?=3 impossible since 4>3.
      //   So col3 D:3 must have only 1 white. Means row2 col3 is black.
      // B      D:6   D:10  D:4   B
      // A:15   W(6)  W(9)  B     B  -- only 2 whites
      //   wait need across run of 3 for sum 15: use col arrangement:
      // B      D:6   D:10  D:3   B
      // A:19   W(6)  W(9)  W(4)  B
      // B      W(1)  W(1)? can't have dup in col2!
      //   Let me try 3 rows of whites in 2 cols:
      // B      D:12  D:15  B
      // A:3    W(1)  W(2)  B  -- 1+2=3✓
      // A:7    W(4)  W(3)  B  -- 4+3=7✓; col1=1+4=5+?; col2=2+3=5+?
      //   col1 D:12: 1+4+?=12, need third row: ?=7
      // A:10   W(7)  W(3)? col2: 2+3+3 = dup!
      //   col2 D:15: 2+3+?=15, ?=10 impossible
      //   fix: row3 col2: 2+3+x=15 -> x=10 impossible.
      // B      D:6   D:15  B
      // A:5    W(2)  W(3)  B
      // A:11   W(4)  W(7)  B
      // A:4    W(1)? wait we already have 4 in col1!
      //   col1: 2+4=6✓, col2: 3+7=10≠15
      // OK, let me pick bottom-up:
      // col1 values: {1,2,3} sum=6; col2 values: {6,9} sum=15? 6+9=15✓ (only 2 rows)
      //   but need same # of rows.
      // 3 row whites, 2 cols, sum col1=6,col2=15:
      //   col1: {1,2,3} sums=6✓
      //   col2: {6,8,1} sums=15✓ but 1 appears in both cols -- that's fine (cols are independent)
      //   across: 1+6=7, 2+8=10, 3+1=4? wait 3+1=4 but have 1 in row3col2?
      //   Actually within across run: {col1val, col2val} must have no dup.
      //   r1: 1,6 ok; r2: 2,8 ok; r3: 3,1 -- no dup in row ✓ (different cols)
      //   across sums: 7, 10, 4
      return buildSimplePuzzle(5, 4,
        [
          "B",   "D:6",  "D:15", "B",
          "A:7", "W",    "W",    "B",
          "A:10","W",    "W",    "B",
          "A:4", "W",    "W",    "B",
          "B",   "B",    "B",    "B",
        ],
        [
          0, 0, 0, 0,
          0, 1, 6, 0,
          0, 2, 8, 0,
          0, 3, 1, 0,
          0, 0, 0, 0,
        ],
      );
    })(),
    // M3
    (() => {
      // 2×3 white block
      // col values: c1={2,7}->9, c2={5,4}->9, c3={6,1}->7
      // across: r1=2+5+6=13, r2=7+4+1=12
      return buildSimplePuzzle(4, 5,
        [
          "B",    "D:9",  "D:9",  "D:7",  "B",
          "A:13", "W",    "W",    "W",    "B",
          "A:12", "W",    "W",    "W",    "B",
          "B",    "B",    "B",    "B",    "B",
        ],
        [
          0, 0, 0, 0, 0,
          0, 2, 5, 6, 0,
          0, 7, 4, 1, 0,
          0, 0, 0, 0, 0,
        ],
      );
    })(),
    // M4: 6-col, 3 run layout
    (() => {
      // Two separate across runs per row
      // r1: [c1,c2] + [c4,c5]; r2: [c1,c2] + [c4,c5]
      // values: r1c1=1,r1c2=8; r1c4=7,r1c5=6
      // r2c1=2,r2c2=9; r2c4=3,r2c5=4
      // cols: c1=1+2=3,c2=8+9=17,c4=7+3=10,c5=6+4=10
      // across: r1left=9, r1right=13; r2left=11, r2right=7
      return buildSimplePuzzle(4, 7,
        [
          "B",   "D:3",  "D:17", "B",    "D:10", "D:10", "B",
          "A:9", "W",    "W",    "A:13", "W",    "W",    "B",
          "A:11","W",    "W",    "A:7",  "W",    "W",    "B",
          "B",   "B",    "B",    "B",    "B",    "B",    "B",
        ],
        [
          0, 0, 0,  0, 0, 0,  0,
          0, 1, 8,  0, 7, 6,  0,
          0, 2, 9,  0, 3, 4,  0,
          0, 0, 0,  0, 0, 0,  0,
        ],
      );
    })(),
  ],
  hard: [
    // H1: larger, more intricate
    (() => {
      // 3 cols, 4 rows of whites
      // col vals: c1={1,3,5,9}->18, c2={2,4,6,8}->20, c3={7,1,2,3}->? no dup!
      // c3: need 4 unique 1-9 values. {7,8,9,... } but then across sums get large
      // c3={7,5,3,1} all unique? col sum=16
      //   across: r1=1+2+7=10, r2=3+4+5=12, r3=5+6+3=14, r4=9+8+1=18
      //   check dup within rows: r1:{1,2,7}ok; r2:{3,4,5}ok; r3:{5,6,3}ok; r4:{9,8,1}ok
      //   wait r3col1=5 but r1col1=1,r2col1=3,r3col1=5,r4col1=9 -- col1 has 1,3,5,9 ✓
      //   col2: 2,4,6,8 ✓; col3: 7,5,3,1 ✓
      return buildSimplePuzzle(6, 5,
        [
          "B",    "D:18", "D:20", "D:16", "B",
          "A:10", "W",    "W",    "W",    "B",
          "A:12", "W",    "W",    "W",    "B",
          "A:14", "W",    "W",    "W",    "B",
          "A:18", "W",    "W",    "W",    "B",
          "B",    "B",    "B",    "B",    "B",
        ],
        [
          0, 0, 0, 0, 0,
          0, 1, 2, 7, 0,
          0, 3, 4, 5, 0,
          0, 5, 6, 3, 0,
          0, 9, 8, 1, 0,
          0, 0, 0, 0, 0,
        ],
      );
    })(),
    // H2: 5 rows, 4 cols whites
    (() => {
      // col1={2,6,9,8,1}->26, col2={3,7,4,5,2}? dup 2!
      // col1={1,2,3,4,9}->19, col2={5,6,7,8,4}? dup 4!
      // col1={1,2,3,4,9} col2={5,6,7,8,3}? dup 3!
      // Use: c1={1,2,3,4,9}sum=19; c2={5,8,6,7,4}? has 4 in last: across r5:9+4 no dup ✓
      //   wait c2={5,8,6,7,4} has no internal dup? 5,8,6,7,4 all different ✓
      //   But across dup check: r5: c1=9,c2=4 ok
      // across: 1+5=6; 2+8=10; 3+6=9; 4+7=11; 9+4=13
      // col sums: c1=19, c2=30
      return buildSimplePuzzle(7, 4,
        [
          "B",    "D:19", "D:30", "B",
          "A:6",  "W",    "W",    "B",
          "A:10", "W",    "W",    "B",
          "A:9",  "W",    "W",    "B",
          "A:11", "W",    "W",    "B",
          "A:13", "W",    "W",    "B",
          "B",    "B",    "B",    "B",
        ],
        [
          0, 0,  0,  0,
          0, 1,  5,  0,
          0, 2,  8,  0,
          0, 3,  6,  0,
          0, 4,  7,  0,
          0, 9,  4,  0,
          0, 0,  0,  0,
        ],
      );
    })(),
    // H3: wider puzzle with multiple runs per row
    (() => {
      // 3 rows, 2 separate 2-cell runs per row
      // run A (c1,c2): r1=(3,6),r2=(1,8),r3=(2,9); sums: 9,9,11
      //   col1: 3+1+2=6, col2: 6+8+9=23
      // run B (c4,c5): r1=(7,4),r2=(5,2),r3=(8,1); sums: 11,7,9
      //   col4: 7+5+8=20, col5: 4+2+1=7
      return buildSimplePuzzle(5, 7,
        [
          "B",   "D:6",  "D:23", "B",   "D:20", "D:7",  "B",
          "A:9", "W",    "W",    "A:11","W",    "W",    "B",
          "A:9", "W",    "W",    "A:7", "W",    "W",    "B",
          "A:11","W",    "W",    "A:9", "W",    "W",    "B",
          "B",   "B",    "B",    "B",   "B",    "B",    "B",
        ],
        [
          0, 0, 0,  0, 0, 0,  0,
          0, 3, 6,  0, 7, 4,  0,
          0, 1, 8,  0, 5, 2,  0,
          0, 2, 9,  0, 8, 1,  0,
          0, 0, 0,  0, 0, 0,  0,
        ],
      );
    })(),
    // H4: bigger mixed puzzle
    (() => {
      // 4 white rows, 4 cols -- dense
      // c1={2,4,6,8}->20, c2={1,3,5,7}->16, c3={9,7,5,3}->24, c4={8,6,4,2}->20
      // Check dup in rows: r1:2+1+9+8=20 ✓ no dup; r2:4+3+7+6=20 ✓; r3:6+5+5? dup col3 r3=5 and col2 r3=5!
      // Fix c3: {9,8,3,4}? across: r1:2+1+9+8=20ok, r2:4+3+8+6? c3r2=8 dup with c4r1=8? no, within row: r2:4,3,8,6 ok✓
      //   c3={9,8,3,4}->24; c4={8,6,4,2}->20
      //   r3: c1=6,c2=5,c3=3,c4=4 -> no dup ✓; r4: c1=8,c2=7,c3=4,c4=2 -> no dup ✓
      //   col internal: c1={2,4,6,8}✓; c2={1,3,5,7}✓; c3={9,8,3,4}? has 9,8,3,4 ✓; c4={8,6,4,2}? has 8,6,4,2 ✓
      //   But across row dup: c3r1=9,c4r1=8; row1:{2,1,9,8}✓; c3r2=8,c4r2=6; row2:{4,3,8,6}✓; row3:{6,5,3,4}✓; row4:{8,7,4,2}✓ -- no dups ✓
      // across: 2+1+9+8=20; 4+3+8+6=21; 6+5+3+4=18; 8+7+4+2=21
      // col sums: c1=2+4+6+8=20; c2=1+3+5+7=16; c3=9+8+3+4=24; c4=8+6+4+2=20
      return buildSimplePuzzle(6, 6,
        [
          "B",    "D:20", "D:16", "D:24", "D:20", "B",
          "A:20", "W",    "W",    "W",    "W",    "B",
          "A:21", "W",    "W",    "W",    "W",    "B",
          "A:18", "W",    "W",    "W",    "W",    "B",
          "A:21", "W",    "W",    "W",    "W",    "B",
          "B",    "B",    "B",    "B",    "B",    "B",
        ],
        [
          0, 0, 0, 0, 0, 0,
          0, 2, 1, 9, 8, 0,
          0, 4, 3, 8, 6, 0,
          0, 6, 5, 3, 4, 0,
          0, 8, 7, 4, 2, 0,
          0, 0, 0, 0, 0, 0,
        ],
      );
    })(),
  ],
};

// ---- Runs computation (for validation) ----

export interface Run {
  cells: number[]; // indices into board
  clue: number;
}

export function computeRuns(puzzle: KakuroPuzzle): { acrossRuns: Run[]; downRuns: Run[] } {
  const { rows, cols, cells } = puzzle;
  const acrossRuns: Run[] = [];
  const downRuns: Run[] = [];

  for (let r = 0; r < rows; r++) {
    let run: number[] = [];
    let clue = 0;
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const cell = cells[idx]!;
      if (!cell.isBlack) {
        run.push(idx);
      } else {
        if (run.length >= 2) {
          acrossRuns.push({ cells: run, clue });
        }
        run = [];
        clue = cell.acrossClue;
      }
    }
    if (run.length >= 2) acrossRuns.push({ cells: run, clue });
  }

  for (let c = 0; c < cols; c++) {
    let run: number[] = [];
    let clue = 0;
    for (let r = 0; r < rows; r++) {
      const idx = r * cols + c;
      const cell = cells[idx]!;
      if (!cell.isBlack) {
        run.push(idx);
      } else {
        if (run.length >= 2) {
          downRuns.push({ cells: run, clue });
        }
        run = [];
        clue = cell.downClue;
      }
    }
    if (run.length >= 2) downRuns.push({ cells: run, clue });
  }

  return { acrossRuns, downRuns };
}

function computeErrors(board: number[], puzzle: KakuroPuzzle): Set<number> {
  const errors = new Set<number>();
  const { acrossRuns, downRuns } = computeRuns(puzzle);
  for (const run of [...acrossRuns, ...downRuns]) {
    const digits = run.cells.map((i) => board[i]!).filter((d) => d > 0);
    const sum = digits.reduce((a, b) => a + b, 0);
    const allFilled = run.cells.every((i) => board[i]! > 0);
    const hasDup = new Set(digits).size < digits.length;
    const wrongSum = allFilled && sum !== run.clue;
    if (hasDup || wrongSum) {
      for (const i of run.cells) errors.add(i);
    }
  }
  return errors;
}

function checkWon(board: number[], puzzle: KakuroPuzzle): boolean {
  // All white cells filled, no errors
  for (let i = 0; i < board.length; i++) {
    if (!puzzle.cells[i]!.isBlack && board[i] === 0) return false;
  }
  const errors = computeErrors(board, puzzle);
  return errors.size === 0;
}

export function initialState(seed: number, settings: KakuroSettings): KakuroState {
  const rng = mulberry32(seed);
  const pool = PUZZLES[settings.difficulty]!;
  const idx = Math.floor(rng() * pool.length);
  const puzzle = pool[idx]!;
  const board = new Array(puzzle.rows * puzzle.cols).fill(0);

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

export function reducer(state: KakuroState, action: KakuroAction): KakuroState {
  if (state.won) return state;
  switch (action.type) {
    case "selectCell": {
      const cell = state.puzzle.cells[action.idx];
      if (!cell || cell.isBlack) return state;
      return { ...state, selected: action.idx };
    }
    case "enterDigit": {
      const { selected } = state;
      if (selected === null) return state;
      const d = action.digit;
      if (d < 1 || d > 9) return state;
      const newBoard = state.board.slice();
      newBoard[selected] = d;
      const errorCells = computeErrors(newBoard, state.puzzle);
      const won = checkWon(newBoard, state.puzzle);
      return { ...state, board: newBoard, errorCells, won, moves: state.moves + 1 };
    }
    case "clearCell": {
      const { selected } = state;
      if (selected === null) return state;
      const newBoard = state.board.slice();
      newBoard[selected] = 0;
      const errorCells = computeErrors(newBoard, state.puzzle);
      return { ...state, board: newBoard, errorCells, moves: state.moves + 1 };
    }
    default:
      return state;
  }
}

export function isTerminal(state: KakuroState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(100, 1000 - state.moves * 5) };
}
