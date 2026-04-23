import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves, PUZZLES } from "./state.js";

const p1 = { puzzle: "1" as const };
const p3 = { puzzle: "3" as const };
const p5 = { puzzle: "5" as const };

describe("initialState", () => {
  it("loads puzzle 1 with correct start position", () => {
    const s = initialState(42, p1);
    expect(s.row).toBe(PUZZLES[0]!.startRow);
    expect(s.col).toBe(PUZZLES[0]!.startCol);
    expect(s.turnsUsed).toBe(0);
    expect(s.solved).toBe(false);
    expect(s.failed).toBe(false);
  });

  it("loads different puzzles by setting", () => {
    const s1 = initialState(1, p1);
    const s3 = initialState(1, p3);
    expect(s1.puzzle.rows).not.toBe(s3.puzzle.rows || s1.puzzle.cols !== s3.puzzle.cols);
  });
});

describe("getLegalMoves", () => {
  it("returns moves within grid bounds", () => {
    const s = initialState(1, p1);
    const moves = getLegalMoves(s);
    expect(Array.isArray(moves)).toBe(true);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("returns empty when solved", () => {
    const s = { ...initialState(1, p1), solved: true };
    expect(getLegalMoves(s)).toEqual([]);
  });

  it("returns empty when failed", () => {
    const s = { ...initialState(1, p1), failed: true };
    expect(getLegalMoves(s)).toEqual([]);
  });
});

describe("reducer — move", () => {
  it("advances position by the cell value", () => {
    const s = initialState(1, p1);
    const val = s.puzzle.grid[s.row]![s.col]!;
    const moves = getLegalMoves(s);
    if (moves.includes("down")) {
      const s2 = reducer(s, { type: "move", dir: "down" });
      expect(s2.row).toBe(s.row + val);
      expect(s2.turnsUsed).toBe(1);
    }
    if (moves.includes("right")) {
      const s2 = reducer(s, { type: "move", dir: "right" });
      expect(s2.col).toBe(s.col + val);
    }
  });

  it("invalid move (out of bounds) is no-op", () => {
    const s = initialState(1, p1);
    // Puzzle 1 start is (0,0) — up and left are always invalid
    const s2 = reducer(s, { type: "move", dir: "up" });
    expect(s2.row).toBe(0);
    expect(s2.col).toBe(0);
    expect(s2.turnsUsed).toBe(0);
  });

  it("no-op when solved", () => {
    const s = { ...initialState(1, p1), solved: true };
    const s2 = reducer(s, { type: "move", dir: "down" });
    expect(s2).toBe(s);
  });

  it("failed when turnsUsed reaches maxTurns without solving", () => {
    let s = initialState(1, p1);
    // Exhaust turns with non-solving moves (bounce right-left)
    for (let i = 0; i < s.puzzle.maxTurns * 2; i++) {
      if (s.solved || s.failed) break;
      const moves = getLegalMoves(s);
      if (moves.length === 0) break;
      s = reducer(s, { type: "move", dir: moves[0]! });
    }
    // After maxTurns the game should be failed (or solved)
    expect(s.solved || s.failed).toBe(true);
  });
});

describe("isTerminal", () => {
  it("returns null during play", () => {
    expect(isTerminal(initialState(42, p1))).toBeNull();
  });

  it("returns 0 when failed", () => {
    const s = { ...initialState(1, p1), failed: true };
    expect(isTerminal(s)!.score).toBe(0);
  });

  it("returns 300 + efficiency when solved", () => {
    const s = { ...initialState(1, p1), solved: true, turnsUsed: 4, puzzle: PUZZLES[0]! };
    const expected = 300 + (PUZZLES[0]!.maxTurns - 4) * 20;
    expect(isTerminal(s)!.score).toBe(expected);
  });
});
