import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy: { difficulty: "easy" } = { difficulty: "easy" };

describe("Numberlink initialState", () => {
  it("starts with endpoints filled, not won, zero moves", () => {
    const s = initialState(1, easy);
    const { puzzle, paths } = s;
    // Endpoints are pre-filled
    for (let i = 0; i < puzzle.size * puzzle.size; i++) {
      if (puzzle.endpoints[i] !== 0) {
        expect(paths[i]).toBe(puzzle.endpoints[i]);
      }
    }
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("puzzle has endpoints", () => {
    const s = initialState(1, easy);
    const endpoints = s.puzzle.endpoints.filter(v => v > 0);
    expect(endpoints.length).toBeGreaterThan(0);
  });
});

describe("Numberlink setPath action", () => {
  it("sets a path cell to a color", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.paths.findIndex(v => v === 0);
    if (emptyIdx >= 0) {
      const s2 = reducer(s, { type: "setPath", idx: emptyIdx, color: 1 });
      expect(s2.paths[emptyIdx]).toBe(1);
      expect(s2.moves).toBe(1);
    }
  });

  it("cannot overwrite endpoint cells", () => {
    const s = initialState(1, easy);
    const endpointIdx = s.puzzle.endpoints.findIndex(v => v > 0);
    const origColor = s.puzzle.endpoints[endpointIdx]!;
    const otherColor = origColor === 1 ? 2 : 1;
    const s2 = reducer(s, { type: "setPath", idx: endpointIdx, color: otherColor });
    expect(s2.paths[endpointIdx]).toBe(origColor);
    expect(s2.moves).toBe(0);
  });
});

describe("Numberlink clearPath action", () => {
  it("clears non-endpoint cells of a given color", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.paths.findIndex(v => v === 0);
    if (emptyIdx >= 0) {
      const s2 = reducer(s, { type: "setPath", idx: emptyIdx, color: 1 });
      const s3 = reducer(s2, { type: "clearPath", color: 1 });
      expect(s3.paths[emptyIdx]).toBe(0);
    }
  });
});

describe("Numberlink checkWon", () => {
  it("returns false for partially filled grid", () => {
    const puzzle = PUZZLES[0]!;
    const partial = puzzle.endpoints.slice();
    expect(checkWon(puzzle, partial)).toBe(false);
  });

  it("returns true for correct solution", () => {
    const puzzle = PUZZLES[0]!;
    expect(checkWon(puzzle, puzzle.solution)).toBe(true);
  });

  it("returns false if a cell is wrong color", () => {
    const puzzle = PUZZLES[0]!;
    const wrong = puzzle.solution.slice();
    // Find a non-endpoint cell and change its color
    const nonEndpt = wrong.findIndex((v, i) => v > 0 && puzzle.endpoints[i] === 0);
    if (nonEndpt >= 0) {
      wrong[nonEndpt] = (wrong[nonEndpt]! % 4) + 1; // different color
      expect(checkWon(puzzle, wrong)).toBe(false);
    }
  });
});

describe("Numberlink reset", () => {
  it("resets paths to endpoints only", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.paths.findIndex(v => v === 0);
    if (emptyIdx >= 0) {
      const s2 = reducer(s, { type: "setPath", idx: emptyIdx, color: 1 });
      const s3 = reducer(s2, { type: "reset" });
      expect(s3.paths[emptyIdx]).toBe(0);
      expect(s3.moves).toBe(0);
      expect(s3.won).toBe(false);
    }
  });
});

describe("Numberlink isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 10 };
    expect(isTerminal(won)!.score).toBe(970);
  });

  it("score has floor 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
