import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("pawn-promotion-puzzle initialState", () => {
  it("starts at puzzle 0, playing", () => {
    const s = initialState();
    expect(s.puzzleIndex).toBe(0);
    expect(s.status).toBe("playing");
  });

  it("board has a white pawn on rank 7 (row 1)", () => {
    const s = initialState();
    const pawn = s.board.find(p => p?.color === "white" && p?.type === "pawn");
    expect(pawn).toBeTruthy();
  });
});

describe("pawn-promotion-puzzle reducer", () => {
  it("moving pawn to promotion square triggers promoting status", () => {
    const s = initialState();
    // Puzzle 0: pawn at a7 (row 1, col 0), black king on b8 — advance to a8 (row 0, col 0)
    const after = reducer(s, { type: "move", from: { row: 1, col: 0 }, to: { row: 0, col: 0 } });
    // Should trigger promotion dialog
    expect(after.status).toBe("promoting");
  });

  it("choosing queen promotion after correct move sets solved", () => {
    const s = initialState();
    const promoting = reducer(s, { type: "move", from: { row: 1, col: 0 }, to: { row: 0, col: 0 } });
    const solved = reducer(promoting, { type: "promote", piece: "queen" });
    expect(solved.status).toBe("solved");
  });

  it("retry resets board to playing", () => {
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
