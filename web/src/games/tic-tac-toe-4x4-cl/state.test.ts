import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWin, ROWS, COLS, TARGET } from "./state.js";
import type { Cell } from "./state.js";

const S = { dummy: false };

describe("Tic-Tac-Toe 4x4 CL", () => {
  it("4x4 board, target 4", () => {
    expect(ROWS).toBe(4); expect(COLS).toBe(4); expect(TARGET).toBe(4);
  });

  it("starts empty playing", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.every((c) => c === null)).toBe(true);
  });

  it("place + CPU response", () => {
    const s = reducer(initialState(1, S), { type: "place", row: 0, col: 0 });
    expect(s.board[0]).toBe("P");
    expect(s.board.filter((c) => c === "C").length).toBe(1);
  });

  it("checkWin sees a vertical 4-in-a-row", () => {
    const b: Cell[] = Array(16).fill(null);
    b[0] = "C"; b[4] = "C"; b[8] = "C"; b[12] = "C";
    expect(checkWin(b).winner).toBe("C");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("rejects out-of-range", () => {
    const s0 = initialState(1, S);
    expect(reducer(s0, { type: "place", row: -1, col: 0 })).toBe(s0);
  });
});
