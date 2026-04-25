import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoveIndices } from "./state.js";

describe("Royal Game of Ur", () => {
  it("starts with all pieces waiting and player's turn", () => {
    const s = initialState(42, {});
    expect(s.turn).toBe("P");
    expect(s.winner).toBeNull();
    expect(s.pPieces).toHaveLength(7);
    expect(s.pPieces.every((p) => p === -1)).toBe(true);
    expect(s.bPieces.every((p) => p === -1)).toBe(true);
  });

  it("roll action triggers and returns lastRoll 0-4", () => {
    const s = initialState(1, {});
    const next = reducer(s, { type: "roll" });
    expect(next.lastRoll).toBeGreaterThanOrEqual(0);
    expect(next.lastRoll).toBeLessThanOrEqual(4);
  });

  it("rejects move when mustRoll is true", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "move", pieceIdx: 0 });
    expect(next).toBe(s);
  });

  it("isTerminal null mid-game", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal score 100 when player wins", () => {
    const s = { ...initialState(0, {}), winner: "P" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("isTerminal score 0 when bot wins", () => {
    const s = { ...initialState(0, {}), winner: "B" as const };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("getLegalMoveIndices allows entering from waiting on roll > 0", () => {
    const pPieces = new Array(7).fill(-1);
    const bPieces = new Array(7).fill(-1);
    const moves = getLegalMoveIndices(pPieces, bPieces, 2, true);
    // All 7 pieces waiting, dest = -1 + 2 = 1, all valid
    expect(moves.length).toBe(7);
  });

  it("getLegalMoveIndices returns empty on roll 0", () => {
    const pPieces = new Array(7).fill(-1);
    const bPieces = new Array(7).fill(-1);
    expect(getLegalMoveIndices(pPieces, bPieces, 0, true)).toHaveLength(0);
  });
});
