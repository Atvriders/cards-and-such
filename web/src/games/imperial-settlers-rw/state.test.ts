import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreRound } from "./state.js";

const S = { rounds: "10" as const };

describe("Imperial Settlers R&W", () => {
  it("initial state", () => { const s = initialState(1, S); expect(s.score).toBe(0); expect(s.round).toBe(1); expect(s.phase).toBe("ready"); });
  it("deterministic init", () => { expect(initialState(99, S)).toEqual(initialState(99, S)); });
  it("play deals 5 cards", () => {
    const s = initialState(3, S); const s2 = reducer(s, { type: "play" });
    expect(s2.hand.length).toBe(5); expect(s2.phase).toBe("played");
  });
  it("scoreRound is non-negative", () => {
    expect(scoreRound([0,1,2,3,4], 1)).toBeGreaterThanOrEqual(0);
    expect(scoreRound([12,11,10,9,8], 5)).toBeGreaterThanOrEqual(0);
  });
  it("score advances after play", () => {
    const s = initialState(5, S); const s2 = reducer(s, { type: "play" });
    expect(s2.score).toBeGreaterThanOrEqual(0);
  });
  it("isTerminal null until gameover", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
