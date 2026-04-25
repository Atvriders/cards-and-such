import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { pairs: "6" as const };

describe("initialState", () => {
  it("creates correct number of cards (pairs * 2)", () => {
    const s = initialState(1, settings);
    expect(s.cards.length).toBe(12);
    expect(s.matched.length).toBe(12);
    expect(s.flipped.every(f => !f)).toBe(true);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });

  it("each cookie type appears exactly twice", () => {
    const s = initialState(42, settings);
    const counts = new Map<number, number>();
    for (const t of s.cards) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const [, count] of counts) expect(count).toBe(2);
  });
});

describe("reducer flip", () => {
  it("flips first card and stores firstPick", () => {
    const s = initialState(1, settings);
    const s2 = reducer(s, { type: "flip", index: 0 });
    expect(s2.flipped[0]).toBe(true);
    expect(s2.firstPick).toBe(0);
    expect(s2.lockBoard).toBe(false);
  });

  it("flipping second card locks the board", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "flip", index: 0 });
    s = reducer(s, { type: "flip", index: 1 });
    expect(s.lockBoard).toBe(true);
    expect(s.moves).toBe(1);
  });
});

describe("reducer resolve", () => {
  it("matching pair increments score and marks matched", () => {
    const s = initialState(1, settings);
    // Find a matching pair
    const first = s.cards.findIndex((_, i) => i >= 0);
    const second = s.cards.findIndex((c, i) => c === s.cards[first] && i !== first);
    let st = reducer(s, { type: "flip", index: first });
    st = reducer(st, { type: "flip", index: second });
    st = reducer(st, { type: "resolve" });
    expect(st.matched[first]).toBe(true);
    expect(st.matched[second]).toBe(true);
    expect(st.score).toBeGreaterThan(0);
  });

  it("non-matching pair flips cards back", () => {
    const s = initialState(1, settings);
    // Find two different-type cards
    const first = 0;
    const second = s.cards.findIndex((c, i) => c !== s.cards[first] && i !== first);
    if (second === -1) return; // skip if seed has all same
    let st = reducer(s, { type: "flip", index: first });
    st = reducer(st, { type: "flip", index: second });
    st = reducer(st, { type: "resolve" });
    expect(st.matched[first]).toBe(false);
    expect(st.matched[second]).toBe(false);
    expect(st.flipped[first]).toBe(false);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when all matched", () => {
    const s = { ...initialState(1, settings), over: true, score: 500 };
    expect(isTerminal(s)!.score).toBe(500);
  });
});
