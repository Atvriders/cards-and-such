import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findThreeLine, ROWS, COLS, TARGET } from "./state.js";
import type { Cell } from "./state.js";

const S = { dummy: false };

describe("Notakto Mini", () => {
  it("4x4 board, 3-in-a-row", () => {
    expect(ROWS).toBe(4); expect(COLS).toBe(4); expect(TARGET).toBe(3);
  });

  it("starts empty in playing phase", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.board.length).toBe(16);
  });

  it("findThreeLine spots 3 X's of either player", () => {
    const b: Cell[] = Array(16).fill(null);
    b[0] = "P"; b[1] = "C"; b[2] = "P";
    expect(findThreeLine(b)).toEqual([0, 1, 2]);
  });

  it("player making 3-in-a-row LOSES (result=C)", () => {
    let s = initialState(99, S);
    // Manually craft a state where placing at idx 2 completes a line
    s = { ...s, board: ["P", "C", null, null, null, null, null, null, null, null, null, null, null, null, null, null] };
    const after = reducer(s, { type: "place", row: 0, col: 2 });
    expect(after.phase).toBe("done");
    expect(after.result).toBe("C");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("rejects out-of-range", () => {
    const s0 = initialState(1, S);
    expect(reducer(s0, { type: "place", row: -1, col: 0 })).toBe(s0);
  });
});
