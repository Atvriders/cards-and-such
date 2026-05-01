import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMoves, idx } from "./state.js";

const S = { botStrength: "easy" as const };

describe("Anti-Othello (misère)", () => {
  it("starts with the standard 4-disc setup", () => {
    const s = initialState(1, S);
    expect(s.blackCount).toBe(2);
    expect(s.whiteCount).toBe(2);
  });

  it("offers four opening moves", () => {
    const s = initialState(1, S);
    expect(legalMoves(s.board, 0).length).toBe(4);
  });

  it("rejects placing on a non-flipping square", () => {
    const s = initialState(1, S);
    const next = reducer(s, { type: "place", row: 0, col: 0 });
    expect(next).toBe(s);
  });

  it("flips opponent's disc on legal placement", () => {
    const s = initialState(1, S);
    const next = reducer(s, { type: "place", row: 2, col: 3 });
    expect(next.board[idx(2, 3)]).toBe(0);
    expect(next.movesMade).toBeGreaterThanOrEqual(1);
  });

  it("isTerminal scores misère: fewer = win", () => {
    const s = initialState(1, S);
    const ended = { ...s, winner: 0 as const, blackCount: 20, whiteCount: 44 };
    const t = isTerminal(ended);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThanOrEqual(100);
  });
});
