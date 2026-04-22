import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon } from "./state.js";
import { FILLOMINO_PUZZLES } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Fillomino initialState", () => {
  it("current matches given at start, won=false, moves=0", () => {
    const s = initialState(1, easy);
    expect(Array.from(s.current)).toEqual(Array.from(s.puzzle.given));
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
    expect(s.selected).toBeNull();
  });

  it("is deterministic", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("hard puzzle is larger", () => {
    const e = initialState(1, easy);
    const h = initialState(1, hard);
    expect(h.puzzle.size).toBeGreaterThan(e.puzzle.size);
  });
});

describe("Fillomino select action", () => {
  it("sets selected index", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "select", idx: 5 });
    expect(s2.selected).toBe(5);
  });

  it("can deselect", () => {
    const s = reducer(initialState(1, easy), { type: "select", idx: 5 });
    expect(reducer(s, { type: "select", idx: null }).selected).toBeNull();
  });
});

describe("Fillomino enter action", () => {
  it("enters number into empty cell", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.given.findIndex(v => v === 0);
    const s2 = reducer({ ...s, selected: emptyIdx }, { type: "enter", value: 3 });
    expect(s2.current[emptyIdx]).toBe(3);
    expect(s2.moves).toBe(1);
  });

  it("cannot overwrite given cell", () => {
    const s = initialState(1, easy);
    const givenIdx = s.puzzle.given.findIndex(v => v !== 0);
    const original = s.puzzle.given[givenIdx]!;
    const s2 = reducer({ ...s, selected: givenIdx }, { type: "enter", value: original + 1 });
    expect(s2.current[givenIdx]).toBe(original);
    expect(s2.moves).toBe(0);
  });

  it("enter 0 clears cell", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.given.findIndex(v => v === 0);
    let s2 = reducer({ ...s, selected: emptyIdx }, { type: "enter", value: 4 });
    s2 = reducer({ ...s2, selected: emptyIdx }, { type: "enter", value: 0 });
    expect(s2.current[emptyIdx]).toBe(0);
  });
});

describe("Fillomino checkWon", () => {
  it("returns false when current doesn't match solution", () => {
    const easyPuzzles = FILLOMINO_PUZZLES["easy"]!;
    const puzzle = easyPuzzles[0]!;
    expect(checkWon(puzzle, new Array(36).fill(0))).toBe(false);
  });

  it("returns true when current matches solution", () => {
    const easyPuzzles = FILLOMINO_PUZZLES["easy"]!;
    const puzzle = easyPuzzles[0]!;
    expect(checkWon(puzzle, puzzle.solution)).toBe(true);
  });
});

describe("Fillomino reset", () => {
  it("restores given state and clears moves", () => {
    const s = initialState(1, easy);
    const emptyIdx = s.puzzle.given.findIndex(v => v === 0);
    let s2 = reducer({ ...s, selected: emptyIdx }, { type: "enter", value: 3 });
    s2 = reducer(s2, { type: "reset" });
    expect(Array.from(s2.current)).toEqual(Array.from(s2.puzzle.given));
    expect(s2.moves).toBe(0);
  });
});

describe("Fillomino win", () => {
  it("wins when filling the last cell correctly", () => {
    const s = initialState(1, easy);
    // Force-fill all empty cells with solution values
    const puzzle = s.puzzle;
    const emptyIdxs = puzzle.given.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0);
    let state = s;
    for (const idx of emptyIdxs) {
      state = reducer({ ...state, selected: idx }, { type: "enter", value: puzzle.solution[idx]! });
    }
    expect(state.won).toBe(true);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("isTerminal returns score floor 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
