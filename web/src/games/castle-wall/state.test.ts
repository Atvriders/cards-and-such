import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, edgeKey, solutionEdgeSet } from "./state.js";
import type { Edge } from "./puzzles.js";

const easy = { difficulty: "easy" as const };

describe("CastleWall initialState", () => {
  it("starts with empty edges and not won", () => {
    const s = initialState(1, easy);
    expect(s.edges.size).toBe(0);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(5, easy);
    const s2 = initialState(5, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("CastleWall edgeKey", () => {
  it("normalizes edge direction", () => {
    const e1: Edge = [0, 0, 0, 1];
    const e2: Edge = [0, 1, 0, 0];
    expect(edgeKey(e1)).toBe(edgeKey(e2));
  });

  it("produces different keys for different edges", () => {
    const e1: Edge = [0, 0, 0, 1];
    const e2: Edge = [0, 1, 0, 2];
    expect(edgeKey(e1)).not.toBe(edgeKey(e2));
  });
});

describe("CastleWall toggleEdge", () => {
  it("adds an edge", () => {
    const s = initialState(1, easy);
    const edge: Edge = [0, 0, 0, 1];
    const s2 = reducer(s, { type: "toggleEdge", edge });
    expect(s2.edges.has(edgeKey(edge))).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("removes an existing edge on second toggle", () => {
    const s = initialState(1, easy);
    const edge: Edge = [0, 0, 0, 1];
    const s2 = reducer(s, { type: "toggleEdge", edge });
    const s3 = reducer(s2, { type: "toggleEdge", edge });
    expect(s3.edges.has(edgeKey(edge))).toBe(false);
  });
});

describe("CastleWall checkWon", () => {
  it("returns false for empty edge set", () => {
    const s = initialState(1, easy);
    expect(checkWon(s.puzzle, new Set())).toBe(false);
  });

  it("returns true when edges exactly match solution", () => {
    const s = initialState(1, easy);
    const solEdges = solutionEdgeSet(s.puzzle);
    expect(checkWon(s.puzzle, solEdges)).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 10 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(950);
  });
});

describe("CastleWall reset", () => {
  it("clears edges and resets moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleEdge", edge: [0, 0, 0, 1] });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.edges.size).toBe(0);
    expect(s3.moves).toBe(0);
    expect(s3.won).toBe(false);
  });
});
