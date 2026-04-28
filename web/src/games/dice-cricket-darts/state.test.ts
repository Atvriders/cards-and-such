import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, TOTAL_ROUNDS, DIE_COUNT } from "./state.js";
const S = { dummy: false };
describe("CricketDarts", () => {
  it("starts with zero marks", () => {
    const s = initialState(1, S);
    expect(s.marks.every(m => m === 0)).toBe(true);
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
  it("marks capped at 3", () => {
    let s = initialState(7, S);
    for (let i = 0; i < TOTAL_ROUNDS + 4; i++) {
      if (s.phase === "rolling") s = reducer(s, { type:"roll" });
      if (s.phase === "rolled") s = reducer(s, { type:"next" });
      for (const m of s.marks) expect(m).toBeLessThanOrEqual(3);
    }
  });
});
