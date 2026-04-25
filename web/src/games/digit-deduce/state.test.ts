import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES } from "./state.js";

describe("DigitDeduce", () => {
  it("initialState creates blank entries of correct length", () => {
    const s = initialState(1, {});
    expect(s.entries).toHaveLength(s.puzzle.length);
    expect(s.entries.every((e) => e === null)).toBe(true);
  });

  it("setDigit updates an entry", () => {
    const s = initialState(2, {});
    const s2 = reducer(s, { type: "setDigit", pos: 0, digit: 5 });
    expect(s2.entries[0]).toBe(5);
    expect(s2.moves).toBe(1);
  });

  it("setDigit null clears an entry", () => {
    let s = initialState(3, {});
    s = reducer(s, { type: "setDigit", pos: 0, digit: 4 });
    s = reducer(s, { type: "setDigit", pos: 0, digit: null });
    expect(s.entries[0]).toBeNull();
  });

  it("submit without all filled does nothing", () => {
    const s = initialState(4, {});
    const s2 = reducer(s, { type: "submit" });
    expect(s2.submitted).toBe(false);
  });

  it("submitting correct solution wins", () => {
    let s = initialState(0, {});
    const puzzle = PUZZLES[0]!;
    s = { ...s, puzzle, entries: new Array<null>(puzzle.length).fill(null) };
    for (let i = 0; i < puzzle.length; i++) {
      s = reducer(s, { type: "setDigit", pos: i, digit: puzzle.solution[i]! });
    }
    s = reducer(s, { type: "submit" });
    expect(s.correct).toBe(true);
    expect(isTerminal(s)!.score).toBeGreaterThan(0);
  });

  it("submitting wrong solution loses", () => {
    let s = initialState(0, {});
    const puzzle = PUZZLES[0]!;
    s = { ...s, puzzle, entries: new Array<null>(puzzle.length).fill(null) };
    for (let i = 0; i < puzzle.length; i++) {
      // put wrong digit (offset by 1)
      s = reducer(s, { type: "setDigit", pos: i, digit: (puzzle.solution[i]! + 1) % 10 });
    }
    s = reducer(s, { type: "submit" });
    expect(s.correct).toBe(false);
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("reset loads a new puzzle", () => {
    let s = initialState(5, {});
    s = reducer(s, { type: "setDigit", pos: 0, digit: 3 });
    s = reducer(s, { type: "reset" });
    expect(s.entries.every((e) => e === null)).toBe(true);
    expect(s.moves).toBe(0);
    expect(s.submitted).toBe(false);
  });

  it("all puzzles have valid solutions", () => {
    for (const p of PUZZLES) {
      expect(p.solution).toHaveLength(p.length);
      for (const d of p.solution) {
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(9);
      }
    }
  });
});
