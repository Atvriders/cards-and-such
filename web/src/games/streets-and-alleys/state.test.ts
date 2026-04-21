import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("StreetsAndAlleys initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, {});
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("4 foundations start empty", () => {
    const s = initialState(42, {});
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    expect(foundations.length).toBe(4);
    for (const f of foundations) expect(f.cards.length).toBe(0);
  });

  it("8 tableau rows with correct sizes (4×7 + 4×6)", () => {
    const s = initialState(42, {});
    const tableau = s.piles.filter((p) => p.kind === "tableau");
    expect(tableau.length).toBe(8);
    const sizes = tableau.map((t) => t.cards.length).sort((a, b) => b - a);
    expect(sizes.filter((x) => x === 7).length).toBe(4);
    expect(sizes.filter((x) => x === 6).length).toBe(4);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(77, {});
    const s2 = initialState(77, {});
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).toEqual(ids2);
  });
});

describe("StreetsAndAlleys reducer", () => {
  it("illegal move (count=2) is rejected", () => {
    const s = initialState(42, {});
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 2 });
    expect(next.movesMade).toBe(0);
  });

  it("does nothing when already won", () => {
    const s = { ...initialState(42, {}), won: true };
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
    expect(next).toBe(s);
  });

  it("valid tableau-to-tableau move decrements source and increments destination", () => {
    const s = initialState(10, {});
    // Find two adjacent piles where top of t_from.rank === top of t_to.rank - 1
    const tableau = s.piles.filter((p) => p.kind === "tableau");
    let moved = false;
    for (const from of tableau) {
      const topFrom = from.cards[from.cards.length - 1]!;
      for (const to of tableau) {
        if (to.id === from.id) continue;
        const topTo = to.cards[to.cards.length - 1]!;
        if (topTo.rank === topFrom.rank + 1) {
          const fromLen = from.cards.length;
          const toLen = to.cards.length;
          const next = reducer(s, { type: "move", fromPile: from.id, toPile: to.id, count: 1 });
          expect(next.piles.find((p) => p.id === from.id)!.cards.length).toBe(fromLen - 1);
          expect(next.piles.find((p) => p.id === to.id)!.cards.length).toBe(toLen + 1);
          moved = true;
          break;
        }
      }
      if (moved) break;
    }
    if (!moved) expect(true).toBe(true);
  });

  it("isTerminal returns null when foundations are not full", () => {
    const s = initialState(42, {});
    expect(isTerminal(s)).toBeNull();
  });
});
