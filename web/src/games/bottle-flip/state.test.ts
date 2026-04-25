import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

describe("BottleFlip initialState", () => {
  it("starts in aiming phase with score 0", () => {
    const s = initialState();
    expect(s.phase).toBe("aiming");
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
  });

  it("power oscillates between 0 and 1", () => {
    const s = initialState();
    expect(s.power).toBeGreaterThanOrEqual(0);
    expect(s.power).toBeLessThanOrEqual(1);
  });
});

describe("BottleFlip tick in aiming", () => {
  it("power increases when dir is 1", () => {
    const s = { ...initialState(), power: 0, powerDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.2 });
    expect(s2.power).toBeGreaterThan(0);
  });

  it("power decreases when dir is -1", () => {
    const s = { ...initialState(), power: 0.8, powerDir: -1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.power).toBeLessThan(0.8);
  });

  it("power bounces at maximum", () => {
    const s = { ...initialState(), power: 0.99, powerDir: 1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.powerDir).toBe(-1);
  });

  it("power bounces at minimum", () => {
    const s = { ...initialState(), power: 0.01, powerDir: -1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.1 });
    expect(s2.powerDir).toBe(1);
  });
});

describe("BottleFlip flip action", () => {
  it("transitions from aiming to flipping", () => {
    const s = { ...initialState(), power: 0.5 };
    const s2 = reducer(s, { type: "flip" });
    expect(s2.phase).toBe("flipping");
    expect(s2.rotSpeed).toBeGreaterThan(0);
  });

  it("rotation speed is proportional to power", () => {
    const s1 = reducer({ ...initialState(), power: 0 }, { type: "flip" });
    const s2 = reducer({ ...initialState(), power: 1 }, { type: "flip" });
    expect(s2.rotSpeed).toBeGreaterThan(s1.rotSpeed);
  });
});

describe("BottleFlip isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score in gameover phase", () => {
    const s = { ...initialState(), phase: "gameover" as const, score: 42 };
    expect(isTerminal(s)?.score).toBe(42);
  });
});
