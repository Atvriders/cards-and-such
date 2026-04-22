/**
 * Codewords puzzles — crossword-like grids where each letter is replaced by a number 1-26.
 *
 * Grid format: string where '#' = black cell, digits represent letter codes 1-26.
 * We encode as a 2D array of cells. Each cell is:
 *   - null: black (blocked)
 *   - number 1-26: a code for a letter
 *
 * For simplicity, puzzles are stored as encoded grids + solution maps.
 */

export interface CodewordsPuzzle {
  /** Grid cells: null = black, number = letter code */
  grid: (number | null)[][];
  /** Map: code (1-26) -> letter ('A'-'Z') */
  solution: Record<number, string>;
  /** Codes pre-given to the player as starters */
  givenCodes: number[];
  width: number;
  height: number;
  difficulty: "easy" | "medium" | "hard";
}

// Helper to create a puzzle. Words are laid out manually.
// We use a compact notation: each word placed in sequence.

function buildPuzzle(
  words: string[],
  layout: { word: string; row: number; col: number; dir: "H" | "V" }[],
  width: number,
  height: number,
  givenCount: number,
  difficulty: CodewordsPuzzle["difficulty"]
): CodewordsPuzzle {
  // Assign codes to letters
  const letterToCode: Record<string, number> = {};
  let nextCode = 1;
  // Assign codes to all unique letters in all words
  for (const w of words) {
    for (const ch of w.toUpperCase()) {
      if (!letterToCode[ch]) {
        letterToCode[ch] = nextCode++;
      }
    }
  }
  // Fill remaining letters with codes
  for (let ch = 65; ch <= 90; ch++) {
    const c = String.fromCharCode(ch);
    if (!letterToCode[c]) {
      letterToCode[c] = nextCode++;
    }
  }

  const solution: Record<number, string> = {};
  for (const [ch, code] of Object.entries(letterToCode)) {
    solution[code] = ch;
  }

  // Build grid (all black initially)
  const grid: (number | null)[][] = Array.from({ length: height }, () =>
    new Array(width).fill(null)
  );

  for (const placement of layout) {
    const word = placement.word.toUpperCase();
    for (let i = 0; i < word.length; i++) {
      const r = placement.dir === "H" ? placement.row : placement.row + i;
      const c = placement.dir === "H" ? placement.col + i : placement.col;
      if (r < height && c < width) {
        grid[r]![c] = letterToCode[word[i]!]!;
      }
    }
  }

  // Pick given codes: most frequent codes first
  const codeCounts: Record<number, number> = {};
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null) {
        codeCounts[cell] = (codeCounts[cell] ?? 0) + 1;
      }
    }
  }
  const sortedCodes = Object.entries(codeCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([code]) => parseInt(code));

  const givenCodes = sortedCodes.slice(0, givenCount);

  return { grid, solution, givenCodes, width, height, difficulty };
}

// Puzzle 1 — Easy, small grid
const P1_WORDS = ["TREE", "RAIL", "ABLE", "EARL", "LIME"];
const P1_LAYOUT: { word: string; row: number; col: number; dir: "H" | "V" }[] = [
  { word: "TREE", row: 0, col: 0, dir: "H" },
  { word: "RAIL", row: 1, col: 0, dir: "H" },
  { word: "ABLE", row: 2, col: 0, dir: "H" },
  { word: "EARL", row: 3, col: 0, dir: "H" },
  { word: "TREE", row: 0, col: 0, dir: "V" },
  { word: "RALE", row: 0, col: 1, dir: "V" },
  { word: "ABLE", row: 0, col: 2, dir: "V" },
  { word: "LIME", row: 0, col: 3, dir: "V" },
];

// Puzzle 2 — Medium
const P2_WORDS = ["CANOE", "ALONE", "NOBLE", "OUTER", "ELDER"];
const P2_LAYOUT: { word: string; row: number; col: number; dir: "H" | "V" }[] = [
  { word: "CANOE", row: 0, col: 0, dir: "H" },
  { word: "ALONE", row: 1, col: 0, dir: "H" },
  { word: "NOBLE", row: 2, col: 0, dir: "H" },
  { word: "OUTER", row: 3, col: 0, dir: "H" },
  { word: "ELDER", row: 4, col: 0, dir: "H" },
  { word: "CANOE", row: 0, col: 0, dir: "V" },
  { word: "ALONE", row: 0, col: 1, dir: "V" },
  { word: "NOBLE", row: 0, col: 2, dir: "V" },
  { word: "OUTER", row: 0, col: 3, dir: "V" },
  { word: "EAGLE", row: 0, col: 4, dir: "V" },
];

// Puzzle 3 — Hard
const P3_WORDS = ["BRIDGE", "RISING", "INFORM", "DRAGON", "GRAVEL", "ENGINE"];
const P3_LAYOUT: { word: string; row: number; col: number; dir: "H" | "V" }[] = [
  { word: "BRIDGE", row: 0, col: 0, dir: "H" },
  { word: "RISING", row: 1, col: 0, dir: "H" },
  { word: "INFORM", row: 2, col: 0, dir: "H" },
  { word: "DRAGON", row: 3, col: 0, dir: "H" },
  { word: "GRAVEL", row: 4, col: 0, dir: "H" },
  { word: "ENGINE", row: 5, col: 0, dir: "H" },
  { word: "BRIDGE", row: 0, col: 0, dir: "V" },
  { word: "RIDING", row: 0, col: 1, dir: "V" },
  { word: "IRONED", row: 0, col: 2, dir: "V" },
  { word: "DRAGON", row: 0, col: 3, dir: "V" },
  { word: "GRAVEL", row: 0, col: 4, dir: "V" },
  { word: "ENGINE", row: 0, col: 5, dir: "V" },
];

export const PUZZLES: CodewordsPuzzle[] = [
  buildPuzzle(P1_WORDS, P1_LAYOUT, 4, 4, 3, "easy"),
  buildPuzzle(P2_WORDS, P2_LAYOUT, 5, 5, 2, "medium"),
  buildPuzzle(P3_WORDS, P3_LAYOUT, 6, 6, 2, "hard"),
];
