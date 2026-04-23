import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, brainiacRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

const settings = {};

describe("Brainiac initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("has 4 tableau columns of 13 cards each", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(13);
      expect(t.faceUpCount).toBe(13);
    }
  });

  it("foundations start empty", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      const f = s.piles.find((p) => p.id === `f${i}`)!;
      expect(f.cards.length).toBe(0);
    }
  });

  it("is deterministic under the same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(
      s1.piles.flatMap((p) => p.cards.map((c) => c.id)),
    ).toEqual(
      s2.piles.flatMap((p) => p.cards.map((c) => c.id)),
    );
  });
});

describe("Brainiac ruleset", () => {
  it("allows same-suit ascending tableau stack", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 5 }], faceUpCount: 1 };
    expect(brainiacRuleset.canStack(target, [{ id: "c2", suit: "♠", rank: 6 }])).toBe(true);
  });

  it("rejects cross-suit tableau stack", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 5 }], faceUpCount: 1 };
    expect(brainiacRuleset.canStack(target, [{ id: "c2", suit: "♥", rank: 6 }])).toBe(false);
  });

  it("rejects multi-card move", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 };
    expect(brainiacRuleset.canStack(target, [
      { id: "c1", suit: "♠", rank: 5 },
      { id: "c2", suit: "♠", rank: 4 },
    ])).toBe(false);
  });

  it("rejects count > 1 in canPickUp", () => {
    const pile: Pile = { id: "t1", kind: "tableau", cards: [{ id: "c1", suit: "♠", rank: 5 }], faceUpCount: 1 };
    expect(brainiacRuleset.canPickUp(pile, 2)).toBe(false);
  });
});

describe("Brainiac reducer", () => {
  it("illegal move returns same state reference", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });

  it("total cards unchanged after legal move", () => {
    const s = initialState(42, settings);
    // Try moving t1 top to t2 — may or may not be legal, just verify card count
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("won state is not modified", () => {
    const s = initialState(1, settings);
    const won = { ...s, won: true };
    const next = reducer(won, { type: "auto-move-to-foundation" });
    expect(next).toBe(won);
  });
});

describe("Brainiac isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when foundations are full", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (let fi = 1; fi <= 4; fi++) {
      const suit = SUITS[fi - 1]!;
      wonPiles.push({
        id: `f${fi}`, kind: "foundation",
        cards: RANKS.map((rank) => ({ suit: suit as Suit, rank: rank as Rank, id: `${cardIdx++}` })),
      });
    }
    for (let i = 1; i <= 4; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState = { piles: wonPiles, score: 520, movesMade: 52, won: true, settings };
    expect(isTerminal(wonState)).toEqual({ score: 520 });
  });
});
