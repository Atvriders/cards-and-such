import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const s8 = { rounds: "8" as const };

describe("CardPairPick initialState", () => {
  it("starts in picking phase with 6 cards", () => {
    const s = initialState(1, s8);
    expect(s.phase).toBe("picking");
    expect(s.cards.length).toBe(6);
  });
  it("has at least one matching pair", () => {
    const s = initialState(1, s8);
    const ranks = s.cards.map(c => c % 13);
    const counts = ranks.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc; }, {} as Record<number, number>);
    const pairs = Object.values(counts).filter(v => v >= 2).length;
    expect(pairs).toBeGreaterThanOrEqual(1);
  });
  it("is deterministic", () => {
    expect(initialState(99, s8).cards).toEqual(initialState(99, s8).cards);
  });
  it("starts with score 0", () => {
    expect(initialState(1, s8).score).toBe(0);
  });
});

describe("CardPairPick reducer", () => {
  it("flip adds to picks and flipped", () => {
    const s = initialState(1, s8);
    const s2 = reducer(s, { type: "flip", pos: 0 });
    expect(s2.picks).toContain(0);
    expect(s2.flipped).toContain(0);
  });
  it("correct pair awards 30 pts", () => {
    const s = initialState(1, s8);
    const ranks = s.cards.map(c => c % 13);
    const pairRank = ranks.find(r => ranks.indexOf(r) !== ranks.lastIndexOf(r))!;
    const pos1 = ranks.indexOf(pairRank);
    const pos2 = ranks.lastIndexOf(pairRank);
    let s2 = reducer(s, { type: "flip", pos: pos1 });
    s2 = reducer(s2, { type: "flip", pos: pos2 });
    s2 = reducer(s2, { type: "confirm" });
    expect(s2.matched).toBe(true);
    expect(s2.score).toBe(30);
  });
  it("wrong pair scores 0", () => {
    const s = initialState(1, s8);
    const ranks = s.cards.map(c => c % 13);
    const pairRank = ranks.find(r => ranks.indexOf(r) !== ranks.lastIndexOf(r))!;
    const pos1 = ranks.indexOf(pairRank);
    const pos2 = ranks.findIndex((r, i) => r !== pairRank && i !== pos1);
    let s2 = reducer(s, { type: "flip", pos: pos1 });
    s2 = reducer(s2, { type: "flip", pos: pos2 });
    s2 = reducer(s2, { type: "confirm" });
    expect(s2.matched).toBe(false);
    expect(s2.score).toBe(0);
  });
});

describe("CardPairPick isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, s8))).toBeNull();
  });
  it("returns score when done", () => {
    let s = initialState(1, { rounds: "6" });
    for (let i = 0; i < 6; i++) {
      s = reducer(s, { type: "flip", pos: 0 });
      s = reducer(s, { type: "flip", pos: 1 });
      s = reducer(s, { type: "confirm" });
      if (s.phase === "result") s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
