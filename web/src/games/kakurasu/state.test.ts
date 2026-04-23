import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeRowSum, computeColSum } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy: { difficulty: "easy" } = { difficulty: "easy" };

describe("Kakurasu initialState", () => {
  it("starts with no shaded cells, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.shaded.every(v => !v)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("puzzle clues are derived from solution correctly", () => {
    const puzzle = PUZZLES[0]!;
    // Row 0 shaded at cols 0,2,4 => sum = 1+3+5=9
    expect(puzzle.rowClues[0]).toBe(9);
  });
});

describe("Kakurasu computeRowSum", () => {
  it("sums column values of shaded cells in a row", () => {
    const shaded = new Array(25).fill(false);
    shaded[0] = true; // (0,0) col val=1
    shaded[2] = true; // (0,2) col val=3
    expect(computeRowSum(5, shaded, 0)).toBe(4);
  });

  it("returns 0 for empty row", () => {
    expect(computeRowSum(5, new Array(25).fill(false), 0)).toBe(0);
  });
});

describe("Kakurasu computeColSum", () => {
  it("sums row values of shaded cells in a column", () => {
    const shaded = new Array(25).fill(false);
    shaded[0] = true;  // (0,0) row val=1
    shaded[10] = true; // (2,0) row val=3
    expect(computeColSum(5, shaded, 0)).toBe(4);
  });
});

describe("Kakurasu toggle action", () => {
  it("shades a cell", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggle", idx: 0 });
    expect(s2.shaded[0]).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("unshades a shaded cell", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggle", idx: 0 });
    const s3 = reducer(s2, { type: "toggle", idx: 0 });
    expect(s3.shaded[0]).toBe(false);
  });
});

describe("Kakurasu checkWon", () => {
  it("returns false for empty grid", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, new Array(25).fill(false))).toBe(false);
  });

  it("returns true for correct solution", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, puzzle.solution)).toBe(true);
  });

  it("returns false for wrong shading", () => {
    const puzzle = PUZZLES[0]!;
    const wrong = puzzle.solution.slice();
    wrong[0] = !wrong[0];
    expect(checkWon(puzzle, wrong)).toBe(false);
  });
});

describe("Kakurasu reset", () => {
  it("clears all shaded cells", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggle", idx: 0 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.shaded.every(v => !v)).toBe(true);
    expect(s3.moves).toBe(0);
  });
});

describe("Kakurasu isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 15 };
    expect(isTerminal(won)!.score).toBe(925);
  });

  it("score floor at 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
