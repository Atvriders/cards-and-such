import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { ramps: "3" as const };

describe("initialState", () => {
  it("starts with 3 lives, score 0, not over", () => {
    const s = initialState(1, defaultSettings);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
    expect(s.ramps.length).toBe(3);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("jump", () => {
  it("jump when not in air sets inAir and positive velocityY", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "jump" });
    expect(after.inAir).toBe(true);
    expect(after.velocityY).toBeGreaterThan(0);
  });

  it("jump while in air is ignored", () => {
    const s = { ...initialState(1, defaultSettings), inAir: true, velocityY: 5 };
    const after = reducer(s, { type: "jump" });
    expect(after.velocityY).toBe(5);
  });
});

describe("throttle", () => {
  it("throttle increases speed", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "throttle" });
    expect(after.speed).toBeGreaterThan(s.speed);
  });

  it("speed is capped at 8", () => {
    let s = initialState(1, defaultSettings);
    for (let i = 0; i < 20; i++) s = reducer(s, { type: "throttle" });
    expect(s.speed).toBe(8);
  });
});

describe("tick", () => {
  it("bikeX advances each tick", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "tick" });
    expect(after.bikeX).toBeGreaterThan(s.bikeX);
    expect(after.ticks).toBe(1);
  });
});

describe("isTerminal", () => {
  it("returns null when not over", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, defaultSettings), over: true, score: 400 };
    expect(isTerminal(s)?.score).toBe(400);
  });
});
