import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeRowCounts, computeColCounts } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("Battleship Solitaire initialState", () => {
  it("starts with revealed cells filled, rest null", () => {
    const s = initialState(1, easy);
    for (let i = 0; i < s.puzzle.size * s.puzzle.size; i++) {
      if (s.puzzle.revealed[i] !== null) expect(s.marks[i]).toBe(s.puzzle.revealed[i]);
      else expect(s.marks[i]).toBeNull();
    }
  });

  it("is deterministic with same seed", () => {
    expect(initialState(7, easy).puzzle).toBe(initialState(7, easy).puzzle);
  });

  it("starts not won", () => {
    expect(initialState(1, easy).won).toBe(false);
  });

  it("medium uses 8×8 puzzles", () => {
    expect(initialState(1, medium).puzzle.size).toBe(8);
  });
});

describe("Battleship Solitaire computeRowCounts / computeColCounts", () => {
  it("empty grid has all-zero counts", () => {
    const s = initialState(1, easy);
    const size = s.puzzle.size;
    const empty = new Array(size * size).fill(null);
    expect(computeRowCounts(size, empty)).toEqual(new Array(size).fill(0));
    expect(computeColCounts(size, empty)).toEqual(new Array(size).fill(0));
  });

  it("solution matches clues exactly", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const sol = puzzle.solution.map(v => v as boolean | null);
    const rowCounts = computeRowCounts(puzzle.size, sol);
    const colCounts = computeColCounts(puzzle.size, sol);
    expect(rowCounts).toEqual(puzzle.rowClues);
    expect(colCounts).toEqual(puzzle.colClues);
  });
});

describe("Battleship Solitaire checkWon", () => {
  it("returns false for empty board", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(checkWon(puzzle, new Array(puzzle.size * puzzle.size).fill(null))).toBe(false);
  });

  it("returns true for correct solution", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(checkWon(puzzle, puzzle.solution as (boolean | null)[])).toBe(true);
  });

  it("returns true for all easy solutions", () => {
    for (const puzzle of PUZZLES_EASY) {
      expect(checkWon(puzzle, puzzle.solution as (boolean | null)[])).toBe(true);
    }
  });
});

describe("Battleship Solitaire reducer", () => {
  it("mark cycles null→ship→water→null", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.revealed.findIndex(v => v === null);
    const s2 = reducer(s, { type: "mark", idx, value: true });
    expect(s2.marks[idx]).toBe(true);
    const s3 = reducer(s2, { type: "mark", idx, value: false });
    expect(s3.marks[idx]).toBe(false);
    const s4 = reducer(s3, { type: "mark", idx, value: null });
    expect(s4.marks[idx]).toBeNull();
  });

  it("cannot mark revealed cells", () => {
    const s = initialState(1, easy);
    const revIdx = s.puzzle.revealed.findIndex(v => v !== null);
    if (revIdx >= 0) {
      const origVal = s.marks[revIdx];
      const s2 = reducer(s, { type: "mark", idx: revIdx, value: !origVal as boolean });
      expect(s2.marks[revIdx]).toBe(origVal);
    }
  });

  it("reset restores initial marks", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.revealed.findIndex(v => v === null);
    const s2 = reducer(reducer(s, { type: "mark", idx, value: true }), { type: "reset" });
    expect(s2.marks[idx]).toBeNull();
    expect(s2.moves).toBe(0);
  });

  it("moves counter increments", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.revealed.findIndex(v => v === null);
    const s2 = reducer(s, { type: "mark", idx, value: true });
    expect(s2.moves).toBe(1);
  });
});

describe("Battleship Solitaire isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const r = isTerminal({ ...s, won: true, moves: 10 });
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });
});
