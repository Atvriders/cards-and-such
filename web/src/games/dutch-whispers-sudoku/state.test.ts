import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, validate, GRID_SIZE } from "./state.js";

const S = { dummy: true };

describe("Dutch Whispers Sudoku", () => {
  it("creates initial state with puzzles", () => {
    const s = initialState(1, S);
    expect(s.puzzles.length).toBeGreaterThanOrEqual(4);
    expect(s.current.length).toBe(GRID_SIZE * GRID_SIZE);
    expect(s.phase).toBe("playing");
  });

  it("select then enter writes digit on empty cell", () => {
    const s = initialState(1, S);
    const empty = s.puzzles[0]!.given.findIndex((g) => g === 0);
    expect(empty).toBeGreaterThanOrEqual(0);
    const s1 = reducer(s, { type: "select", index: empty });
    const target = s.puzzles[0]!.solution[empty]!;
    const wrong = target === 1 ? 2 : 1;
    const s2 = reducer(s1, { type: "enter", digit: wrong });
    expect(s2.current[empty]).toBe(wrong);
    expect(s2.movesMade).toBe(1);
  });

  it("validate flags incorrect entry", () => {
    const s = initialState(1, S);
    const puzzle = s.puzzles[0]!;
    const empty = puzzle.given.findIndex((g) => g === 0);
    const wrong = puzzle.solution[empty] === 1 ? 2 : 1;
    const cur = [...s.current];
    cur[empty] = wrong;
    const errs = validate(cur, puzzle.solution);
    expect(errs).toContain(empty);
  });

  it("hint fills a correct cell", () => {
    const s = initialState(1, S);
    const s1 = reducer(s, { type: "hint" });
    expect(s1.hintsUsed).toBe(1);
  });

  it("filling complete solution solves the puzzle", () => {
    let s = initialState(1, S);
    const puzzle = s.puzzles[0]!;
    for (let i = 0; i < puzzle.given.length; i++) {
      if (puzzle.given[i] === 0) {
        s = reducer(s, { type: "select", index: i });
        s = reducer(s, { type: "enter", digit: puzzle.solution[i]! });
      }
    }
    expect(s.solved).toBe(true);
  });

  it("isTerminal returns score after all puzzles", () => {
    let s = initialState(1, S);
    while (s.phase !== "done") {
      const puzzle = s.puzzles[s.idx]!;
      for (let i = 0; i < puzzle.given.length; i++) {
        if (puzzle.given[i] === 0) {
          s = reducer(s, { type: "select", index: i });
          s = reducer(s, { type: "enter", digit: puzzle.solution[i]! });
        }
      }
      s = reducer(s, { type: "next" });
    }
    expect(isTerminal(s)).not.toBeNull();
  });
});
