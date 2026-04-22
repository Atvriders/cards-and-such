import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, checkWin } from "./state.js";

describe("Hidato", () => {
  it("initialState loads given numbers onto the board", () => {
    const s = initialState(1, { difficulty: "easy" });
    for (let i = 0; i < s.board.length; i++) {
      if (s.puzzle.given[i]) {
        expect(s.board[i]).toBe(s.puzzle.solution[i]);
      }
    }
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("selectCell selects an empty cell", () => {
    const s = initialState(1, { difficulty: "easy" });
    const emptyIdx = s.board.findIndex((v, i) => v === 0 && s.puzzle.solution[i]! > 0);
    const next = reducer(s, { type: "selectCell", idx: emptyIdx });
    expect(next.selected).toBe(emptyIdx);
  });

  it("placeNumber sets a number in the selected cell", () => {
    const s = initialState(1, { difficulty: "easy" });
    const emptyIdx = s.board.findIndex((v, i) => v === 0 && s.puzzle.solution[i]! > 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    const s3 = reducer(s2, { type: "placeNumber", num: 3 });
    expect(s3.board[emptyIdx]).toBe(3);
    expect(s3.moves).toBe(1);
  });

  it("clearCell removes a non-given number", () => {
    const s = initialState(1, { difficulty: "easy" });
    const emptyIdx = s.board.findIndex((v, i) => v === 0 && s.puzzle.solution[i]! > 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    const s3 = reducer(s2, { type: "placeNumber", num: 5 });
    const s4 = reducer(s3, { type: "clearCell", idx: emptyIdx });
    expect(s4.board[emptyIdx]).toBe(0);
  });

  it("cannot modify given cells", () => {
    const s = initialState(1, { difficulty: "easy" });
    const givenIdx = s.puzzle.given.findIndex((g) => g);
    const givenVal = s.board[givenIdx];
    const attempt = reducer(s, { type: "selectCell", idx: givenIdx });
    expect(attempt.selected).toBe(null); // given cells not selectable
    const attempt2 = reducer(s, { type: "clearCell", idx: givenIdx });
    expect(attempt2.board[givenIdx]).toBe(givenVal); // unchanged
  });

  it("won becomes true when solution is applied", () => {
    const s = initialState(1, { difficulty: "easy" });
    // Apply the full solution
    let s2 = s;
    for (let i = 0; i < s.puzzle.solution.length; i++) {
      if (s.puzzle.solution[i] === 0 || s.puzzle.given[i]) continue;
      s2 = reducer(s2, { type: "selectCell", idx: i });
      s2 = reducer(s2, { type: "placeNumber", num: s.puzzle.solution[i]! });
    }
    expect(s2.won).toBe(true);
    expect(isTerminal(s2)?.score).toBeGreaterThanOrEqual(100);
  });

  it("checkWin returns false for incomplete board", () => {
    const s = initialState(1, { difficulty: "easy" });
    expect(checkWin(s.puzzle, s.board)).toBe(false);
  });

  it("medium difficulty loads 6×6 grid", () => {
    const s = initialState(10, { difficulty: "medium" });
    expect(s.puzzle.rows).toBe(6);
    expect(s.puzzle.cols).toBe(6);
    expect(s.board).toHaveLength(36);
  });

  it("hard difficulty loads 7×7 grid", () => {
    const s = initialState(7, { difficulty: "hard" });
    expect(s.puzzle.rows).toBe(7);
    expect(s.puzzle.cols).toBe(7);
    expect(s.board).toHaveLength(49);
  });
});
