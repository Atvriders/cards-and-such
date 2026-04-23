import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeErrors, areAdjacent } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("Rikudo initialState", () => {
  it("starts with clues filled, other cells zero", () => {
    const s = initialState(1, easy);
    for (let i = 0; i < s.puzzle.n; i++) {
      if (s.puzzle.clues[i]! > 0) expect(s.values[i]).toBe(s.puzzle.clues[i]);
      else expect(s.values[i]).toBe(0);
    }
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(7, easy);
    const s2 = initialState(7, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("starts not won", () => {
    expect(initialState(1, easy).won).toBe(false);
  });

  it("medium uses 5x5 puzzles", () => {
    const s = initialState(1, medium);
    expect(s.puzzle.n).toBe(25);
  });
});

describe("Rikudo areAdjacent", () => {
  it("adjacent cells in 4x4 grid", () => {
    expect(areAdjacent(4, 4, 0, 1)).toBe(true);  // (0,0)-(0,1)
    expect(areAdjacent(4, 4, 0, 4)).toBe(true);  // (0,0)-(1,0)
    expect(areAdjacent(4, 4, 0, 5)).toBe(false); // diagonal
    expect(areAdjacent(4, 4, 0, 2)).toBe(false); // two apart
  });

  it("cells on different rows are not adjacent unless directly below", () => {
    expect(areAdjacent(4, 4, 3, 4)).toBe(false); // (0,3)-(1,0) — row neighbors but different col
    expect(areAdjacent(4, 4, 4, 5)).toBe(true);  // (1,0)-(1,1)
  });
});

describe("Rikudo checkWon", () => {
  it("returns false for empty board", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const values = new Array(16).fill(0);
    expect(checkWon(puzzle, values)).toBe(false);
  });

  it("returns true for correct solution (snake puzzle E1)", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(checkWon(puzzle, puzzle.solution)).toBe(true);
  });

  it("returns true for all easy puzzle solutions", () => {
    for (const puzzle of PUZZLES_EASY) {
      expect(checkWon(puzzle, puzzle.solution)).toBe(true);
    }
  });

  it("returns false when duplicate numbers exist", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const values = puzzle.solution.slice();
    values[0] = values[1]!; // duplicate
    expect(checkWon(puzzle, values)).toBe(false);
  });
});

describe("Rikudo computeErrors", () => {
  it("no errors on correct solution", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(computeErrors(puzzle, puzzle.solution).size).toBe(0);
  });

  it("flags duplicate values", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const values = puzzle.solution.slice();
    values[5] = values[0]!; // put 1 at index 5 too
    const errs = computeErrors(puzzle, values);
    expect(errs.has(0) || errs.has(5)).toBe(true);
  });
});

describe("Rikudo reducer", () => {
  it("selectCell selects an empty cell", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.clues.findIndex(v => v === 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    expect(s2.selected).toBe(emptyIdx);
  });

  it("cannot select a clue cell", () => {
    const s = initialState(1, easy);
    const clueIdx = s.puzzle.clues.findIndex(v => v > 0);
    const s2 = reducer(s, { type: "selectCell", idx: clueIdx });
    expect(s2.selected).toBeNull();
  });

  it("enterValue fills selected cell", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.clues.findIndex(v => v === 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    const s3 = reducer(s2, { type: "enterValue", value: 5 });
    expect(s3.values[emptyIdx]).toBe(5);
    expect(s3.moves).toBe(1);
  });

  it("clearCell removes value from non-clue cell", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.clues.findIndex(v => v === 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    const s3 = reducer(s2, { type: "enterValue", value: 3 });
    const s4 = reducer(s3, { type: "clearCell", idx: emptyIdx });
    expect(s4.values[emptyIdx]).toBe(0);
  });

  it("reset restores clues", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.clues.findIndex(v => v === 0);
    const s2 = reducer(reducer(s, { type: "selectCell", idx: emptyIdx }), { type: "enterValue", value: 9 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.values[emptyIdx]).toBe(0);
    expect(s3.moves).toBe(0);
    expect(s3.won).toBe(false);
  });
});

describe("Rikudo isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 5 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 99999 })!.score).toBe(100);
  });
});
