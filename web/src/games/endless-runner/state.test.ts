import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { EndlessRunnerState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("player starts on ground with no velocity", () => {
    const s = initialState(42, settings);
    expect(s.playerY).toBe(0);
    expect(s.playerVy).toBe(0);
  });

  it("starts with 0 distance and not over", () => {
    const s = initialState(42, settings);
    expect(s.distance).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("jump action", () => {
  it("sets positive playerVy when on ground", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "jump" });
    expect(after.playerVy).toBeGreaterThan(0);
  });

  it("ignores jump when already airborne", () => {
    const s = initialState(42, settings);
    const jumped = reducer(s, { type: "jump" });
    const again = reducer(jumped, { type: "jump" });
    expect(again.playerVy).toBe(jumped.playerVy);
  });
});

describe("duck action", () => {
  it("sets ducking flag", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "duck", on: true });
    expect(after.ducking).toBe(true);
    const off = reducer(after, { type: "duck", on: false });
    expect(off.ducking).toBe(false);
  });
});

describe("tick - distance increases", () => {
  it("distance increases on each tick", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.distance).toBeGreaterThan(0);
  });
});

describe("tick - speed ramps up", () => {
  it("speed increases over time", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 5 });
    expect(after.speed).toBeGreaterThan(s.speed);
  });
});

describe("collision with low obstacle", () => {
  it("sets over=true when running into cactus", () => {
    const s = initialState(42, settings);
    const modified: EndlessRunnerState = {
      ...s,
      obstacles: [{ id: 1, x: 0.15, type: "low" }], // directly in front of player
      playerY: 0, // on ground
    };
    const after = reducer(modified, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("collision with high obstacle while standing", () => {
  it("sets over=true when running into overhead bar without ducking", () => {
    const s = initialState(42, settings);
    const modified: EndlessRunnerState = {
      ...s,
      obstacles: [{ id: 2, x: 0.15, type: "high" }],
      playerY: 0,
      ducking: false,
    };
    const after = reducer(modified, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("high obstacle missed while ducking", () => {
  it("no collision when ducking under high obstacle", () => {
    const s = initialState(42, settings);
    const modified: EndlessRunnerState = {
      ...s,
      obstacles: [{ id: 3, x: 0.155, type: "high" }],
      playerY: 0,
      ducking: true,
    };
    const after = reducer(modified, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(false);
  });
});

describe("isTerminal", () => {
  it("returns null during game", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score based on distance when over", () => {
    const s = { ...initialState(42, settings), over: true, distance: 2.5 };
    expect(isTerminal(s)!.score).toBe(250);
  });

  it("no-ops when already over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after).toBe(s);
  });
});
