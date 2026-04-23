import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { TapRunnerState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("player starts on ground, not over", () => {
    const s = initialState(42, settings);
    expect(s.playerY).toBe(0);
    expect(s.over).toBe(false);
  });

  it("distance and speed are initialized", () => {
    const s = initialState(42, settings);
    expect(s.distance).toBe(0);
    expect(s.speed).toBeGreaterThan(0);
  });
});

describe("tapDown action", () => {
  it("jumps from ground", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tapDown" });
    expect(after.playerVy).toBeGreaterThan(0);
  });

  it("engages glide when airborne", () => {
    const s: TapRunnerState = { ...initialState(42, settings), playerY: 0.2, playerVy: 0.1 };
    const after = reducer(s, { type: "tapDown" });
    expect(after.holding).toBe(true);
  });
});

describe("tapUp action", () => {
  it("releases glide", () => {
    const s = { ...initialState(42, settings), holding: true };
    const after = reducer(s, { type: "tapUp" });
    expect(after.holding).toBe(false);
  });
});

describe("tick - physics", () => {
  it("player falls when airborne without holding", () => {
    const s: TapRunnerState = { ...initialState(42, settings), playerY: 0.3, playerVy: 0, holding: false };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.playerY).toBeLessThan(0.3);
  });

  it("glide has lower gravity than normal fall", () => {
    const base: TapRunnerState = { ...initialState(42, settings), playerY: 0.5, playerVy: 0 };
    const normal = reducer({ ...base, holding: false }, { type: "tick", dt: 0.2 });
    const glide  = reducer({ ...base, holding: true  }, { type: "tick", dt: 0.2 });
    // With glide, Y decreases more slowly (falls less)
    expect(glide.playerY).toBeGreaterThan(normal.playerY);
  });

  it("distance increases on tick", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.distance).toBeGreaterThan(0);
  });
});

describe("collision", () => {
  it("game over when player hits obstacle", () => {
    const s: TapRunnerState = {
      ...initialState(42, settings),
      playerY: 0,
      obstacles: [{ id: 1, x: 0.12, kind: "low", w: 0.04, h: 0.10 }],
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
    const s = { ...initialState(42, settings), over: true, distance: 4.0 };
    expect(isTerminal(s)!.score).toBe(400);
  });
});
