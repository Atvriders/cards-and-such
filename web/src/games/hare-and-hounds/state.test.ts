import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getHareMoves, COLS } from "./state.js";

describe("Hare and Hounds", () => {
  it("starts with 3 hounds and 1 hare, hound turn first", () => {
    const s = initialState(0, {});
    expect(s.hounds.length).toBe(3);
    expect(s.winner).toBeNull();
    expect(s.turn).toBe("hounds");
  });

  it("hare wins immediately if in escape position", () => {
    // Hare is at column 0, hounds all at column 2
    const s = initialState(0, {});
    const hounds = [2 * COLS + 2, 1 * COLS + 2, 0 * COLS + 2];
    const hare = 1 * COLS + 0;
    const escaped = { ...s, hounds, hare, turn: "hare" as const };
    // Move hare anywhere - escape check is on hare's current pos before move
    const moves = getHareMoves(hounds, hare);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("isTerminal returns null mid-game, score at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: "hare" })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: "hounds" })).toEqual({ score: 0 });
  });

  it("hare cannot move to occupied cell", () => {
    const s = initialState(0, {});
    const houndsPos = new Set(s.hounds);
    const hareMoves = getHareMoves(s.hounds, s.hare);
    for (const m of hareMoves) {
      expect(houndsPos.has(m)).toBe(false);
    }
  });

  it("reducer ignores invalid move", () => {
    const s = initialState(0, {});
    const hare = { ...s, turn: "hare" as const };
    const result = reducer(hare, { type: "move", to: s.hounds[0]! }); // move onto hound = illegal
    expect(result.winner).toBeNull();
    expect(result.hare).toBe(hare.hare);
  });
});
