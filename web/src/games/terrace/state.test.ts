import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Terrace initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const st = initialState(42, {});
    const total = st.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("has first foundation seeded with 1 card", () => {
    const st = initialState(42, {});
    const f1 = st.piles.find((p) => p.id === "f1")!;
    expect(f1.cards.length).toBe(1);
  });

  it("foundationStartRank matches first foundation card rank", () => {
    const st = initialState(42, {});
    const f1 = st.piles.find((p) => p.id === "f1")!;
    expect(st.foundationStartRank).toBe(f1.cards[0]!.rank as number);
  });

  it("is deterministic", () => {
    const s1 = initialState(99, {});
    const s2 = initialState(99, {});
    expect(s1.piles[0]!.cards[0]!.id).toBe(s2.piles[0]!.cards[0]!.id);
  });

  it("terrace has 9 piles of 1 card each", () => {
    const st = initialState(42, {});
    for (let i = 1; i <= 9; i++) {
      const r = st.piles.find((p) => p.id === `r${i}`)!;
      expect(r.cards.length).toBe(1);
    }
  });
});

describe("Terrace reducer", () => {
  it("isTerminal returns null at start", () => {
    const st = initialState(42, {});
    expect(isTerminal(st)).toBeNull();
  });

  it("draw reduces stock by 1", () => {
    const st = initialState(42, {});
    const stockBefore = st.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(st, { type: "draw" });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 1);
  });

  it("total cards preserved after draw", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "draw" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("auto-move preserves card count", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "auto-move-to-foundation" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });
});
