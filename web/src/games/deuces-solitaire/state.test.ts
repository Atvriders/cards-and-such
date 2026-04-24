import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { Pile } from "../../engines/tableau/types.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";

describe("Deuces Solitaire initialState", () => {
  it("has exactly 52 cards", () => {
    const s = initialState(1);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(total).toBe(52);
  });

  it("foundations start with the four 2s", () => {
    const s = initialState(42);
    const foundations = s.piles.filter((p) => p.kind === "foundation");
    expect(foundations.length).toBe(4);
    for (const f of foundations) {
      expect(f.cards.length).toBe(1);
      expect(f.cards[0]!.rank).toBe(2);
    }
  });

  it("has 10 tableau columns", () => {
    const s = initialState(5);
    const cols = s.piles.filter((p) => p.kind === "tableau");
    expect(cols.length).toBe(10);
  });

  it("is deterministic under same seed", () => {
    const s1 = initialState(99);
    const s2 = initialState(99);
    const ids1 = s1.piles.flatMap((p) => p.cards.map((c) => c.id));
    const ids2 = s2.piles.flatMap((p) => p.cards.map((c) => c.id));
    expect(ids1).toEqual(ids2);
  });
});

describe("Deuces Solitaire reducer", () => {
  it("auto-move does not change total card count", () => {
    const s = initialState(7);
    const total = s.piles.reduce((sum, p) => sum + p.cards.length, 0);
    const next = reducer(s, { type: "auto-move-to-foundation" });
    const totalAfter = next.piles.reduce((sum, p) => sum + p.cards.length, 0);
    expect(totalAfter).toBe(total);
  });

  it("count=0 move is rejected", () => {
    const s = initialState(42);
    const next = reducer(s, { type: "move", fromPile: "t1", toPile: "t2", count: 0 });
    expect(next).toBe(s);
  });

  it("won state rejects further moves", () => {
    const s = initialState(1);
    const wonState = { ...s, won: true };
    const next = reducer(wonState, { type: "auto-move-to-foundation" });
    expect(next).toBe(wonState);
  });
});

describe("Deuces Solitaire isTerminal", () => {
  it("returns null on initial state", () => {
    expect(isTerminal(initialState(1))).toBeNull();
  });

  it("returns score when all 52 cards on foundations", () => {
    const wonPiles: Pile[] = [];
    let cardIdx = 0;
    for (const suit of SUITS) {
      wonPiles.push({
        id: `f${SUITS.indexOf(suit) + 1}`,
        kind: "foundation",
        cards: RANKS.map((rank) => ({
          suit: suit as Suit,
          rank: rank as Rank,
          id: `${cardIdx++}-${suit}${rank}`,
        })),
      });
    }
    for (let i = 1; i <= 10; i++) {
      wonPiles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    }
    const wonState = { piles: wonPiles, movesMade: 80, won: true };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0);
  });
});
