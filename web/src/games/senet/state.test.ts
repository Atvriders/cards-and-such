import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves } from "./state.js";

describe("Senet", () => {
  it("starts with alternating pieces and player's turn", () => {
    const s = initialState(42, {});
    expect(s.turn).toBe("P");
    expect(s.winner).toBeNull();
    expect(s.escapedP).toBe(0);
    expect(s.escapedB).toBe(0);
    expect(s.board[0]).toBe("P");
    expect(s.board[1]).toBe("B");
  });

  it("roll action sets roll and clears mustRoll", () => {
    const s = initialState(1, {});
    expect(s.mustRoll).toBe(true);
    const next = reducer(s, { type: "roll" });
    // After roll: roll is 1-5, mustRoll false OR turn skipped if no moves
    expect(next.lastRoll).toBeGreaterThanOrEqual(1);
    expect(next.lastRoll).toBeLessThanOrEqual(5);
  });

  it("rejects move action when mustRoll is true", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "move", from: 0 });
    expect(next).toBe(s);
  });

  it("rejects roll when not player turn", () => {
    const s = { ...initialState(0, {}), turn: "B" as const };
    const next = reducer(s, { type: "roll" });
    expect(next).toBe(s);
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 100 for player win", () => {
    const s = { ...initialState(0, {}), winner: "P" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("isTerminal returns score 0 for bot win", () => {
    const s = { ...initialState(0, {}), winner: "B" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("getLegalMoves returns empty when all destinations blocked by own pieces", () => {
    // Board where P occupies 0 and 1, roll 1: dest=1 has P → blocked
    const board = new Array(30).fill(null);
    board[0] = "P";
    board[1] = "P";
    const moves = getLegalMoves(board, 0, 0, "P", 1);
    // piece at 0 can't move to 1 (own piece). Piece at 1 can move to 2 (null).
    expect(moves).toContain(1);
    expect(moves).not.toContain(0);
  });
});
