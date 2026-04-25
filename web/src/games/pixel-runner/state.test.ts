import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { speed: "normal" as const };

describe("initialState", () => {
  it("starts alive with no obstacles", () => {
    const s = initialState(1, defaultSettings);
    expect(s.alive).toBe(true);
    expect(s.obstacles).toHaveLength(0);
    expect(s.playerY).toBe(0);
    expect(s.score).toBe(0);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(99, defaultSettings);
    const s2 = initialState(99, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("jump", () => {
  it("jump sets positive velocityY when on ground", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "jump" });
    expect(after.velocityY).toBeGreaterThan(0);
  });

  it("jump is ignored when already in air", () => {
    const s = { ...initialState(1, defaultSettings), playerY: 4, velocityY: 3 };
    const after = reducer(s, { type: "jump" });
    expect(after.velocityY).toBe(3); // unchanged
  });
});

describe("tick", () => {
  it("score increases each tick", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "tick" });
    expect(after.score).toBeGreaterThan(s.score);
  });

  it("player falls back to ground after jump", () => {
    let s = initialState(1, defaultSettings);
    s = reducer(s, { type: "jump" });
    // Tick many times until land
    for (let i = 0; i < 20; i++) {
      s = reducer(s, { type: "tick" });
    }
    expect(s.playerY).toBe(0);
  });
});

describe("isTerminal", () => {
  it("returns null when alive", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when dead", () => {
    const s = { ...initialState(1, defaultSettings), alive: false, score: 42 };
    const result = isTerminal(s);
    expect(result?.score).toBe(42);
  });
});
