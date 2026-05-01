import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWin, ROWS, COLS } from "./state.js";
import type { Cell } from "./state.js";

const S = { dummy: false };

describe("Tic-Tac-Toe 3x3 Classic", () => {
  it("starts empty, P to move, playing phase", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(ROWS * COLS);
    expect(s.turn).toBe("P");
    expect(s.phase).toBe("playing");
  });

  it("place puts P then CPU answers", () => {
    const s = reducer(initialState(1, S), { type: "place", row: 0, col: 0 });
    expect(s.board[0]).toBe("P");
    const cpuPieces = s.board.filter((c) => c === "C").length;
    expect(cpuPieces).toBe(1);
  });

  it("checkWin detects horizontal P win", () => {
    const b: Cell[] = ["P", "P", "P", null, null, null, null, null, null];
    expect(checkWin(b).winner).toBe("P");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("game terminates eventually when filling cells", () => {
    let s = initialState(7, S);
    let safety = 50;
    while (s.phase === "playing" && safety-- > 0) {
      const idx = s.board.findIndex((c) => c === null);
      if (idx < 0) break;
      const r = Math.floor(idx / COLS), c = idx % COLS;
      s = reducer(s, { type: "place", row: r, col: c });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });

  it("rejects placing on an occupied cell", () => {
    let s = reducer(initialState(1, S), { type: "place", row: 0, col: 0 });
    const before = s;
    s = reducer(s, { type: "place", row: 0, col: 0 });
    expect(s).toBe(before);
  });
});
