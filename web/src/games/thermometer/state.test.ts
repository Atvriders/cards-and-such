import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, applyThermFill } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy: { difficulty: "easy" } = { difficulty: "easy" };

describe("Thermometer initialState", () => {
  it("starts with no filled cells, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.filled.every(v => !v)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("puzzle has thermometers", () => {
    const s = initialState(1, easy);
    expect(s.puzzle.thermometers.length).toBeGreaterThan(0);
  });
});

describe("Thermometer applyThermFill", () => {
  it("fills N cells from bulb", () => {
    const puzzle = PUZZLES[0]!;
    const filled = new Array(puzzle.rows * puzzle.cols).fill(false);
    const therm = puzzle.thermometers[0]!;
    const newFilled = applyThermFill(puzzle, filled, 0, 2);
    // First 2 cells of therm 0 should be filled
    const [r0, c0] = therm.cells[0]!;
    const [r1, c1] = therm.cells[1]!;
    expect(newFilled[r0 * puzzle.cols + c0]).toBe(true);
    expect(newFilled[r1 * puzzle.cols + c1]).toBe(true);
    if (therm.cells.length > 2) {
      const [r2, c2] = therm.cells[2]!;
      expect(newFilled[r2 * puzzle.cols + c2]).toBe(false);
    }
  });

  it("fillCount=0 clears thermometer", () => {
    const puzzle = PUZZLES[0]!;
    const filled = puzzle.solution.slice();
    const newFilled = applyThermFill(puzzle, filled, 0, 0);
    const therm = puzzle.thermometers[0]!;
    for (const [r, c] of therm.cells) {
      expect(newFilled[r * puzzle.cols + c]).toBe(false);
    }
  });
});

describe("Thermometer checkWon", () => {
  it("returns false for empty grid", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, new Array(puzzle.rows * puzzle.cols).fill(false))).toBe(false);
  });

  it("returns true for solution", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, puzzle.solution)).toBe(true);
  });

  it("returns false for wrong row count", () => {
    const puzzle = PUZZLES[0]!;
    const wrong = puzzle.solution.slice();
    // flip first filled cell
    const firstFilled = wrong.findIndex(v => v);
    if (firstFilled >= 0) {
      wrong[firstFilled] = false;
      expect(checkWon(puzzle, wrong)).toBe(false);
    }
  });
});

describe("Thermometer setTherm action", () => {
  it("fills thermometer cells", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "setTherm", thermIdx: 0, fillCount: 1 });
    const therm = s.puzzle.thermometers[0]!;
    const [r0, c0] = therm.cells[0]!;
    expect(s2.filled[r0 * s2.puzzle.cols + c0]).toBe(true);
    expect(s2.moves).toBe(1);
  });
});

describe("Thermometer reset", () => {
  it("clears all filled cells", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "setTherm", thermIdx: 0, fillCount: 2 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.filled.every(v => !v)).toBe(true);
    expect(s3.moves).toBe(0);
    expect(s3.won).toBe(false);
  });
});

describe("Thermometer isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 10 };
    expect(isTerminal(won)!.score).toBe(950);
  });

  it("score has floor 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
