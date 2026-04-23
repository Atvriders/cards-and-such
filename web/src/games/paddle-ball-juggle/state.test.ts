import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { PaddleBallState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("starts with 1 ball, 3 lives, not over", () => {
    const s = initialState(42, settings);
    expect(s.balls.length).toBe(1);
    expect(s.lives).toBe(3);
    expect(s.over).toBe(false);
  });

  it("score and bounceCount start at 0", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.bounceCount).toBe(0);
  });
});

describe("movePaddle", () => {
  it("updates paddleX within bounds", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "movePaddle", x: 0.7 });
    expect(after.paddleX).toBeCloseTo(0.7, 1);
  });

  it("clamps paddleX to within paddle half-width of edges", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "movePaddle", x: 0 });
    expect(after.paddleX).toBeGreaterThan(0);
  });
});

describe("tick - ball physics", () => {
  it("ball y increases when moving downward", () => {
    const s: PaddleBallState = {
      ...initialState(42, settings),
      balls: [{ id: 1, x: 0.5, y: 0.5, vx: 0, vy: 0.5, r: 0.022, active: true }],
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.balls[0]?.y).toBeGreaterThan(0.5);
  });

  it("ball bounces off left wall", () => {
    const s: PaddleBallState = {
      ...initialState(42, settings),
      balls: [{ id: 1, x: 0.02, y: 0.5, vx: -0.5, vy: 0, r: 0.022, active: true }],
    };
    const after = reducer(s, { type: "tick", dt: 0.05 });
    expect(after.balls[0]?.vx).toBeGreaterThan(0);
  });
});

describe("life loss", () => {
  it("loses a life when ball falls past paddle", () => {
    const s: PaddleBallState = {
      ...initialState(42, settings),
      balls: [{ id: 1, x: 0.5, y: 0.95, vx: 0, vy: 0.8, r: 0.022, active: true }],
      lives: 3,
    };
    // Simulate several ticks to let ball fall off
    let ns = s;
    for (let i = 0; i < 10; i++) ns = reducer(ns, { type: "tick", dt: 0.05 });
    // Ball should have fallen; we check lives reduced OR new ball spawned
    expect(ns.lives).toBeLessThan(3);
  });
});

describe("isTerminal", () => {
  it("null during play", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, settings), over: true, score: 42 };
    expect(isTerminal(s)!.score).toBe(42);
  });

  it("no-ops when already over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "movePaddle", x: 0.5 });
    expect(after).toBe(s);
  });
});
