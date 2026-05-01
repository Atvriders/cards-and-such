import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWin, ROWS, COLS, TARGET } from "./state.js";
import type { Cell } from "./state.js";

const S = { dummy: false };

describe("Tic-Tac-Toe 4x4", () => {
  it("4x4 board, target 4 in a row", () => {
    expect(ROWS).toBe(4);
    expect(COLS).toBe(4);
    expect(TARGET).toBe(4);
  });

  it("starts empty in playing phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.length).toBe(16);
    expect(s.board.every((c) => c === null)).toBe(true);
  });

  it("player place + CPU response", () => {
    const s = reducer(initialState(1, S), { type: "place", row: 0, col: 0 });
    expect(s.board[0]).toBe("P");
    expect(s.board.filter((c) => c === "C").length).toBe(1);
  });

  it("checkWin sees a 4-in-a-row diagonal", () => {
    const b: Cell[] = Array(16).fill(null);
    b[0] = "P"; b[5] = "P"; b[10] = "P"; b[15] = "P";
    const r = checkWin(b);
    expect(r.winner).toBe("P");
    expect(r.line).toEqual([0, 5, 10, 15]);
  });

  it("isTerminal is null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("rejects out-of-range placement", () => {
    const s0 = initialState(1, S);
    const s1 = reducer(s0, { type: "place", row: -1, col: -1 });
    expect(s1).toBe(s0);
  });
});
