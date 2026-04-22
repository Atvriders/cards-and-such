import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PADDLE_Y, BALL_R } from "./state.js";
import type { BouncerState } from "./state.js";

const settings = { difficulty: "medium" as const, lives: "3" as const };

describe("initialState", () => {
  it("starts with correct lives", () => {
    const s = initialState(42, settings);
    expect(s.lives).toBe(3);
  });

  it("starts with one ball and not started", () => {
    const s = initialState(42, settings);
    expect(s.balls).toHaveLength(1);
    expect(s.started).toBe(false);
  });

  it("score starts at 0 and not over", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("release action", () => {
  it("sets started=true", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "release" });
    expect(after.started).toBe(true);
  });

  it("ignores release if already started", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "release" });
    const again = reducer(started, { type: "release" });
    expect(again).toBe(started);
  });
});

describe("tick when not started", () => {
  it("ball does not move before release", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.balls[0]!.y).toBe(s.balls[0]!.y);
  });
});

describe("paddle bounce increases score", () => {
  it("score increments when ball hits paddle", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "release" });
    // Position ball just above paddle, moving down
    const modified: BouncerState = {
      ...started,
      balls: [{
        id: 1,
        x: 0.5,
        y: PADDLE_Y - BALL_R - 0.005,
        vx: 0,
        vy: 0.5,
      }],
      paddleX: 0.5,
    };
    const after = reducer(modified, { type: "tick", dt: 0.1 });
    expect(after.score).toBeGreaterThan(0);
    expect(after.balls[0]!.vy).toBeLessThan(0); // bounced upward
  });
});

describe("ball falls off bottom: lose a life", () => {
  it("lives decrements when ball escapes", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "release" });
    const modified: BouncerState = {
      ...started,
      balls: [{ id: 1, x: 0.5, y: 0.99, vx: 0, vy: 0.5 }],
      paddleX: 0.0, // paddle far away
    };
    const after = reducer(modified, { type: "tick", dt: 0.5 });
    expect(after.lives).toBeLessThan(3);
  });
});

describe("game over when no lives left and ball gone", () => {
  it("sets over=true when lives=0 and no balls", () => {
    const s = initialState(42, settings);
    const started = reducer(s, { type: "release" });
    const modified: BouncerState = {
      ...started,
      balls: [{ id: 1, x: 0.5, y: 0.99, vx: 0, vy: 0.5 }],
      lives: 1,
      paddleX: 0.0,
    };
    const after = reducer(modified, { type: "tick", dt: 0.5 });
    expect(after.over).toBe(true);
  });
});

describe("movePaddle", () => {
  it("moves paddle to clamped position", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "movePaddle", x: 0.8 });
    expect(after.paddleX).toBeCloseTo(0.8, 2);
  });

  it("clamps paddle to valid range", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "movePaddle", x: -1.0 });
    const half = s.paddleWidth / 2;
    expect(after.paddleX).toBeGreaterThanOrEqual(half);
  });
});

describe("isTerminal", () => {
  it("returns null during game", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(42, settings), over: true, score: 42 };
    expect(isTerminal(s)!.score).toBe(42);
  });

  it("no-ops when already over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after).toBe(s);
  });
});
