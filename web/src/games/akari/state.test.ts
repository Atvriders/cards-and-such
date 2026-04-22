import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeIlluminated, computeConflicts, checkWon } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const medium = { difficulty: "medium" as const };
const hard = { difficulty: "hard" as const };

describe("Akari initialState", () => {
  it("starts with no bulbs, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.bulbs.every(b => !b)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, medium);
    const s2 = initialState(42, medium);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("selects different difficulties", () => {
    const e = initialState(1, easy);
    const h = initialState(1, hard);
    expect(e.puzzle.size).toBe(5);
    expect(h.puzzle.size).toBe(9);
  });
});

describe("Akari computeIlluminated", () => {
  it("bulb illuminates its row and col until wall", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const bulbs = new Array(25).fill(false);
    bulbs[0] = true; // (0,0)
    const lit = computeIlluminated(puzzle, bulbs);
    // (0,0) shines right until wall at (0,2), and down until wall at (3,0)
    expect(lit.has(0)).toBe(true);
    expect(lit.has(1)).toBe(true); // (0,1)
    // wall at (0,2) so (0,2) is wall, shouldn't be lit
    expect(lit.has(5)).toBe(true); // (1,0)
    expect(lit.has(10)).toBe(true); // (2,0)
  });

  it("wall blocks illumination", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const bulbs = new Array(25).fill(false);
    bulbs[0] = true; // (0,0), wall at (0,2)
    const lit = computeIlluminated(puzzle, bulbs);
    // (0,3) and (0,4) should NOT be lit (blocked by wall at col 2)
    expect(lit.has(3)).toBe(false);
    expect(lit.has(4)).toBe(false);
  });
});

describe("Akari computeConflicts", () => {
  it("two bulbs in same row segment produce conflict", () => {
    const puzzle = PUZZLES_EASY[1]!; // wall at (2,2) — no wall in row 0
    const bulbs = new Array(25).fill(false);
    bulbs[0] = true; // (0,0)
    bulbs[1] = true; // (0,1) — same row, no wall between
    const conflicts = computeConflicts(puzzle, bulbs);
    expect(conflicts.has(0)).toBe(true);
    expect(conflicts.has(1)).toBe(true);
  });

  it("bulbs separated by wall have no conflict", () => {
    const puzzle = PUZZLES_EASY[0]!; // wall at (0,2)
    const bulbs = new Array(25).fill(false);
    bulbs[0] = true; // (0,0)
    bulbs[3] = true; // (0,3) — separated by wall at (0,2)
    const conflicts = computeConflicts(puzzle, bulbs);
    expect(conflicts.size).toBe(0);
  });
});

describe("Akari toggleBulb action", () => {
  it("places a bulb on white cell", () => {
    const s = initialState(1, easy);
    const whiteIdx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(s, { type: "toggleBulb", idx: whiteIdx });
    expect(s2.bulbs[whiteIdx]).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("cannot place bulb on wall cell", () => {
    const s = initialState(1, easy);
    const wallIdx = s.puzzle.grid.findIndex(v => v !== null);
    const s2 = reducer(s, { type: "toggleBulb", idx: wallIdx });
    expect(s2.bulbs[wallIdx]).toBe(false);
    expect(s2.moves).toBe(0);
  });

  it("toggles off an existing bulb", () => {
    const s = initialState(1, easy);
    const whiteIdx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(s, { type: "toggleBulb", idx: whiteIdx });
    const s3 = reducer(s2, { type: "toggleBulb", idx: whiteIdx });
    expect(s3.bulbs[whiteIdx]).toBe(false);
  });
});

describe("Akari reset", () => {
  it("clears all bulbs and resets moves", () => {
    const s = initialState(1, easy);
    const idx = s.puzzle.grid.findIndex(v => v === null);
    const s2 = reducer(reducer(s, { type: "toggleBulb", idx }), { type: "reset" });
    expect(s2.bulbs.every(b => !b)).toBe(true);
    expect(s2.moves).toBe(0);
    expect(s2.won).toBe(false);
  });
});

describe("Akari win condition", () => {
  it("checkWon returns false for empty board", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const bulbs = new Array(25).fill(false);
    expect(checkWon(puzzle, bulbs)).toBe(false);
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

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 9999 };
    expect(isTerminal(wonState)!.score).toBe(100);
  });
});
