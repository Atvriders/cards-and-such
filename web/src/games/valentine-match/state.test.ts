import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { pairs: "6" as const };

describe("initialState", () => {
  it("creates correct number of cards", () => {
    const s = initialState(1, settings);
    expect(s.cards.length).toBe(12);
    expect(s.score).toBe(0);
    expect(s.combo).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("combo system", () => {
  it("consecutive matches build combo", () => {
    const s = initialState(1, settings);
    const first = 0;
    const second = s.cards.findIndex((c, i) => c === s.cards[first] && i !== first);
    let st = reducer(s, { type: "flip", index: first });
    st = reducer(st, { type: "flip", index: second });
    st = reducer(st, { type: "resolve" });
    expect(st.combo).toBe(1);
    expect(st.score).toBeGreaterThan(100);
  });

  it("miss resets combo", () => {
    const s = initialState(1, settings);
    // Find two different cards
    const first = 0;
    const second = s.cards.findIndex((c, i) => c !== s.cards[first] && i !== first);
    if (second === -1) return;
    let st = reducer(s, { type: "flip", index: first });
    st = reducer(st, { type: "flip", index: second });
    // Artificially set combo > 0
    st = { ...st, combo: 3 };
    st = reducer(st, { type: "resolve" });
    expect(st.combo).toBe(0);
  });
});

describe("reducer flip", () => {
  it("locks board after second flip", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "flip", index: 0 });
    s = reducer(s, { type: "flip", index: 1 });
    expect(s.lockBoard).toBe(true);
  });

  it("ignores flip while board locked", () => {
    let s = initialState(1, settings);
    s = reducer(s, { type: "flip", index: 0 });
    s = reducer(s, { type: "flip", index: 1 });
    const locked = s;
    s = reducer(s, { type: "flip", index: 2 });
    expect(s.flipped[2]).toBe(locked.flipped[2]);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 800 };
    expect(isTerminal(s)!.score).toBe(800);
  });
});
