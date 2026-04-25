import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { difficulty: "medium" as const };

describe("initialState", () => {
  it("starts with 3 lives, score 0, not over", () => {
    const s = initialState(1, settings);
    expect(s.lives).toBe(3);
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });

  it("jumper starts on trampoline at rest", () => {
    const s = initialState(1, settings);
    expect(s.jumperVy).toBe(0);
  });
});

describe("start action", () => {
  it("gives jumper upward velocity", () => {
    const s = initialState(1, settings);
    const after = reducer(s, { type: "start" });
    expect(after.jumperVy).toBeLessThan(0);
  });

  it("ignores start if already in motion", () => {
    const s = initialState(1, settings);
    const started = reducer(s, { type: "start" });
    const again = reducer(started, { type: "start" });
    expect(again.jumperVy).toBe(started.jumperVy);
  });
});

describe("bounce action", () => {
  it("subtracts a life when bounce window is not open", () => {
    const s = initialState(1, settings);
    const started = reducer(s, { type: "start" });
    // Window is not open when jumper is going up
    const afterBounce = reducer(started, { type: "bounce" });
    expect(afterBounce.lives).toBe(2);
  });

  it("increments score when bounce window is open", () => {
    const s = initialState(1, settings);
    const withWindow = { ...s, bounceWindowOpen: true, jumperVy: 1.0 };
    const after = reducer(withWindow, { type: "bounce" });
    expect(after.score).toBe(1);
    expect(after.bounceWindowOpen).toBe(false);
  });
});

describe("tick", () => {
  it("increases jumperVy due to gravity while in motion", () => {
    const s = initialState(1, settings);
    const started = reducer(s, { type: "start" });
    const after = reducer(started, { type: "tick", dt: 0.05 });
    expect(after.jumperVy).toBeGreaterThan(started.jumperVy);
  });

  it("is no-op when game is over", () => {
    const s = { ...initialState(1, settings), over: true };
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after).toBe(s);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 7 };
    expect(isTerminal(s)!.score).toBe(7);
  });
});
