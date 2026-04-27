import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, maxSameSuit } from "./state.js";
const S = { dummy: false };
describe("SuitShuffle", () => {
  it("starts at round 1", () => { expect(initialState(1, S).round).toBe(1); });
  it("deal yields 4 cards", () => {
    const s = reducer(initialState(1, S), { type:"deal" });
    expect(s.hand.length).toBe(4);
  });
  it("score is at least 10 per round", () => {
    const s = reducer(initialState(1, S), { type:"deal" });
    expect(s.score).toBeGreaterThanOrEqual(10);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      s = reducer(s, { type:"deal" });
      if (s.phase !== "done") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
  });
  it("maxSameSuit handles 4-of-a-suit", () => {
    expect(maxSameSuit([0, 1, 2, 3])).toBe(4);
    expect(maxSameSuit([0, 13, 26, 39])).toBe(1);
  });
});
