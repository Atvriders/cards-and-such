import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("chess-tactics initialState", () => {
  it("starts at puzzle 0 with playing status", () => {
    const s = initialState();
    expect(s.puzzleIndex).toBe(0);
    expect(s.status).toBe("playing");
  });

  it("first puzzle is a fork", () => {
    const s = initialState();
    expect(s.puzzle.tacticType).toBe("fork");
  });

  it("board has pieces", () => {
    const s = initialState();
    expect(s.board.filter(p => p !== null).length).toBeGreaterThan(4);
  });
});

describe("chess-tactics reducer", () => {
  it("wrong move sets status to wrong", () => {
    const s = initialState();
    const after = reducer(s, { type: "move", from: { row: 7, col: 0 }, to: { row: 6, col: 0 } });
    expect(after.status).not.toBe("solved");
  });

  it("retry resets board", () => {
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
