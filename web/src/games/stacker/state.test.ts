import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, COLS } from "./state.js";

describe("Stacker initialState", () => {
  it("starts in moving phase, score 0", () => {
    const s = initialState();
    expect(s.phase).toBe("moving");
    expect(s.score).toBe(0);
    expect(s.stack.length).toBe(1); // base platform
  });

  it("moving block has full initial width", () => {
    const s = initialState();
    expect(s.moving.width).toBe(6);
  });

  it("movingDir is 1 at start", () => {
    const s = initialState();
    expect(s.movingDir).toBe(1);
  });

  it("stack has one base row", () => {
    const s = initialState();
    expect(s.stack.length).toBe(1);
    expect(s.stack[0]!.width).toBeGreaterThan(0);
  });
});

describe("Stacker tick", () => {
  it("moving block advances position", () => {
    const s = initialState();
    const x0 = s.movingX;
    const s2 = reducer(s, { type: "tick", dt: 0.3 });
    expect(s2.movingX).toBeGreaterThan(x0);
  });

  it("block bounces off right wall", () => {
    const s = initialState();
    // Force to right edge
    const atEdge = { ...s, movingX: COLS - s.moving.width - 0.01, movingDir: 1 as const };
    const s2 = reducer(atEdge, { type: "tick", dt: 0.5 });
    expect(s2.movingDir).toBe(-1);
  });

  it("block bounces off left wall", () => {
    const s = { ...initialState(), movingX: 0.01, movingDir: -1 as const };
    const s2 = reducer(s, { type: "tick", dt: 0.5 });
    expect(s2.movingDir).toBe(1);
  });

  it("no tick in gameover phase", () => {
    const s = { ...initialState(), phase: "gameover" as const };
    const s2 = reducer(s, { type: "tick", dt: 1 });
    expect(s2.elapsed).toBe(s.elapsed);
  });
});

describe("Stacker drop", () => {
  it("perfect drop preserves full width", () => {
    const s = initialState();
    const top = s.stack[s.stack.length - 1]!;
    // Position moving block exactly over top row
    const aligned = { ...s, movingX: top.x };
    const s2 = reducer(aligned, { type: "drop" });
    expect(s2.phase).toBe("moving");
    expect(s2.stack.length).toBe(2);
    // Width should be same as top (full overlap)
    expect(s2.stack[s2.stack.length - 1]!.width).toBeCloseTo(top.width);
  });

  it("partial overlap cuts off overhang", () => {
    const s = initialState();
    const top = s.stack[0]!;
    // Offset moving block by 1 unit to the right
    const shifted = { ...s, movingX: top.x + 1 };
    const s2 = reducer(shifted, { type: "drop" });
    expect(s2.phase).toBe("moving");
    const newTop = s2.stack[s2.stack.length - 1]!;
    // Overlap is (originalWidth - 1)
    expect(newTop.width).toBeCloseTo(top.width - 1);
  });

  it("complete miss triggers gameover", () => {
    const s = initialState();
    // Position moving block completely to the right of the stack
    const top = s.stack[0]!;
    const missed = { ...s, movingX: top.x + top.width + 0.1 };
    const s2 = reducer(missed, { type: "drop" });
    expect(s2.phase).toBe("gameover");
  });

  it("score increases on each successful drop", () => {
    const s = initialState();
    const top = s.stack[0]!;
    const aligned = { ...s, movingX: top.x };
    const s2 = reducer(aligned, { type: "drop" });
    expect(s2.score).toBeGreaterThan(0);
    // Second drop
    const top2 = s2.stack[s2.stack.length - 1]!;
    const aligned2 = { ...s2, movingX: top2.x };
    const s3 = reducer(aligned2, { type: "drop" });
    expect(s3.score).toBeGreaterThan(s2.score);
  });

  it("block width narrows after partial overlap", () => {
    const s = initialState();
    const top = s.stack[0]!;
    const shifted = { ...s, movingX: top.x + 2 };
    const s2 = reducer(shifted, { type: "drop" });
    expect(s2.moving.width).toBeCloseTo(top.width - 2);
  });
});

describe("Stacker isTerminal", () => {
  it("null while playing", () => {
    expect(isTerminal(initialState())).toBeNull();
  });

  it("returns score when gameover", () => {
    const s = initialState();
    const top = s.stack[0]!;
    const missed = { ...s, movingX: top.x + top.width + 0.1 };
    const s2 = reducer(missed, { type: "drop" });
    expect(s2.phase).toBe("gameover");
    expect(isTerminal(s2)?.score).toBe(0);
  });
});
