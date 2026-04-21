import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, computeErrorCells } from "./state.js";
import type { SudokuState } from "./state.js";

const easySettings = { difficulty: "easy" as const };
const mediumSettings = { difficulty: "medium" as const };
const hardSettings = { difficulty: "hard" as const };

describe("Sudoku initialState", () => {
  it("has length-81 given and current, selected=null, won=false", () => {
    const s = initialState(42, easySettings);
    expect(s.given.length).toBe(81);
    expect(s.current.length).toBe(81);
    expect(s.solution.length).toBe(81);
    expect(s.selected).toBeNull();
    expect(s.won).toBe(false);
    expect(s.movesMade).toBe(0);
    expect(s.hintsUsed).toBe(0);
  });

  it("given and current are identical at start", () => {
    const s = initialState(42, easySettings);
    expect(Array.from(s.current)).toEqual(Array.from(s.given));
  });

  it("easy difficulty has more givens than hard", () => {
    const easy = initialState(42, easySettings);
    const hard = initialState(42, hardSettings);
    const easyGivens = easy.given.filter((v) => v !== 0).length;
    const hardGivens = hard.given.filter((v) => v !== 0).length;
    // easy: 81-40=41 givens, hard: 81-58=23 givens
    expect(easyGivens).toBeGreaterThan(hardGivens);
  });

  it("medium difficulty has fewer givens than easy and more than hard", () => {
    const easy = initialState(7, easySettings);
    const medium = initialState(7, mediumSettings);
    const hard = initialState(7, hardSettings);
    const easyN = easy.given.filter((v) => v !== 0).length;
    const medN = medium.given.filter((v) => v !== 0).length;
    const hardN = hard.given.filter((v) => v !== 0).length;
    expect(easyN).toBeGreaterThan(medN);
    expect(medN).toBeGreaterThan(hardN);
  });
});

describe("Sudoku determinism", () => {
  it("is deterministic under the same seed and settings", () => {
    const s1 = initialState(99, easySettings);
    const s2 = initialState(99, easySettings);
    expect(Array.from(s1.given)).toEqual(Array.from(s2.given));
    expect(Array.from(s1.solution)).toEqual(Array.from(s2.solution));
  });

  it("produces different puzzles for different seeds", () => {
    const s1 = initialState(1, easySettings);
    const s2 = initialState(2, easySettings);
    // Very unlikely (essentially impossible) to be identical
    expect(Array.from(s1.given)).not.toEqual(Array.from(s2.given));
  });
});

describe("Sudoku select action", () => {
  it("updates selected to the given index", () => {
    const s = initialState(42, easySettings);
    const s2 = reducer(s, { type: "select", index: 5 });
    expect(s2.selected).toBe(5);
  });

  it("can select null to deselect", () => {
    let s = initialState(42, easySettings);
    s = reducer(s, { type: "select", index: 5 });
    s = reducer(s, { type: "select", index: null });
    expect(s.selected).toBeNull();
  });
});

describe("Sudoku enter action", () => {
  function findEmptyCell(s: SudokuState): number {
    return s.given.findIndex((v) => v === 0);
  }

  function findGivenCell(s: SudokuState): number {
    return s.given.findIndex((v) => v !== 0);
  }

  it("entering on a given cell is rejected (current unchanged)", () => {
    const s = initialState(42, easySettings);
    const givenIdx = findGivenCell(s);
    const givenDigit = s.given[givenIdx]!;
    const newDigit = givenDigit === 9 ? 1 : givenDigit + 1;

    const s2 = reducer(
      { ...s, selected: givenIdx },
      { type: "enter", digit: newDigit as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 },
    );
    expect(s2.current[givenIdx]).toBe(givenDigit);
    expect(s2.movesMade).toBe(0);
  });

  it("entering on an empty cell records the digit and bumps movesMade", () => {
    const s = initialState(42, easySettings);
    const emptyIdx = findEmptyCell(s);
    expect(emptyIdx).toBeGreaterThanOrEqual(0);

    const s2 = reducer({ ...s, selected: emptyIdx }, { type: "enter", digit: 5 });
    expect(s2.current[emptyIdx]).toBe(5);
    expect(s2.movesMade).toBe(1);
  });

  it("entering digit 0 erases the cell", () => {
    const s = initialState(42, easySettings);
    const emptyIdx = findEmptyCell(s);

    let s2 = reducer({ ...s, selected: emptyIdx }, { type: "enter", digit: 3 });
    expect(s2.current[emptyIdx]).toBe(3);

    s2 = reducer({ ...s2, selected: emptyIdx }, { type: "enter", digit: 0 });
    expect(s2.current[emptyIdx]).toBe(0);
  });

  it("no-op when selected is null", () => {
    const s = initialState(42, easySettings);
    const s2 = reducer({ ...s, selected: null }, { type: "enter", digit: 5 });
    expect(s2.movesMade).toBe(0);
    expect(Array.from(s2.current)).toEqual(Array.from(s.current));
  });
});

