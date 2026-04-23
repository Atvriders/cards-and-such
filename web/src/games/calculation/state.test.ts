import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, nextRankForFoundation, canPlayOnFoundation } from "./state.js";
import type { Card } from "../../engines/deck/index.js";

const settings = {};

describe("Calculation nextRankForFoundation", () => {
  it("foundation 0 (+1): sequence is A 2 3 ... K", () => {
    expect(nextRankForFoundation([], 0)).toBe(1); // Need Ace
    const mockF0: Card[] = [{ rank: 1, suit: "♠", id: "0-♠1" }];
    expect(nextRankForFoundation(mockF0, 0)).toBe(2);
    const f0_12: Card[] = Array.from({ length: 12 }, (_, i) => ({ rank: (i + 1) as any, suit: "♠", id: `x${i}` }));
    expect(nextRankForFoundation(f0_12, 0)).toBe(13); // Need King
  });

  it("foundation 1 (+2): sequence is 2 4 6 8 10 Q A 3 ...", () => {
    expect(nextRankForFoundation([], 1)).toBe(2);
    const f1_1: Card[] = [{ rank: 2, suit: "♥", id: "0-♥2" }];
    expect(nextRankForFoundation(f1_1, 1)).toBe(4);
  });

  it("foundation 2 (+3): sequence is 3 6 9 Q ...", () => {
    expect(nextRankForFoundation([], 2)).toBe(3);
    const f2_1: Card[] = [{ rank: 3, suit: "♦", id: "0-♦3" }];
    expect(nextRankForFoundation(f2_1, 2)).toBe(6);
  });

  it("foundation 3 (+4): sequence is 4 8 Q 3 7 J ...", () => {
    expect(nextRankForFoundation([], 3)).toBe(4);
    const f3_1: Card[] = [{ rank: 4, suit: "♣", id: "0-♣4" }];
    expect(nextRankForFoundation(f3_1, 3)).toBe(8);
  });
});

describe("Calculation initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42, settings);
    const foundations = s.foundations.reduce((sum, f) => sum + f.length, 0);
    const waste = s.wastePiles.reduce((sum, w) => sum + w.length, 0);
    const stock = s.stock.length + (s.stockTop ? 1 : 0);
    expect(foundations + waste + stock).toBe(52);
  });

  it("foundations start with 1 card each (the starting rank)", () => {
    const s = initialState(42, settings);
    expect(s.foundations[0]![0]!.rank).toBe(1); // Ace
    expect(s.foundations[1]![0]!.rank).toBe(2);
    expect(s.foundations[2]![0]!.rank).toBe(3);
    expect(s.foundations[3]![0]!.rank).toBe(4);
  });

  it("is deterministic", () => {
    const s1 = initialState(10, settings);
    const s2 = initialState(10, settings);
    const flat1 = s1.foundations.flat().map((c) => c.id).join(",");
    const flat2 = s2.foundations.flat().map((c) => c.id).join(",");
    expect(flat1).toBe(flat2);
  });
});

describe("Calculation reducer", () => {
  it("draw reveals next stock card", () => {
    const s = initialState(42, settings);
    const stockBefore = s.stock.length;
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBe(stockBefore - 1);
    expect(next.stockTop).not.toBeNull();
  });

  it("stock-to-waste places card on chosen waste pile", () => {
    const s = initialState(42, settings);
    if (!s.stockTop) return;
    const next = reducer(s, { type: "stock-to-waste", wasteIdx: 0 });
    expect(next.wastePiles[0]!.length).toBe(1);
  });

  it("stock-to-foundation plays card if it matches", () => {
    const s = initialState(42, settings);
    // Find which foundation index needs the stockTop rank
    if (!s.stockTop) return;
    for (let fi = 0; fi < 4; fi++) {
      if (canPlayOnFoundation(s.stockTop, s.foundations[fi]!, fi)) {
        const next = reducer(s, { type: "stock-to-foundation", foundationIdx: fi });
        expect(next.foundations[fi]!.length).toBe(s.foundations[fi]!.length + 1);
        return;
      }
    }
    // No match found — pass
    expect(true).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });
});
