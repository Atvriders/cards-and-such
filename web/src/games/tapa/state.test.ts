import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeNeighborGroups, getNeighborsCW } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Tapa initialState", () => {
  it("starts with all empty, not won, zero moves", () => {
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

  it("hard and easy both initialize", () => {
    expect(() => initialState(1, hard)).not.toThrow();
    expect(() => initialState(1, easy)).not.toThrow();
  });
});

describe("Tapa getNeighborsCW", () => {
  it("returns 8 neighbors for interior cell", () => {
    const neighbors = getNeighborsCW(6, 2, 2);
    expect(neighbors.filter(n => n >= 0).length).toBe(8);
  });

  it("returns fewer valid neighbors for corner cell", () => {
    const neighbors = getNeighborsCW(6, 0, 0);
    expect(neighbors.filter(n => n >= 0).length).toBe(3);
  });

  it("returns clockwise order NW,N,NE,E,SE,S,SW,W", () => {
    const neighbors = getNeighborsCW(6, 2, 2);
    // NW = (1,1) = 7, N = (1,2) = 8, NE = (1,3) = 9
    expect(neighbors[0]).toBe(1*6+1); // NW
    expect(neighbors[1]).toBe(1*6+2); // N
    expect(neighbors[2]).toBe(1*6+3); // NE
    expect(neighbors[3]).toBe(2*6+3); // E
  });
});

describe("Tapa computeNeighborGroups", () => {
  it("returns empty array when no shaded neighbors", () => {
    const board = new Array(36).fill("empty") as ("empty"|"shaded"|"dot")[];
    expect(computeNeighborGroups(board, 6, 2, 2)).toEqual([]);
  });

  it("detects a single group of shaded neighbors", () => {
    const board = new Array(36).fill("empty") as ("empty"|"shaded"|"dot")[];
    // Shade N,NE,E neighbors of (2,2) = (1,2),(1,3),(2,3)
    board[1*6+2] = "shaded"; // N
    board[1*6+3] = "shaded"; // NE
    board[2*6+3] = "shaded"; // E
    const groups = computeNeighborGroups(board, 6, 2, 2);
    expect(groups).toEqual([3]);
  });

  it("detects two separate groups", () => {
    const board = new Array(36).fill("empty") as ("empty"|"shaded"|"dot")[];
    // Shade N and S only (positions 1 and 5 in CW order) → 2 separate groups of 1
    board[1*6+2] = "shaded"; // N (pos 1)
    board[3*6+2] = "shaded"; // S (pos 5)
    const groups = computeNeighborGroups(board, 6, 2, 2);
    expect(groups).toEqual([1, 1]);
  });
});

describe("Tapa clickCell", () => {
  it("cycles empty → shaded → dot → empty", () => {
    const s = initialState(1, easy);
    const nonClueIdx = Array.from({length: s.puzzle.size**2}, (_, i) => i)
      .find(i => !s.puzzle.clues.some(cl => cl.r * s.puzzle.size + cl.c === i))!;
    let s2 = reducer(s, { type: "clickCell", idx: nonClueIdx });
    expect(s2.board[nonClueIdx]).toBe("shaded");
    s2 = reducer(s2, { type: "clickCell", idx: nonClueIdx });
    expect(s2.board[nonClueIdx]).toBe("dot");
    s2 = reducer(s2, { type: "clickCell", idx: nonClueIdx });
    expect(s2.board[nonClueIdx]).toBe("empty");
  });

  it("cannot click clue cell", () => {
    const s = initialState(1, easy);
    const clue = s.puzzle.clues[0]!;
    const clueIdx = clue.r * s.puzzle.size + clue.c;
    const s2 = reducer(s, { type: "clickCell", idx: clueIdx });
    expect(s2.board[clueIdx]).toBe("empty");
    expect(s2.moves).toBe(0);
  });
});

describe("Tapa checkWon", () => {
  it("returns false for empty board", () => {
    expect(checkWon(PUZZLES_EASY[0]!, new Array(36).fill("empty"))).toBe(false);
  });

  it("returns true when board matches solution", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const board = puzzle.solution.map(s => s ? "shaded" : "empty") as ("shaded"|"empty"|"dot")[];
    expect(checkWon(puzzle, board)).toBe(true);
  });
});

describe("Tapa isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score with floor 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 10 })!.score).toBe(960);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
