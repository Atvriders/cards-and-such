import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("CartographerHeroes", () => {
  it("starts in initial phase with score 0", () => {
    const s = initialState(1, S);
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });
  it("first draw produces items and possibly score", () => {
    const s = reducer(initialState(1, S), { type: "draw" });
    expect(s.hand.length).toBeGreaterThanOrEqual(1);
    expect(s.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("game ends after total rounds", () => {
    let s = initialState(7, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type: "draw" });
      if (s.phase === "scored") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(isTerminal(s)?.score).toBeGreaterThanOrEqual(0);
  });
  it("non-negative score across multiple seeds", () => {
    for (const seed of [1, 42, 1234]) {
      let s = initialState(seed, S);
      for (let i = 0; i < TOTAL_ROUNDS; i++) {
        s = reducer(s, { type: "draw" });
        if (s.phase === "scored") s = reducer(s, { type: "next" });
      }
      expect(s.score).toBeGreaterThanOrEqual(0);
    }
  });
  it("TOTAL_ROUNDS is 10", () => {
    expect(TOTAL_ROUNDS).toBe(10);
  });
});
