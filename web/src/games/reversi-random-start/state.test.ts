import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMoves } from "./state.js";

const S = { botStrength: "easy" as const };

describe("Reversi (Random Start)", () => {
  it("starts with 4 discs (2 black, 2 white)", () => {
    const s = initialState(1, S);
    const black = s.board.filter((c) => c === 0).length;
    const white = s.board.filter((c) => c === 1).length;
    expect(black).toBe(2);
    expect(white).toBe(2);
    expect(s.blackCount).toBe(2);
    expect(s.whiteCount).toBe(2);
  });

  it("ensures at least one legal opening move", () => {
    for (let seed = 1; seed <= 5; seed++) {
      const s = initialState(seed, S);
      expect(legalMoves(s.board, 0).length).toBeGreaterThan(0);
    }
  });

  it("seed determinism — same seed yields same opening", () => {
    const a = initialState(42, S);
    const b = initialState(42, S);
    expect(a.board).toEqual(b.board);
  });

  it("rejects illegal placement", () => {
    const s = initialState(1, S);
    // Place at (0,0) — corner is rarely legal in opening
    const next = reducer(s, { type: "place", row: 0, col: 0 });
    if (legalMoves(s.board, 0).find((m) => m.row === 0 && m.col === 0)) {
      // It was legal — check it advanced
      expect(next).not.toBe(s);
    } else {
      expect(next).toBe(s);
    }
  });

  it("isTerminal null while game in progress", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
