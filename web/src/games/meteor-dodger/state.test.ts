import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { MeteorDodgerState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("ship starts at center, not over", () => {
    const s = initialState(42, settings);
    expect(s.shipX).toBeCloseTo(0.5);
    expect(s.shipY).toBeCloseTo(0.75);
    expect(s.over).toBe(false);
  });

  it("starts with 0 elapsed time and no meteors", () => {
    const s = initialState(42, settings);
    expect(s.elapsed).toBe(0);
    expect(s.meteors.length).toBe(0);
  });
});

describe("move action", () => {
  it("sets dx and dy", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "move", dx: 1, dy: -1 });
    expect(after.dx).toBe(1);
    expect(after.dy).toBe(-1);
  });
});

describe("tick - ship movement", () => {
  it("ship moves right when dx=1", () => {
    const s = { ...initialState(42, settings), dx: 1 as 1, dy: 0 as 0 };
    const after = reducer(s, { type: "tick", dt: 0.2 });
    expect(after.shipX).toBeGreaterThan(0.5);
  });

  it("ship is clamped to boundaries", () => {
    const s = { ...initialState(42, settings), shipX: 0.99, dx: 1 as 1, dy: 0 as 0 };
    const after = reducer(s, { type: "tick", dt: 1.0 });
    expect(after.shipX).toBeLessThanOrEqual(1);
  });

  it("elapsed time increases", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.elapsed).toBeCloseTo(0.5);
  });
});

describe("collision", () => {
  it("game over when meteor hits ship", () => {
    const s: MeteorDodgerState = {
      ...initialState(42, settings),
      shipX: 0.5,
      shipY: 0.5,
      meteors: [{ id: 1, x: 0.5, y: 0.5, r: 0.05, vy: 0 }],
    };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });

  it("no collision when meteor is far away", () => {
    const s: MeteorDodgerState = {
      ...initialState(42, settings),
      shipX: 0.1,
      shipY: 0.1,
      meteors: [{ id: 1, x: 0.9, y: 0.9, r: 0.04, vy: 0 }],
    };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(false);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns floor of elapsed when over", () => {
    const s = { ...initialState(42, settings), over: true, elapsed: 12.7 };
    expect(isTerminal(s)!.score).toBe(12);
  });

  it("no-ops when already over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "move", dx: 1, dy: 0 });
    expect(after).toBe(s);
  });
});
