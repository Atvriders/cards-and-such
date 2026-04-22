import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scorpionTailRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { canMove } from "../../engines/tableau/moves.js";

const settings = {};

describe("ScorpionTail initialState", () => {
  it("has exactly 52 cards across all piles including reserve", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });

  it("has 9 tableau columns", () => {
    const s = initialState(42, settings);
    const tabs = s.piles.filter((p) => p.kind === "tableau");
    expect(tabs.length).toBe(9);
  });

  it("has a reserve pile with some cards", () => {
    const s = initialState(42, settings);
    const reserve = s.piles.find((p) => p.id === "reserve");
    expect(reserve).toBeDefined();
    expect(reserve!.cards.length).toBeGreaterThan(0);
  });

  it("different seeds produce different deals", () => {
    const s1 = initialState(1, settings);
    const s2 = initialState(2, settings);
    const j1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    const j2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(",");
    expect(j1).not.toEqual(j2);
  });
});

describe("ScorpionTail ruleset", () => {
  it("same-suit descending is valid", () => {
    const target: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "8h", suit: "♥", rank: 8 }],
      faceUpCount: 1,
    };
    expect(scorpionTailRuleset.canStack(target, [{ id: "7h", suit: "♥", rank: 7 }])).toBe(true);
  });

  it("different suit is rejected", () => {
    const target: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [{ id: "8h", suit: "♥", rank: 8 }],
      faceUpCount: 1,
    };
    expect(scorpionTailRuleset.canStack(target, [{ id: "7s", suit: "♠", rank: 7 }])).toBe(false);
  });

  it("empty tableau accepts any card", () => {
    const empty: Pile = { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 };
    expect(scorpionTailRuleset.canStack(empty, [{ id: "5d", suit: "♦", rank: 5 }])).toBe(true);
  });

  it("face-down cards cannot be picked up", () => {
    const pile: Pile = {
      id: "t1",
      kind: "tableau",
      cards: [
        { id: "c1", suit: "♠", rank: 8 },
        { id: "c2", suit: "♥", rank: 7 },
      ],
      faceUpCount: 1, // only top card is face-up
    };
    expect(scorpionTailRuleset.canPickUp(pile, 2)).toBe(false);
    expect(scorpionTailRuleset.canPickUp(pile, 1)).toBe(true);
  });
});

describe("ScorpionTail reducer", () => {
  it("illegal move returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t1", count: 0 });
    expect(next).toBe(s);
  });

  it("deal-reserve adds cards to tableau", () => {
    const s = initialState(42, settings);
    const beforeTotal = s.piles.filter((p) => p.kind === "tableau")
      .reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "deal-reserve" });
    const afterTotal = next.piles.filter((p) => p.kind === "tableau")
      .reduce((sum, p) => sum + p.cards.length, 0);
    expect(afterTotal).toBeGreaterThan(beforeTotal);
    expect(next.reserveDealt).toBe(true);
  });

  it("deal-reserve cannot be done twice", () => {
    const s = initialState(42, settings);
    const s1 = reducer(s, { type: "deal-reserve" });
    const s2 = reducer(s1, { type: "deal-reserve" });
    expect(s2).toBe(s1);
  });

  it("total card count preserved after valid move", () => {
    const s = initialState(99, settings);
    for (const fromId of ["t1","t2","t3","t4","t5","t6","t7","t8","t9"]) {
      for (const toId of ["t1","t2","t3","t4","t5","t6","t7","t8","t9"]) {
        if (fromId === toId) continue;
        if (canMove(s.piles, { fromPile: fromId, toPile: toId, count: 1 }, scorpionTailRuleset)) {
          const next = reducer(s, { type: "move", fromPile: fromId, toPile: toId, count: 1 });
          const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
          expect(total).toBe(52);
          return;
        }
      }
    }
    // It's okay if no legal move is found for this seed
  });
});

describe("ScorpionTail isTerminal", () => {
  it("returns null on initial state", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });
});
