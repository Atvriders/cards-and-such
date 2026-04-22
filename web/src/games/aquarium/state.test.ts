import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, countWaterInRow, countWaterInCol } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Aquarium initialState", () => {
  it("starts with all empty, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.cells.every(c => c === "empty")).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(7, easy);
    const s2 = initialState(7, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Aquarium puzzles clue consistency", () => {
  it("rowClues and colClues sum to same total", () => {
    for (const puzzle of PUZZLES_EASY) {
      const rowSum = puzzle.rowClues.reduce((a, b) => a + b, 0);
      const colSum = puzzle.colClues.reduce((a, b) => a + b, 0);
      expect(rowSum).toBe(colSum);
    }
  });

  it("clues match solution", () => {
    for (const puzzle of PUZZLES_EASY) {
      const allEmpty = new Array(puzzle.size * puzzle.size).fill("empty") as ("water"|"empty"|"x")[];
      const solBoard = puzzle.solution.map(s => s ? "water" : "empty") as ("water"|"empty"|"x")[];
      for (let r = 0; r < puzzle.size; r++) {
        expect(countWaterInRow(solBoard, puzzle.size, r)).toBe(puzzle.rowClues[r]);
      }
      for (let c = 0; c < puzzle.size; c++) {
        expect(countWaterInCol(solBoard, puzzle.size, c)).toBe(puzzle.colClues[c]);
      }
      // Empty board should have all zeros
      for (let r = 0; r < puzzle.size; r++) {
        expect(countWaterInRow(allEmpty, puzzle.size, r)).toBe(0);
      }
    }
  });
});

describe("Aquarium clickCell", () => {
  it("cycles empty → water → x → empty", () => {
    const s = initialState(1, easy);
    let s2 = reducer(s, { type: "clickCell", idx: 0 });
    expect(s2.cells[0]).toBe("water");
    s2 = reducer(s2, { type: "clickCell", idx: 0 });
    expect(s2.cells[0]).toBe("x");
    s2 = reducer(s2, { type: "clickCell", idx: 0 });
    expect(s2.cells[0]).toBe("empty");
  });

  it("increments moves", () => {
    const s = initialState(1, easy);
    expect(reducer(s, { type: "clickCell", idx: 0 }).moves).toBe(1);
  });
});

describe("Aquarium checkWon", () => {
  it("returns false for empty board", () => {
    expect(checkWon(PUZZLES_EASY[0]!, new Array(36).fill("empty"))).toBe(false);
  });

  it("returns true for correct solution", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const board = puzzle.solution.map(s => s ? "water" : "empty") as ("water"|"empty"|"x")[];
    expect(checkWon(puzzle, board)).toBe(true);
  });

  it("x cells don't count as water", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const board = puzzle.solution.map(s => s ? "x" : "empty") as ("water"|"empty"|"x")[];
    expect(checkWon(puzzle, board)).toBe(false);
  });
});

describe("Aquarium reset", () => {
  it("clears cells and resets moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(reducer(s, { type: "clickCell", idx: 0 }), { type: "reset" });
    expect(s2.cells.every(c => c === "empty")).toBe(true);
    expect(s2.moves).toBe(0);
  });
});

describe("Aquarium isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score floor 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
    expect(isTerminal({ ...s, won: true, moves: 5 })!.score).toBe(980);
  });
});
