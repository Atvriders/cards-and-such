import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, countAdjacentTriangles, ALL_DIRS } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("Shakashaka initialState", () => {
  it("starts with no triangles placed", () => {
    const s = initialState(1, easy);
    expect(s.triangles.every(t => t === undefined)).toBe(true);
    expect(s.won).toBe(false);
  });

  it("is deterministic with same seed", () => {
    expect(initialState(3, easy).puzzle).toBe(initialState(3, easy).puzzle);
  });

  it("has 4 triangle directions", () => {
    expect(ALL_DIRS).toHaveLength(4);
  });

  it("medium uses 5×5 puzzles", () => {
    const s = initialState(1, medium);
    expect(s.puzzle.rows).toBe(5);
  });
});

describe("Shakashaka countAdjacentTriangles", () => {
  it("counts triangles adjacent to a black cell", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const tris = new Array(16).fill(undefined);
    // Place a triangle at (0,0) = idx 0 — adjacent to black at (0,1) = idx 1
    tris[0] = "TL";
    // (0,1) is black at idx 1
    expect(countAdjacentTriangles(puzzle, tris, 0, 1)).toBe(1);
  });

  it("returns 0 when no adjacent triangles", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const tris = new Array(16).fill(undefined);
    expect(countAdjacentTriangles(puzzle, tris, 0, 1)).toBe(0);
  });
});

describe("Shakashaka checkWon", () => {
  it("returns false for empty triangles", () => {
    const puzzle = PUZZLES_EASY[0]!;
    expect(checkWon(puzzle, new Array(16).fill(undefined))).toBe(false);
  });

  it("returns true for correct solution (all easy puzzles use un-numbered blacks)", () => {
    for (const puzzle of PUZZLES_EASY) {
      const trisFull = puzzle.solution.slice() as (import("./puzzles.js").TriangleDir | null | undefined)[];
      expect(checkWon(puzzle, trisFull)).toBe(true);
    }
  });
});

describe("Shakashaka reducer", () => {
  it("placeTri places a triangle on a white cell", () => {
    const s = initialState(1, easy);
    const whiteIdx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(s, { type: "placeTri", idx: whiteIdx });
    expect(s2.triangles[whiteIdx]).toBe(s.selectedDir);
    expect(s2.moves).toBe(1);
  });

  it("cannot place triangle on black cell", () => {
    const s = initialState(1, easy);
    const blackIdx = s.puzzle.grid.findIndex(v => v !== null);
    const s2 = reducer(s, { type: "placeTri", idx: blackIdx });
    expect(s2.triangles[blackIdx]).toBeUndefined();
  });

  it("selectDir changes selected direction", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "selectDir", dir: "BR" });
    expect(s2.selectedDir).toBe("BR");
  });

  it("clearTri removes a triangle", () => {
    const s = initialState(1, easy);
    const whiteIdx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(s, { type: "placeTri", idx: whiteIdx });
    const s3 = reducer(s2, { type: "clearTri", idx: whiteIdx });
    expect(s3.triangles[whiteIdx]).toBeUndefined();
  });

  it("reset clears all triangles", () => {
    const s = initialState(1, easy);
    const whiteIdx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(reducer(s, { type: "placeTri", idx: whiteIdx }), { type: "reset" });
    expect(s2.triangles.every(t => t === undefined)).toBe(true);
    expect(s2.moves).toBe(0);
  });
});

describe("Shakashaka isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const r = isTerminal({ ...s, won: true, moves: 6 });
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });

  it("score has minimum of 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 99999 })!.score).toBe(100);
  });
});
