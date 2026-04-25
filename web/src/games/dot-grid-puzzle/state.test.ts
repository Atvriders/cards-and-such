import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal } from "./state.js";
import type { DotGridPuzzleSettings } from "./state.js";

const s4: DotGridPuzzleSettings = { size: "4" };
const s5: DotGridPuzzleSettings = { size: "5" };

describe("DotGridPuzzle initialState", () => {
  it("grid has correct total cells", () => {
    expect(initialState(1, s4).grid).toHaveLength(16);
    expect(initialState(1, s5).grid).toHaveLength(25);
  });

  it("has at least 4 dots", () => {
    const s = initialState(1, s4);
    expect(s.dots.length).toBeGreaterThanOrEqual(4);
  });

  it("starts with empty path, not solved", () => {
    const s = initialState(1, s4);
    expect(s.path).toHaveLength(0);
    expect(s.solved).toBe(false);
  });
});

describe("DotGridPuzzle reducer", () => {
  it("clickCell starts a path", () => {
    const s = initialState(1, s4);
    const s2 = reducer(s, { type: "clickCell", idx: 0 });
    expect(s2.path).toHaveLength(1);
    expect(s2.path[0]).toBe(0);
  });

  it("cannot revisit a cell already in path", () => {
    let s = initialState(1, s4);
    s = reducer(s, { type: "clickCell", idx: 0 });
    s = reducer(s, { type: "clickCell", idx: 1 });
    const s2 = reducer(s, { type: "clickCell", idx: 0 });
    // 0 is already in path — should not add
    expect(s2.path).toHaveLength(2);
  });

  it("cannot add non-adjacent cell", () => {
    let s = initialState(1, s5);
    s = reducer(s, { type: "clickCell", idx: 0 });
    const s2 = reducer(s, { type: "clickCell", idx: 24 });
    expect(s2.path).toHaveLength(1);
  });

  it("reset clears the path", () => {
    let s = initialState(1, s4);
    s = reducer(s, { type: "clickCell", idx: 0 });
    s = reducer(s, { type: "clickCell", idx: 1 });
    s = reducer(s, { type: "reset" });
    expect(s.path).toHaveLength(0);
  });

  it("restart generates a new puzzle", () => {
    let s = initialState(1, s4);
    s = reducer(s, { type: "clickCell", idx: 0 });
    s = reducer(s, { type: "restart" });
    expect(s.path).toHaveLength(0);
    expect(s.solved).toBe(false);
    expect(s.moves).toBe(0);
  });
});

describe("DotGridPuzzle isTerminal", () => {
  it("returns null when not solved", () => {
    expect(isTerminal(initialState(1, s4))).toBeNull();
  });

  it("returns a score when solved", () => {
    const s = { ...initialState(1, s4), solved: true, moves: 10 };
    const result = isTerminal(s);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(0);
  });

  it("fewer moves gives higher score", () => {
    const s1 = { ...initialState(1, s4), solved: true, moves: 5 };
    const s2 = { ...initialState(1, s4), solved: true, moves: 20 };
    expect(isTerminal(s1)!.score).toBeGreaterThan(isTerminal(s2)!.score);
  });
});
