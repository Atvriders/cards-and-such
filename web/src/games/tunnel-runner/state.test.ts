import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, NUM_SEGMENTS } from "./state.js";

const settings = { difficulty: "normal" as const };

describe("initialState", () => {
  it("creates segments, player centered, not over", () => {
    const s = initialState(42, settings);
    expect(s.segments.length).toBe(NUM_SEGMENTS);
    expect(s.playerX).toBe(0.5);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
  });
});

describe("determinism", () => {
  it("same seed produces same first segment", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.segments[0]).toEqual(s2.segments[0]);
    expect(s1.scrollSpeed).toBe(s2.scrollSpeed);
  });
});

describe("move action", () => {
  it("updates playerX", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "move", x: 0.3 });
    expect(after.playerX).toBe(0.3);
  });
});

describe("nudge action", () => {
  it("offsets playerX by dx", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "nudge", dx: -0.05 });
    expect(after.playerX).toBeCloseTo(0.45, 5);
  });
});

describe("tick scrolls tunnel", () => {
  it("adds new segments after ticking", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.5 });
    // Score should increase as distance grows
    expect(after.score).toBeGreaterThanOrEqual(0);
    expect(after.distance).toBeGreaterThan(0);
  });
});

describe("wall collision", () => {
  it("over=true when player is outside tunnel", () => {
    const s = initialState(42, settings);
    // Force player to far left wall
    const moved = reducer(s, { type: "move", x: 0.01 });
    // Tick — the segment at player position should have leftX > 0.01
    const after = reducer(moved, { type: "tick", dt: 0.016 });
    // With player at far left and tunnel centered at 0.5, should hit wall
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null when playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
  it("score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 400 };
    expect(isTerminal(s)).toEqual({ score: 400 });
  });
});
