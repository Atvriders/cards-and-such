import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DIE_COUNT, TARGET_MAX } from "./state.js";
const S = { dummy: false };
describe("AroundClock", () => {
  it("starts at target 1", () => {
    const s = initialState(1, S);
    expect(s.target).toBe(1);
  });
  it("roll yields dice", () => {
    const s = reducer(initialState(1, S), { type:"roll" });
    expect(s.dice!.length).toBe(DIE_COUNT);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(1, S))).toBeNull();
  });
  it("ends after rounds with non-negative score", () => {
    let s = initialState(1, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)!.score).toBeGreaterThanOrEqual(0);
  });
  it("target never exceeds max", () => {
    let s = initialState(42, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
      expect(s.target).toBeLessThanOrEqual(TARGET_MAX);
    }
  });
});
