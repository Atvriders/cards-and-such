import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, VERIFIED_PUZZLES, countTentsInRow, countTentsInCol } from "./state.js";

const s6 = { size: "6" as const };
const s8 = { size: "8" as const };
const s10 = { size: "10" as const };

describe("Tents VERIFIED_PUZZLES", () => {
  it("each puzzle has row/col clues matching the solution", () => {
    for (const [sizeStr, puzzles] of Object.entries(VERIFIED_PUZZLES)) {
      const N = Number(sizeStr);
      for (const puzzle of puzzles) {
        const board = puzzle.solution.map((isTent) => (isTent ? "tent" : "empty")) as ("tent" | "empty")[];
        for (let r = 0; r < N; r++) {
          expect(countTentsInRow(board, N, r)).toBe(puzzle.rowClues[r]);
        }
        for (let c = 0; c < N; c++) {
          expect(countTentsInCol(board, N, c)).toBe(puzzle.colClues[c]);
        }
      }
    }
  });

  it("trees and tents don't overlap", () => {
    for (const puzzles of Object.values(VERIFIED_PUZZLES)) {
      for (const puzzle of puzzles) {
        for (let i = 0; i < puzzle.trees.length; i++) {
          expect(puzzle.trees[i] && puzzle.solution[i]).toBeFalsy();
        }
      }
    }
  });
});

describe("Tents initialState", () => {
  it("board starts all empty", () => {
    const s = initialState(1, s6);
    expect(s.board.every((m) => m === "empty")).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, s8);
    const s2 = initialState(42, s8);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("puzzle size matches settings", () => {
    const s = initialState(1, s10);
    expect(s.puzzle.size).toBe(10);
    expect(s.board.length).toBe(100);
  });
});

describe("Tents clickCell", () => {
  it("cycles empty → tent → x → empty", () => {
    const s = initialState(1, s6);
    // Find a non-tree cell
    const idx = s.puzzle.trees.findIndex((t) => !t);
    let s2 = reducer(s, { type: "clickCell", idx });
    expect(s2.board[idx]).toBe("tent");
    s2 = reducer(s2, { type: "clickCell", idx });
    expect(s2.board[idx]).toBe("x");
    s2 = reducer(s2, { type: "clickCell", idx });
    expect(s2.board[idx]).toBe("empty");
  });

  it("cannot click a tree cell", () => {
    const s = initialState(1, s6);
    const treeIdx = s.puzzle.trees.findIndex((t) => t);
    const s2 = reducer(s, { type: "clickCell", idx: treeIdx });
    expect(s2.board[treeIdx]).toBe("empty");
    expect(s2.moves).toBe(0);
  });

  it("increments moves on valid click", () => {
    const s = initialState(1, s6);
    const idx = s.puzzle.trees.findIndex((t) => !t);
    const s2 = reducer(s, { type: "clickCell", idx });
    expect(s2.moves).toBe(1);
  });
});

describe("Tents reset", () => {
  it("clears the board and resets moves", () => {
    const s = initialState(1, s6);
    const idx = s.puzzle.trees.findIndex((t) => !t);
    let s2 = reducer(s, { type: "clickCell", idx });
    expect(s2.moves).toBe(1);
    s2 = reducer(s2, { type: "reset" });
    expect(s2.board.every((m) => m === "empty")).toBe(true);
    expect(s2.moves).toBe(0);
    expect(s2.won).toBe(false);
  });
});

describe("Tents win", () => {
  it("wins when board matches solution", () => {
    const puzzle = VERIFIED_PUZZLES["6"]![0]!;
    const s = initialState(0, s6);
    const solBoard = puzzle.solution.map((isTent) => (isTent ? "tent" : "empty")) as ("tent" | "empty")[];
    // Find last tent index
    const lastTentIdx = [...solBoard].reverse().findIndex((m) => m === "tent");
    const lastIdx = solBoard.length - 1 - lastTentIdx;
    const board = solBoard.slice();
    board[lastIdx] = "empty";
    const almostState = { ...s, puzzle, board };
    const done = reducer(almostState, { type: "clickCell", idx: lastIdx });
    expect(done.won).toBe(true);
  });

  it("isTerminal returns score when won", () => {
    const s = initialState(1, s6);
    const wonState = { ...s, won: true, moves: 15 };
    const result = isTerminal(wonState);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(100);
  });

  it("isTerminal returns null when not won", () => {
    expect(isTerminal(initialState(1, s6))).toBeNull();
  });
});
