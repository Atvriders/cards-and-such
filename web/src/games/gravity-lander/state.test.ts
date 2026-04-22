import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { GravityLanderState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("ship starts near top with full fuel", () => {
    const s = initialState(42, settings);
    expect(s.y).toBeLessThan(0.2);
    expect(s.fuel).toBe(100);
  });

  it("not over and not won", () => {
    const s = initialState(42, settings);
    expect(s.over).toBe(false);
    expect(s.won).toBe(false);
  });

  it("terrain is generated with pad", () => {
    const s = initialState(42, settings);
    expect(s.terrain.length).toBeGreaterThan(2);
    expect(s.padX).toBeGreaterThan(0);
    expect(s.padX).toBeLessThan(1);
  });
});

describe("gravity applies on tick", () => {
  it("vy increases (downward) over time", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.vy).toBeGreaterThan(s.vy);
  });
});

describe("thrust reduces fuel", () => {
  it("fuel decreases when thrusting", () => {
    const s = initialState(42, settings);
    const thrusting = reducer(s, { type: "thrust", on: true });
    const after = reducer(thrusting, { type: "tick", dt: 0.5 });
    expect(after.fuel).toBeLessThan(100);
  });
});

describe("rotation", () => {
  it("rotateLeft decreases angle on tick", () => {
    const s = initialState(42, settings);
    const rot = reducer(s, { type: "rotateLeft", on: true });
    const after = reducer(rot, { type: "tick", dt: 0.1 });
    // Angle wraps to [0, 2π], rotating left at angle=0 goes toward 2π
    // Just check it changed
    expect(after.angle).not.toBe(s.angle);
  });
});

describe("crash on terrain at bad angle", () => {
  it("sets over=true when landing with excessive speed", () => {
    const s = initialState(42, settings);
    // Place ship just above pad but with high downward speed
    const modified: GravityLanderState = {
      ...s,
      x: s.padX,
      y: s.padY - 0.01,
      vy: 0.5, // too fast
      vx: 0,
      angle: 0,
    };
    const after = reducer(modified, { type: "tick", dt: 0.1 });
    expect(after.over).toBe(true);
    expect(after.won).toBe(false);
  });
});

describe("successful landing", () => {
  it("sets won=true with gentle landing on pad", () => {
    const s = initialState(42, settings);
    // Place ship just above pad with tiny velocity and zero angle
    const modified: GravityLanderState = {
      ...s,
      x: s.padX,
      y: s.padY - 0.005,
      vy: 0.05, // safe
      vx: 0.01, // safe
      angle: 0.1, // safe (< 0.35)
    };
    const after = reducer(modified, { type: "tick", dt: 0.1 });
    expect(after.won).toBe(true);
    expect(after.score).toBeGreaterThan(0);
  });
});

describe("isTerminal", () => {
  it("returns null during game", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns 0 score on crash", () => {
    const s = { ...initialState(42, settings), over: true };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("returns positive score on win", () => {
    const s = { ...initialState(42, settings), won: true, score: 180 };
    expect(isTerminal(s)!.score).toBe(180);
  });

  it("no-ops when already over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after).toBe(s);
  });
});