describe("Sudoku error detection", () => {
  it("duplicate in same row marks both cells as errors", () => {
    // Build a current board where row 0 has two cells with same digit
    const base = Array(81).fill(0);
    base[0] = 5;
    base[1] = 5; // duplicate in row 0
    const errors = computeErrorCells(base);
    expect(errors).toContain(0);
    expect(errors).toContain(1);
  });

  it("duplicate in same column marks both cells as errors", () => {
    const base = Array(81).fill(0);
    base[0] = 7;  // row 0, col 0
    base[9] = 7;  // row 1, col 0 — same column
    const errors = computeErrorCells(base);
    expect(errors).toContain(0);
    expect(errors).toContain(9);
  });

  it("duplicate in same 3x3 box marks both cells as errors", () => {
    const base = Array(81).fill(0);
    base[0] = 3;  // row 0, col 0 — top-left box
    base[11] = 3; // row 1, col 2 — same box
    const errors = computeErrorCells(base);
    expect(errors).toContain(0);
    expect(errors).toContain(11);
  });

  it("non-conflicting entries produce no errors", () => {
    const base = Array(81).fill(0);
    base[0] = 1;
    base[1] = 2;
    const errors = computeErrorCells(base);
    expect(errors.length).toBe(0);
  });
});

describe("Sudoku win condition", () => {
  it("won becomes true when current fully matches a valid solution", () => {
    const s = initialState(42, easySettings);
    // Fill current with the known solution
    const winState: SudokuState = {
      ...s,
      current: s.solution.slice(),
    };
    // Trigger recompute via a dummy enter on a cell that is already correct
    // Instead, just test via a crafted state with won checked by reducer
    const firstEmpty = s.given.findIndex((v) => v === 0);
    // Fill everything except one cell, then fill that cell
    const almostDone = s.solution.slice() as number[];
    almostDone[firstEmpty] = 0; // make it empty

    const almostState: SudokuState = {
      ...s,
      given: s.given,
      current: almostDone,
      selected: firstEmpty,
    };

    const digit = s.solution[firstEmpty] as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    const done = reducer(almostState, { type: "enter", digit });
    expect(done.won).toBe(true);
  });
});

describe("Sudoku isTerminal", () => {
  it("returns null when game is not won", () => {
    const s = initialState(42, easySettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("returns { score } when won is true", () => {
    const s = initialState(42, easySettings);
    const wonState: SudokuState = { ...s, won: true, movesMade: 10, hintsUsed: 0 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(typeof result?.score).toBe("number");
    // score = max(100, 1000 - 10*5 - 0*50) = max(100, 950) = 950
    expect(result?.score).toBe(950);
  });

  it("score is at minimum 100 regardless of moves", () => {
    const s = initialState(42, easySettings);
    const wonState: SudokuState = { ...s, won: true, movesMade: 9999, hintsUsed: 99 };
    const result = isTerminal(wonState);
    expect(result?.score).toBe(100);
  });
});

describe("Sudoku hint action", () => {
  it("fills the first empty cell with the correct solution digit", () => {
    const s = initialState(42, easySettings);
    const firstEmpty = s.given.findIndex((v) => v === 0);
    const expected = s.solution[firstEmpty]!;

    const s2 = reducer(s, { type: "hint" });
    expect(s2.current[firstEmpty]).toBe(expected);
    expect(s2.hintsUsed).toBe(1);
    expect(s2.selected).toBe(firstEmpty);
  });

  it("increments movesMade on hint", () => {
    const s = initialState(42, easySettings);
    const s2 = reducer(s, { type: "hint" });
    expect(s2.movesMade).toBe(1);
  });
});
