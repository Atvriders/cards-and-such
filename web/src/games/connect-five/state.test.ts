import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWin, topRow, ROWS, COLS, TARGET } from "./state.js";

const S = { botStrength: "easy" as const };

describe("connect-five", () => {
  it("starts in playing phase with empty grid", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.length).toBe(ROWS * COLS);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(TARGET).toBe(5);
  });

  it("drop applies gravity to bottom row", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "drop", col: 4 });
    expect(s1.board[(ROWS - 1) * COLS + 4]).toBe("P");
    // Bot should drop somewhere too
    const cCount = s1.board.filter((c) => c === "C").length;
    expect(cCount).toBe(1);
  });

  it("topRow returns -1 when column is full", () => {
    const board = Array(ROWS * COLS).fill("P");
    expect(topRow(board, 0)).toBe(-1);
  });

  it("checkWin detects 5-in-a-row vertical", () => {
    const b = Array(ROWS * COLS).fill(null);
    for (let r = ROWS - 5; r < ROWS; r++) b[r * COLS + 0] = "P";
    expect(checkWin(b).winner).toBe("P");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
