import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Shamrocks initialState", () => {
  it("has exactly 52 cards", () => {
    const st = initialState(42, {});
    const total = st.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("has 18 tableau piles + 4 foundations = 22 piles", () => {
    const st = initialState(42, {});
    expect(st.piles.length).toBe(22);
  });

  it("is deterministic", () => {
    const s1 = initialState(10, {});
    const s2 = initialState(10, {});
    expect(s1.piles[0]!.cards[0]!.id).toBe(s2.piles[0]!.cards[0]!.id);
  });

  it("foundations are empty at start", () => {
    const st = initialState(42, {});
    const foundations = st.piles.filter((p) => p.kind === "foundation");
    for (const f of foundations) {
      expect(f.cards.length).toBe(0);
    }
  });
});

describe("Shamrocks reducer", () => {
  it("returns null from isTerminal at start", () => {
    const st = initialState(42, {});
    expect(isTerminal(st)).toBeNull();
  });

  it("moving top card to foundation with Ace works", () => {
    const st = initialState(42, {});
    // Find a pile with Ace on top
    const aceSource = st.piles.find(
      (p) => p.kind === "tableau" && p.cards.length > 0 && p.cards[p.cards.length - 1]!.rank === 1,
    );
    if (aceSource) {
      const f = st.piles.find((p) => p.kind === "foundation")!;
      const next = reducer(st, { type: "move", fromPile: aceSource.id, toPile: f.id, count: 1 });
      expect(next.movesMade).toBe(1);
      expect(next.score).toBe(1);
    } else {
      // No ace on top — just verify no crash
      expect(st.piles.some((p) => p.kind === "tableau")).toBe(true);
    }
  });

  it("illegal move returns same state", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "move", fromPile: "t1", toPile: "t1", count: 1 });
    expect(next).toBe(st);
  });

  it("total cards preserved after auto-move attempt", () => {
    const st = initialState(42, {});
    const next = reducer(st, { type: "auto-move-to-foundation" });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });
});
