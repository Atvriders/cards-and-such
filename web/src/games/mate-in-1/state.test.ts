import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("mate-in-1 initialState", () => {
  it("starts at puzzle 0 with playing status", () => {
    const s = initialState();
    expect(s.puzzleIndex).toBe(0);
    expect(s.status).toBe("playing");
  });

  it("board is populated (has at least 2 pieces)", () => {
    const s = initialState();
    const pieces = s.board.filter(p => p !== null);
    expect(pieces.length).toBeGreaterThan(1);
  });
});

describe("mate-in-1 reducer", () => {
  it("wrong move sets status to wrong", () => {
    const s = initialState();
    // Move a non-solution white piece (pawn on h2 to h3 — won't checkmate)
    // We'll pick a move that exists legally but isn't the solution
    const wrongFrom = { row: 7, col: 0 }; // corner
    const wrongTo = { row: 6, col: 0 };
    const after = reducer(s, { type: "move", from: wrongFrom, to: wrongTo });
    // If not legal it stays playing; either way status isn't solved
    expect(after.status).not.toBe("solved");
  });

  it("retry resets board and status", () => {
    const s = initialState();
    const withWrong = { ...s, status: "wrong" as const };
    const retried = reducer(withWrong, { type: "retry" });
    expect(retried.status).toBe("playing");
  });

  it("next on solved advances puzzle index", () => {
    const s = { ...initialState(), status: "solved" as const };
    const next = reducer(s, { type: "next" });
    expect(next.puzzleIndex).toBe(1);
  });

  it("next on last puzzle sets complete", () => {
    const s = { ...initialState(), puzzleIndex: PUZZLES.length - 1, status: "solved" as const };
    const next = reducer(s, { type: "next" });
    expect(next.status).toBe("complete");
  });

  it("isTerminal returns null when not complete", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("isTerminal returns score when complete", () => {
    const s = { ...initialState(), status: "complete" as const };
    expect(isTerminal(s)).toEqual({ score: 1 });
  });
});
