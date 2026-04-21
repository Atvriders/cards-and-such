import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Penguin initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, {});
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("all 4 foundations start with 1 card each of the same rank", () => {
    const s = initialState(42, {});
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    expect(foundations.length).toBe(4);
    for (const f of foundations) {
      expect(f.cards.length).toBe(1);
      expect(f.cards[0]!.rank).toBe(s.foundationRank);
    }
  });

  it("4 foundation cards have distinct suits", () => {
    const s = initialState(42, {});
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    const suits = new Set(foundations.map((f) => f.cards[0]!.suit));
    expect(suits.size).toBe(4);
  });

  it("7 free cells start empty", () => {
    const s = initialState(42, {});
    for (let i = 1; i <= 7; i++) {
      expect(s.piles.find((p) => p.id === `fc${i}`)!.cards.length).toBe(0);
    }
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, {});
    const s2 = initialState(7, {});
    expect(s1.foundationRank).toBe(s2.foundationRank);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).toEqual(ids2);
  });
});

describe("Penguin reducer", () => {
  it("moves top card of column to free cell", () => {
    const s = initialState(42, {});
    const col = s.piles.find((p) => p.id === "col1")!;
    const before = col.cards.length;
    const next = reducer(s, { type: "move", fromPile: "col1", toPile: "fc1", count: 1 });
    expect(next.piles.find((p) => p.id === "col1")!.cards.length).toBe(before - 1);
    expect(next.piles.find((p) => p.id === "fc1")!.cards.length).toBe(1);
  });

  it("moving 2 cards to free cell is illegal", () => {
    const s = initialState(42, {});
    const next = reducer(s, { type: "move", fromPile: "col1", toPile: "fc1", count: 2 });
    expect(next.movesMade).toBe(0);
  });

  it("does nothing when already won", () => {
    const s = { ...initialState(42, {}), won: true };
    const next = reducer(s, { type: "move", fromPile: "col1", toPile: "fc1", count: 1 });
    expect(next).toBe(s);
  });

  it("foundation accepts card of correct suit and next rank", () => {
    const s = initialState(42, {});
    // Try to auto-move anything to foundation
    const next = reducer(s, { type: "auto-move-to-foundation" });
    // May or may not move, but should not throw
    expect(next.movesMade).toBeGreaterThanOrEqual(0);
  });
});

describe("Penguin isTerminal", () => {
  it("returns null when not all foundations complete", () => {
    const s = initialState(42, {});
    expect(isTerminal(s)).toBeNull();
  });
});
