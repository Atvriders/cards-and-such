import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { FlappyBirdState } from "./state.js";

const settings = {};

describe("initialState", () => {
  it("bird starts at mid height not over", () => {
    const s = initialState(42, settings);
    expect(s.birdY).toBeCloseTo(0.4);
    expect(s.over).toBe(false);
  });

  it("starts with 0 score and no pipes", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.pipes.length).toBe(0);
  });
});

describe("flap action", () => {
  it("gives negative (upward) velocity", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "flap" });
    expect(after.birdVy).toBeLessThan(0);
  });

  it("no-ops when game is over", () => {
    const s = { ...initialState(42, settings), over: true };
    const after = reducer(s, { type: "flap" });
    expect(after).toBe(s);
  });
});

describe("tick - gravity", () => {
  it("bird falls when not flapping", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.birdY).toBeGreaterThan(s.birdY);
  });

  it("bird moves upward after flap on next tick", () => {
    const s = initialState(42, settings);
    const flapped = reducer(s, { type: "flap" });
    const after = reducer(flapped, { type: "tick", dt: 0.05 });
    expect(after.birdY).toBeLessThan(flapped.birdY);
  });
});

describe("collision and game over", () => {
  it("game ends when bird hits floor", () => {
    const s: FlappyBirdState = { ...initialState(42, settings), birdY: 0.99, birdVy: 0.5 };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.over).toBe(true);
  });

  it("game ends when bird hits ceiling", () => {
    const s: FlappyBirdState = { ...initialState(42, settings), birdY: 0.02, birdVy: -2 };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.over).toBe(true);
  });

  it("collision with pipe sets over=true", () => {
    const s: FlappyBirdState = {
      ...initialState(42, settings),
      birdY: 0.5,
      birdVy: 0,
      pipes: [{ id: 1, x: 0.155, gapY: 0.1, passed: false }], // gap far from bird
    };
    const after = reducer(s, { type: "tick", dt: 0.016 });
    expect(after.over).toBe(true);
  });
});

describe("scoring", () => {
  it("score increments when pipe is passed", () => {
    const s: FlappyBirdState = {
      ...initialState(42, settings),
      birdY: 0.5,
      birdVy: 0,
      pipes: [{ id: 1, x: 0.08, gapY: 0.5, passed: false }], // pipe about to be passed
    };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.score).toBe(1);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, settings), over: true, score: 7 };
    expect(isTerminal(s)!.score).toBe(7);
  });
});
