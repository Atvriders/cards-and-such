import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, edgeKey, solutionEdgeSet } from "./state.js";
import type { Edge } from "./puzzles.js";

const easy = { difficulty: "easy" as const };

describe("Corral initialState", () => {
  it("starts with empty edges and not won", () => {
    const s = initialState(1, easy);
    expect(s.edges.size).toBe(0);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(3, easy);
    const s2 = initialState(3, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Corral edgeKey", () => {
  it("normalizes edge direction", () => {
    const e1: Edge = [1, 1, 1, 2];
    const e2: Edge = [1, 2, 1, 1];
    expect(edgeKey(e1)).toBe(edgeKey(e2));
  });
});

describe("Corral toggleEdge", () => {
  it("adds an edge on first click", () => {
    const s = initialState(1, easy);
    const edge: Edge = [0, 0, 0, 1];
    const s2 = reducer(s, { type: "toggleEdge", edge });
    expect(s2.edges.has(edgeKey(edge))).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("removes an edge on second click", () => {
    const s = initialState(1, easy);
    const edge: Edge = [0, 0, 0, 1];
    const s2 = reducer(s, { type: "toggleEdge", edge });
    const s3 = reducer(s2, { type: "toggleEdge", edge });
    expect(s3.edges.has(edgeKey(edge))).toBe(false);
  });
});

describe("Corral checkWon", () => {
  it("returns false for empty edges", () => {
    const s = initialState(1, easy);
    expect(checkWon(s.puzzle, new Set())).toBe(false);
  });

  it("returns true when edges match solution", () => {
    const s = initialState(1, easy);
    const solEdges = solutionEdgeSet(s.puzzle);
    expect(checkWon(s.puzzle, solEdges)).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 15 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(925);
  });
});

describe("Corral reset", () => {
  it("clears edges and resets moves", () => {
    const s = initialState(1, easy);
    const edge: Edge = [0, 0, 0, 1];
    const s2 = reducer(s, { type: "toggleEdge", edge });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.edges.size).toBe(0);
    expect(s3.moves).toBe(0);
  });
});
