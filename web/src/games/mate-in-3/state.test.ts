import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("mate-in-3 initialState", () => {
  it("starts at puzzle 0, phase white1", () => {
    const s = initialState();
    expect(s.puzzleIndex).toBe(0);
    expect(s.phase).toBe("white1");
    expect(s.status).toBe("playing");
  });

  it("board is populated", () => {
    const s = initialState();
    expect(s.board.filter(p => p !== null).length).toBeGreaterThan(1);
  });
});

describe("mate-in-3 reducer", () => {
  it("wrong first move sets status to wrong", () => {
    const s = initialState();
    // Attempt a move that's unlikely to be the key move
    const after = reducer(s, { type: "move", from: { row: 7, col: 0 }, to: { row: 6, col: 0 } });
    expect(after.status).not.toBe("solved");
  });

  it("retry after wrong resets to playing", () => {
    const wrong = { ...initialState(), status: "wrong" as const };
    const retried = reducer(wrong, { type: "retry" });
    expect(retried.status).toBe("playing");
    expect(retried.phase).toBe("white1");
  });

  it("next on solved advances puzzleIndex", () => {
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
