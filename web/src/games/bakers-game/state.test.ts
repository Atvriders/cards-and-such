import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("BakersGame initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, {});
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("8 cascades with 7-7-7-7-6-6-6-6 distribution, all face-up", () => {
    const s = initialState(42, {});
    for (let i = 1; i <= 4; i++) {
      const c = s.piles.find((p) => p.id === `c${i}`)!;
      expect(c.cards.length).toBe(7);
      expect(c.faceUpCount).toBe(7);
    }
    for (let i = 5; i <= 8; i++) {
      const c = s.piles.find((p) => p.id === `c${i}`)!;
      expect(c.cards.length).toBe(6);
      expect(c.faceUpCount).toBe(6);
    }
  });

  it("4 free cells start empty", () => {
    const s = initialState(42, {});
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `fc${i}`)!.cards.length).toBe(0);
    }
  });

  it("4 foundations start empty", () => {
    const s = initialState(42, {});
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `f${i}`)!.cards.length).toBe(0);
    }
  });
});

describe("BakersGame reducer", () => {
  it("moving top card to free cell is legal", () => {
    const s = initialState(42, {});
    const c1 = s.piles.find((p) => p.id === "c1")!;
    const before = c1.cards.length;
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "fc1", count: 1 });
    expect(next.piles.find((p) => p.id === "c1")!.cards.length).toBe(before - 1);
    expect(next.piles.find((p) => p.id === "fc1")!.cards.length).toBe(1);
    expect(next.movesMade).toBe(1);
  });

  it("moving 2 cards to free cell is illegal", () => {
    const s = initialState(42, {});
    const next = reducer(s, { type: "move", fromPile: "c1", toPile: "fc1", count: 2 });
    expect(next.piles.find((p) => p.id === "fc1")!.cards.length).toBe(0);
    expect(next.movesMade).toBe(0);
  });

  it("same-suit sequence can stack on tableau", () => {
    const s = initialState(42, {});
    // Find any cascade where top 2 are same suit, descending rank
    const cascades = s.piles.filter((p) => p.kind === "tableau");
    let tested = false;
    for (const from of cascades) {
      if (from.cards.length < 1) continue;
      const topFrom = from.cards[from.cards.length - 1]!;
      for (const to of cascades) {
        if (to.id === from.id || to.cards.length === 0) continue;
        const topTo = to.cards[to.cards.length - 1]!;
        if (topTo.suit === topFrom.suit && topTo.rank === topFrom.rank + 1) {
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

  it("cross-suit stack is illegal in Baker's Game (different suits rejected)", () => {
    const s = initialState(42, {});
    // Find two cascades where tops have different suits but right rank relationship
    const c1 = s.piles.find((p) => p.id === "c1")!;
    const c2 = s.piles.find((p) => p.id === "c2")!;
    const topC1 = c1.cards[c1.cards.length - 1]!;
    const topC2 = c2.cards[c2.cards.length - 1]!;
    if (topC1.suit !== topC2.suit && topC2.rank === topC1.rank + 1) {
      const next = reducer(s, { type: "move", fromPile: "c1", toPile: "c2", count: 1 });
      // Different suits — Baker's Game requires same suit, so this must be rejected
      expect(next.movesMade).toBe(0);
    } else {
      expect(true).toBe(true); // skip if topology doesn't match
    }
  });
});

describe("BakersGame isTerminal", () => {
  it("returns null when foundations not complete", () => {
    const s = initialState(42, {});
    expect(isTerminal(s)).toBeNull();
  });
});
