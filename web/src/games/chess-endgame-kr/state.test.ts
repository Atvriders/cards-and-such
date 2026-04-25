import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("chess-endgame-kr initialState", () => {
  it("starts at puzzle 0, playing", () => {
    const s = initialState();
    expect(s.puzzleIndex).toBe(0);
    expect(s.status).toBe("playing");
  });

  it("board has exactly 3 pieces (K+R vs k)", () => {
    const s = initialState();
    const pieces = s.board.filter(p => p !== null);
    expect(pieces.length).toBe(3);
  });

  it("has white king, white rook, black king", () => {
    const s = initialState();
    const pieces = s.board.filter(p => p !== null);
    const wk = pieces.filter(p => p!.color === "white" && p!.type === "king");
    const wr = pieces.filter(p => p!.color === "white" && p!.type === "rook");
    const bk = pieces.filter(p => p!.color === "black" && p!.type === "king");
    expect(wk.length).toBe(1);
    expect(wr.length).toBe(1);
    expect(bk.length).toBe(1);
  });
});

describe("chess-endgame-kr reducer", () => {
  it("wrong move sets status to wrong", () => {
    const s = initialState();
    // Move white king somewhere wrong
    const after = reducer(s, { type: "move", from: { row: 7, col: 7 }, to: { row: 6, col: 7 } });
    expect(after.status).not.toBe("solved");
  });

  it("retry resets board and status", () => {
    const wrong = { ...initialState(), status: "wrong" as const };
    const retried = reducer(wrong, { type: "retry" });
    expect(retried.status).toBe("playing");
  });

  it("next on solved advances puzzle", () => {
    const s = { ...initialState(), status: "solved" as const };
    const next = reducer(s, { type: "next" });
    expect(next.puzzleIndex).toBe(1);
  });

  it("next on last puzzle marks complete", () => {
    const s = { ...initialState(), puzzleIndex: PUZZLES.length - 1, status: "solved" as const };
    const completed = reducer(s, { type: "next" });
    expect(completed.status).toBe("complete");
  });

  it("isTerminal null when playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("isTerminal 1 when complete", () => {
    const s = { ...initialState(), status: "complete" as const };
    expect(isTerminal(s)?.score).toBe(1);
  });
});
