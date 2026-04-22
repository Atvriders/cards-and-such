import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, checkWon, computeVisibility } from "./state.js";
import { PUZZLES_EASY } from "./puzzles.js";

const easy = { difficulty: "easy" as const };
const hard = { difficulty: "hard" as const };

describe("Cave initialState", () => {
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

  it("hard puzzle may be larger", () => {
    const e = initialState(1, easy);
    const h = initialState(1, hard);
    expect(h.puzzle.size).toBeGreaterThanOrEqual(e.puzzle.size);
  });
});

describe("Cave computeVisibility", () => {
  it("counts self plus visible cells in 4 directions", () => {
    const puzzle = PUZZLES_EASY[0]!;
    // Use the solution board (border shaded)
    const board = puzzle.solution.map(s => s ? "shaded" : "empty") as ("shaded"|"empty"|"dot")[];
    // Clue at (2,2): self + up=(1,2) 1 + down=(3,2),(4,2) 2 + left=(2,1) 1 + right=(2,3),(2,4) 2 = 7
    const vis = computeVisibility(puzzle, board, 2, 2);
    expect(vis).toBe(7);
  });

  it("shaded cell returns 0", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const board = puzzle.solution.map(s => s ? "shaded" : "empty") as ("shaded"|"empty"|"dot")[];
    // (0,0) is shaded in E1
    expect(computeVisibility(puzzle, board, 0, 0)).toBe(0);
  });

  it("visibility is blocked by shaded cells", () => {
    const puzzle = { size: 5, clues: [], solution: new Array(25).fill(false) };
    const board = new Array(25).fill("empty") as ("shaded"|"empty"|"dot")[];
    board[5] = "shaded"; // (1,0) shaded
    // From (2,0): up blocked at (1,0) immediately, so up=0; self=1
    const vis = computeVisibility(puzzle, board, 2, 0);
    // down=(3,0),(4,0)→2; left=0; right=(2,1),(2,2),(2,3),(2,4)→4; up=0; self=1
    expect(vis).toBe(1 + 0 + 4 + 0 + 2);
  });
});

describe("Cave clickCell", () => {
  it("cycles empty → shaded → dot → empty", () => {
    const s = initialState(1, easy);
    let s2 = reducer(s, { type: "clickCell", idx: 0 });
    expect(s2.board[0]).toBe("shaded");
    s2 = reducer(s2, { type: "clickCell", idx: 0 });
    expect(s2.board[0]).toBe("dot");
    s2 = reducer(s2, { type: "clickCell", idx: 0 });
    expect(s2.board[0]).toBe("empty");
  });

  it("increments moves", () => {
    const s = initialState(1, easy);
    expect(reducer(s, { type: "clickCell", idx: 0 }).moves).toBe(1);
  });
});

describe("Cave checkWon", () => {
  it("returns false for empty board", () => {
    expect(checkWon(PUZZLES_EASY[0]!, new Array(36).fill("empty"))).toBe(false);
  });

  it("returns true when board matches solution", () => {
    const puzzle = PUZZLES_EASY[0]!;
    const board = puzzle.solution.map(s => s ? "shaded" : "empty") as ("shaded"|"empty"|"dot")[];
    expect(checkWon(puzzle, board)).toBe(true);
  });
});

describe("Cave reset", () => {
  it("resets board and moves", () => {
    const s = initialState(1, easy);
    const s2 = reducer(reducer(s, { type: "clickCell", idx: 0 }), { type: "reset" });
    expect(s2.board.every(c => c === "empty")).toBe(true);
    expect(s2.moves).toBe(0);
  });
});

describe("Cave isTerminal", () => {
  it("returns null when not won", () => {
    expect(isTerminal(initialState(1, easy))).toBeNull();
  });

  it("returns score when won, with floor 100", () => {
    const s = initialState(1, easy);
    expect(isTerminal({ ...s, won: true, moves: 10 })!.score).toBe(960);
    expect(isTerminal({ ...s, won: true, moves: 9999 })!.score).toBe(100);
  });
});
