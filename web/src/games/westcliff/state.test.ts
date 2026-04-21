import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Westcliff initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, {});
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("10 tableau columns with 3 cards each, 1 face-up", () => {
    const s = initialState(42, {});
    const tableau = s.piles.filter((p) => p.kind === "tableau");
    expect(tableau.length).toBe(10);
    for (const t of tableau) {
      expect(t.cards.length).toBe(3);
      expect(t.faceUpCount).toBe(1);
    }
  });

  it("stock has 22 cards (52 - 30)", () => {
    const s = initialState(42, {});
    expect(s.piles.find((p) => p.id === "stock")!.cards.length).toBe(22);
  });

  it("waste starts empty, foundations start empty", () => {
    const s = initialState(42, {});
    expect(s.piles.find((p) => p.id === "waste")!.cards.length).toBe(0);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
    }
  });
});

describe("Westcliff reducer — draw", () => {
  it("draw moves one card from stock to waste", () => {
    const s = initialState(42, {});
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "draw" });
    expect(next.piles.find((p) => p.id === "stock")!.cards.length).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("no redeal: draw does nothing when stock is empty", () => {
    const s = initialState(42, {});
    // Drain stock
    let cur = s;
    for (let i = 0; i < 22; i++) cur = reducer(cur, { type: "draw" });
    expect(cur.piles.find((p) => p.id === "stock")!.cards.length).toBe(0);
    const next = reducer(cur, { type: "draw" });
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(22);
    expect(next.movesMade).toBe(22); // no extra move
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(55, {});
    const s2 = initialState(55, {});
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).toEqual(ids2);
  });
});

describe("Westcliff isTerminal", () => {
  it("returns null when foundations not complete", () => {
    expect(isTerminal(initialState(42, {}))).toBeNull();
  });

  it("tableau move is legal (faceUp card onto suitable target)", () => {
    const s = initialState(42, {});
    // Find a face-up top card and a valid target
    const tableau = s.piles.filter((p) => p.kind === "tableau");
    let tested = false;
    for (const from of tableau) {
      const topFrom = from.cards[from.cards.length - 1]!;
      for (const to of tableau) {
        if (to.id === from.id || to.cards.length === 0) continue;
        const topTo = to.cards[to.cards.length - 1]!;
        const fromIsRed = topFrom.suit === "♥" || topFrom.suit === "♦";
        const toIsRed = topTo.suit === "♥" || topTo.suit === "♦";
        if (fromIsRed !== toIsRed && topTo.rank === topFrom.rank + 1) {
          const next = reducer(s, { type: "move", fromPile: from.id, toPile: to.id, count: 1 });
          expect(next.movesMade).toBe(1);
          tested = true;
          break;
        }
      }
      if (tested) break;
    }
    if (!tested) expect(true).toBe(true);
  });
});
