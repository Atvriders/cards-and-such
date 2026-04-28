import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, PATH_LEN } from "./state.js";

const S = { path: "business" as const };

describe("careers-mini", () => {
  it("starts at pos 0 turn 1", () => {
    const s = initialState(1, S);
    expect(s.pos).toBe(0);
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("rolling");
  });
  it("roll advances 1-6", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.pos).toBeGreaterThanOrEqual(1);
    expect(s.pos).toBeLessThanOrEqual(6);
    expect(s.lastRoll).not.toBeNull();
  });
  it("score is non-negative", () => {
    let s = initialState(2, S);
    for (let i = 0; i < 80; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase !== "done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
  it("path always reaches end (terminates)", () => {
    let s = initialState(5, S);
    for (let i = 0; i < 200; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase !== "done") s = reducer(s, { type: "next" });
      if (s.phase === "done") break;
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(s.pos).toBeLessThanOrEqual(PATH_LEN - 1);
  });
});
