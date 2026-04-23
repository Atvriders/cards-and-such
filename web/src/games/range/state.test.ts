import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeRange, hasAdjacentBlacks } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };

describe("Range initialState", () => {
  it("starts with no shaded cells", () => {
    const s = initialState(1, easy);
    expect(s.shaded.every(v => !v)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    expect(initialState(7, easy).puzzle).toBe(initialState(7, easy).puzzle);
  });

  it("medium uses 6×6 puzzles", () => {
    const s = initialState(1, medium);
    expect(s.puzzle.rows).toBe(6);
  });

  it("easy uses 5×5 puzzles", () => {
    const s = initialState(1, easy);
    expect(s.puzzle.rows).toBe(5);
  });
});

describe("Range computeRange", () => {
  it("counts self plus open cells in all 4 directions", () => {
    // 3×3 all white, center cell at (1,1) should see 5: self + 2 horiz + 2 vert
    const puzzle = { rows: 3, cols: 3, grid: new Array(9).fill(null), solution: new Array(9).fill(false) };
    const shaded = new Array(9).fill(false);
    expect(computeRange(puzzle, shaded, 1, 1)).toBe(5);
  });

  it("stops at shaded cell", () => {
    const puzzle = { rows: 3, cols: 3, grid: new Array(9).fill(null), solution: new Array(9).fill(false) };
    const shaded = new Array(9).fill(false);
    shaded[1] = true; // (0,1) shaded — blocks upward from (1,1)
    // (1,1) sees: self + down(2,1) + left(1,0) + right(1,2) = 4, not up
    expect(computeRange(puzzle, shaded, 1, 1)).toBe(4);
  });

  it("counts self even if isolated", () => {
    const puzzle = { rows: 3, cols: 3, grid: new Array(9).fill(null), solution: new Array(9).fill(false) };
    const shaded = [false,true,false, true,false,true, false,true,false];
    // (1,1) is surrounded by shaded — sees only itself
    expect(computeRange(puzzle, shaded, 1, 1)).toBe(1);
  });
});

describe("Range hasAdjacentBlacks", () => {
  it("detects two adjacent shaded cells", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const shaded = new Array(25).fill(false);
    shaded[0] = true;
    shaded[1] = true; // adjacent
    expect(hasAdjacentBlacks(puzzle, shaded)).toBe(true);
  });

  it("non-adjacent shaded cells are fine", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const shaded = new Array(25).fill(false);
    shaded[0] = true;
    shaded[2] = true; // gap between them
    expect(hasAdjacentBlacks(puzzle, shaded)).toBe(false);
  });
});

describe("Range checkWon", () => {
  it("returns false for empty board (clue cells need specific ranges)", () => {
    const puzzle = PUZZLES_EASY[1]!; // has clue cells
    expect(checkWon(puzzle, new Array(25).fill(false))).toBe(false);
  });

  it("returns true for all easy solutions", () => {
    for (const puzzle of PUZZLES_EASY) {
      expect(checkWon(puzzle, puzzle.solution)).toBe(true);
    }
  });
});

describe("Range reducer", () => {
  it("toggleShade shades a blank cell", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(s, { type: "toggleShade", idx });
    expect(s2.shaded[idx]).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("cannot shade numbered cell", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.grid.findIndex(v => v !== null);
    const s2 = reducer(s, { type: "toggleShade", idx });
    expect(s2.shaded[idx]).toBe(false);
  });

  it("toggleShade unshades a shaded cell", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(reducer(s, { type: "toggleShade", idx }), { type: "toggleShade", idx });
    expect(s2.shaded[idx]).toBe(false);
  });

  it("reset clears shading", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(reducer(s, { type: "toggleShade", idx }), { type: "reset" });
    expect(s2.shaded.every(v => !v)).toBe(true);
    expect(s2.moves).toBe(0);
  });
});

describe("Range isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const r = isTerminal({ ...s, won: true, moves: 5 });
    expect(r).not.toBeNull();
    expect(r!.score).toBeGreaterThan(0);
  });
});
