import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const S = { rounds: "5" as const };

describe("CardPileStack", () => {
  it("starts with empty pile", () => {
    const s = initialState(42, S);
    expect(s.pile.length).toBe(0);
    expect(s.score).toBe(0);
  });
  it("drawing adds a card to pile", () => {
    const s = initialState(42, S);
    const s2 = reducer(s, { type: "draw" });
    expect(s2.pile.length).toBe(1);
  });
  it("banking adds pile total to score", () => {
    const s = initialState(42, S);
    const s2 = reducer(s, { type: "draw" });
    const total = s2.pile.reduce((acc, c) => acc + (c % 13 === 0 ? 11 : c % 13 >= 10 ? 10 : c % 13 + 1), 0);
    const s3 = reducer(s2, { type: "bank" });
    expect(s3.score).toBe(total);
  });
  it("game ends after all rounds", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 5; i++) {
      s = reducer(s, { type: "draw" });
      s = reducer(s, { type: "bank" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
