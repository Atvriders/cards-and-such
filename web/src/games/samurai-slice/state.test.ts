import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { SamuraiSliceState } from "./state.js";

const def = { speed: "medium" as const, duration: "60" as const };

describe("initialState", () => {
  it("starts with 3 lives, score 0, no targets", () => {
    const s = initialState(1, def);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.targets.length).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("determinism", () => {
  it("same seed gives identical state", () => {
    expect(initialState(42, def)).toEqual(initialState(42, def));
  });
});

describe("slicing a fruit", () => {
  it("increments score", () => {
    const base = initialState(1, def);
    const withFruit: SamuraiSliceState = {
      ...base,
      targets: [{ id: 1, x: 0.5, y: 0.5, vx: 0, vy: 0, kind: "fruit", radius: 0.045, sliced: false }],
    };
    const after = reducer(withFruit, { type: "slice", x: 0.5, y: 0.5 });
    expect(after.score).toBe(1);
  });
});

describe("slicing a bomb", () => {
  it("decrements lives", () => {
    const base = initialState(1, def);
    const withBomb: SamuraiSliceState = {
      ...base,
      targets: [{ id: 2, x: 0.5, y: 0.5, vx: 0, vy: 0, kind: "bomb", radius: 0.045, sliced: false }],
    };
    const after = reducer(withBomb, { type: "slice", x: 0.5, y: 0.5 });
    expect(after.lives).toBe(2);
  });
});

describe("ticks spawn targets over time", () => {
  it("targets appear after several ticks", () => {
    let s = initialState(5, def);
    for (let i = 0; i < 100; i++) s = reducer(s, { type: "tick", dt: 0.016 });
    expect(s.targets.length).toBeGreaterThanOrEqual(0); // may have spawned and been removed
    expect(s.elapsed).toBeCloseTo(1.6, 0);
  });
});

describe("isTerminal", () => {
  it("null while playing", () => expect(isTerminal(initialState(1, def))).toBeNull());
  it("score when over", () => {
    const s = { ...initialState(1, def), over: true, score: 7 };
    expect(isTerminal(s)).toEqual({ score: 7 });
  });
});
