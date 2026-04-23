import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon } from "./state.js";
import { PUZZLES } from "./puzzles.js";

const easy: { difficulty: "easy" } = { difficulty: "easy" };

describe("LogicGrid initialState", () => {
  it("starts with all marks null and not won", () => {
    const s = initialState(1, easy);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
    expect(s.marks[0]![0]![0]).toBeNull();
  });

  it("is deterministic with same seed", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle.title).toBe(s2.puzzle.title);
  });

  it("marks array has correct shape 5×4×5", () => {
    const s = initialState(1, easy);
    expect(s.marks.length).toBe(5);
    expect(s.marks[0]!.length).toBe(4);
    expect(s.marks[0]![0]!.length).toBe(5);
  });
});

describe("LogicGrid setMark action", () => {
  it("sets a mark to true", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "setMark", entity: 0, attr: 0, value: 0, mark: true });
    expect(s2.marks[0]![0]![0]).toBe(true);
    expect(s2.moves).toBe(1);
  });

  it("sets a mark to false", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "setMark", entity: 1, attr: 2, value: 3, mark: false });
    expect(s2.marks[1]![2]![3]).toBe(false);
  });

  it("clears a mark back to null", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "setMark", entity: 0, attr: 0, value: 0, mark: true });
    const s3 = reducer(s2, { type: "setMark", entity: 0, attr: 0, value: 0, mark: null });
    expect(s3.marks[0]![0]![0]).toBeNull();
  });

  it("does not mutate other marks", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "setMark", entity: 0, attr: 0, value: 0, mark: true });
    expect(s2.marks[1]![0]![0]).toBeNull();
    expect(s2.marks[0]![1]![0]).toBeNull();
  });
});

describe("LogicGrid checkWon", () => {
  it("returns false for empty marks", () => {
    const puzzle = PUZZLES[0]!;
    const marks = Array.from({ length: 5 }, () =>
      Array.from({ length: 4 }, () => new Array(5).fill(null))
    );
    expect(checkWon(puzzle, marks)).toBe(false);
  });

  it("returns true for exactly correct marks", () => {
    const puzzle = PUZZLES[0]!;
    const n = 5;
    const marks = Array.from({ length: n }, (_e, ei) =>
      Array.from({ length: 4 }, (_a, ai) =>
        Array.from({ length: n }, (_v, vi) => vi === puzzle.solution[ei]![ai] ? true : false as boolean | null)
      )
    );
    expect(checkWon(puzzle, marks)).toBe(true);
  });

  it("returns false if one mark is wrong", () => {
    const puzzle = PUZZLES[0]!;
    const n = 5;
    const marks = Array.from({ length: n }, (_e, ei) =>
      Array.from({ length: 4 }, (_a, ai) =>
        Array.from({ length: n }, (_v, vi) => vi === puzzle.solution[ei]![ai] ? true : false as boolean | null)
      )
    );
    // flip one correct mark
    marks[0]![0]![puzzle.solution[0]![0]!] = false;
    expect(checkWon(puzzle, marks)).toBe(false);
  });
});

describe("LogicGrid reset", () => {
  it("clears all marks and moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "setMark", entity: 0, attr: 0, value: 0, mark: true });
    const s3 = reducer(s2, { type: "reset" });
    expect(s3.marks[0]![0]![0]).toBeNull();
    expect(s3.moves).toBe(0);
    expect(s3.won).toBe(false);
  });
});

describe("LogicGrid isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 20 };
    const result = isTerminal(won);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(940);
  });

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    const won = { ...s, won: true, moves: 9999 };
    expect(isTerminal(won)!.score).toBe(100);
  });
});
