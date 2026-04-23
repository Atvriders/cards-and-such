import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("KlondikeSuperSolver initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("tableau piles have sizes 1-7", () => {
    const s = initialState(42, settings);
    for (let i = 1; i <= 7; i++) {
      const pile = s.piles.find((p) => p.id === `t${i}`)!;
      expect(pile.cards.length).toBe(i);
      expect(pile.faceUpCount).toBe(1);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(5, settings);
    const s2 = initialState(5, settings);
    expect(s1.piles.map((p) => p.cards.map((c) => c.id).join(",")).join("|"))
      .toBe(s2.piles.map((p) => p.cards.map((c) => c.id).join(",")).join("|"));
  });

  it("starts with zero score and no redeals", () => {
    const s = initialState(1, settings);
    expect(s.score).toBe(0);
    expect(s.redealsUsed).toBe(0);
  });
});

describe("KlondikeSuperSolver reducer", () => {
  it("draw moves a card from stock to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBeLessThanOrEqual(stockBefore);
  });

  it("redeal flips waste back to stock", () => {
    let s = initialState(42, settings);
    const stockLen = s.piles.find((p) => p.id === "stock")!.cards.length;
    for (let i = 0; i < stockLen; i++) s = reducer(s, { type: "draw" });
    const wasteLen = s.piles.find((p) => p.id === "waste")!.cards.length;
    const redealed = reducer(s, { type: "redeal" });
    expect(redealed.piles.find((p) => p.id === "stock")!.cards.length).toBe(wasteLen);
    expect(redealed.redealsUsed).toBe(1);
  });

  it("hint action sets a hint string", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "hint" });
    expect(typeof next.hint).toBe("string");
    expect(next.hint!.length).toBeGreaterThan(0);
  });

  it("auto-move does not crash even if nothing to move", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });
});
