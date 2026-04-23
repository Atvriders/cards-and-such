import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, bisleyRuleset } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

const settings = {};

describe("Bisley initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42, settings);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("up-foundations start with one Ace each", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      const f = s.piles.find((p) => p.id === `fu${i}`)!;
      expect(f.cards.length).toBe(1);
      expect(f.cards[0]!.rank).toBe(1);
    }
  });

  it("down-foundations start empty", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 4; i++) {
      const f = s.piles.find((p) => p.id === `fd${i}`)!;
      expect(f.cards.length).toBe(0);
    }
  });

  it("12 tableau columns of 4 cards", () => {
    const s = initialState(1, settings);
    for (let i = 1; i <= 12; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(4);
    }
  });
});

describe("Bisley ruleset", () => {
  it("up-foundation accepts same-suit ascending card", () => {
    const target: Pile = { id: "fu1", kind: "foundation", cards: [{ id: "a", suit: "♥", rank: 5 }] };
    expect(bisleyRuleset.canStack(target, [{ id: "b", suit: "♥", rank: 6 }])).toBe(true);
  });

  it("down-foundation accepts King to start", () => {
    const target: Pile = { id: "fd1", kind: "foundation", cards: [] };
    expect(bisleyRuleset.canStack(target, [{ id: "b", suit: "♠", rank: 13 }])).toBe(true);
  });

  it("down-foundation rejects non-King on empty pile", () => {
    const target: Pile = { id: "fd1", kind: "foundation", cards: [] };
    expect(bisleyRuleset.canStack(target, [{ id: "b", suit: "♠", rank: 7 }])).toBe(false);
  });

  it("tableau allows same-suit either direction", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ id: "a", suit: "♣", rank: 7 }], faceUpCount: 1 };
    expect(bisleyRuleset.canStack(target, [{ id: "b", suit: "♣", rank: 8 }])).toBe(true);
    expect(bisleyRuleset.canStack(target, [{ id: "c", suit: "♣", rank: 6 }])).toBe(true);
  });

  it("tableau rejects cross-suit", () => {
    const target: Pile = { id: "t1", kind: "tableau", cards: [{ id: "a", suit: "♣", rank: 7 }], faceUpCount: 1 };
    expect(bisleyRuleset.canStack(target, [{ id: "b", suit: "♥", rank: 6 }])).toBe(false);
  });
});

describe("Bisley reducer", () => {
  it("illegal move count 0 returns same state", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });

  it("card count preserved after any move attempt", () => {
    const s = initialState(42, settings);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 1 });
    const total = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("won state is not modified", () => {
    const s = { ...initialState(1, settings), won: true };
    const next = reducer(s, { type: "auto-move-to-foundation" });
    expect(next).toBe(s);
  });
});

describe("Bisley isTerminal", () => {
  it("returns null initially", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when all foundations full", () => {
    const wonPiles: Pile[] = [];
    let idx = 0;
    for (let i = 1; i <= 4; i++) {
      const suit = SUITS[i - 1]!;
      wonPiles.push({ id: `fu${i}`, kind: "foundation", cards: RANKS.map((r) => ({ suit: suit as Suit, rank: r as Rank, id: `${idx++}` })) });
      wonPiles.push({ id: `fd${i}`, kind: "foundation", cards: [] });
    }
    for (let i = 1; i <= 12; i++) wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    const s = { piles: wonPiles, score: 520, movesMade: 52, won: true, settings };
    expect(isTerminal(s)).toEqual({ score: 520 });
  });
});
