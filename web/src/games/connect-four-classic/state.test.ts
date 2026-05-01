import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROWS, COLS, TARGET } from "./state.js";

const S = { dummy: false };

describe("connect-four-classic", () => {
  it("starts in playing phase with empty 7x6 board", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.length).toBe(ROWS * COLS);
    expect(s.board.every(c => c === null)).toBe(true);
    expect(COLS).toBe(7);
    expect(ROWS).toBe(6);
    expect(TARGET).toBe(4);
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("drop places piece in lowest empty cell of column", () => {
    const s = reducer(initialState(1, S), { type: "drop", col: 3 });
    expect(s.board[(ROWS - 1) * COLS + 3]).toBe("P");
  });

  it("legacy place action also works", () => {
    const s = reducer(initialState(1, S), { type: "place", row: ROWS - 1, col: 0 });
    expect(s.board[(ROWS - 1) * COLS + 0]).toBe("P");
  });

  it("CPU plays after player", () => {
    const s = reducer(initialState(7, S), { type: "drop", col: 3 });
    if (s.phase === "playing") {
      const cpu = s.board.filter(c => c === "C").length;
      expect(cpu).toBeGreaterThanOrEqual(1);
    }
  });

  it("detects horizontal four-in-a-row", () => {
    let s = initialState(1, S);
    const b = s.board.slice();
    b[(ROWS - 1) * COLS + 0] = "P";
    b[(ROWS - 1) * COLS + 1] = "P";
    b[(ROWS - 1) * COLS + 2] = "P";
    s = { ...s, board: b };
    const s2 = reducer(s, { type: "drop", col: 3 });
    expect(s2.result).toBe("P");
    expect(s2.winLine?.length).toBe(4);
  });

  it("detects vertical four-in-a-row", () => {
    let s = initialState(1, S);
    const b = s.board.slice();
    b[(ROWS - 1) * COLS + 0] = "P";
    b[(ROWS - 2) * COLS + 0] = "P";
    b[(ROWS - 3) * COLS + 0] = "P";
    s = { ...s, board: b };
    const s2 = reducer(s, { type: "drop", col: 0 });
    expect(s2.result).toBe("P");
    expect(s2.winLine?.length).toBe(4);
  });

  it("detects diagonal four-in-a-row", () => {
    const b: ("P" | "C" | null)[] = Array(ROWS * COLS).fill(null);
    b[5 * COLS + 0] = "P";
    b[4 * COLS + 1] = "P";
    b[3 * COLS + 2] = "P";
    // Fill col 3 from bottom to row 3 with non-P (C) so player drop lands at row 2.
    b[5 * COLS + 3] = "C";
    b[4 * COLS + 3] = "C";
    b[3 * COLS + 3] = "C";
    const s = { ...initialState(1, S), board: b };
    const s2 = reducer(s, { type: "drop", col: 3 });
    expect(s2.result).toBe("P");
    expect(s2.winLine?.length).toBe(4);
  });

  it("invalid action does not crash", () => {
    const s = reducer(initialState(1, S), { type: "drop", col: -1 });
    expect(s.phase).toBe("playing");
  });

  it("reset returns to a fresh playing state", () => {
    let s = reducer(initialState(1, S), { type: "drop", col: 0 });
    s = reducer(s, { type: "reset", seed: 999 });
    expect(s.phase).toBe("playing");
    expect(s.board.every(c => c === null)).toBe(true);
    expect(s.score).toBe(0);
  });
});
