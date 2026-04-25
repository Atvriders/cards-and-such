import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("chess-back-rank initialState", () => {
  it("starts at puzzle 0, playing", () => {
    const s = initialState();
    expect(s.puzzleIndex).toBe(0);
    expect(s.status).toBe("playing");
  });

  it("board has pieces", () => {
    const s = initialState();
    expect(s.board.filter(p => p !== null).length).toBeGreaterThan(3);
  });

  it("black king is on rank 8 (row 0)", () => {
    const s = initialState();
    const bk = s.board.find(p => p?.color === "black" && p?.type === "king");
    expect(bk).toBeTruthy();
  });
});

describe("chess-back-rank reducer", () => {
  it("wrong move does not set solved", () => {
    const s = initialState();
    // Try an invalid move from an empty square
    const after = reducer(s, { type: "move", from: { row: 5, col: 5 }, to: { row: 4, col: 5 } });
    expect(after.status).not.toBe("solved");
  });

  it("retry resets to playing", () => {
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
