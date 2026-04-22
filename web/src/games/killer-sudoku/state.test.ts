import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeErrors } from "./state.js";
import { KILLER_PUZZLES, validatePuzzle } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("KillerSudoku puzzles", () => {
  it("all puzzles have valid cage coverage (81 unique cells, correct sums)", () => {
    for (const p of KILLER_PUZZLES) {
      expect(validatePuzzle(p)).toBe(true);
    }
  });

  it("has at least 3 easy puzzles and 2 medium puzzles", () => {
    const easyCount = KILLER_PUZZLES.filter((p) => p.difficulty === "easy").length;
    const medCount = KILLER_PUZZLES.filter((p) => p.difficulty === "medium").length;
    expect(easyCount).toBeGreaterThanOrEqual(3);
    expect(medCount).toBeGreaterThanOrEqual(2);
  });
});

describe("KillerSudoku initialState", () => {
  it("starts with all cells empty (current = all zeros)", () => {
    const s = initialState(42, easy);
    expect(s.current.every((v) => v === 0)).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const s1 = initialState(7, easy);
    const s2 = initialState(7, easy);
    expect(s1.puzzle.id).toBe(s2.puzzle.id);
  });

  it("starts with won=false and no errors", () => {
    const s = initialState(1, medium);
    expect(s.won).toBe(false);
    expect(s.errorCells).toHaveLength(0);
  });
});

describe("KillerSudoku reducer", () => {
  it("select action updates selected index", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "select", index: 10 });
    expect(s2.selected).toBe(10);
  });

  it("enter digit on selected cell updates current", () => {
    const s = initialState(1, easy);
    const s2 = reducer({ ...s, selected: 0 }, { type: "enter", digit: 5 });
    expect(s2.current[0]).toBe(5);
    expect(s2.movesMade).toBe(1);
  });

  it("enter 0 erases a cell", () => {
    const s = initialState(1, easy);
    let s2 = reducer({ ...s, selected: 0 }, { type: "enter", digit: 3 });
    s2 = reducer({ ...s2, selected: 0 }, { type: "enter", digit: 0 });
    expect(s2.current[0]).toBe(0);
  });

  it("entering without a selected cell is a no-op", () => {
    const s = initialState(1, easy);
    const s2 = reducer({ ...s, selected: null }, { type: "enter", digit: 5 });
    expect(s2.movesMade).toBe(0);
    expect(s2.current[0]).toBe(0);
  });
});

describe("KillerSudoku error detection", () => {
  it("duplicate digit in same row is flagged as error", () => {
    const s = initialState(1, easy);
    const puzzle = s.puzzle;
    const errors = computeErrors([5, 5, 0, 0, 0, 0, 0, 0, 0, ...new Array(72).fill(0)], puzzle);
    expect(errors).toContain(0);
    expect(errors).toContain(1);
  });

  it("cage sum violation on fully filled cage is flagged", () => {
    const s = initialState(1, easy);
    const puzzle = s.puzzle;
    // Find a 2-cell cage and fill with wrong sum
    const cage = puzzle.cages.find((c) => c.cells.length === 2)!;
    const [r0, c0] = cage.cells[0]!;
    const [r1, c1] = cage.cells[1]!;
    const current = new Array(81).fill(0);
    // Put values that don't match the cage sum
    current[r0 * 9 + c0] = 1;
    current[r1 * 9 + c1] = 1; // same digit = repeat in cage AND won't match sum (unless sum=2)
    const errors = computeErrors(current, puzzle);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("correct solution has no errors", () => {
    const s = initialState(1, easy);
    const errors = computeErrors(s.puzzle.solution, s.puzzle);
    expect(errors).toHaveLength(0);
  });
});

describe("KillerSudoku win condition", () => {
  it("won becomes true when solution is fully entered correctly", () => {
    const s = initialState(2, easy);
    // Fill with the known solution, digit by digit via the reducer
    let state = s;
    for (let i = 0; i < 81; i++) {
      state = reducer({ ...state, selected: i }, { type: "enter", digit: s.puzzle.solution[i]! });
    }
    expect(state.won).toBe(true);
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, movesMade: 20 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(Math.max(100, 1000 - 20 * 5));
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(1, easy);
    expect(isTerminal(s)).toBeNull();
  });
});
