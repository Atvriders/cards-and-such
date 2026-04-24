import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy = { difficulty: "easy" as const };

describe("Nurimisaki initialState", () => {
  it("starts with all cells unknown and not won", () => {
    const s = initialState(1, easy);
    expect(s.cells.every(v => v === 0)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(10, easy);
    const s2 = initialState(10, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Nurimisaki toggleCell", () => {
  it("cycles non-clue cell unknown->white->black->unknown", () => {
    const s = initialState(1, easy);
    // Find a non-clue cell
    const nonClueIdx = s.puzzle.clues.findIndex(v => v === null);
    const s1 = reducer(s, { type: "toggleCell", idx: nonClueIdx });
    expect(s1.cells[nonClueIdx]).toBe(1);
    const s2 = reducer(s1, { type: "toggleCell", idx: nonClueIdx });
    expect(s2.cells[nonClueIdx]).toBe(2);
    const s3 = reducer(s2, { type: "toggleCell", idx: nonClueIdx });
    expect(s3.cells[nonClueIdx]).toBe(0);
  });

  it("increments moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleCell", idx: 0 });
    expect(s2.moves).toBe(1);
  });
});

describe("Nurimisaki checkWon", () => {
  it("returns false for all-unknown board", () => {
    const puzzle = PUZZLES[0]!;
    const cells = new Array(36).fill(0);
    expect(checkWon(puzzle, cells)).toBe(false);
  });

  it("returns false when cells don't match solution", () => {
    const puzzle = PUZZLES[0]!;
    // All white (1) won't match if solution has black cells
    const cells = new Array(36).fill(1);
    const hasSomeBlack = puzzle.solution.some(v => !v);
    if (hasSomeBlack) {
      expect(checkWon(puzzle, cells)).toBe(false);
    }
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 20 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(940);
  });
});

describe("Nurimisaki reset", () => {
  it("clears all cells and resets moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleCell", idx: 0 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.cells.every(v => v === 0)).toBe(true);
    expect(s3.moves).toBe(0);
    expect(s3.won).toBe(false);
  });
});
