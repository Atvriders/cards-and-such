import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s6 = { pairs: "6" as const };
const s8 = { pairs: "8" as const };

describe("Memory Pairs (Kids)", () => {
  it("initializes with correct number of cards", () => {
    const s = initialState(42, s6);
    expect(s.cards.length).toBe(12);
    expect(s.matchedPairs).toBe(0);
    expect(s.totalPairs).toBe(6);
    expect(s.moves).toBe(0);
  });

  it("8-pair mode creates 16 cards", () => {
    const s = initialState(99, s8);
    expect(s.cards.length).toBe(16);
    expect(s.totalPairs).toBe(8);
  });

  it("all cards start face-down and unmatched", () => {
    const s = initialState(7, s6);
    expect(s.cards.every(c => !c.faceUp && !c.matched)).toBe(true);
  });

  it("flipping a card makes it face-up", () => {
    const s = initialState(42, s6);
    const next = reducer(s, { type: "flip", index: 0 });
    expect(next.cards[0]!.faceUp).toBe(true);
    expect(next.flipped).toEqual([0]);
  });

  it("matching pair stays face-up with matched=true", () => {
    const s = initialState(42, s6);
    // Find two cards with same symbol
    const symbol = s.cards[0]!.symbol;
    const idxB = s.cards.findIndex((c, i) => i !== 0 && c.symbol === symbol);
    let cur = reducer(s, { type: "flip", index: 0 });
    cur = reducer(cur, { type: "flip", index: idxB });
    expect(cur.cards[0]!.matched).toBe(true);
    expect(cur.cards[idxB]!.matched).toBe(true);
    expect(cur.matchedPairs).toBe(1);
    expect(cur.moves).toBe(1);
  });

  it("non-matching pair locks and cards stay face-up temporarily", () => {
    const s = initialState(42, s6);
    const symbol = s.cards[0]!.symbol;
    const idxB = s.cards.findIndex((c, i) => i !== 0 && c.symbol !== symbol);
    let cur = reducer(s, { type: "flip", index: 0 });
    cur = reducer(cur, { type: "flip", index: idxB });
    expect(cur.locked).toBe(true);
    expect(cur.cards[0]!.matched).toBe(false);
  });

  it("clear action hides non-matched face-up cards", () => {
    const s = initialState(42, s6);
    const symbol = s.cards[0]!.symbol;
    const idxB = s.cards.findIndex((c, i) => i !== 0 && c.symbol !== symbol);
    let cur = reducer(s, { type: "flip", index: 0 });
    cur = reducer(cur, { type: "flip", index: idxB });
    cur = reducer(cur, { type: "clear" });
    expect(cur.locked).toBe(false);
    expect(cur.cards[0]!.faceUp).toBe(false);
  });

  it("isTerminal returns null when not done", () => {
    const s = initialState(42, s6);
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns a score when all pairs matched", () => {
    let s = initialState(42, s6);
    // Match all pairs by finding pairs systematically
    while (s.matchedPairs < s.totalPairs) {
      const symbol = s.cards.find(c => !c.matched)!.symbol;
      const idxs = s.cards.reduce<number[]>((acc, c, i) => (c.symbol === symbol && !c.matched ? [...acc, i] : acc), []);
      s = reducer(s, { type: "flip", index: idxs[0]! });
      s = reducer(s, { type: "flip", index: idxs[1]! });
    }
    const terminal = isTerminal(s);
    expect(terminal).not.toBeNull();
    expect(terminal!.score).toBeGreaterThan(0);
  });
});
