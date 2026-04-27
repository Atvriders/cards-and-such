import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS } from "./state.js";
const S = { dummy: false };
describe("DiceClutch", () => {
  it("starts at round 1", () => { expect(initialState(1, S).round).toBe(1); });
  it("roll yields 2 dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice).not.toBeNull();
    expect(s.dice!.length).toBe(2);
  });
  it("score grows", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.score).toBeGreaterThanOrEqual(2);
  });
  it("isTerminal null while playing", () => { expect(isTerminal(initialState(1, S))).toBeNull(); });
  it("game ends after TOTAL_ROUNDS, last roll is 5x", () => {
    let s = initialState(2, S);
    for (let i = 0; i < TOTAL_ROUNDS - 1; i++) {
      s = reducer(s, { type:"roll" });
      s = reducer(s, { type:"next" });
    }
    const before = s.score;
    s = reducer(s, { type:"roll" });
    expect(s.phase).toBe("done");
    const finalGain = s.score - before;
    // final gain is sum * 5, sum 2..12, so range 10..60
    expect(finalGain).toBeGreaterThanOrEqual(10);
    expect(finalGain).toBeLessThanOrEqual(60);
  });
});
