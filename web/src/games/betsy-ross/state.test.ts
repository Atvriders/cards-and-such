import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("BetsyRoss initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42);
    const total =
      s.foundations.reduce((sum, f) => sum + f.length, 0) +
      s.stock.length +
      s.waste.length;
    expect(total).toBe(52);
  });

  it("each foundation starts with one Ace", () => {
    const s = initialState(42);
    for (const f of s.foundations) {
      expect(f.length).toBe(1);
      expect(f[0]!.rank).toBe(1);
    }
  });

  it("stock has 48 cards", () => {
    const s = initialState(42);
    expect(s.stock.length).toBe(48);
  });

  it("is deterministic", () => {
    const s1 = initialState(5);
    const s2 = initialState(5);
    expect(s1.stock.map(c => c.id).join(",")).toBe(s2.stock.map(c => c.id).join(","));
  });
});

describe("BetsyRoss reducer", () => {
  it("draw moves a card to waste", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "draw" });
    expect(next.waste.length).toBe(1);
    expect(next.stock.length).toBe(47);
  });

  it("redeal flips waste back to stock", () => {
    let s = initialState(42);
    // Draw all stock
    while (s.stock.length > 0) {
      s = reducer(s, { type: "draw" });
    }
    expect(s.waste.length).toBeGreaterThan(0);
    const next = reducer(s, { type: "draw" });
    expect(next.stock.length).toBeGreaterThan(0);
    expect(next.waste.length).toBe(0);
  });

  it("total cards preserved after draw", () => {
    const s = initialState(10);
    const total = (st: typeof s) =>
      st.foundations.reduce((sum, f) => sum + f.length, 0) + st.stock.length + st.waste.length;
    const next = reducer(s, { type: "draw" });
    expect(total(next)).toBe(52);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });
});
