import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("chess-endgame-kqk initialState", () => {
  it("starts at puzzle 0 playing", () => {
    const s = initialState();
    expect(s.puzzleIndex).toBe(0);
    expect(s.status).toBe("playing");
  });

  it("board has exactly 3 pieces (K+Q vs k)", () => {
    const s = initialState();
    expect(s.board.filter(p => p !== null).length).toBe(3);
  });

  it("has white king, white queen, black king", () => {
    const s = initialState();
    const pieces = s.board.filter(p => p !== null);
    const wk = pieces.filter(p => p!.color === "white" && p!.type === "king");
    const wq = pieces.filter(p => p!.color === "white" && p!.type === "queen");
    const bk = pieces.filter(p => p!.color === "black" && p!.type === "king");
    expect(wk.length).toBe(1);
    expect(wq.length).toBe(1);
    expect(bk.length).toBe(1);
  });
});

describe("chess-endgame-kqk reducer", () => {
  it("wrong move does not set solved", () => {
    const s = initialState();
    const after = reducer(s, { type: "move", from: { row: 2, col: 5 }, to: { row: 1, col: 5 } });
    expect(after.status).not.toBe("solved");
  });

  it("retry after wrong resets to playing", () => {
    const wrong = { ...initialState(), status: "wrong" as const };
    const retried = reducer(wrong, { type: "retry" });
    expect(retried.status).toBe("playing");
  });

  it("next on solved advances puzzle", () => {
    const s = { ...initialState(), status: "solved" as const };
    expect(reducer(s, { type: "next" }).puzzleIndex).toBe(1);
  });

  it("next on last puzzle marks complete", () => {
    const s = { ...initialState(), puzzleIndex: PUZZLES.length - 1, status: "solved" as const };
    expect(reducer(s, { type: "next" }).status).toBe("complete");
  });

  it("isTerminal null when playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("isTerminal score 1 when complete", () => {
    expect(isTerminal({ ...initialState(), status: "complete" as const })?.score).toBe(1);
  });
});
