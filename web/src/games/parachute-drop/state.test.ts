import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { ParachuteDropState } from "./state.js";

const def = { wind: "none" as const, lives: "3" as const };

describe("initialState", () => {
  it("starts with lives, empty sky, score 0", () => {
    const s = initialState(1, def);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.parachutists.length).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("determinism", () => {
  it("same seed produces same state", () => {
    expect(initialState(99, def)).toEqual(initialState(99, def));
  });
});

describe("move action", () => {
  it("moves landing zone and clamps to bounds", () => {
    const s = initialState(1, def);
    const moved = reducer(s, { type: "move", x: 0.3 });
    expect(moved.zone).toBeCloseTo(0.3);
    const far = reducer(s, { type: "move", x: 0.0 });
    expect(far.zone).toBeGreaterThan(0);
  });
});

describe("landing in zone gives score", () => {
  it("score increases when parachutist lands on zone", () => {
    const base = initialState(1, def);
    const withP: ParachuteDropState = {
      ...base,
      zone: 0.5,
      zoneW: 0.14,
      parachutists: [{ id: 0, x: 0.5, y: 0.89, vy: 0.15, vx: 0 }],
    };
    const after = reducer(withP, { type: "tick", dt: 0.016 });
    expect(after.score).toBe(1);
  });
});

describe("missing zone costs a life", () => {
  it("lives decreases when parachutist lands outside zone", () => {
    const base = initialState(1, def);
    const withP: ParachuteDropState = {
      ...base,
      zone: 0.5,
      zoneW: 0.14,
      parachutists: [{ id: 0, x: 0.05, y: 0.89, vy: 0.15, vx: 0 }],
    };
    const after = reducer(withP, { type: "tick", dt: 0.016 });
    expect(after.lives).toBe(2);
  });
});

describe("isTerminal", () => {
  it("null while alive", () => expect(isTerminal(initialState(1, def))).toBeNull());
  it("score when over", () => {
    const s = { ...initialState(1, def), over: true, score: 12 };
    expect(isTerminal(s)).toEqual({ score: 12 });
  });
});
