import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, FLOORS, targetFor } from "./state.js";

const S = { dummy: false };

describe("dice-tower-mini", () => {
  it("starts at floor 1, no attempts", () => {
    const s = initialState(1, S);
    expect(s.floor).toBe(1);
    expect(s.attempts).toBe(0);
  });
  it("targetFor scales with floor", () => {
    expect(targetFor(1)).toBeLessThan(targetFor(8));
    expect(targetFor(10)).toBeLessThanOrEqual(11);
  });
  it("climb produces dice 1..6", () => {
    const s = reducer(initialState(2, S), { type: "climb" });
    expect(s.rolls).not.toBeNull();
    expect(s.rolls![0]).toBeGreaterThanOrEqual(1);
    expect(s.rolls![0]).toBeLessThanOrEqual(6);
  });
  it("isTerminal null at start", () => {
    expect(isTerminal(initialState(3, S))).toBeNull();
  });
  it("eventually ends within many turns", () => {
    let s = initialState(4, S);
    for (let i = 0; i < FLOORS * 6 && s.phase !== "done"; i++) {
      if (s.phase === "roll") s = reducer(s, { type: "climb" });
      else s = reducer(s, { type: "next" });
    }
    expect(s.phase).toBe("done");
  });
  it("score never decreases", () => {
    let s = initialState(11, S);
    let last = s.score;
    for (let i = 0; i < 30 && s.phase !== "done"; i++) {
      if (s.phase === "roll") s = reducer(s, { type: "climb" });
      else s = reducer(s, { type: "next" });
      expect(s.score).toBeGreaterThanOrEqual(last);
      last = s.score;
    }
  });
});
