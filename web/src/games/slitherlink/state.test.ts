import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, type SlitherlinkState } from "./state.js";

describe("Slitherlink", () => {
  it("initialState creates empty edges", () => {
    const s = initialState(1, { difficulty: "easy" });
    expect(s.hEdges.every((e) => !e)).toBe(true);
    expect(s.vEdges.every((e) => !e)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("toggleH flips a horizontal edge", () => {
    const s = initialState(1, { difficulty: "easy" });
    const next = reducer(s, { type: "toggleH", idx: 0 });
    expect(next.hEdges[0]).toBe(true);
    expect(next.moves).toBe(1);
    const toggled = reducer(next, { type: "toggleH", idx: 0 });
    expect(toggled.hEdges[0]).toBe(false);
  });

  it("toggleV flips a vertical edge", () => {
    const s = initialState(1, { difficulty: "easy" });
    const next = reducer(s, { type: "toggleV", idx: 0 });
    expect(next.vEdges[0]).toBe(true);
    expect(next.moves).toBe(1);
  });

  it("won=false when no edges active", () => {
    const s = initialState(1, { difficulty: "easy" });
    expect(isTerminal(s)).toBe(null);
  });

  it("won becomes true when solution edges are set", () => {
    const s = initialState(1, { difficulty: "easy" });
    // Apply the solution directly
    const solved: SlitherlinkState = {
      ...s,
      hEdges: [...s.puzzle.solutionH],
      vEdges: [...s.puzzle.solutionV],
    };
    // trigger a toggle to re-evaluate win
    const trigger = reducer(solved, { type: "toggleH", idx: 0 });
    const trigger2 = reducer(trigger, { type: "toggleH", idx: 0 });
    // After re-applying, won should be true if solution is correct
    expect(trigger2.won).toBe(true);
    expect(isTerminal(trigger2)?.score).toBeGreaterThanOrEqual(100);
  });

  it("medium difficulty puzzle loads without error", () => {
    const s = initialState(42, { difficulty: "medium" });
    expect(s.puzzle.rows).toBe(6);
    expect(s.puzzle.cols).toBe(6);
    expect(s.hEdges).toHaveLength((s.puzzle.rows + 1) * s.puzzle.cols);
    expect(s.vEdges).toHaveLength(s.puzzle.rows * (s.puzzle.cols + 1));
  });

  it("hard difficulty puzzle loads without error", () => {
    const s = initialState(7, { difficulty: "hard" });
    expect(s.puzzle.rows).toBe(7);
    expect(s.puzzle.clues).toHaveLength(s.puzzle.rows * s.puzzle.cols);
  });
});
