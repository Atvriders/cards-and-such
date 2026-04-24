import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";

const settings = { speed: "normal" as const };

describe("initialState", () => {
  it("starts with one base block and a moving block", () => {
    const s = initialState(42, settings);
    expect(s.stack).toHaveLength(1);
    expect(s.moving).toBeDefined();
    expect(s.score).toBe(0);
    expect(s.over).toBe(false);
  });
});

describe("determinism", () => {
  it("same seed produces same initial state shape", () => {
    const s1 = initialState(7, settings);
    const s2 = initialState(7, settings);
    expect(s1.stack[0]).toEqual(s2.stack[0]);
    expect(s1.moveSpeed).toBe(s2.moveSpeed);
  });
});

describe("tick moves block", () => {
  it("moving block x changes after tick", () => {
    const s = initialState(42, settings);
    const after = reducer(s, { type: "tick", dt: 0.1 });
    expect(after.moving.x).not.toBe(s.moving.x);
  });
});

describe("drop with overlap", () => {
  it("adds a new block to stack and increases score", () => {
    const s = initialState(42, settings);
    // Force moving block to be centered over base block
    const centered = { ...s, moving: { ...s.moving, x: 0.1, width: 0.8, dir: 1 as const } };
    const after = reducer(centered, { type: "drop" });
    expect(after.stack.length).toBe(2);
    expect(after.score).toBeGreaterThan(0);
    expect(after.over).toBe(false);
  });
});

describe("drop with no overlap", () => {
  it("sets over=true when block completely misses", () => {
    const s = initialState(42, settings);
    // Force moving block far to the right (no overlap with base 0.1..0.9)
    const missed = { ...s, moving: { ...s.moving, x: 0.95, width: 0.04, dir: 1 as const } };
    const after = reducer(missed, { type: "drop" });
    expect(after.over).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null in progress", () => {
    expect(isTerminal(initialState(1, settings))).toBeNull();
  });
  it("returns score when over", () => {
    const s = { ...initialState(1, settings), over: true, score: 200 };
    expect(isTerminal(s)).toEqual({ score: 200 });
  });
});
