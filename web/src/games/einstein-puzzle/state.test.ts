import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, checkWon, PUZZLES } from "./state.js";

describe("EinsteinPuzzle", () => {
  it("initialState creates puzzle with 5 categories and 5 positions", () => {
    const s = initialState(1, {});
    expect(s.puzzle.categories).toHaveLength(5);
    expect(s.puzzle.values).toHaveLength(5);
    for (const vals of s.puzzle.values) {
      expect(vals).toHaveLength(5);
    }
  });

  it("marks start all null", () => {
    const s = initialState(2, {});
    for (const cm of s.marks) {
      for (const pm of cm) {
        for (const v of pm) {
          expect(v).toBeNull();
        }
      }
    }
  });

  it("setMark toggles a cell and increments moves", () => {
    const s = initialState(3, {});
    const s2 = reducer(s, { type: "setMark", cat: 0, pos: 0, val: 0, mark: true });
    expect(s2.marks[0]![0]![0]).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("checkWon returns false on partial marks", () => {
    const s = initialState(4, {});
    expect(checkWon(s.puzzle, s.marks)).toBe(false);
  });

  it("reset clears marks and moves", () => {
    let s = initialState(5, {});
    s = reducer(s, { type: "setMark", cat: 0, pos: 1, val: 2, mark: true });
    const reset = reducer(s, { type: "reset" });
    expect(reset.moves).toBe(0);
    expect(reset.marks[0]![1]![2]).toBeNull();
  });

  it("isTerminal returns null when not won", () => {
    const s = initialState(6, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("filling the correct solution triggers a win", () => {
    let s = initialState(7, {});
    const puzzle = PUZZLES[0]!;
    s = { ...s, puzzle };
    // Fill solution completely: for each cat and pos, mark the correct value true and all others false
    let cur = s;
    for (let c = 0; c < 5; c++) {
      for (let p = 0; p < 5; p++) {
        const solV = puzzle.solution[c]![p]!;
        for (let v = 0; v < 5; v++) {
          cur = reducer(cur, { type: "setMark", cat: c, pos: p, val: v, mark: v === solV ? true : false });
        }
      }
    }
    expect(cur.won).toBe(true);
    expect(isTerminal(cur)).not.toBeNull();
  });

  it("score is capped at minimum 100", () => {
    let s = initialState(8, {});
    const puzzle = PUZZLES[1]!;
    s = { ...s, puzzle };
    // spam some moves
    let cur = s;
    for (let i = 0; i < 50; i++) {
      cur = reducer(cur, { type: "setMark", cat: 0, pos: 0, val: 0, mark: null });
    }
    // now fill the correct solution
    for (let c = 0; c < 5; c++) {
      for (let p = 0; p < 5; p++) {
        const solV = puzzle.solution[c]![p]!;
        for (let v = 0; v < 5; v++) {
          cur = reducer(cur, { type: "setMark", cat: c, pos: p, val: v, mark: v === solV ? true : false });
        }
      }
    }
    expect(cur.won).toBe(true);
    expect(isTerminal(cur)!.score).toBeGreaterThanOrEqual(100);
  });
});
