import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWin, topRow, ROWS, COLS, TARGET } from "./state.js";

const S = { botStrength: "easy" as const };

describe("connect-six", () => {
  it("starts in playing phase with empty grid", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.length).toBe(ROWS * COLS);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(TARGET).toBe(6);
  });

  it("drop applies gravity to bottom row", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "drop", col: 5 });
    expect(s1.board[(ROWS - 1) * COLS + 5]).toBe("P");
  });

  it("topRow returns -1 when full", () => {
    const board = Array(ROWS * COLS).fill("P");
    expect(topRow(board, 0)).toBe(-1);
  });

  it("checkWin detects 6-in-a-row horizontal", () => {
    const b = Array(ROWS * COLS).fill(null);
    for (let i = 0; i < 6; i++) b[(ROWS - 1) * COLS + i] = "P";
    expect(checkWin(b).winner).toBe("P");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
