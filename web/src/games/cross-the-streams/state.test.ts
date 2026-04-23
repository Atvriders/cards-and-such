import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeRuns, rowsMatch, colsMatch } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("Cross the Streams computeRuns", () => {
  it("computes runs from filled cells", () => {
    expect(computeRuns([true,true,false,true])).toEqual([2,1]);
    expect(computeRuns([false,false,false])).toEqual([0]);
    expect(computeRuns([true])).toEqual([1]);
    expect(computeRuns([true,true,true])).toEqual([3]);
  });

  it("null cells treated as non-filled", () => {
    expect(computeRuns([true, null, true])).toEqual([1,1]);
  });

  it("trailing false does not add a run", () => {
    expect(computeRuns([true,false,false])).toEqual([1]);
  });
});

describe("Cross the Streams initialState", () => {
  it("starts with all null marks", () => {
    const s = initialState(1, easy);
    expect(s.marks.every(m => m === null)).toBe(true);
    expect(s.won).toBe(false);
  });

  it("is deterministic with same seed", () => {
    expect(initialState(5, easy).puzzle).toBe(initialState(5, easy).puzzle);
  });

  it("medium uses 6×6 puzzles", () => {
    const s = initialState(1, medium);
    expect(s.puzzle.rows).toBe(6);
  });

  it("easy uses 5×5 puzzles", () => {
    const s = initialState(1, easy);
    expect(s.puzzle.rows).toBe(5);
  });
});

describe("Cross the Streams rowsMatch / colsMatch", () => {
  it("solution rows and cols all match their clues", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const sol = puzzle.solution.map(v => v as boolean | null);
    expect(rowsMatch(puzzle, sol).every(Boolean)).toBe(true);
    expect(colsMatch(puzzle, sol).every(Boolean)).toBe(true);
  });

  it("empty marks do not match non-zero clues", () => {
    const puzzle = PUZZLES_EASY[2]!; // has non-zero clues
    const empty = new Array(25).fill(null);
    const matched = rowsMatch(puzzle, empty);
    // Not all rows should match (unless all clues are [0])
    expect(matched.some(m => !m)).toBe(true);
  });
});

describe("Cross the Streams checkWon", () => {
  it("returns false for empty marks", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(checkWon(puzzle, new Array(25).fill(null))).toBe(false);
  });

  it("returns true for all easy solutions", () => {
    for (const puzzle of PUZZLES_EASY) {
      expect(checkWon(puzzle, puzzle.solution as (boolean | null)[])).toBe(true);
    }
  });

  it("returns false for wrong marks", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const wrong = puzzle.solution.map(v => !v) as (boolean | null)[];
    expect(checkWon(puzzle, wrong)).toBe(false);
  });
});

describe("Cross the Streams reducer", () => {
  it("mark cycles null→filled→empty→null", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "mark", idx: 0, value: true });
    expect(s2.marks[0]).toBe(true);
    expect(s2.moves).toBe(1);
    const s3 = reducer(s2, { type: "mark", idx: 0, value: false });
    expect(s3.marks[0]).toBe(false);
    const s4 = reducer(s3, { type: "mark", idx: 0, value: null });
    expect(s4.marks[0]).toBeNull();
  });

  it("reset clears all marks", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "mark", idx: 0, value: true });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.marks.every(m => m === null)).toBe(true);
    expect(s3.moves).toBe(0);
  });

  it("moves counter increments", () => {
    const s = initialState(1, easy);
    const s2 = reducer(reducer(s, { type: "mark", idx: 0, value: true }), { type: "mark", idx: 1, value: false });
    expect(s2.moves).toBe(2);
  });
});

describe("Cross the Streams isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const r = isTerminal({ ...s, won: true, moves: 10 });
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });

  it("score has minimum 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 99999 })!.score).toBe(100);
  });
});
