import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { AceOfThePileState } from "./state.js";
import { SUITS, RANKS } from "../../engines/deck/index.js";
import type { Suit, Rank } from "../../engines/deck/index.js";
import type { Pile } from "../../engines/tableau/types.js";

describe("Ace of the Pile initialState", () => {
  it("has exactly 52 cards total", () => {
    const s = initialState(42);
    expect(s.piles.reduce((sum, p) => sum + p.cards.length, 0)).toBe(52);
  });

  it("is deterministic", () => {
    const s1 = initialState(33);
    const s2 = initialState(33);
    expect(s1.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","))
      .toEqual(s2.piles.flatMap((p) => p.cards.map((c) => c.id)).join(","));
  });

  it("6 tableau columns of 4 face-up cards each", () => {
    const s = initialState(42);
    for (let i = 1; i <= 6; i++) {
      const t = s.piles.find((p) => p.id === `t${i}`)!;
      expect(t.cards.length).toBe(4);
      expect(t.faceUpCount).toBe(4);
    }
  });

  it("reserve has 27 cards (remaining after 6×4 tableau)", () => {
    const s = initialState(42);
    expect(s.piles.find((p) => p.id === "reserve")!.cards.length).toBe(28);
  });
});

describe("Ace of the Pile reducer", () => {
  it("same-suit descending move on tableau is accepted", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ suit: "♠", rank: 8, id: "8s" }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ suit: "♠", rank: 7, id: "7s" }], faceUpCount: 1 },
      { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t4", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t5", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t6", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "reserve", kind: "stock", cards: [] },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ];
    const s: AceOfThePileState = { piles, score: 0, movesMade: 0, won: false };
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next).not.toBe(s);
    expect(next.piles.find((p) => p.id === "t1")!.cards.length).toBe(2);
  });

  it("different-suit move is rejected", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [{ suit: "♠", rank: 8, id: "8s" }], faceUpCount: 1 },
      { id: "t2", kind: "tableau", cards: [{ suit: "♥", rank: 7, id: "7h" }], faceUpCount: 1 },
      { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t4", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t5", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t6", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "reserve", kind: "stock", cards: [] },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ];
    const s: AceOfThePileState = { piles, score: 0, movesMade: 0, won: false };
    const next = reducer(s, { type: "move", fromPile: "t2", toPile: "t1", count: 1 });
    expect(next).toBe(s);
  });

  it("reserve card can move to foundation", () => {
    const piles: Pile[] = [
      { id: "t1", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t2", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t3", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t4", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t5", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "t6", kind: "tableau", cards: [], faceUpCount: 0 },
      { id: "reserve", kind: "stock", cards: [{ suit: "♥", rank: 1, id: "ah" }] },
      { id: "f1", kind: "foundation", cards: [] },
      { id: "f2", kind: "foundation", cards: [] },
      { id: "f3", kind: "foundation", cards: [] },
      { id: "f4", kind: "foundation", cards: [] },
    ];
    const s: AceOfThePileState = { piles, score: 0, movesMade: 0, won: false };
    const next = reducer(s, { type: "move", fromPile: "reserve", toPile: "f1", count: 1 });
    expect(next.piles.find((p) => p.id === "f1")!.cards.length).toBe(1);
    expect(next.score).toBe(10);
  });

  it("won state not modified", () => {
    const s = initialState(42);
    const won: AceOfThePileState = { ...s, won: true };
    expect(reducer(won, { type: "auto-move-to-foundation" })).toBe(won);
  });
});

describe("Ace of the Pile isTerminal", () => {
  it("returns null on fresh state", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("returns score on won state", () => {
    const piles: Pile[] = [];
    let idx = 0;
    for (let fi = 0; fi < 4; fi++) {
      piles.push({
        id: `f${fi + 1}`,
        kind: "foundation",
        cards: RANKS.map((r) => ({ suit: SUITS[fi]! as Suit, rank: r as Rank, id: `ap${idx++}` })),
      });
    }
    for (let i = 1; i <= 6; i++) piles.push({ id: `t${i}`, kind: "tableau", cards: [], faceUpCount: 0 });
    piles.push({ id: "reserve", kind: "freecell", cards: [] });
    const wonState: AceOfThePileState = { piles, score: 520, movesMade: 52, won: true };
    expect(isTerminal(wonState)!.score).toBe(520);
  });
});
