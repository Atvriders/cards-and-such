import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROWS, COLS, TARGET } from "./state.js";
const S = { dummy: false };

describe("gomoku-classic", () => {
  it("starts in playing phase with empty board", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.length).toBe(ROWS * COLS);
    expect(s.board.every(c => c === null)).toBe(true);
  });
  it("constants are sensible", () => {
    expect(ROWS).toBeGreaterThanOrEqual(3);
    expect(COLS).toBeGreaterThanOrEqual(3);
    expect(TARGET).toBeGreaterThanOrEqual(3);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("place action records a player piece on the board", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", row: ROWS - 1, col: 0 });
    const pCount = s1.board.filter(c => c === "P").length;
    expect(pCount).toBeGreaterThanOrEqual(1);
  });
  it("invalid action does not crash", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", row: -5, col: -5 });
    expect(s1.phase).toBe("playing");
  });
});
