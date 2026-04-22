import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, checkWin } from "./state.js";

describe("Futoshiki", () => {
  it("initialState loads givens onto the board", () => {
    const s = initialState(1, { size: "4" });
    for (let i = 0; i < s.board.length; i++) {
      if (s.puzzle.givens[i] !== 0) {
        expect(s.board[i]).toBe(s.puzzle.givens[i]);
      }
    }
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("selectCell selects an empty cell", () => {
    const s = initialState(1, { size: "4" });
    const emptyIdx = s.board.findIndex((v) => v === 0);
    const next = reducer(s, { type: "selectCell", idx: emptyIdx });
    expect(next.selected).toBe(emptyIdx);
  });

  it("placeNumber fills the selected cell and increments moves", () => {
    const s = initialState(1, { size: "4" });
    const emptyIdx = s.board.findIndex((v) => v === 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    const s3 = reducer(s2, { type: "placeNumber", num: 2 });
    expect(s3.board[emptyIdx]).toBe(2);
    expect(s3.moves).toBe(1);
  });

  it("clearCell removes a placed number", () => {
    const s = initialState(1, { size: "4" });
    const emptyIdx = s.board.findIndex((v) => v === 0);
    const s2 = reducer(s, { type: "selectCell", idx: emptyIdx });
    const s3 = reducer(s2, { type: "placeNumber", num: 3 });
    const s4 = reducer(s3, { type: "selectCell", idx: emptyIdx });
    const s5 = reducer(s4, { type: "clearCell" });
    expect(s5.board[emptyIdx]).toBe(0);
  });

  it("given cells cannot be selected or modified", () => {
    const s = initialState(1, { size: "4" });
    const givenIdx = s.puzzle.givens.findIndex((v) => v !== 0);
    const givenVal = s.board[givenIdx];
    const attempt = reducer(s, { type: "selectCell", idx: givenIdx });
    expect(attempt.selected).toBe(null);
    // place number directly won't work either since selected is null
    const attempt2 = reducer(attempt, { type: "placeNumber", num: 99 });
    expect(attempt2.board[givenIdx]).toBe(givenVal);
  });

  it("won becomes true when solution is applied", () => {
    const s = initialState(1, { size: "4" });
    let s2 = s;
    const { size, solution, givens } = s.puzzle;
    for (let i = 0; i < size * size; i++) {
      if (givens[i] !== 0) continue;
      s2 = reducer(s2, { type: "selectCell", idx: i });
      s2 = reducer(s2, { type: "placeNumber", num: solution[i]! });
    }
    expect(s2.won).toBe(true);
    expect(isTerminal(s2)?.score).toBeGreaterThanOrEqual(100);
  });

  it("checkWin returns false for incomplete board", () => {
    const s = initialState(1, { size: "4" });
    expect(checkWin(s.puzzle, s.board)).toBe(false);
  });

  it("size 5 loads 5×5 grid", () => {
    const s = initialState(5, { size: "5" });
    expect(s.puzzle.size).toBe(5);
    expect(s.board).toHaveLength(25);
  });

  it("size 6 loads 6×6 grid", () => {
    const s = initialState(2, { size: "6" });
    expect(s.puzzle.size).toBe(6);
    expect(s.board).toHaveLength(36);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(1, { size: "4" });
    expect(isTerminal(s)).toBe(null);
  });
});
