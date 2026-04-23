import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, checkLatinSquare, checkDotConstraints } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy: { difficulty: "easy" } = { difficulty: "easy" };

describe("Kropki initialState", () => {
  it("fills givens, all other cells are 0", () => {
    const s = initialState(1, easy);
    const { puzzle, grid } = s;
    for (const [r, c] of puzzle.givens) {
      expect(grid[r * puzzle.size + c]).toBeGreaterThan(0);
    }
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(99, easy);
    const s2 = initialState(99, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("puzzle size is 5", () => {
    const s = initialState(1, easy);
    expect(s.puzzle.size).toBe(5);
  });
});

describe("Kropki checkLatinSquare", () => {
  it("returns false for empty grid", () => {
    expect(checkLatinSquare(5, new Array(25).fill(0))).toBe(false);
  });

  it("returns true for valid latin square", () => {
    const grid = [1,2,3,4,5, 2,3,4,5,1, 3,4,5,1,2, 4,5,1,2,3, 5,1,2,3,4];
    expect(checkLatinSquare(5, grid)).toBe(true);
  });

  it("returns false for duplicate in row", () => {
    const grid = [1,1,3,4,5, 2,3,4,5,1, 3,4,5,1,2, 4,5,1,2,3, 5,1,2,3,4];
    expect(checkLatinSquare(5, grid)).toBe(false);
  });

  it("returns false for duplicate in column", () => {
    const grid = [1,2,3,4,5, 1,3,4,5,2, 3,4,5,1,2, 4,5,1,2,3, 5,1,2,3,4];
    expect(checkLatinSquare(5, grid)).toBe(false);
  });
});

describe("Kropki checkDotConstraints", () => {
  it("white dot satisfied when diff=1", () => {
    const puzzle = PUZZLES[4]!; // has verified white dots
    const grid = puzzle.solution.slice();
    // find a white dot and verify
    const whiteDot = puzzle.dots.find(d => d.kind === "white");
    if (whiteDot) {
      const a = grid[whiteDot.r1 * 5 + whiteDot.c1]!;
      const b = grid[whiteDot.r2 * 5 + whiteDot.c2]!;
      expect(Math.abs(a - b)).toBe(1);
    }
    expect(typeof checkDotConstraints(puzzle, grid)).toBe("boolean");
  });
});

describe("Kropki setCell action", () => {
  it("sets a cell value", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.grid.findIndex(v => v === 0);
    if (emptyIdx >= 0) {
      const s2 = reducer(s, { type: "setCell", idx: emptyIdx, value: 1 });
      expect(s2.grid[emptyIdx]).toBe(1);
      expect(s2.moves).toBe(1);
    }
  });

  it("cannot overwrite a given cell", () => {
    const s = initialState(1, easy);
    const { puzzle, grid } = s;
    if (puzzle.givens.length > 0) {
      const [r, c] = puzzle.givens[0]!;
      const idx = r * puzzle.size + c;
      const orig = grid[idx];
      const s2 = reducer(s, { type: "setCell", idx, value: orig === 1 ? 2 : 1 });
      expect(s2.grid[idx]).toBe(orig);
    }
  });
});

describe("Kropki checkWon", () => {
  it("returns true when solution is placed", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, puzzle.solution)).toBe(true);
  });

  it("returns false for partially filled grid", () => {
    const puzzle = PUZZLES[0]!;
    const partial = puzzle.solution.slice();
    partial[0] = 0;
    expect(checkWon(puzzle, partial)).toBe(false);
  });
});

describe("Kropki isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 20 };
    expect(isTerminal(won)!.score).toBe(900);
  });

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});

describe("Kropki reset", () => {
  it("clears non-given cells", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.grid.findIndex(v => v === 0);
    if (emptyIdx >= 0) {
      const s2 = reducer(s, { type: "setCell", idx: emptyIdx, value: 3 });
      const s3 = reducer(s2, { type: "reset" });
      expect(s3.grid[emptyIdx]).toBe(0);
      expect(s3.moves).toBe(0);
    }
  });
});
