import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, wallKey } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy: { difficulty: "easy" } = { difficulty: "easy" };

describe("DominoPlacement initialState", () => {
  it("starts with no walls, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.walls.size).toBe(0);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("puzzle has 56 cells (7x8)", () => {
    const s = initialState(1, easy);
    expect(s.puzzle.rows * s.puzzle.cols).toBe(56);
  });
});

describe("DominoPlacement toggleWall", () => {
  it("adds a wall between adjacent cells", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleWall", idx1: 0, idx2: 1 });
    expect(s2.walls.has(wallKey(0, 1))).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("removes wall on second toggle", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleWall", idx1: 0, idx2: 1 });
    const s3 = reducer(s2, { type: "toggleWall", idx1: 0, idx2: 1 });
    expect(s3.walls.has(wallKey(0, 1))).toBe(false);
  });

  it("wallKey is order-independent", () => {
    expect(wallKey(0, 1)).toBe(wallKey(1, 0));
    expect(wallKey(5, 3)).toBe(wallKey(3, 5));
  });
});

describe("DominoPlacement checkWon", () => {
  it("returns false for no walls (all cells connected)", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, new Set())).toBe(false);
  });

  it("returns true for exactly correct wall placement", () => {
    const puzzle = PUZZLES[0]!;
    // Build walls from solution: put wall between cells with different domino IDs
    const walls = new Set<string>();
    const { rows, cols, solution } = puzzle;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (c + 1 < cols) {
          const nIdx = idx + 1;
          if (solution[idx] !== solution[nIdx]) walls.add(wallKey(idx, nIdx));
        }
        if (r + 1 < rows) {
          const nIdx = (r + 1) * cols + c;
          if (solution[idx] !== solution[nIdx]) walls.add(wallKey(idx, nIdx));
        }
      }
    }
    expect(checkWon(puzzle, walls)).toBe(true);
  });
});

describe("DominoPlacement reset", () => {
  it("clears walls and moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "toggleWall", idx1: 0, idx2: 1 });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.walls.size).toBe(0);
    expect(s3.moves).toBe(0);
    expect(s3.won).toBe(false);
  });
});

describe("DominoPlacement isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 30 };
    expect(isTerminal(won)!.score).toBe(910);
  });

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
