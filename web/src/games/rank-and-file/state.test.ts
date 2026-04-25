import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("RankAndFile initialState", () => {
  it("has exactly 52 cards", () => {
    const st = initialState(42, {});
    const total = st.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("has 10 tableau columns with 4 cards each", () => {
    const st = initialState(42, {});
    for (let i = 1; i <= 10; i++) {
      expect(st.piles.find((p) => p.id === `t${i}`)!.cards.length).toBe(4);
    }
  });

  it("stock has 12 cards", () => {
    const st = initialState(42, {});
    expect(st.piles.find((p) => p.id === "stock")!.cards.length).toBe(12);
  });

  it("is deterministic", () => {
    const s1 = initialState(55, {});
    const s2 = initialState(55, {});
    expect(s1.piles[0]!.cards[0]!.id).toBe(s2.piles[0]!.cards[0]!.id);
  });

  it("foundations start empty", () => {
    const st = initialState(42, {});
    for (let i = 1; i <= 4; i++) {
      expect(st.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
    }
  });
});

describe("RankAndFile reducer", () => {
  it("draw from stock to waste works", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "move", fromPile: "stock", toPile: "waste", count: 1 });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(11);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("total cards preserved after draw", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "move", fromPile: "stock", toPile: "waste", count: 1 });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("illegal move returns same state", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "move", fromPile: "t1", toPile: "t1", count: 1 });
    expect(next).toBe(st);
  });

  it("isTerminal returns null at start", () => {
    expect(isTerminal(initialState(42, {}))).toBeNull();
  });

  it("auto-move preserves card count", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "auto-move-to-foundation" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });
});
