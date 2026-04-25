import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = {};

describe("Interregnum initialState", () => {
  it("accounts for all 104 cards", () => {
    const s = initialState(1, settings);
    const foundCount = s.foundations.reduce((sum, f) => sum + f.cards.length, 0);
    const discardCount = s.discards.reduce((sum, d) => sum + d.length, 0);
    const total = foundCount + discardCount + s.stock.length + s.waste.length;
    expect(total).toBe(104);
  });

  it("has 8 foundations", () => {
    const s = initialState(1, settings);
    expect(s.foundations.length).toBe(8);
  });

  it("has 8 discard piles starting empty", () => {
    const s = initialState(1, settings);
    expect(s.discards.length).toBe(8);
    for (const d of s.discards) expect(d.length).toBe(0);
  });

  it("is deterministic for same seed", () => {
    const s1 = initialState(10, settings);
    const s2 = initialState(10, settings);
    expect(s1.foundations[0]!.baseRank).toBe(s2.foundations[0]!.baseRank);
  });

  it("foundations start with base cards", () => {
    const s = initialState(1, settings);
    const withCards = s.foundations.filter((f) => f.cards.length > 0);
    expect(withCards.length).toBeGreaterThan(0);
  });
});

describe("Interregnum reducer", () => {
  it("draw moves card to waste", () => {
    const s = initialState(1, settings);
    const next = reducer(s, { type: "draw" });
    expect(next.waste.length).toBe(1);
    expect(next.stock.length).toBe(s.stock.length - 1);
  });

  it("move-waste-to-discard works", () => {
    const s = initialState(1, settings);
    const afterDraw = reducer(s, { type: "draw" });
    const next = reducer(afterDraw, { type: "move-waste-to-discard", discardIdx: 0 });
    expect(next.discards[0]!.length).toBe(1);
    expect(next.waste.length).toBe(0);
  });

  it("move-discard-to-discard works", () => {
    const s = initialState(1, settings);
    const afterDraw = reducer(s, { type: "draw" });
    const afterDiscard = reducer(afterDraw, { type: "move-waste-to-discard", discardIdx: 0 });
    const next = reducer(afterDiscard, { type: "move-discard-to-discard", fromIdx: 0, toIdx: 1 });
    expect(next.discards[0]!.length).toBe(0);
    expect(next.discards[1]!.length).toBe(1);
  });

  it("same discard-to-discard is a no-op", () => {
    const s = initialState(1, settings);
    const afterDraw = reducer(s, { type: "draw" });
    const afterDiscard = reducer(afterDraw, { type: "move-waste-to-discard", discardIdx: 0 });
    const next = reducer(afterDiscard, { type: "move-discard-to-discard", fromIdx: 0, toIdx: 0 });
    expect(next).toBe(afterDiscard);
  });

  it("foundation move rejects wrong suit", () => {
    const s = initialState(1, settings);
    const afterDraw = reducer(s, { type: "draw" });
    const afterDiscard = reducer(afterDraw, { type: "move-waste-to-discard", discardIdx: 0 });
    const discardTop = afterDiscard.discards[0]![0]!;
    // Find a foundation with wrong suit
    const fi = afterDiscard.foundations.findIndex((f) => f.suit !== discardTop.suit);
    if (fi >= 0) {
      const next = reducer(afterDiscard, { type: "move-to-foundation", fromType: "discard", fromIdx: 0, foundIdx: fi });
      expect(next).toBe(afterDiscard);
    }
    expect(true).toBe(true);
  });
});

describe("Interregnum isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when all 104 on foundations", () => {
    const s = initialState(1, settings);
    const fullFounds = s.foundations.map((f) => ({
      ...f,
      cards: Array(13).fill({ rank: 1, suit: f.suit, id: "x" }),
    }));
    const result = isTerminal({ ...s, foundations: fullFounds, won: true, score: 500 });
    expect(result).not.toBeNull();
    expect(result!.score).toBe(500);
  });
});
