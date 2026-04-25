import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("LittleSpider initialState", () => {
  it("has 52 cards total", () => {
    const st = initialState(42, {});
    const total = st.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("stock has all 52 cards at start", () => {
    const st = initialState(42, {});
    expect(st.piles.find((p) => p.id === "stock")!.cards.length).toBe(52);
  });

  it("tableau starts empty", () => {
    const st = initialState(42, {});
    for (let i = 1; i <= 8; i++) {
      expect(st.piles.find((p) => p.id === `t${i}`)!.cards.length).toBe(0);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(77, {});
    const s2 = initialState(77, {});
    expect(s1.piles.find((p) => p.id === "stock")!.cards[0]!.id).toBe(
      s2.piles.find((p) => p.id === "stock")!.cards[0]!.id,
    );
  });
});

describe("LittleSpider reducer", () => {
  it("deal-row deals 8 cards to tableau", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "deal-row" });
    let total = 0;
    for (let i = 1; i <= 8; i++) {
      total += next.piles.find((p) => p.id === `t${i}`)!.cards.length;
    }
    expect(total).toBe(8);
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(44);
  });

  it("total cards preserved after deal", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "deal-row" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("isTerminal returns null at start", () => {
    expect(isTerminal(initialState(42, {}))).toBeNull();
  });

  it("auto-move preserves card count", () => {
    let st = initialState(42, {});
    st = reducer(st, { type: "deal-row" });
    const next = reducer(st, { type: "auto-move-to-foundation" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("deal-row when stock empty does nothing", () => {
    let st = initialState(42, {});
    // Drain stock: 52 cards, 8 per deal → 6 full deals (48 cards) + 1 partial (4 cards)
    for (let i = 0; i < 6; i++) {
      st = reducer(st, { type: "deal-row" });
    }
    expect(st.piles.find((p) => p.id === "stock")!.cards.length).toBe(4);
    st = reducer(st, { type: "deal-row" }); // partial deal of 4
    expect(st.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
    const next = reducer(st, { type: "deal-row" });
    expect(next).toBe(st);
  });
});
