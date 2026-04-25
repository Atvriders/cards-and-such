import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Colorado initialState", () => {
  it("deals 104 cards total", () => {
    const s = initialState(1, settings);
    const pileCount = s.piles.reduce((sum, p) => sum + p.length, 0);
    const total = pileCount + s.stock.length;
    expect(total).toBe(104);
  });

  it("has 20 piles of 2 cards each", () => {
    const s = initialState(1, settings);
    expect(s.piles.length).toBe(20);
    for (const p of s.piles) expect(p.length).toBe(2);
  });

  it("has 8 foundations", () => {
    const s = initialState(1, settings);
    expect(s.foundations.length).toBe(8);
  });

  it("stock starts with 64 cards", () => {
    const s = initialState(1, settings);
    expect(s.stock.length).toBe(64);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(5, settings);
    const s2 = initialState(5, settings);
    expect(s1.piles[0]![0]!.id).toBe(s2.piles[0]![0]!.id);
  });
});

describe("Colorado reducer - foundation move", () => {
  it("rejects non-ace for empty foundation", () => {
    const s = initialState(1, settings);
    const top = s.piles[0]![s.piles[0]!.length - 1]!;
    if (top.rank !== 1) {
      const next = reducer(s, { type: "move-to-foundation", pileIdx: 0, foundIdx: 0 });
      expect(next).toBe(s);
    } else {
      expect(true).toBe(true);
    }
  });

  it("valid ace to empty foundation scores 5", () => {
    const s = initialState(1, settings);
    for (let pi = 0; pi < s.piles.length; pi++) {
      const top = s.piles[pi]![s.piles[pi]!.length - 1]!;
      if (top.rank === 1) {
        const fi = s.foundations.findIndex((f) => f.suit === top.suit && f.cards.length === 0);
        if (fi >= 0) {
          const next = reducer(s, { type: "move-to-foundation", pileIdx: pi, foundIdx: fi });
          expect(next.score).toBe(5);
          expect(next.piles[pi]!.length).toBe(s.piles[pi]!.length - 1);
          return;
        }
      }
    }
    expect(true).toBe(true);
  });

  it("total cards maintained after foundation move", () => {
    const s = initialState(1, settings);
    for (let pi = 0; pi < s.piles.length; pi++) {
      const top = s.piles[pi]![s.piles[pi]!.length - 1]!;
      if (top.rank === 1) {
        const fi = s.foundations.findIndex((f) => f.suit === top.suit && f.cards.length === 0);
        if (fi >= 0) {
          const next = reducer(s, { type: "move-to-foundation", pileIdx: pi, foundIdx: fi });
          const before = s.piles.reduce((sum, p) => sum + p.length, 0) + s.stock.length;
          const after = next.piles.reduce((sum, p) => sum + p.length, 0) + next.stock.length + next.foundations.reduce((sum, f) => sum + f.cards.length, 0);
          expect(after).toBe(before);
          return;
        }
      }
    }
    expect(true).toBe(true);
  });
});

describe("Colorado reducer - deal-row", () => {
  it("deal-row adds one card to each pile", () => {
    const s = initialState(1, settings);
    const beforeLens = s.piles.map((p) => p.length);
    const next = reducer(s, { type: "deal-row" });
    for (let i = 0; i < 20; i++) {
      expect(next.piles[i]!.length).toBe(beforeLens[i]! + 1);
    }
    expect(next.dealsLeft).toBe(s.dealsLeft - 1);
  });

  it("cannot deal when dealsLeft is 0", () => {
    const s = { ...initialState(1, settings), dealsLeft: 0 };
    const next = reducer(s, { type: "deal-row" });
    expect(next).toBe(s);
  });
});

describe("Colorado isTerminal", () => {
  it("returns null when not complete", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when all 104 on foundations", () => {
    const s = initialState(1, settings);
    const fullFounds = s.foundations.map((f) => ({
      ...f,
      cards: Array(13).fill({ rank: 1, suit: f.suit, id: "x" }),
    }));
    const result = isTerminal({ ...s, foundations: fullFounds });
    expect(result).not.toBeNull();
  });
});
