import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, isSnappable } from "./state.js";

const S = { rounds: "15" as const };

describe("CardSnap3", () => {
  it("starts with empty history", () => { expect(initialState(1, S).history.length).toBe(0); });
  it("flip adds a card to history", () => {
    const s = reducer(initialState(1, S), { type: "flip" });
    expect(s.history.length).toBe(1);
  });
  it("wrong snap deducts points", () => {
    let s = initialState(1, S);
    s = reducer(s, { type: "flip" });
    s = reducer(s, { type: "flip" });
    if (!isSnappable(s.history)) {
      const s2 = reducer(s, { type: "snap" });
      expect(s2.score).toBe(0); // max(0, 0-20)
      expect(s2.misses).toBe(1);
    }
  });
  it("isTerminal returns score when gameover", () => {
    expect(isTerminal({ ...initialState(1, S), phase: "gameover" })).not.toBeNull();
  });
});
