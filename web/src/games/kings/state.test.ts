import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, kingsRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";

const settings = {};

describe("Kings initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("13 tableau columns of 4 cards each", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 13; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(4);
    }
  });

  it("4 king foundations start empty", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      const k = s.piles.find((p) => p.id === `k${i}`)!;
      expect(k.cards.length).toBe(0);
    }
  });

  it("is deterministic", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.piles.flatMap((p) => p.cards.map((c) => c.id)))
      .toEqual(s2.piles.flatMap((p) => p.cards.map((c) => c.id)));
  });
});

describe("Kings ruleset", () => {
  it("king foundation accepts King", () => {
    const target: Pile = { id: "k1", kind: "foundation", cards: [] };
    expect(kingsRuleset.canStack(target, [{ id: "a", suit: "♠", rank: 13 }])).toBe(true);
  });

  it("king foundation rejects non-King", () => {
    const target: Pile = { id: "k1", kind: "foundation", cards: [] };
    expect(kingsRuleset.canStack(target, [{ id: "a", suit: "♠", rank: 12 }])).toBe(false);
  });

  it("tableau accepts one rank higher regardless of suit", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ id: "a", suit: "♠", rank: 7 }], faceUpCount: 1 };
    expect(kingsRuleset.canStack(target, [{ id: "b", suit: "♥", rank: 8 }])).toBe(true);
  });

  it("tableau rejects same rank", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ id: "a", suit: "♠", rank: 7 }], faceUpCount: 1 };
    expect(kingsRuleset.canStack(target, [{ id: "b", suit: "♣", rank: 7 }])).toBe(false);
  });
});

describe("Kings reducer", () => {
  it("count 0 returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });

  it("total cards preserved after move", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("won state is immutable", () => {
    const s = { ...initialState(1, settings), won: true };
    const next = reducer(s, { type: "auto-remove-kings" });
    expect(next).toBe(s);
  });

  it("auto-remove-kings moves King to foundation", () => {
    const s = initialState(1, settings);
    // Manually set a King on top of t1
    const piles = s.piles.map((p) => {
      if (p.id === "t1") return { ...p, cards: [{ id: "king-test", suit: "♠" as const, rank: 13 as const }], faceUpCount: 1 };
      return p;
    });
    const modified = { ...s, piles };
    const next = reducer(modified, { type: "auto-remove-kings" });
    const kingFound = next.piles.filter((p) => p.id.startsWith("k")).reduce((sum, p) => sum + p.cards.length, 0);
    expect(kingFound).toBeGreaterThanOrEqual(1);
  });
});

describe("Kings isTerminal", () => {
  it("returns null initially", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when 4 kings on foundations", () => {
    const s = initialState(1, settings);
    const piles = s.piles.map((p) => {
      if (p.id === "k1") return { ...p, cards: [{ id: "k1c", suit: "♠" as const, rank: 13 as const }] };
      if (p.id === "k2") return { ...p, cards: [{ id: "k2c", suit: "♥" as const, rank: 13 as const }] };
      if (p.id === "k3") return { ...p, cards: [{ id: "k3c", suit: "♦" as const, rank: 13 as const }] };
      if (p.id === "k4") return { ...p, cards: [{ id: "k4c", suit: "♣" as const, rank: 13 as const }] };
      return p;
    });
    const won = { ...s, piles, score: 80 };
    expect(isTerminal(won)).toEqual({ score: 80 });
  });
});
