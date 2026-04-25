import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, getWolfMoves, getSheepMoves, toIdx, fromIdx } from "./state.js";

describe("Wolf and Sheep", () => {
  it("starts with 4 sheep on top row and wolf at bottom", () => {
    const s = initialState(0, {});
    expect(s.sheep.length).toBe(4);
    for (const sp of s.sheep) {
      const [r] = fromIdx(sp);
      expect(r).toBe(0);
    }
    const [wr] = fromIdx(s.wolf);
    expect(wr).toBeGreaterThan(4);
    expect(s.turn).toBe("wolf");
    expect(s.winner).toBeNull();
  });

  it("wolf has valid moves at start", () => {
    const s = initialState(0, {});
    const moves = getWolfMoves(s);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("sheep cannot move onto occupied squares", () => {
    const s = initialState(0, {});
    const shState = { ...s, turn: "sheep" as const };
    for (let si = 0; si < 4; si++) {
      const moves = getSheepMoves(shState, si);
      const wolfAndSheep = new Set([...s.sheep, s.wolf]);
      for (const m of moves) {
        expect(wolfAndSheep.has(m)).toBe(false);
      }
    }
  });

  it("isTerminal returns null mid-game and scores at end", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    expect(isTerminal({ ...s, winner: "sheep" })).toEqual({ score: 100 });
    expect(isTerminal({ ...s, winner: "wolf" })).toEqual({ score: 0 });
  });

  it("toIdx and fromIdx are inverse", () => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 0) {
          const i = toIdx(r, c);
          const [rr, cc] = fromIdx(i);
          expect(rr).toBe(r);
          expect(cc).toBe(c);
        }
      }
    }
  });
});
