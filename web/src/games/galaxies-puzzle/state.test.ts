import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy = { difficulty: "easy" as const };

describe("Galaxies initialState", () => {
  it("starts with all cells unassigned and not won", () => {
    const s = initialState(1, easy);
    expect(s.assignment.every(v => v === -1)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
    expect(s.selected).toBeNull();
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(99, easy);
    const s2 = initialState(99, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Galaxies selectGalaxy", () => {
  it("sets selected galaxy", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "selectGalaxy", galaxyIdx: 1 });
    expect(s2.selected).toBe(1);
  });
});

describe("Galaxies paintCell", () => {
  it("paints a cell with selected galaxy", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "selectGalaxy", galaxyIdx: 0 });
    const s3 = reducer(s2, { type: "paintCell", cellIdx: 5 });
    expect(s3.assignment[5]).toBe(0);
    expect(s3.moves).toBe(1);
  });

  it("clears a cell if already painted with selected galaxy", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "selectGalaxy", galaxyIdx: 2 });
    const s3 = reducer(s2, { type: "paintCell", cellIdx: 5 });
    const s4 = reducer(s3, { type: "paintCell", cellIdx: 5 });
    expect(s4.assignment[5]).toBe(-1);
  });

  it("does nothing without selected galaxy", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "paintCell", cellIdx: 0 });
    expect(s2.assignment[0]).toBe(-1);
  });
});

describe("Galaxies checkWon", () => {
  it("returns false for unassigned cells", () => {
    const puzzle = PUZZLES[0]!;
    const assignment = new Array(36).fill(-1);
    expect(checkWon(puzzle, assignment)).toBe(false);
  });

  it("returns true when assignment matches solution", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, puzzle.solution)).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, easy);
    const wonState = { ...s, won: true, moves: 30 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(910);
  });
});

describe("Galaxies reset", () => {
  it("clears assignment and resets state", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "selectGalaxy", galaxyIdx: 0 });
    const s3 = reducer(s2, { type: "paintCell", cellIdx: 0 });
    const s4 = reducer(s3, { type: "reset" });
    expect(s4.assignment.every(v => v === -1)).toBe(true);
    expect(s4.moves).toBe(0);
    expect(s4.selected).toBeNull();
  });
});
