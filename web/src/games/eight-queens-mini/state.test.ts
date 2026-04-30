import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeConflicts, SIZE, PUZZLE_COUNT } from "./state.js";

const S = { dummy: false };

describe("eight-queens-mini", () => {
  it("starts in playing phase with empty board", () => {
    const s = initialState(1, S);
    expect(s.phase).toBe("playing");
    expect(s.queens.length).toBe(SIZE * SIZE);
    expect(s.queens.every((q) => !q)).toBe(true);
  });
  it("toggle places and unplaces a queen, updating conflicts", () => {
    let s = reducer(initialState(1, S), { type: "toggle", idx: 0 });
    expect(s.queens[0]).toBe(true);
    // queen at (0,0) attacks (0,1) (1,0) (1,1) (2,2) (3,3) at minimum
    expect(s.conflicts[1]).toBe(true);
    expect(s.conflicts[5]).toBe(true);
    s = reducer(s, { type: "toggle", idx: 0 });
    expect(s.queens[0]).toBe(false);
    expect(s.conflicts.every((c) => !c)).toBe(true);
  });
  it("invalid submit (wrong count) reports a message and no advance", () => {
    let s = reducer(initialState(1, S), { type: "toggle", idx: 0 });
    s = reducer(s, { type: "submit" });
    expect(s.message.length).toBeGreaterThan(0);
    expect(s.score).toBe(0);
    expect(s.puzzleIndex).toBe(0);
  });
  it("valid 4-queens solve advances and scores", () => {
    // Solution: cols [1,3,0,2] for rows 0..3 → idx 1, 7, 8, 14
    let s = initialState(1, S);
    [1, 7, 8, 14].forEach((i) => {
      s = reducer(s, { type: "toggle", idx: i });
    });
    s = reducer(s, { type: "submit" });
    expect(s.score).toBe(25);
    expect(s.puzzleIndex).toBe(1);
    expect(s.queens.every((q) => !q)).toBe(true);
  });
  it("solving all 4 puzzles ends the game", () => {
    let s = initialState(1, S);
    for (let p = 0; p < PUZZLE_COUNT; p++) {
      [1, 7, 8, 14].forEach((i) => {
        s = reducer(s, { type: "toggle", idx: i });
      });
      s = reducer(s, { type: "submit" });
    }
    expect(s.phase).toBe("done");
    expect(isTerminal(s)).not.toBeNull();
    expect(s.score).toBe(25 * PUZZLE_COUNT);
  });
  it("computeConflicts marks all attacked squares", () => {
    const q = Array(SIZE * SIZE).fill(false);
    q[0] = true;
    const c = computeConflicts(q);
    // Whole row, col, and diagonal are attacked.
    expect(c[1]).toBe(true);
    expect(c[2]).toBe(true);
    expect(c[3]).toBe(true);
    expect(c[4]).toBe(true);
    expect(c[5]).toBe(true);
    expect(c[10]).toBe(true);
    expect(c[15]).toBe(true);
  });
});
