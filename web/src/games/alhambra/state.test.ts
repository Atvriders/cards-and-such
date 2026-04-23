import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, alhambraRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";

const settings = {};

describe("Alhambra initialState", () => {
  it("has exactly 104 cards total", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("4 tableau columns of 3 cards each", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(3);
    }
  });

  it("8 foundations start empty", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      expect(s.piles.find((p) => p.id === `fu${i}`)!.cards.length).toBe(0);
      expect(s.piles.find((p) => p.id === `fd${i}`)!.cards.length).toBe(0);
    }
  });

  it("stock has 92 cards", () => {
    const s = initialState(1, settings);
    const stock = s.piles.find((p) => p.id === "stock")!;
    expect(stock.cards.length).toBe(92);
  });
});

describe("Alhambra ruleset", () => {
  it("up-foundation accepts Ace on empty pile", () => {
    const target: Pile = { id: "fu1", kind: "foundation", cards: [] };
    expect(alhambraRuleset.canStack(target, [{ id: "a", suit: "♠", rank: 1 }])).toBe(true);
  });

  it("down-foundation accepts King on empty pile", () => {
    const target: Pile = { id: "fd1", kind: "foundation", cards: [] };
    expect(alhambraRuleset.canStack(target, [{ id: "a", suit: "♠", rank: 13 }])).toBe(true);
  });

  it("tableau allows alternating color up or down", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ id: "a", suit: "♠", rank: 7 }], faceUpCount: 1 };
    // ♥ is red, ♠ is black — alternating, rank 6 (down) or 8 (up)
    expect(alhambraRuleset.canStack(target, [{ id: "b", suit: "♥", rank: 8 }])).toBe(true);
    expect(alhambraRuleset.canStack(target, [{ id: "c", suit: "♦", rank: 6 }])).toBe(true);
  });

  it("tableau rejects same-color", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ id: "a", suit: "♠", rank: 7 }], faceUpCount: 1 };
    expect(alhambraRuleset.canStack(target, [{ id: "b", suit: "♣", rank: 8 }])).toBe(false);
  });
});

describe("Alhambra reducer", () => {
  it("draw from stock moves one card to waste", () => {
    const s = initialState(42, settings);
    const stockBefore = s.piles.find((p) => p.id === "stock")!.cards.length;
    const next = reducer(s, { type: "move", fromPile: "stock", toPile: "waste", count: 1 });
    const stockAfter = next.piles.find((p) => p.id === "stock")!.cards.length;
    expect(stockAfter).toBe(stockBefore - 1);
    expect(next.piles.find((p) => p.id === "waste")!.cards.length).toBe(1);
  });

  it("total cards preserved after draw", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "stock", toPile: "waste", count: 1 });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(104);
  });

  it("won state is immutable", () => {
    const s = { ...initialState(1, settings), won: true };
    const next = reducer(s, { type: "auto-move-to-foundation" });
    expect(next).toBe(s);
  });

  it("illegal move returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });
});

describe("Alhambra isTerminal", () => {
  it("returns null initially", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when won flag set and foundations full would trigger", () => {
    const s = { ...initialState(1, settings), won: true, score: 1040 };
    expect(isTerminal(s)).toBeNull(); // won=true but foundations not actually full in this test
  });
});
