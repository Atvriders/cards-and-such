import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const defaultSettings = { bumpers: "5" as const };

describe("initialState", () => {
  it("starts with 3 lives and score 0", () => {
    const s = initialState(1, defaultSettings);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
    expect(s.bumpers.length).toBe(5);
  });
});

describe("determinism", () => {
  it("same seed produces identical state", () => {
    const s1 = initialState(42, defaultSettings);
    const s2 = initialState(42, defaultSettings);
    expect(s1).toEqual(s2);
  });
});

describe("movePaddle", () => {
  it("clamps paddle within field bounds", () => {
    const s = initialState(1, defaultSettings);
    const left = reducer(s, { type: "movePaddle", x: -100 });
    expect(left.paddleX).toBe(0);
    const right = reducer(s, { type: "movePaddle", x: 9999 });
    expect(right.paddleX).toBe(s.fieldW - s.paddleW);
  });
});

describe("tick", () => {
  it("ball moves each tick", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "tick" });
    const moved = after.ballX !== s.ballX || after.ballY !== s.ballY;
    expect(moved).toBe(true);
    expect(after.ticks).toBe(1);
  });
});

describe("paddleLeft/paddleRight", () => {
  it("paddleLeft moves paddle left", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "paddleLeft" });
    expect(after.paddleX).toBeLessThanOrEqual(s.paddleX);
  });

  it("paddleRight moves paddle right", () => {
    const s = initialState(1, defaultSettings);
    const after = reducer(s, { type: "paddleRight" });
    expect(after.paddleX).toBeGreaterThanOrEqual(s.paddleX);
  });
});

describe("isTerminal", () => {
  it("returns null when not over", () => {
    const s = initialState(1, defaultSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns score when game over", () => {
    const s = { ...initialState(1, defaultSettings), over: true, score: 330 };
    expect(isTerminal(s)?.score).toBe(330);
  });
});
