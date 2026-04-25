import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Martha initialState", () => {
  it("has exactly 52 cards", () => {
    const st = initialState(42, {});
    const total = st.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("has 7 tableau columns", () => {
    const st = initialState(42, {});
    const tabs = st.piles.filter((p) => p.kind === "tableau");
    expect(tabs.length).toBe(7);
  });

  it("foundations start empty", () => {
    const st = initialState(42, {});
    const founds = st.piles.filter((p) => p.kind === "foundation");
    for (const f of founds) expect(f.cards.length).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(5, {});
    const s2 = initialState(5, {});
    expect(s1.piles[0]!.cards[0]!.id).toBe(s2.piles[0]!.cards[0]!.id);
  });
});

describe("Martha reducer", () => {
  it("draw moves stock top to waste", () => {
    const st = initialState(42, {});
    const stockLen = st.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(st, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockLen - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("recycle works when stock is empty", () => {
    let st = initialState(42, {});
    // Draw all stock
    while (st.piles.find((p) => p.id === "stock")!.cards.length > 0) {
      st = reducer(st, { type: "draw" });
    }
    const wasteLen = st.piles.find((p) => p.id === "waste")!.cards.length;
    const next = reducer(st, { type: "recycle" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(wasteLen);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
  });

  it("illegal move leaves state unchanged", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "move", fromPile: "t1", toPile: "t1", count: 1 });
    expect(next).toBe(st);
  });

  it("total cards preserved after draw", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "draw" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("isTerminal returns null at start", () => {
    expect(isTerminal(initialState(42, {}))).toBeNull();
  });
});
