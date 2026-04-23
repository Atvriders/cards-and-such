import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { HelicopterState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("helicopter starts at mid height not over", () => {
    const s = initialState(42, settings);
    expect(s.heliY).toBeCloseTo(0.4);
    expect(s.over).toBe(false);
  });

  it("no walls at start", () => {
    const s = initialState(42, settings);
    expect(s.walls.length).toBe(0);
  });
});

describe("hold action", () => {
  it("sets holding flag", () => {
    const s = initialState(42, settings);
    const on = reducer(s, { type: "hold", on: true });
    expect(on.holding).toBe(true);
    const off = reducer(on, { type: "hold", on: false });
    expect(off.holding).toBe(false);
  });
});

describe("tick - physics", () => {
  it("heli falls when not holding", () => {
    const s = { ...initialState(42, settings), heliY: 0.5, heliVy: 0 };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.heliY).toBeGreaterThan(0.5);
  });

  it("heli rises when holding", () => {
    const s = { ...initialState(42, settings), heliY: 0.5, heliVy: 0, holding: true };
    const after = reducer(s, { type: "tick", dt: 0.2 });
    expect(after.heliY).toBeLessThan(0.5);
  });

  it("distance increases on tick", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.distance).toBeGreaterThan(0);
  });
});

describe("collision", () => {
  it("game over when heli hits ceiling", () => {
    const s: HelicopterState = { ...initialState(42, settings), heliY: 0.01, heliVy: -1, holding: true };
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.over).toBe(true);
  });

  it("game over when heli hits wall", () => {
    const s: HelicopterState = {
      ...initialState(42, settings),
      heliY: 0.1, // near top
      heliVy: 0,
      walls: [{ id: 1, x: 0.12, topH: 0.3, botH: 0.2 }], // wall overlapping heli with top wall covering 0.3 of height
    };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns distance score when over", () => {
    const s = { ...initialState(42, settings), over: true, distance: 3.5 };
    expect(isTerminal(s)!.score).toBe(350);
  });
});
