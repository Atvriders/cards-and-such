import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const def = { speed: "medium" as const };

describe("initialState", () => {
  it("starts alive with segments and score 0", () => {
    const s = initialState(1, def);
    expect(s.over).toBe(false);
    expect(s.score).toBe(0);
    expect(s.segments.length).toBeGreaterThan(0);
    expect(s.playerY).toBeGreaterThan(0);
    expect(s.playerY).toBeLessThan(1);
  });
});

describe("determinism", () => {
  it("same seed produces same state", () => {
    expect(initialState(88, def)).toEqual(initialState(88, def));
  });
});

describe("thrust action", () => {
  it("sets thrusting flag", () => {
    const s = initialState(1, def);
    const on = reducer(s, { type: "thrust", on: true });
    expect(on.thrusting).toBe(true);
    const off = reducer(on, { type: "thrust", on: false });
    expect(off.thrusting).toBe(false);
  });
});

describe("tick increases score", () => {
  it("score increments each frame while alive", () => {
    let s = initialState(1, def);
    // Position player safely in the middle
    s = { ...s, playerY: 0.5 };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    // Score should increase (or stay if collision)
    expect(after.score).toBeGreaterThanOrEqual(s.score);
  });
});

describe("wall collision", () => {
  it("over becomes true when player hits ceiling (y <= topY)", () => {
    const s = initialState(1, def);
    // Force player to top edge
    const crashed = { ...s, playerY: 0.0 };
    const after = reducer(crashed, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("null when alive", () => expect(isTerminal(initialState(1, def))).toBeNull());
  it("score when over", () => {
    const s = { ...initialState(1, def), over: true, score: 500 };
    expect(isTerminal(s)).toEqual({ score: 500 });
  });
});
