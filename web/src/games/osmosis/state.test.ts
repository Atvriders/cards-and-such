import { describe, it, expect } from "vitest";
import { initialState, reducer } from "./state.js";

const s = () => initialState(42, {});

describe("Osmosis initialState", () => {
  it("has 52 cards total across all piles", () => {
    const st = s();
    const reserveCount = st.reserve.reduce((sum, p) => sum + p.length, 0);
    const foundCount = st.foundations.reduce((sum, f) => sum + f.cards.length, 0);
    const total = reserveCount + foundCount + st.stock.length + st.waste.length;
    expect(total).toBe(52);
  });

  it("first foundation has 1 seed card", () => {
    const st = s();
    expect(st.foundations[0]!.cards.length).toBe(1);
  });

  it("reserve has 4 piles of 4 cards", () => {
    const st = s();
    for (const pile of st.reserve) {
      expect(pile.length).toBe(4);
    }
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(7, {});
    const s2 = initialState(7, {});
    expect(s1.foundations[0]!.cards[0]!.id).toBe(s2.foundations[0]!.cards[0]!.id);
  });

  it("different seeds give different deals", () => {
    const s1 = initialState(1, {});
    const s2 = initialState(2, {});
    const id1 = s1.foundations[0]!.cards[0]!.id;
    const id2 = s2.foundations[0]!.cards[0]!.id;
    // Very likely different
    const stock1 = s1.stock.map((c) => c.id).join(",");
    const stock2 = s2.stock.map((c) => c.id).join(",");
    expect(stock1 + id1).not.toBe(stock2 + id2);
  });
});

describe("Osmosis reducer", () => {
  it("draw moves top stock card to waste", () => {
    const st = s();
    const stockLen = st.stock.length;
    const next = reducer(st, { type: "draw" });
    expect(next.stock.length).toBe(stockLen - 1);
    expect(next.waste.length).toBe(1);
  });

  it("recycle requires empty stock", () => {
    const st = s();
    // Stock is not empty, recycle should do nothing
    const next = reducer(st, { type: "recycle" });
    expect(next.stock.length).toBe(st.stock.length);
  });

  it("total cards preserved after draw", () => {
    const st = s();
    const next = reducer(st, { type: "draw" });
    const total = (n: typeof st) =>
      n.reserve.reduce((sum, p) => sum + p.length, 0) +
      n.foundations.reduce((sum, f) => sum + f.cards.length, 0) +
      n.stock.length + n.waste.length;
    expect(total(next)).toBe(52);
  });

  it("moving reserve top to matching foundation works if valid", () => {
    const st = s();
    const seedCard = st.foundations[0]!.cards[0]!;
    const seedSuit = seedCard.suit;
    // Find a reserve pile whose top matches seed suit
    const ri = st.reserve.findIndex((p) => p[p.length - 1]!.suit === seedSuit);
    if (ri >= 0) {
      const next = reducer(st, { type: "move-reserve-to-foundation", reserveIndex: ri, foundationIndex: 0 });
      expect(next.foundations[0]!.cards.length).toBe(2);
    } else {
      // No matching reserve top — just ensure state unchanged shape
      expect(st.foundations[0]!.cards.length).toBe(1);
    }
  });
});
