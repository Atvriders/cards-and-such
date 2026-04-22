import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES, edgeKey, checkWon, getNeighbors } from "./state.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };
const hard = { difficulty: "hard" as const };

describe("Masyu edgeKey", () => {
  it("always puts smaller index first", () => {
    expect(edgeKey(3, 7)).toBe("3-7");
    expect(edgeKey(7, 3)).toBe("3-7");
  });

  it("is symmetric", () => {
    expect(edgeKey(5, 10)).toBe(edgeKey(10, 5));
  });
});

describe("Masyu getNeighbors", () => {
  it("corner cell has 2 neighbors", () => {
    const n = getNeighbors(0, 7, 7); // top-left
    expect(n.length).toBe(2);
  });

  it("edge cell has 3 neighbors", () => {
    const n = getNeighbors(1, 7, 7); // top row, not corner
    expect(n.length).toBe(3);
  });

  it("interior cell has 4 neighbors", () => {
    const n = getNeighbors(8, 7, 7); // row 1, col 1
    expect(n.length).toBe(4);
  });
});

describe("Masyu PUZZLES", () => {
  it("each puzzle has at least one pearl", () => {
    for (const puzzles of Object.values(PUZZLES)) {
      for (const puzzle of puzzles) {
        const hasPearl = puzzle.pearls.some((p) => p !== "none");
        expect(hasPearl).toBe(true);
      }
    }
  });

  it("solution edges form a valid closed loop", () => {
    for (const puzzles of Object.values(PUZZLES)) {
      for (const puzzle of puzzles) {
        // Every node in solution should have exactly 2 edges
        const deg = new Map<number, number>();
        for (const e of puzzle.solutionEdges) {
          const [a, b] = e.split("-").map(Number) as [number, number];
          deg.set(a, (deg.get(a) ?? 0) + 1);
          deg.set(b, (deg.get(b) ?? 0) + 1);
        }
        for (const [, d] of deg) {
          expect(d).toBe(2);
        }
      }
    }
  });

  it("solution passes through all pearls", () => {
    for (const puzzles of Object.values(PUZZLES)) {
      for (const puzzle of puzzles) {
        const inLoop = new Set<number>();
        for (const e of puzzle.solutionEdges) {
          const [a, b] = e.split("-").map(Number) as [number, number];
          inLoop.add(a);
          inLoop.add(b);
        }
        for (let i = 0; i < puzzle.pearls.length; i++) {
          if (puzzle.pearls[i] !== "none") {
            expect(inLoop.has(i)).toBe(true);
          }
        }
      }
    }
  });
});

describe("Masyu initialState", () => {
  it("starts with empty edges", () => {
    const s = initialState(1, easy);
    expect(s.edges.size).toBe(0);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, medium);
    const s2 = initialState(42, medium);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Masyu toggleEdge", () => {
  it("adds an edge when not present", () => {
    const s = initialState(1, easy);
    const { rows, cols } = s.puzzle;
    const s2 = reducer(s, { type: "toggleEdge", from: 0, to: 1 });
    expect(s2.edges.has(edgeKey(0, 1))).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("removes an edge when already present", () => {
    const s = initialState(1, easy);
    let s2 = reducer(s, { type: "toggleEdge", from: 0, to: 1 });
    s2 = reducer(s2, { type: "toggleEdge", from: 0, to: 1 });
    expect(s2.edges.has(edgeKey(0, 1))).toBe(false);
    expect(s2.moves).toBe(2);
  });
});

describe("Masyu reset", () => {
  it("clears all edges", () => {
    const s = initialState(1, easy);
    let s2 = reducer(s, { type: "toggleEdge", from: 0, to: 1 });
    s2 = reducer(s2, { type: "reset" });
    expect(s2.edges.size).toBe(0);
    expect(s2.moves).toBe(0);
  });
});

describe("Masyu win condition", () => {
  it("wins when solution edges are placed exactly", () => {
    const puzzle = PUZZLES["easy"]![0]!;
    const s = initialState(0, easy);
    // Build a state with all solution edges minus one
    const solEdges = [...puzzle.solutionEdges];
    const lastEdge = solEdges[solEdges.length - 1]!;
    const [a, b] = lastEdge.split("-").map(Number) as [number, number];
    const edgesWithoutLast = new Set(solEdges.slice(0, -1));
    const almostState = { ...s, puzzle, edges: edgesWithoutLast };
    expect(almostState.won).toBe(false);
    const done = reducer(almostState, { type: "toggleEdge", from: a, to: b });
    expect(done.won).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, hard);
    const wonState = { ...s, won: true, moves: 40 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(100);
  });
});
