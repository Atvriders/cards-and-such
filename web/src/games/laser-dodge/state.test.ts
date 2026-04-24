import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { difficulty: "normal" as const };

describe("initialState", () => {
  it("starts with player centered, lasers, not over", () => {
    const s = initialState(42, settings);
    expect(s.playerX).toBe(0.5);
    expect(s.playerY).toBe(0.5);
    expect(s.lasers.length).toBeGreaterThan(0);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
  });
});

describe("determinism", () => {
  it("same seed produces same number of lasers", () => {
    const s1 = initialState(77, settings);
    const s2 = initialState(77, settings);
    expect(s1.lasers.length).toBe(s2.lasers.length);
    expect(s1.lasers[0]!.oscSpeed).toBeCloseTo(s2.lasers[0]!.oscSpeed, 10);
  });
});

describe("setPos", () => {
  it("moves player to safe spot", () => {
    const s = initialState(42, settings);
    // Move to a corner unlikely to be hit
    const after = reducer(s, { type: "setPos", x: 0.05, y: 0.05 });
    expect(after.playerX).toBeCloseTo(0.05, 2);
  });
});

describe("tick moves lasers", () => {
  it("lasers change fixedPos after tick", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.5 });
    const changed = after.lasers.some((l, i) => l.fixedPos !== s.lasers[i]!.fixedPos);
    expect(changed).toBe(true);
  });
});

describe("collision detection", () => {
  it("over=true when player touches a laser", () => {
    const s = initialState(42, settings);
    // Force a horizontal laser at y=0.5 spanning the full width
    const withLaser: typeof s = {
      ...s,
      lasers: [{ id: 99, axis: "h", fixedPos: 0.5, minCoord: 0, maxCoord: 1, oscMin: 0.1, oscMax: 0.9, oscSpeed: 0.1, oscDir: 1, color: "#ff0000" }],
    };
    const after = reducer(withLaser, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null when in progress", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
  it("score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 55 };
    expect(isTerminal(s)).toEqual({ score: 55 });
  });
});
