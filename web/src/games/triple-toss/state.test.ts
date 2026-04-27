import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, scoreThree } from "./state.js";
const S = { dummy: false };
describe("TripleToss", () => {
  it("starts in ready", () => { const s = initialState(1, S); expect(s.phase).toBe("ready"); });
  it("roll produces 3 dice", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.dice.length).toBe(3); });
  it("score is non-negative after rolling", () => { const s = reducer(initialState(1, S), { type:"roll" }); expect(s.score).toBeGreaterThanOrEqual(0); });
  it("scoreThree: triples=100, pair=20, all diff=0", () => {
    expect(scoreThree([3,3,3]).pts).toBe(100);
    expect(scoreThree([1,2,2]).pts).toBe(20);
    expect(scoreThree([1,2,3]).pts).toBe(0);
  });
  it("isTerminal null during play", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
});
