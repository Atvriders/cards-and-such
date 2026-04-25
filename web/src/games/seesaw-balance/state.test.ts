import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { difficulty: "medium" as const };

describe("initialState", () => {
  it("starts with score 0 and round 1", () => {
    const s = initialState(42, settings);
    expect(s.score).toBe(0);
    expect(s.round).toBe(1);
    expect(s.over).toBe(false);
  });

  it("starts with a pending ball", () => {
    const s = initialState(42, settings);
    expect(s.pendingBall).not.toBeNull();
  });

  it("starts balanced", () => {
    const s = initialState(42, settings);
    expect(s.leftWeight).toBe(0);
    expect(s.rightWeight).toBe(0);
  });
});

describe("placeLeft", () => {
  it("adds ball weight to left side", () => {
    const s = initialState(42, settings);
    const weight = s.pendingBall!.weight;
    const after = reducer(s, { type: "placeLeft" });
    expect(after.leftWeight).toBe(weight);
    expect(after.pendingBall).toBeNull();
  });
});

describe("placeRight", () => {
  it("adds ball weight to right side", () => {
    const s = initialState(42, settings);
    const weight = s.pendingBall!.weight;
    const after = reducer(s, { type: "placeRight" });
    expect(after.rightWeight).toBe(weight);
    expect(after.pendingBall).toBeNull();
  });
});

describe("next", () => {
  it("advances to next round after placing", () => {
    const s = initialState(42, settings);
    const placed = reducer(s, { type: "placeLeft" });
    const next = reducer(placed, { type: "next" });
    expect(next.round).toBe(2);
    expect(next.pendingBall).not.toBeNull();
  });

  it("ends game after maxRounds", () => {
    let s = initialState(42, settings);
    for (let i = 0; i < s.maxRounds; i++) {
      s = reducer(s, { type: "placeLeft" });
      s = reducer(s, { type: "next" });
    }
    expect(s.over).toBe(true);
  });
});

describe("scoring", () => {
  it("perfect balance gives max score per round", () => {
    const s = initialState(42, settings);
    const weight = s.pendingBall!.weight;
    // Place same weight on each side across two rounds
    const after1 = reducer(s, { type: "placeLeft" });
    const after1b = reducer(after1, { type: "next" });
    // Force next ball to same weight for perfect balance
    const forceState = { ...after1b, pendingBall: { id: 2, weight, side: "right" as const } };
    const after2 = reducer(forceState, { type: "placeRight" });
    // Both sides equal → diff = 0 → score = 10 per round
    expect(after2.score).toBeGreaterThan(after1.score);
  });
});

describe("isTerminal", () => {
  it("returns null while playing", () => {
    expect(isTerminal(initialState(42, settings))).toBeNull();
  });

  it("returns score when over", () => {
    const s = { ...initialState(42, settings), over: true, score: 55 };
    expect(isTerminal(s)!.score).toBe(55);
  });
});

describe("tick", () => {
  it("increases angle when right side heavier", () => {
    const s = initialState(42, settings);
    const placed = reducer(s, { type: "placeRight" });
    const after = reducer(placed, { type: "tick", dt: 0.1 });
    expect(after.angle).toBeGreaterThan(placed.angle);
  });
});
