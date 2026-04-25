import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, FORK_PUZZLES } from "./state.js";

describe("ChessFork initialState", () => {
  it("starts at puzzle 0 with score 0", () => {
    const s = initialState();
    expect(s.puzzleIndex).toBe(0);
    expect(s.score).toBe(0);
    expect(s.status).toBe("playing");
  });

  it("has a valid board with pieces", () => {
    const s = initialState();
    const pieces = s.board.filter((p) => p !== null);
    expect(pieces.length).toBeGreaterThan(0);
  });

  it("has 6 fork puzzles defined", () => {
    expect(FORK_PUZZLES).toHaveLength(6);
  });
});

describe("ChessFork select", () => {
  it("selects a white piece", () => {
    const s = initialState();
    // Find a white piece
    const whiteIdx = s.board.findIndex((p) => p !== null && p.color === "white");
    const row = Math.floor(whiteIdx / 8);
    const col = whiteIdx % 8;
    const s2 = reducer(s, { type: "select", coord: { row, col } });
    expect(s2.selected).toEqual({ row, col });
  });

  it("does not select black piece", () => {
    const s = initialState();
    const blackIdx = s.board.findIndex((p) => p !== null && p.color === "black");
    const row = Math.floor(blackIdx / 8);
    const col = blackIdx % 8;
    const s2 = reducer(s, { type: "select", coord: { row, col } });
    expect(s2.selected).toBeNull();
  });
});

describe("ChessFork retry", () => {
  it("resets board to original FEN position", () => {
    const s = initialState();
    const s2 = reducer(s, { type: "retry" });
    expect(s2.status).toBe("playing");
    expect(s2.board).toEqual(s.board);
  });
});

describe("ChessFork isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score when complete", () => {
    const s = { ...initialState(), status: "complete" as const };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(typeof result!.score).toBe("number");
  });
});
