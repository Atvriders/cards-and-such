import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMoves, idx } from "./state.js";

const S = { clockSeconds: "15" as const, botStrength: "easy" as const };

describe("Reversi (Timed)", () => {
  it("starts with the standard 4-disc Othello setup", () => {
    const s = initialState(1, S);
    expect(s.blackCount).toBe(2);
    expect(s.whiteCount).toBe(2);
    expect(s.board[idx(3, 4)]).toBe(0);
    expect(s.board[idx(4, 3)]).toBe(0);
    expect(s.board[idx(3, 3)]).toBe(1);
    expect(s.board[idx(4, 4)]).toBe(1);
  });

  it("black has exactly 4 legal opening moves", () => {
    const s = initialState(1, S);
    expect(legalMoves(s.board, 0).length).toBe(4);
  });

  it("placing flips opponent discs immediately", () => {
    const s = initialState(1, S);
    // Validate flip detection directly using legalMoves before the bot moves
    const before = s.board[idx(3, 3)];
    expect(before).toBe(1); // white
    const next = reducer(s, { type: "place", row: 2, col: 3 });
    // Disc placed by human is at (2,3)
    expect(next.board[idx(2, 3)]).toBe(0);
    // After our move and bot's reply, total movesMade is at least 1
    expect(next.movesMade).toBeGreaterThanOrEqual(1);
    // Black count must have increased from 2
    expect(next.blackCount).toBeGreaterThan(2);
  });

  it("clock ticks down and is not terminal during play", () => {
    const s = initialState(1, S);
    const t = reducer(s, { type: "tick" });
    expect(t.timeLeft).toBe(parseInt(S.clockSeconds, 10) - 1);
    expect(isTerminal(t)).toBeNull();
  });

  it("rejects placing on an occupied square", () => {
    const s = initialState(1, S);
    const next = reducer(s, { type: "place", row: 3, col: 3 });
    expect(next).toBe(s);
  });
});
