import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { speed: "normal" as const };

describe("initialState", () => {
  it("starts with full lives, empty field, not over", () => {
    const s = initialState(42, settings);
    expect(s.lives).toBe(5);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
    expect(s.fallingItems).toHaveLength(0);
  });
});

describe("determinism", () => {
  it("produces same state for same seed", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.rngSeed).toBe(s2.rngSeed);
    expect(s1.dropSpeed).toBe(s2.dropSpeed);
  });
});

describe("tick spawns items", () => {
  it("spawns a falling item after spawn interval", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "start" });
    // Tick past spawn interval (2.0 seconds at normal speed)
    const after = reducer(started, { type: "tick", dt: 2.1 });
    expect(after.fallingItems.length).toBeGreaterThan(0);
  });
});

describe("press matching color", () => {
  it("scores 10 when pressing a color with item in zone", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "start" });
    // Manually inject a falling red item in the zone
    const withItem: typeof started = {
      ...started,
      fallingItems: [{ id: 1, color: "red", y: 0.85, x: 0.125 }],
    };
    const after = reducer(withItem, { type: "press", color: "red" });
    expect(after.score).toBe(10);
    expect(after.fallingItems).toHaveLength(0);
  });
});

describe("item missed bottom", () => {
  it("loses a life when item passes y > 1.05", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "start" });
    const withItem: typeof started = {
      ...started,
      fallingItems: [{ id: 1, color: "green", y: 0.99, x: 0.375 }],
    };
    // A tick that moves item past 1.05
    const after = reducer(withItem, { type: "tick", dt: 0.5 });
    expect(after.lives).toBeLessThan(5);
  });
});

describe("game over", () => {
  it("isTerminal returns score when over", () => {
    const s = initialState(42, settings);
    const over: typeof s = { ...s, over: true, score: 50 };
    expect(isTerminal(over)).toEqual({ score: 50 });
  });

  it("isTerminal returns null when in progress", () => {
    const s = initialState(42, settings);
    expect(isTerminal(s)).toBeNull();
  });
});
