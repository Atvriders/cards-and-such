import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy = { difficulty: "easy" as const };

describe("ArrowSudoku initialState", () => {
  it("starts with no selected cell and not won", () => {
    const s = initialState(1, easy);
    expect(s.selected).toBeNull();
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("board starts as copy of givens", () => {
    const s = initialState(7, easy);
    expect(s.board).toEqual(s.puzzle.givens);
  });
});

describe("ArrowSudoku selectCell", () => {
  it("selects an empty cell", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.givens.findIndex(v => v === 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    expect(s2.selected).toBe(emptyIdx);
  });

  it("cannot select a given cell", () => {
    const s = initialState(1, easy);
    const givenIdx = s.puzzle.givens.findIndex(v => v !== 0);
    const s2 = reducer(s, { type: "selectCell", idx: givenIdx });
    expect(s2.selected).toBeNull();
  });
});

describe("ArrowSudoku enterDigit", () => {
  it("places a digit in selected cell", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.givens.findIndex(v => v === 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    const s3 = reducer(s2, { type: "enterDigit", digit: 3 });
    expect(s3.board[emptyIdx]).toBe(3);
    expect(s3.moves).toBe(1);
  });

  it("ignores digit entry when no cell selected", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "enterDigit", digit: 4 });
    expect(s2.board).toEqual(s.board);
  });

  it("clears cell with clearCell action", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.givens.findIndex(v => v === 0);
    const s2 = reducer(reducer(s, { type: "selectCell", idx: emptyIdx }), { type: "enterDigit", digit: 5 });
    const s3 = reducer(s2, { type: "clearCell" });
    expect(s3.board[emptyIdx]).toBe(0);
  });
});

describe("ArrowSudoku checkWon", () => {
  it("returns false for incomplete board", () => {
    const puzzle = PUZZLES[0]!;
    const board = puzzle.givens.slice();
    expect(checkWon(puzzle, board)).toBe(false);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 20 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(900);
  });

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 9999 };
    expect(isTerminal(wonState)!.score).toBe(100);
  });
});

describe("ArrowSudoku reset", () => {
  it("resets board to givens", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.givens.findIndex(v => v === 0);
    const s2 = reducer(reducer(s, { type: "selectCell", idx: emptyIdx }), { type: "enterDigit", digit: 2 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.board).toEqual(s.puzzle.givens);
    expect(s3.moves).toBe(0);
    expect(s3.selected).toBeNull();
  });
});
