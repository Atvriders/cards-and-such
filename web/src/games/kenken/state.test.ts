import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES, cageValue } from "./state.js";

const s4 = { size: "4" as const };
const s5 = { size: "5" as const };
const s6 = { size: "6" as const };

describe("KenKen PUZZLES validity", () => {
  it("all puzzles have solutions that are valid Latin squares", () => {
    for (const [sizeStr, puzzles] of Object.entries(PUZZLES)) {
      const N = Number(sizeStr);
      for (const puzzle of puzzles) {
        // Check each row
        for (let r = 0; r < N; r++) {
          const row = Array.from({ length: N }, (_, c) => puzzle.solution[r * N + c]!);
          expect(new Set(row).size).toBe(N);
          expect(row.every((v) => v >= 1 && v <= N)).toBe(true);
        }
        // Check each col
        for (let c = 0; c < N; c++) {
          const col = Array.from({ length: N }, (_, r) => puzzle.solution[r * N + c]!);
          expect(new Set(col).size).toBe(N);
        }
      }
    }
  });

  it("all cages satisfy their target with the solution", () => {
    for (const puzzles of Object.values(PUZZLES)) {
      for (const puzzle of puzzles) {
        for (const cage of puzzle.cages) {
          const val = cageValue(cage.cells, puzzle.solution, cage.op);
          expect(val).toBe(cage.target);
        }
      }
    }
  });

  it("all cells are covered by exactly one cage in each puzzle", () => {
    for (const [sizeStr, puzzles] of Object.entries(PUZZLES)) {
      const N = Number(sizeStr);
      for (const puzzle of puzzles) {
        const covered = new Array(N * N).fill(0);
        for (const cage of puzzle.cages) {
          for (const cell of cage.cells) {
            covered[cell]++;
          }
        }
        expect(covered.every((v) => v === 1)).toBe(true);
      }
    }
  });
});

describe("KenKen initialState", () => {
  it("creates empty board of correct size", () => {
    const s = initialState(42, s4);
    expect(s.board.length).toBe(16);
    expect(s.board.every((v) => v === 0)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(7, s5);
    const s2 = initialState(7, s5);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("KenKen reducer", () => {
  it("selectCell updates selected", () => {
    const s = initialState(1, s4);
    const s2 = reducer(s, { type: "selectCell", idx: 3 });
    expect(s2.selected).toBe(3);
  });

  it("enterDigit places digit and increments moves", () => {
    const s = initialState(1, s4);
    let s2 = reducer(s, { type: "selectCell", idx: 0 });
    s2 = reducer(s2, { type: "enterDigit", digit: 2 });
    expect(s2.board[0]).toBe(2);
    expect(s2.moves).toBe(1);
  });

  it("enterDigit ignores digits larger than grid size", () => {
    const s = initialState(1, s4);
    let s2 = reducer(s, { type: "selectCell", idx: 0 });
    s2 = reducer(s2, { type: "enterDigit", digit: 9 }); // 9 > 4
    expect(s2.board[0]).toBe(0);
    expect(s2.moves).toBe(0);
  });

  it("clearCell removes the digit", () => {
    const s = initialState(1, s4);
    let s2 = reducer(s, { type: "selectCell", idx: 0 });
    s2 = reducer(s2, { type: "enterDigit", digit: 3 });
    expect(s2.board[0]).toBe(3);
    s2 = reducer(s2, { type: "clearCell" });
    expect(s2.board[0]).toBe(0);
  });

  it("duplicate in row produces error cells", () => {
    const s = initialState(1, s4);
    let s2 = reducer(s, { type: "selectCell", idx: 0 });
    s2 = reducer(s2, { type: "enterDigit", digit: 1 });
    s2 = reducer(s2, { type: "selectCell", idx: 1 });
    s2 = reducer(s2, { type: "enterDigit", digit: 1 });
    expect(s2.errorCells.size).toBeGreaterThan(0);
  });
});

describe("KenKen win", () => {
  it("wins when board matches solution", () => {
    const puzzle = PUZZLES["4"]![0]!;
    const s = initialState(0, s4);
    // Build a state with the solution filled in except last cell
    const board = puzzle.solution.slice();
    const lastIdx = board.length - 1;
    const lastDigit = board[lastIdx]!;
    board[lastIdx] = 0;
    const almostState = { ...s, puzzle, board, selected: lastIdx };
    const done = reducer(almostState, { type: "enterDigit", digit: lastDigit });
    expect(done.won).toBe(true);
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, s6);
    const wonState = { ...s, won: true, moves: 30 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(100);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, s4))).toBeNull();
  });
});
