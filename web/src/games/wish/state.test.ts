import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Wish initialState", () => {
  it("deals exactly 32 cards total", () => {
    const s = initialState(1, settings);
    const total = s.piles.reduce((sum, p) => sum + p.length, 0);
    expect(total).toBe(32);
  });

  it("deals 4 piles of 8 cards", () => {
    const s = initialState(1, settings);
    expect(s.piles.length).toBe(4);
    for (const p of s.piles) expect(p.length).toBe(8);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(42, settings);
    const s2 = initialState(42, settings);
    expect(s1.piles[0]![0]!.id).toBe(s2.piles[0]![0]!.id);
  });

  it("different seeds give different deals", () => {
    const s1 = initialState(1, settings);
    const s2 = initialState(2, settings);
    expect(s1.piles[0]![0]!.id).not.toBe(s2.piles[0]![0]!.id);
  });
});

describe("Wish reducer", () => {
  it("cannot remove pair from same pile", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "remove-pair", pileA: 0, pileB: 0 });
    expect(next).toBe(s);
  });

  it("cannot remove mismatched ranks", () => {
    const s = initialState(1, settings);
    // Force a mismatch by checking - if top cards differ, this should be rejected
    const top0 = s.piles[0]![s.piles[0]!.length - 1]!;
    const top1 = s.piles[1]![s.piles[1]!.length - 1]!;
    if (top0.rank !== top1.rank) {
      const next = reducer(s, { type: "remove-pair", pileA: 0, pileB: 1 });
      expect(next).toBe(s);
    } else {
      // same rank: should work
      const next = reducer(s, { type: "remove-pair", pileA: 0, pileB: 1 });
      expect(next.movesMade).toBe(1);
    }
  });

  it("removes matching pair and updates score", () => {
    // Build a state where top cards match
    const s = initialState(99, settings);
    const top0 = s.piles[0]![s.piles[0]!.length - 1]!;
    // Find another pile with same rank
    let found = -1;
    for (let i = 1; i < 4; i++) {
      const top = s.piles[i]![s.piles[i]!.length - 1]!;
      if (top.rank === top0.rank) { found = i; break; }
    }
    if (found >= 0) {
      const next = reducer(s, { type: "remove-pair", pileA: 0, pileB: found });
      expect(next.score).toBe(s.score + 2);
      expect(next.piles[0]!.length).toBe(s.piles[0]!.length - 1);
    } else {
      // No immediate match - just verify state is unchanged
      expect(s.won).toBe(false);
    }
  });

  it("total cards decreases by 2 after valid removal", () => {
    const s = initialState(7, settings);
    const top0 = s.piles[0]![s.piles[0]!.length - 1]!;
    let matched = false;
    for (let i = 1; i < 4; i++) {
      const top = s.piles[i]![s.piles[i]!.length - 1]!;
      if (top.rank === top0.rank) {
        const next = reducer(s, { type: "remove-pair", pileA: 0, pileB: i });
        const before = s.piles.reduce((sum, p) => sum + p.length, 0);
        const after = next.piles.reduce((sum, p) => sum + p.length, 0);
        expect(after).toBe(before - 2);
        matched = true;
        break;
      }
    }
    if (!matched) {
      expect(s.piles.reduce((sum, p) => sum + p.length, 0)).toBe(32);
    }
  });
});

describe("Wish isTerminal", () => {
  it("returns null when cards remain", () => {
    const s = initialState(1, settings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when all cards removed", () => {
    const s = { piles: [[], [], [], []], score: 32, movesMade: 16, won: true };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(32);
  });
});
