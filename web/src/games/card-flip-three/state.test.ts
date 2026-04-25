import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "5" as const };

describe("CardFlipThree", () => {
  it("deals 3 cards per round", () => {
    const s = initialState(42, S);
    expect(s.hand.length).toBe(3);
    expect(s.revealed).toEqual([false, false, false]);
  });
  it("flipping reveals a card and adds score", () => {
    const s = initialState(42, S);
    const s2 = reducer(s, { type: "flip", index: 0 });
    expect(s2.revealed[0]).toBe(true);
    expect(s2.score).toBeGreaterThan(0);
  });
  it("cannot advance until all revealed", () => {
    const s = initialState(42, S);
    const s2 = reducer(reducer(s, { type: "flip", index: 0 }), { type: "next" });
    expect(s2.round).toBe(1);
  });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let r = 0; r < 5; r++) {
      s = reducer(reducer(reducer(s, { type: "flip", index: 0 }), { type: "flip", index: 1 }), { type: "flip", index: 2 });
      s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
