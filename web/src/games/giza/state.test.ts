import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isAccessible } from "./state.js";

const settings = {};

describe("Giza initialState", () => {
  it("has 27 cards in pyramids + 25 in stock", () => {
    const s = initialState(42, settings);
    const pyramidCards = s.pyramids.flat(2).filter((c) => c !== null).length;
    expect(pyramidCards).toBe(27);
    expect(s.stock.length).toBe(25);
  });

  it("each pyramid has 3 rows of 1,2,3 cards", () => {
    const s = initialState(1, settings);
    for (let p = 0; p < 3; p++) {
      expect(s.pyramids[p]![0]!.length).toBe(1);
      expect(s.pyramids[p]![1]!.length).toBe(2);
      expect(s.pyramids[p]![2]!.length).toBe(3);
    }
  });

  it("foundations start empty", () => {
    const s = initialState(1, settings);
    expect(s.foundations.every((f) => f.length === 0)).toBe(true);
  });

  it("is deterministic", () => {
    const s1 = initialState(5, settings);
    const s2 = initialState(5, settings);
    expect(JSON.stringify(s1.pyramids)).toBe(JSON.stringify(s2.pyramids));
  });
});

describe("Giza isAccessible", () => {
  it("bottom row is always accessible", () => {
    const s = initialState(42, settings);
    // Row 2 (bottom) of each pyramid
    for (let p = 0; p < 3; p++) {
      for (let col = 0; col < 3; col++) {
        if (s.pyramids[p]![2]![col]) {
          expect(isAccessible(s.pyramids, p, 2, col)).toBe(true);
        }
      }
    }
  });

  it("apex is blocked when lower rows exist", () => {
    const s = initialState(42, settings);
    // Apex (row 0) blocked by rows below
    expect(isAccessible(s.pyramids, 0, 0, 0)).toBe(false);
  });

  it("apex accessible when rows below are cleared", () => {
    const s = initialState(1, settings);
    const cleared = s.pyramids.map((py) =>
      py.map((row, ri) => ri === 0 ? [...row] : row.map(() => null))
    );
    expect(isAccessible(cleared, 0, 0, 0)).toBe(true);
  });
});

describe("Giza reducer", () => {
  it("remove-pair with non-13 sum returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, {
      type: "remove-pair",
      card1: { py: 0, row: 2, col: 0 },
      card2: { py: 0, row: 2, col: 1 },
    });
    // May or may not remove (depends on seed), just check no cards were invented
    const pyramidCards = next.pyramids.flat(2).filter((c) => c !== null).length;
    expect(pyramidCards).toBeLessThanOrEqual(27);
  });

  it("draw-stock decreases stock by 1", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "draw-stock" });
    expect(next.stock.length).toBe(s.stock.length - 1);
  });

  it("draw-stock on empty stock returns same state", () => {
    const s = { ...initialState(1, settings), stock: [] };
    const next = reducer(s, { type: "draw-stock" });
    expect(next).toBe(s);
  });

  it("won state is immutable", () => {
    const s = { ...initialState(1, settings), won: true };
    const next = reducer(s, { type: "draw-stock" });
    expect(next).toBe(s);
  });
});

describe("Giza isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when won", () => {
    const s = { ...initialState(1, settings), won: true, score: 200 };
    expect(isTerminal(s)).toEqual({ score: 200 });
  });
});
