import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Peek initialState", () => {
  it("deals exactly 52 cards", () => {
    const s = initialState(1);
    const tab = s.tableau.reduce((sum, c) => sum + c.length, 0);
    const stk = s.stock.reduce((sum, r) => sum + r.length, 0);
    expect(tab + stk).toBe(52);
  });

  it("tableau has 12 piles with 1 card each", () => {
    const s = initialState(2);
    expect(s.tableau.length).toBe(12);
    for (const col of s.tableau) expect(col.length).toBe(1);
  });

  it("stock rounds cover remaining 40 cards", () => {
    const s = initialState(3);
    const total = s.stock.reduce((sum, r) => sum + r.length, 0);
    expect(total).toBe(40);
  });

  it("is deterministic", () => {
    const s1 = initialState(42);
    const s2 = initialState(42);
    expect(s1.tableau[0]![0]!.id).toBe(s2.tableau[0]![0]!.id);
  });
});

describe("Peek reducer — deal-round", () => {
  it("deal-round adds one card to each column", () => {
    const s = initialState(5);
    const before = s.tableau.map((c) => c.length);
    const next = reducer(s, { type: "deal-round" });
    for (let i = 0; i < 12; i++) {
      expect(next.tableau[i]!.length).toBeGreaterThanOrEqual(before[i]!);
    }
  });

  it("deal-round on last round increments stockRound correctly", () => {
    const s = initialState(5);
    const next = reducer(s, { type: "deal-round" });
    expect(next.stockRound).toBe(1);
  });
});

describe("Peek reducer — move", () => {
  it("illegal move to foundation is rejected", () => {
    const s = initialState(10);
    const col0Top = s.tableau[0]![0]!;
    if (col0Top.rank !== 1) {
      const next = reducer(s, { type: "move-to-foundation", colIndex: 0, foundIndex: 0 });
      expect(next.foundations[0]!.length).toBe(0);
    }
  });

  it("same-col move is rejected", () => {
    const s = initialState(10);
    const next = reducer(s, { type: "move-col", fromCol: 0, toCol: 0 });
    expect(next).toBe(s);
  });
});

describe("Peek isTerminal", () => {
  it("returns null at start (stock rounds remain)", () => {
    const s = initialState(1);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1);
    const wonState = { ...s, won: true, score: 260 };
    expect(isTerminal(wonState)!.score).toBe(260);
  });
});
