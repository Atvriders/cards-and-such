import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, stitchKey, isCrossRegion, areAdjacent4, computeRowCounts, computeColCounts } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("Stitches helpers", () => {
  it("stitchKey is order-independent", () => {
    expect(stitchKey(2, 5)).toBe(stitchKey(5, 2));
    expect(stitchKey(0, 1)).toBe("0,1");
  });

  it("areAdjacent4 detects orthogonal neighbors in 4x4 grid", () => {
    expect(areAdjacent4(4, 0, 1)).toBe(true);  // right
    expect(areAdjacent4(4, 0, 4)).toBe(true);  // down
    expect(areAdjacent4(4, 0, 5)).toBe(false); // diagonal
    expect(areAdjacent4(4, 0, 2)).toBe(false); // two apart
  });

  it("isCrossRegion works for PUZZLES_EASY[0]", () => {
    const p = PUZZLES_EASY[0]!;
    // region of (0,0)=0, (0,1)=0 — same
    expect(isCrossRegion(p, 0, 1)).toBe(false);
    // region of (0,1)=0, (0,2)=1 — different
    expect(isCrossRegion(p, 1, 2)).toBe(true);
  });
});

describe("Stitches initialState", () => {
  it("starts with no stitches", () => {
    const s = initialState(1, easy);
    expect(s.stitches.size).toBe(0);
    expect(s.won).toBe(false);
  });

  it("is deterministic", () => {
    expect(initialState(5, easy).puzzle).toBe(initialState(5, easy).puzzle);
  });

  it("medium puzzles have 5x5 grid", () => {
    const s = initialState(1, medium);
    expect(s.puzzle.rows).toBe(5);
  });
});

describe("Stitches computeRowCounts / computeColCounts", () => {
  it("empty stitches gives zero counts", () => {
    const s = initialState(1, easy);
    expect(computeRowCounts(s.puzzle, new Set())).toEqual(new Array(s.puzzle.rows).fill(0));
    expect(computeColCounts(s.puzzle, new Set())).toEqual(new Array(s.puzzle.cols).fill(0));
  });

  it("solution stitches match clues", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const solStitches = new Set(puzzle.solution.map(([a, b]) => stitchKey(a, b)));
    const rowCounts = computeRowCounts(puzzle, solStitches);
    const colCounts = computeColCounts(puzzle, solStitches);
    expect(rowCounts).toEqual(puzzle.rowClues);
    expect(colCounts).toEqual(puzzle.colClues);
  });
});

describe("Stitches checkWon", () => {
  it("returns false for empty state", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(checkWon(puzzle, new Set())).toBe(false);
  });

  it("returns true for solution stitches", () => {
    for (const puzzle of PUZZLES_EASY) {
      const solStitches = new Set(puzzle.solution.map(([a, b]) => stitchKey(a, b)));
      expect(checkWon(puzzle, solStitches)).toBe(true);
    }
  });
});

describe("Stitches reducer", () => {
  it("toggleStitch adds a valid cross-region stitch from puzzle solution", () => {
    // Use puzzle directly to find a cross-region stitch from the solution
    const puzzle = PUZZLES_EASY[0]!;
    const [a, b] = puzzle.solution[0]!;
    const s = { settings: { difficulty: "easy" as const }, puzzle, stitches: new Set<string>(), won: false, moves: 0 };
    const s2 = reducer(s, { type: "toggleStitch", a, b });
    expect(s2.stitches.has(stitchKey(a, b))).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("toggleStitch removes existing stitch", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const [a, b] = puzzle.solution[0]!;
    const s = { settings: { difficulty: "easy" as const }, puzzle, stitches: new Set<string>(), won: false, moves: 0 };
    const s2 = reducer(s, { type: "toggleStitch", a, b });
    const s3 = reducer(s2, { type: "toggleStitch", a, b });
    expect(s3.stitches.has(stitchKey(a, b))).toBe(false);
  });

  it("cannot stitch same-region adjacent cells", () => {
    const puzzle = PUZZLES_EASY[0]!;
    // Find two adjacent cells in the same region
    let sameA = -1, sameB = -1;
    outer: for (let i = 0; i < puzzle.rows * puzzle.cols; i++) {
      const r = Math.floor(i / puzzle.cols), c = i % puzzle.cols;
      if (c + 1 < puzzle.cols && puzzle.regions[i] === puzzle.regions[i + 1]) {
        sameA = i; sameB = i + 1; break outer;
      }
      if (r + 1 < puzzle.rows && puzzle.regions[i] === puzzle.regions[i + puzzle.cols]) {
        sameA = i; sameB = i + puzzle.cols; break outer;
      }
    }
    if (sameA >= 0) {
      const s = { settings: { difficulty: "easy" as const }, puzzle, stitches: new Set<string>(), won: false, moves: 0 };
      const s2 = reducer(s, { type: "toggleStitch", a: sameA, b: sameB });
      expect(s2.stitches.size).toBe(0);
    }
  });

  it("reset clears stitches", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleStitch", a: 1, b: 2 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.stitches.size).toBe(0);
    expect(s3.moves).toBe(0);
  });
});

describe("Stitches isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const r = isTerminal({ ...s, won: true, moves: 8 });
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });
});
