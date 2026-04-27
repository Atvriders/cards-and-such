import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TARGET, MAX_ROLLS } from "./state.js";
const S = { dummy: false };
describe("DiceLeap", () => {
  it("starts at position 0", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("rolling");
    expect(s.position).toBe(0);
  });
  it("roll changes position", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.rollsUsed).toBe(1);
    expect(s.lastRoll).not.toBeNull();
  });
  it("position never goes below 0", () => {
    let s = initialState(1, S);
    for (let i = 0; i < 5; i++) s = reducer(s, { type: "roll" });
    expect(s.position).toBeGreaterThanOrEqual(0);
  });
  it("game ends after MAX_ROLLS", () => {
    let s = initialState(1, S);
    for (let i = 0; i < MAX_ROLLS; i++) s = reducer(s, { type: "roll" });
    expect(s.phase).toBe("done");
  });
  it("TARGET is 50", () => { expect(TARGET).toBe(50); });
  it("isTerminal null while playing", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
});
