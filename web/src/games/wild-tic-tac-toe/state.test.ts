import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findCompletedLine, ROWS, COLS } from "./state.js";
import type { Cell } from "./state.js";

const S = { dummy: false };

describe("Wild Tic-Tac-Toe", () => {
  it("starts empty, default pendingMark X", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.pendingMark).toBe("X");
    expect(s.board.every((c) => c === null)).toBe(true);
  });

  it("selectMark switches the pending symbol", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "selectMark", mark: "O" });
    expect(s.pendingMark).toBe("O");
  });

  it("place uses the chosen mark", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "selectMark", mark: "O" });
    s = reducer(s, { type: "place", row: 0, col: 0 });
    expect(s.board[0]).toBe("O");
  });

  it("findCompletedLine spots a wild line of any single mark", () => {
    const b: Cell[] = ["X", "X", "X", null, null, null, null, null, null];
    expect(findCompletedLine(b)?.mark).toBe("X");
    const b2: Cell[] = ["O", null, null, null, "O", null, null, null, "O"];
    expect(findCompletedLine(b2)?.mark).toBe("O");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("after enough moves the game ends", () => {
    let s = initialState(7, S);
    let safety = 30;
    while (s.phase === "playing" && safety-- > 0) {
      const idx = s.board.findIndex((c) => c === null);
      if (idx < 0) break;
      const r = Math.floor(idx / COLS), c = idx % COLS;
      s = reducer(s, { type: "place", row: r, col: c });
    }
    expect(isTerminal(s)).not.toBeNull();
  });

  it("ROWS=COLS=3", () => { expect(ROWS).toBe(3); expect(COLS).toBe(3); });
});
