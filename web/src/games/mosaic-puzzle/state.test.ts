import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, countNeighbourhood } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy = { difficulty: "easy" as const };

describe("Mosaic initialState", () => {
  it("starts with all cells unknown and not won", () => {
    const s = initialState(1, easy);
    expect(s.cells.every(v => v === 0)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(7, easy);
    const s2 = initialState(7, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Mosaic countNeighbourhood", () => {
  it("counts black cells in 3x3 neighbourhood", () => {
    const puzzle = PUZZLES[0]!;
    const cells = new Array(36).fill(1); // all white
    cells[0] = 2; // black at (0,0)
    cells[1] = 2; // black at (0,1)
    // neighbourhood of (0,0): (0,0),(0,1),(1,0),(1,1) -> 2 black
    const count = countNeighbourhood(cells, puzzle.size, 0, 0);
    expect(count).toBe(2);
  });

  it("does not count cells out of bounds", () => {
    const cells = new Array(36).fill(2); // all black
    const count = countNeighbourhood(cells, 6, 0, 0);
    // corner neighbourhood is only 4 cells
    expect(count).toBe(4);
  });
});

describe("Mosaic toggleCell", () => {
  it("cycles through unknown->white->black->unknown", () => {
    const s = initialState(1, easy);
    const s1 = reducer(s, { type: "toggleCell", idx: 0 });
    expect(s1.cells[0]).toBe(1); // white
    const s2 = reducer(s1, { type: "toggleCell", idx: 0 });
    expect(s2.cells[0]).toBe(2); // black
    const s3 = reducer(s2, { type: "toggleCell", idx: 0 });
    expect(s3.cells[0]).toBe(0); // unknown again
  });

  it("increments moves on toggle", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleCell", idx: 5 });
    expect(s2.moves).toBe(1);
  });
});

describe("Mosaic checkWon", () => {
  it("returns false for all-unknown board", () => {
    const puzzle = PUZZLES[0]!;
    const cells = new Array(36).fill(0);
    expect(checkWon(puzzle, cells)).toBe(false);
  });

  it("returns false when cells don't match solution", () => {
    const puzzle = PUZZLES[0]!;
    const cells = new Array(36).fill(1); // all white, wrong
    expect(checkWon(puzzle, cells)).toBe(false);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 30 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(910);
  });
});

describe("Mosaic reset", () => {
  it("clears all cells and resets moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleCell", idx: 0 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.cells.every(v => v === 0)).toBe(true);
    expect(s3.moves).toBe(0);
    expect(s3.won).toBe(false);
  });
});
