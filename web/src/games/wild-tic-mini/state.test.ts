import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findCompletedLine, ROWS, COLS } from "./state.js";
import type { Cell } from "./state.js";

const S = { dummy: false };

describe("Wild Tic Mini", () => {
  it("starts empty, default mark X", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.pendingMark).toBe("X");
    expect(s.board.length).toBe(9);
  });

  it("selectMark + place uses chosen mark", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "selectMark", mark: "O" });
    s = reducer(s, { type: "place", row: 1, col: 1 });
    expect(s.board[4]).toBe("O");
  });

  it("findCompletedLine on column", () => {
    const b: Cell[] = [null, "X", null, null, "X", null, null, "X", null];
    expect(findCompletedLine(b)?.mark).toBe("X");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("3x3 board", () => { expect(ROWS).toBe(3); expect(COLS).toBe(3); });

  it("invalid placement is rejected", () => {
    const s0 = initialState(1, S);
    expect(reducer(s0, { type: "place", row: 9, col: 9 })).toBe(s0);
  });
});
