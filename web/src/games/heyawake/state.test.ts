import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, countShadedInRoom } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Heyawake initialState", () => {
  it("starts with all empty cells, not won, zero moves", () => {
    const s = initialState(1, easy);
    expect(s.board.every(c => c === "empty")).toBe(true);
    expect(s.won).toBe(false);
    expect(s.moves).toBe(0);
  });

  it("is deterministic", () => {
    const s1 = initialState(42, easy);
    const s2 = initialState(42, easy);
    expect(s1.puzzle).toBe(s2.puzzle);
  });

  it("hard puzzle size is larger", () => {
    const e = initialState(1, easy);
    const h = initialState(1, hard);
    expect(h.puzzle.size).toBeGreaterThanOrEqual(e.puzzle.size);
  });
});

describe("Heyawake clickCell", () => {
  it("cycles empty → shaded → dot → empty", () => {
    const s = initialState(1, easy);
    let s2 = reducer(s, { type: "clickCell", idx: 0 });
    expect(s2.board[0]).toBe("shaded");
    s2 = reducer(s2, { type: "clickCell", idx: 0 });
    expect(s2.board[0]).toBe("dot");
    s2 = reducer(s2, { type: "clickCell", idx: 0 });
    expect(s2.board[0]).toBe("empty");
  });

  it("increments moves on each click", () => {
    const s = initialState(1, easy);
    const s2 = reducer(s, { type: "clickCell", idx: 0 });
    expect(s2.moves).toBe(1);
  });
});

describe("Heyawake reset", () => {
  it("clears board and resets moves", () => {
    const s = initialState(1, easy);
    let s2 = reducer(s, { type: "clickCell", idx: 0 });
    s2 = reducer(s2, { type: "reset" });
    expect(s2.board.every(c => c === "empty")).toBe(true);
    expect(s2.moves).toBe(0);
  });
});

describe("Heyawake countShadedInRoom", () => {
  it("counts shaded cells inside a room correctly", () => {
    const s = initialState(1, easy);
    const puzzle = s.puzzle;
    // Shade the center of the grid — check which room it's in
    const board = s.board.slice() as typeof s.board;
    const room0 = puzzle.rooms[0]!;
    const cellInRoom0 = room0.r * puzzle.size + room0.c;
    board[cellInRoom0] = "shaded";
    expect(countShadedInRoom(board, puzzle, 0)).toBe(1);
  });

  it("dot cells do not count as shaded", () => {
    const s = initialState(1, easy);
    const board = s.board.slice() as typeof s.board;
    board[0] = "dot";
    expect(countShadedInRoom(board, s.puzzle, 0)).toBe(0);
  });
});

describe("Heyawake checkWon", () => {
  it("returns false for empty board", () => {
    const puzzle = PUZZLES_EASY[1]!; // simple clue=1 per quadrant
    expect(checkWon(puzzle, new Array(36).fill("empty"))).toBe(false);
  });

  it("returns true when board matches solution", () => {
    const puzzle = PUZZLES_EASY[1]!;
    const board = puzzle.solution.map(s => s ? "shaded" : "empty") as ("shaded"|"empty"|"dot")[];
    expect(checkWon(puzzle, board)).toBe(true);
  });

  it("returns false when wrong cell is shaded", () => {
    const puzzle = PUZZLES_EASY[1]!;
    const board = new Array(36).fill("empty") as ("shaded"|"empty"|"dot")[];
    board[0] = "shaded"; // wrong cell
    expect(checkWon(puzzle, board)).toBe(false);
  });
});

describe("Heyawake isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won", () => {
    const s = initialState(1, easy);
    const result = isTerminal({ ...s, won: true, moves: 10 });
    expect(result!.score).toBe(960);
  });

  it("score has floor of 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
