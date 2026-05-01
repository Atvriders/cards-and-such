import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, findLineFor, SIZE } from "./state.js";
import type { Cell } from "./state.js";

const S = { dummy: false };

describe("Misere Tic-Tac-Toe", () => {
  it("starts empty in playing phase", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(SIZE * SIZE);
    expect(s.phase).toBe("playing");
    expect(s.score).toBe(0);
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("rejects out-of-bounds placements", () => {
    const s = initialState(1, S);
    expect(reducer(s, { type: "place", idx: -1 })).toBe(s);
    expect(reducer(s, { type: "place", idx: SIZE * SIZE })).toBe(s);
  });

  it("findLineFor detects 3-in-a-row of P", () => {
    const b: Cell[] = ["P", "P", "P", null, null, null, null, null, null];
    expect(findLineFor(b, "P")).toEqual([0, 1, 2]);
    expect(findLineFor(b, "C")).toBeNull();
  });

  it("player completing 3 of P loses (result=C)", () => {
    let s = initialState(99, S);
    s = { ...s, board: ["P", "P", null, null, null, null, null, null, null] };
    const after = reducer(s, { type: "place", idx: 2 });
    expect(after.phase).toBe("done");
    expect(after.result).toBe("C");
  });

  it("playing places P then CPU places C (when not terminal)", () => {
    const s = reducer(initialState(1, S), { type: "place", idx: 0 });
    expect(s.board[0]).toBe("P");
    expect(s.board.filter((c) => c === "C").length).toBe(1);
  });
});
