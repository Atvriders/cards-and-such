import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, ROWS, COLS, TARGET } from "./state.js";

const S = { dummy: false };

describe("connect-four-classic-cl", () => {
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
    expect(isTerminal(initialState(2, S))).toBeNull();
  });

  it("drop places disc at lowest empty cell of column", () => {
    const s = reducer(initialState(3, S), { type: "drop", col: 0 });
    expect(s.board[(ROWS - 1) * COLS + 0]).toBe("P");
  });

  it("legacy place action also lands a disc", () => {
    const s = reducer(initialState(3, S), { type: "place", row: ROWS - 1, col: 0 });
    expect(s.board.filter(c => c === "P").length).toBeGreaterThanOrEqual(1);
  });

  it("CPU plays after the player drops", () => {
    const s = reducer(initialState(7, S), { type: "drop", col: 3 });
    if (s.phase === "playing") {
      const cpu = s.board.filter(c => c === "C").length;
      expect(cpu).toBeGreaterThanOrEqual(1);
    }
  });

  it("detects horizontal win", () => {
    const b = Array<"P" | "C" | null>(ROWS * COLS).fill(null);
    b[(ROWS - 1) * COLS + 0] = "P";
    b[(ROWS - 1) * COLS + 1] = "P";
    b[(ROWS - 1) * COLS + 2] = "P";
    const s = { ...initialState(1, S), board: b };
    const s2 = reducer(s, { type: "drop", col: 3 });
    expect(s2.result).toBe("P");
  });

  it("detects vertical win", () => {
    const b = Array<"P" | "C" | null>(ROWS * COLS).fill(null);
    b[(ROWS - 1) * COLS + 0] = "P";
    b[(ROWS - 2) * COLS + 0] = "P";
    b[(ROWS - 3) * COLS + 0] = "P";
    const s = { ...initialState(1, S), board: b };
    const s2 = reducer(s, { type: "drop", col: 0 });
    expect(s2.result).toBe("P");
  });

  it("detects diagonal win", () => {
    const b = Array<"P" | "C" | null>(ROWS * COLS).fill(null);
    b[5 * COLS + 0] = "P";
    b[4 * COLS + 1] = "P";
    b[3 * COLS + 2] = "P";
    b[5 * COLS + 3] = "C";
    b[4 * COLS + 3] = "C";
    b[3 * COLS + 3] = "C";
    const s = { ...initialState(1, S), board: b };
    const s2 = reducer(s, { type: "drop", col: 3 });
    expect(s2.result).toBe("P");
  });

  it("invalid action does not crash", () => {
    const s = reducer(initialState(4, S), { type: "drop", col: -5 });
    expect(s.phase).toBe("playing");
  });

  it("reset returns a fresh playing state", () => {
    let s = reducer(initialState(1, S), { type: "drop", col: 0 });
    s = reducer(s, { type: "reset", seed: 12345 });
    expect(s.phase).toBe("playing");
    expect(s.board.every(c => c === null)).toBe(true);
  });
});
