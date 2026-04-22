import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, PUZZLES, countVisible } from "./state.js";

const s4 = { size: "4" as const };
const s5 = { size: "5" as const };
const s6 = { size: "6" as const };

describe("countVisible", () => {
  it("counts 1 for decreasing sequence", () => {
    expect(countVisible([4, 3, 2, 1])).toBe(1);
  });

  it("counts N for strictly increasing sequence", () => {
    expect(countVisible([1, 2, 3, 4])).toBe(4);
  });

  it("counts correctly for mixed sequence", () => {
    expect(countVisible([2, 1, 4, 3])).toBe(2); // 2 visible (2, then 4)
  });

  it("returns 1 for a single element", () => {
    expect(countVisible([5])).toBe(1);
  });
});

describe("Skyscrapers PUZZLES validity", () => {
  it("all solutions are valid Latin squares", () => {
    for (const [sizeStr, puzzles] of Object.entries(PUZZLES)) {
      const N = Number(sizeStr);
      for (const puzzle of puzzles) {
        for (let r = 0; r < N; r++) {
          const row = Array.from({ length: N }, (_, c) => puzzle.solution[r * N + c]!);
          expect(new Set(row).size).toBe(N);
          expect(Math.min(...row)).toBe(1);
          expect(Math.max(...row)).toBe(N);
        }
        for (let c = 0; c < N; c++) {
          const col = Array.from({ length: N }, (_, r) => puzzle.solution[r * N + c]!);
          expect(new Set(col).size).toBe(N);
        }
      }
    }
  });

  it("clues match the solution visibility counts", () => {
    for (const [sizeStr, puzzles] of Object.entries(PUZZLES)) {
      const N = Number(sizeStr);
      for (const puzzle of puzzles) {
        for (let c = 0; c < N; c++) {
          const col = Array.from({ length: N }, (_, r) => puzzle.solution[r * N + c]!);
          expect(countVisible(col)).toBe(puzzle.topClues[c]);
          expect(countVisible([...col].reverse())).toBe(puzzle.bottomClues[c]);
        }
        for (let r = 0; r < N; r++) {
          const row = Array.from({ length: N }, (_, c) => puzzle.solution[r * N + c]!);
          expect(countVisible(row)).toBe(puzzle.leftClues[r]);
          expect(countVisible([...row].reverse())).toBe(puzzle.rightClues[r]);
        }
      }
    }
  });
});

describe("Skyscrapers initialState", () => {
  it("creates empty board", () => {
    const s = initialState(1, s4);
    expect(s.board.every((v) => v === 0)).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, s5);
    const s2 = initialState(42, s5);
    expect(s1.puzzle).toBe(s2.puzzle);
  });
});

describe("Skyscrapers reducer", () => {
  it("selectCell updates selected", () => {
    const s = initialState(1, s4);
    const s2 = reducer(s, { type: "selectCell", idx: 5 });
    expect(s2.selected).toBe(5);
  });

  it("enterDigit places digit and increments moves", () => {
    const s = initialState(1, s4);
    let s2 = reducer(s, { type: "selectCell", idx: 0 });
    s2 = reducer(s2, { type: "enterDigit", digit: 2 });
    expect(s2.board[0]).toBe(2);
    expect(s2.moves).toBe(1);
  });

  it("enterDigit rejects digit > size", () => {
    const s = initialState(1, s4);
    let s2 = reducer(s, { type: "selectCell", idx: 0 });
    s2 = reducer(s2, { type: "enterDigit", digit: 7 });
    expect(s2.board[0]).toBe(0);
    expect(s2.moves).toBe(0);
  });

  it("clearCell resets to 0", () => {
    const s = initialState(1, s4);
    let s2 = reducer(s, { type: "selectCell", idx: 0 });
    s2 = reducer(s2, { type: "enterDigit", digit: 3 });
    s2 = reducer(s2, { type: "clearCell" });
    expect(s2.board[0]).toBe(0);
  });

  it("duplicate in row marks error cells", () => {
    const s = initialState(1, s4);
    let s2 = reducer(s, { type: "selectCell", idx: 0 });
    s2 = reducer(s2, { type: "enterDigit", digit: 2 });
    s2 = reducer(s2, { type: "selectCell", idx: 1 });
    s2 = reducer(s2, { type: "enterDigit", digit: 2 });
    expect(s2.errorCells.size).toBeGreaterThan(0);
  });
});

describe("Skyscrapers win", () => {
  it("wins when solution entered correctly", () => {
    const puzzle = PUZZLES["4"]![1]!; // verified Latin square
    const s = initialState(0, s4);
    const board = puzzle.solution.slice();
    const lastIdx = board.length - 1;
    board[lastIdx] = 0;
    const almostState = { ...s, puzzle, board, selected: lastIdx };
    const lastDigit = puzzle.solution[lastIdx]!;
    const done = reducer(almostState, { type: "enterDigit", digit: lastDigit });
    expect(done.won).toBe(true);
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, s6);
    const wonState = { ...s, won: true, moves: 25 };
    expect(isTerminal(wonState)).not.toBeNull();
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, s4))).toBeNull();
  });
});
