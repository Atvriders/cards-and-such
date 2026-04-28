import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, score, DAYS } from "./state.js";

const S = { dummy: false };

describe("payday-mini", () => {
  it("starts at day 1 with $200", () => {
    const s = initialState(1, S);
    expect(s.day).toBe(1);
    expect(s.bank).toBe(200);
  });
  it("roll logs an event", () => {
    const s = reducer(initialState(1, S), { type: "roll" });
    expect(s.log.length).toBeGreaterThanOrEqual(1);
    expect(s.lastRoll).not.toBeNull();
  });
  it("score never below 0", () => {
    let s = initialState(2, S);
    for (let i = 0; i < DAYS + 5; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase !== "done") s = reducer(s, { type: "next" });
    }
    expect(score(s)).toBeGreaterThanOrEqual(0);
  });
  it("ends after 30 days", () => {
    let s = initialState(3, S);
    for (let i = 0; i < DAYS + 5; i++) {
      s = reducer(s, { type: "roll" });
      if (s.phase !== "done") s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
  });
});
