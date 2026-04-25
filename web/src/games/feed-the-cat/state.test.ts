import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Feed the Cat", () => {
  it("initializes with correct defaults", () => {
    const s = initialState(7);
    expect(s.phase).toBe("playing");
    expect(s.tick).toBe(0);
    expect(s.hunger).toBe(70);
    expect(s.score).toBe(0);
    expect(s.items).toHaveLength(0);
  });

  it("tick increments tick count", () => {
    const s = initialState(7);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.tick).toBe(1);
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(7))).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = { ...initialState(7), phase: "done" as const, score: 100 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(20);
  });

  it("game ends when maxTicks reached", () => {
    let s = initialState(7);
    s = { ...s, tick: s.maxTicks - 1 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.phase).toBe("done");
  });

  it("hunger starts at 70 and decreases over time", () => {
    let s = initialState(7);
    for (let i = 0; i < 10; i++) s = reducer(s, { type: "tick" });
    expect(s.hunger).toBeLessThanOrEqual(70);
  });
});
