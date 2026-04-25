import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { speed: "medium" as const, lives: "3" as const };

describe("initialState", () => {
  it("starts with correct lives, empty eggs, score 0", () => {
    const s = initialState(1, defaultSettings);
    expect(s.lives).toBe(3);
    expect(s.eggs.length).toBe(0);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("tick spawns eggs over time", () => {
  it("eggs appear after enough time has passed", () => {
    let s = initialState(7, defaultSettings);
    // Tick forward 2 seconds in small steps
    for (let i = 0; i < 40; i++) {
      s = reducer(s, { type: "tick", dt: 0.05 });
    }
    expect(s.eggs.length).toBeGreaterThan(0);
  });
});

describe("move action clamps basket", () => {
  it("basket clamped to [0.07, 0.93]", () => {
    const s = initialState(1, defaultSettings);
    const a = reducer(s, { type: "move", x: -5 });
    expect(a.basket).toBe(0.07);
    const b = reducer(s, { type: "move", x: 99 });
    expect(b.basket).toBe(0.93);
  });
});

describe("egg falls through floor — lose life", () => {
  it("life decreases when egg reaches y >= 1.0", () => {
    let s = initialState(1, defaultSettings);
    // Manually inject an egg at y=0.99 moving fast
    s = { ...s, eggs: [{ id: 0, x: 0.5, y: 0.99, vy: 0.5, broken: false }], basket: 0.0 };
    s = reducer(s, { type: "tick", dt: 0.05 });
    expect(s.lives).toBe(2);
  });
});

describe("isTerminal", () => {
  it("null when not over", () => {
    expect(isTerminal(initialState(1, defaultSettings))).toBeNull();
  });
  it("returns score when over", () => {
    const s = { ...initialState(1, defaultSettings), over: true, score: 17 };
    expect(isTerminal(s)).toEqual({ score: 17 });
  });
});
