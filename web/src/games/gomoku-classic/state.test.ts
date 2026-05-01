import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWin, ROWS, COLS, TARGET } from "./state.js";

const S = { botStrength: "easy" as const };

describe("gomoku-classic", () => {
  it("starts in playing phase with empty 15×15 board", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.length).toBe(ROWS * COLS);
    expect(s.board.every((c) => c === null)).toBe(true);
    expect(TARGET).toBe(5);
    expect(ROWS).toBe(15);
  });

  it("place action records the player stone", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", row: 7, col: 7 });
    expect(s1.board[7 * COLS + 7]).toBe("P");
    expect(s1.pieces).toBeGreaterThanOrEqual(1);
  });

  it("invalid placement does nothing", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", row: -1, col: 0 });
    expect(s1).toBe(s0);
  });

  it("detects horizontal 5-in-a-row", () => {
    const board = new Array(ROWS * COLS).fill(null);
    for (let i = 0; i < 5; i++) board[7 * COLS + i] = "P";
    const { winner } = checkWin(board);
    expect(winner).toBe("P");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
