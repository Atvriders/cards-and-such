import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { difficulty: "normal" as const };

describe("initialState", () => {
  it("starts with plane centered, no obstacles, not over", () => {
    const s = initialState(42, settings);
    expect(s.planeX).toBe(0.5);
    expect(s.planeY).toBe(0.5);
    expect(s.obstacles).toHaveLength(0);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
  });
});

describe("determinism", () => {
  it("same seed produces same scrollSpeed", () => {
    const s1 = initialState(99, settings);
    const s2 = initialState(99, settings);
    expect(s1.scrollSpeed).toBe(s2.scrollSpeed);
  });
});

describe("move action", () => {
  it("changes plane position", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "move", x: 0.3, y: 0.4 });
    expect(after.planeX).not.toBe(s.planeX);
  });
});

describe("tick spawns obstacles", () => {
  it("spawns obstacles after spawn interval", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 1.6 });
    expect(after.obstacles.length).toBeGreaterThan(0);
  });
});

describe("collision detection", () => {
  it("sets over=true when plane collides with obstacle", () => {
    const s = initialState(42, settings);
    // Place obstacle directly on plane
    const withObstacle: typeof s = {
      ...s,
      obstacles: [{ id: 1, x: 0.5, y: 0.5, w: 0.1, h: 0.1 }],
    };
    const after = reducer(withObstacle, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null when in progress", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
  it("score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 300 };
    expect(isTerminal(s)).toEqual({ score: 300 });
  });
});
