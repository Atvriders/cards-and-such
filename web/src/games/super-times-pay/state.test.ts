import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreHand } from "./state.js";

const S = { rounds: "10" as const };

describe("Super Times Pay", () => {
  it("initial state", () => {
    const s = initialState(1, S);
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
    expect(s.phase).toBe("ready");
  });
  it("deterministic init", () => { expect(initialState(13, S)).toEqual(initialState(13, S)); });
  it("deal produces 5 cards", () => {
    const s = initialState(7, S);
    const s2 = reducer(s, { type: "deal" });
    expect(s2.hand.length).toBe(5);
    expect(s2.phase).toBe("dealt");
    expect(s2.score).toBeGreaterThanOrEqual(0);
  });
  it("scoreHand returns >= 1", () => {
    expect(scoreHand([0, 1, 2, 3, 4])).toBeGreaterThanOrEqual(1);
    expect(scoreHand([0, 13, 26, 39, 1])).toBeGreaterThanOrEqual(1);
  });
  it("scoreHand returns >= for pairs", () => {
    // 0=2S, 13=2H — same rank
    expect(scoreHand([0, 13, 5, 6, 7])).toBeGreaterThanOrEqual(10);
  });
  it("isTerminal null until gameover", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
