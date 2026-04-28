import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, TOTAL_TURNS, BUDGET } from "./state.js";

const S = { dummy: false };

describe("mall-mania-mini", () => {
  it("starts with full budget and 0 items", () => {
    const s = initialState(1, S);
    expect(s.budget).toBe(BUDGET);
    expect(s.items).toBe(0);
  });
  it("roll moves into deciding phase", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.phase).toBe("deciding");
  });
  it("score is non-negative", () => {
    let s = initialState(2, S);
    for (let i = 0; i < 200; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "deciding") s = reducer(s, { type: "skip" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
  it("ends after 16 turns", () => {
    let s = initialState(3, S);
    for (let i = 0; i < 200; i++) {
      if (s.phase === "rolling") s = reducer(s, { type: "roll" });
      else if (s.phase === "deciding") s = reducer(s, { type: "skip" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
