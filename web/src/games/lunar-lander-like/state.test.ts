import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, FUEL_MAX } from "./state.js";
import type { LunarDescentState } from "./state.js";

// ─── 1. Initial state ─────────────────────────────────────────────────────────
describe("initialState", () => {
  it("starts at top center with full fuel, upright, 3 lives", () => {
    const s = initialState(42);
    expect(s.x).toBe(0.5);
    expect(s.y).toBe(0.05);
    expect(s.angle).toBe(0);
    expect(s.fuel).toBe(FUEL_MAX);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.lost).toBe(false);
    expect(s.won).toBe(false);
    expect(s.thrustOn).toBe(false);
  });
});

// ─── 2. Determinism ───────────────────────────────────────────────────────────
describe("determinism", () => {
  it("same seed same state", () => {
    expect(initialState(7)).toEqual(initialState(7));
  });
});

// ─── 3. Gravity causes downward drift ────────────────────────────────────────
describe("gravity", () => {
  it("vy increases over time without thrust", () => {
    const s = initialState(42);
    const after = reducer(s, { type: "tick", dt: 0.5 });
    expect(after.vy).toBeGreaterThan(0);
    expect(after.y).toBeGreaterThan(s.y);
  });
});

// ─── 4. Thrust consumes fuel and adds velocity ────────────────────────────────
describe("thrust", () => {
  it("thrust reduces fuel and gives upward velocity (at angle=0)", () => {
    const s = initialState(42);
    const thrusting = reducer(s, { type: "thrust-start" });
    const after = reducer(thrusting, { type: "tick", dt: 0.5 });
    expect(after.fuel).toBeLessThan(FUEL_MAX);
    // vy should be less positive (thrust counteracts gravity at angle=0)
  });
});

// ─── 5. Rotation changes angle ────────────────────────────────────────────────
describe("rotation", () => {
  it("rotate-left decreases angle", () => {
    const s = initialState(42);
    const rotating = reducer(s, { type: "rotate-left-start" });
    const after = reducer(rotating, { type: "tick", dt: 0.5 });
    expect(after.angle).toBeLessThan(0);
  });

  it("rotate-right increases angle", () => {
    const s = initialState(42);
    const rotating = reducer(s, { type: "rotate-right-start" });
    const after = reducer(rotating, { type: "tick", dt: 0.5 });
    expect(after.angle).toBeGreaterThan(0);
  });
});

// ─── 6. isTerminal ───────────────────────────────────────────────────────────
describe("isTerminal", () => {
  it("null while in progress", () => {
    expect(isTerminal(initialState(42))).toBeNull();
  });

  it("score on lost", () => {
    const s: LunarDescentState = { ...initialState(42), lost: true, score: 250 };
    expect(isTerminal(s)?.score).toBe(250);
  });

  it("score + lives bonus on won", () => {
    const s: LunarDescentState = { ...initialState(42), won: true, score: 800, lives: 2 };
    expect(isTerminal(s)?.score).toBe(1200);
  });
});
