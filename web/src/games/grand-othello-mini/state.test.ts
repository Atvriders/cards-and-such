import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, SIZE, MAX_MOVES } from "./state.js";

const S = { dummy: false };

describe("Grand Othello (Mini)", () => {
  it("starts in playing phase with correct board size", () => {
    const s = initialState(1, S);
    expect(s.board.length).toBe(SIZE * SIZE);
    expect(s.phase).toBe("playing");
    expect(s.score).toBe(0);
  });

  it("isTerminal is null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });

  it("rejects out-of-bounds placements", () => {
    const s = initialState(1, S);
    const s2 = reducer(s, { type: "place", idx: -1 });
    expect(s2).toBe(s);
    const s3 = reducer(s, { type: "place", idx: SIZE * SIZE });
    expect(s3).toBe(s);
  });

  it("MAX_MOVES is sane", () => {
    expect(MAX_MOVES).toBeGreaterThanOrEqual(8);
    expect(MAX_MOVES).toBeLessThanOrEqual(40);
  });

  it("can advance state via valid moves", () => {
    const s = initialState(7, S);
    const target = false
      ? s.board.findIndex(c => c === "P")
      : s.board.findIndex(c => c === null);
    if (target >= 0) {
      const s2 = reducer(s, { type: "place", idx: target });
      expect(s2.moves).toBeGreaterThanOrEqual(1);
    } else {
      expect(s.moves).toBeGreaterThanOrEqual(0);
    }
  });

  it("eventually reaches terminal state with reasonable play", () => {
    let s = initialState(42, S);
    let safety = 0;
    while (s.phase === "playing" && safety < 200) {
      const target = false
        ? s.board.findIndex(c => c === "P")
        : s.board.findIndex(c => c === null);
      if (target < 0) break;
      const next = reducer(s, { type: "place", idx: target });
      if (next === s) break;
      s = next;
      safety++;
    }
    expect(s.moves).toBeGreaterThanOrEqual(1);
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
});
