import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("Firework Show", () => {
  it("initializes correctly", () => {
    const s = initialState(42);
    expect(s.tick).toBe(0);
    expect(s.score).toBe(0);
    expect(s.multiplier).toBe(1);
    expect(s.phase).toBe("playing");
    expect(s.targets).toHaveLength(0);
  });

  it("tick increments counter", () => {
    const s = initialState(42);
    const s2 = reducer(s, { type: "tick" });
    expect(s2.tick).toBe(1);
  });

  it("tapping a valid target increases score", () => {
    const s = initialState(42);
    // inject a target
    const s1 = { ...s, targets: [{ id: 0, x: 50, y: 50, radius: 10, color: "gold" as const, timeLeft: 30, points: 25, hit: false }] };
    const s2 = reducer(s1, { type: "tap", targetId: 0 });
    expect(s2.score).toBe(25); // 25 * multiplier(1)
    expect(s2.hits).toBe(1);
    expect(s2.targets[0]?.hit).toBe(true);
  });

  it("multiplier increases on consecutive hits", () => {
    const s = initialState(42);
    const s1 = { ...s, targets: [{ id: 0, x: 50, y: 50, radius: 10, color: "red" as const, timeLeft: 30, points: 10, hit: false }] };
    const s2 = reducer(s1, { type: "tap", targetId: 0 });
    expect(s2.multiplier).toBeGreaterThan(1);
  });

  it("game ends at maxTicks", () => {
    const s = { ...initialState(42), tick: 399 };
    const s2 = reducer(s, { type: "tick" });
    expect(s2.phase).toBe("done");
  });

  it("isTerminal returns null while playing", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("isTerminal returns score when done", () => {
    const s = { ...initialState(42), phase: "done" as const, score: 5000 };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });
});
