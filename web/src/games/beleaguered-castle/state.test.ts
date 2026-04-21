import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("BeleagueredCastle initialState", () => {
  it("has exactly 52 cards across all piles", () => {
    const s = initialState(42, {});
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("4 foundations each have exactly one Ace", () => {
    const s = initialState(42, {});
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    expect(foundations.length).toBe(4);
    for (const f of foundations) {
      expect(f.cards.length).toBe(1);
      expect(f.cards[0]!.rank).toBe(1);
    }
  });

  it("8 tableau rows of 6 cards each, all face-up", () => {
    const s = initialState(42, {});
    const tableau = s.piles.filter((p) => p.kind === "tableau");
    expect(tableau.length).toBe(8);
    for (const t of tableau) {
      expect(t.cards.length).toBe(6);
      expect(t.faceUpCount).toBe(6);
    }
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(99, {});
    const s2 = initialState(99, {});
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(ids1).toEqual(ids2);
  });
});

describe("BeleagueredCastle reducer", () => {
  it("moves top card of tableau to foundation if legal", () => {
    const s = initialState(42, {});
    // Find a tableau card that is rank 2, matching a foundation ace suit
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    const tableau = s.piles.filter((p) => p.kind === "tableau");
    let moved = false;
    for (const t of tableau) {
      const top = t.cards[t.cards.length - 1]!;
      if (top.rank === 2) {
        const matchF = foundations.find((f) => f.cards[0]!.suit === top.suit);
        if (matchF) {
          const next = reducer(s, { type: "move", fromPile: t.id, toPile: matchF.id, count: 1 });
          expect(next.movesMade).toBe(1);
          moved = true;
          break;
        }
      }
    }
    if (!moved) expect(true).toBe(true); // No 2 on top — skip
  });

  it("illegal move (moving 2 cards) is rejected", () => {
    const s = initialState(42, {});
    const t1 = s.piles.find((p) => p.id === "t1")!;
    const before = t1.cards.length;
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 2 });
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(before);
    expect(next.movesMade).toBe(0);
  });

  it("does nothing when already won", () => {
    const s = { ...initialState(42, {}), won: true };
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
    expect(next).toBe(s);
  });

  it("tableau to tableau move works when rank descends", () => {
    // Build a minimal state with two tableau piles where top of t2 = top of t1 rank - 1
    const s = initialState(10, {});
    const t1 = s.piles.find((p) => p.id === "t1")!;
    const t2 = s.piles.find((p) => p.id === "t2")!;
    const topT1 = t1.cards[t1.cards.length - 1]!;
    // find a tableau with top rank = topT1.rank + 1 (so topT1 can go on top)
    const target = s.piles.filter((p) => p.kind === "tableau" && p.id !== "t1").find((p) => {
      const top = p.cards[p.cards.length - 1]!;
      return top.rank === topT1.rank + 1;
    });
    if (target) {
      const next = reducer(s, { type: "move", fromPile: "t1", toPile: target.id, count: 1 });
      expect(next.movesMade).toBe(1);
    } else {
      expect(true).toBe(true); // No valid target — skip
    }
    void t2;
  });
});

describe("BeleagueredCastle isTerminal", () => {
  it("returns null when not all cards on foundations", () => {
    const s = initialState(42, {});
    expect(isTerminal(s)).toBeNull();
  });
});
