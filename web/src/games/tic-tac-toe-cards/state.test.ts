import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWin, isRedSuit } from "./state.js";
import type { Cell } from "./state.js";

const S = { dummy: false };

describe("Tic-Tac-Toe Cards", () => {
  it("starts empty playing", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(9);
    expect(s.phase).toBe("playing");
    expect(s.score).toBe(0);
  });

  it("place draws a P card and CPU answers with C card", () => {
    const s = reducer(initialState(1, S), { type: "place", idx: 0 });
    expect(s.board[0]?.owner).toBe("P");
    expect(s.board.filter((c) => c?.owner === "C").length).toBe(1);
  });

  it("isRedSuit identifies hearts/diamonds", () => {
    expect(isRedSuit("H")).toBe(true);
    expect(isRedSuit("D")).toBe(true);
    expect(isRedSuit("S")).toBe(false);
    expect(isRedSuit("C")).toBe(false);
  });

  it("checkWin detects 3 same-owner in a row", () => {
    const b: Cell[] = [
      { suit: "H", rank: 0, owner: "P" },
      { suit: "D", rank: 1, owner: "P" },
      { suit: "H", rank: 2, owner: "P" },
      null, null, null, null, null, null,
    ];
    expect(checkWin(b).winner).toBe("P");
  });

  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("rejects placement on occupied cell", () => {
    let s = reducer(initialState(1, S), { type: "place", idx: 0 });
    const before = s;
    s = reducer(s, { type: "place", idx: 0 });
    expect(s).toBe(before);
  });
});
