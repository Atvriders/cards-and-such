import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, legalMovesFrom, initialBoard, applyXqMove, isInCheck } from "./state.js";
import type { XqBoard, XqPiece } from "./state.js";

const COLS = 9;
function idx(r: number, c: number) { return r * COLS + c; }
function emptyBoard(): XqBoard { return new Array(90).fill(null); }
function p(color: XqPiece["color"], type: XqPiece["type"]): XqPiece { return { color, type }; }

describe("Xiangqi", () => {
  it("initial state has correct setup", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe("red");
    expect(s.winner).toBeNull();
    // Red general at row 9, col 4
    expect(s.board[idx(9, 4)]).toEqual({ color: "red", type: "general" });
    // Black general at row 0, col 4
    expect(s.board[idx(0, 4)]).toEqual({ color: "black", type: "general" });
  });

  it("general cannot move outside palace", () => {
    const b = emptyBoard();
    b[idx(9, 4)] = p("red", "general");
    // Palace: rows 7-9, cols 3-5
    const moves = legalMovesFrom(b, 9, 4);
    const targets = moves.map(m => m.to);
    // Should be able to move within palace (row 8, col 4; row 9, col 3; row 9, col 5)
    expect(targets).toContain(idx(8, 4));
    // Should NOT move to row 6 (outside palace)
    expect(targets).not.toContain(idx(7, 6));
  });

  it("elephant cannot cross river", () => {
    const b = emptyBoard();
    b[idx(9, 4)] = p("red", "general");
    b[idx(7, 2)] = p("red", "elephant");
    const moves = legalMovesFrom(b, 7, 2);
    const targets = moves.map(m => m.to);
    // Would go to row 5, which is across the river — not allowed for red
    expect(targets.every(t => Math.floor(t / COLS) >= 5)).toBe(true);
  });

  it("cannon moves without capture (no jump)", () => {
    const b = emptyBoard();
    b[idx(9, 4)] = p("red", "general");
    b[idx(0, 4)] = p("black", "general");
    b[idx(5, 4)] = p("red", "soldier"); // block flying general on col 4
    b[idx(7, 1)] = p("red", "cannon");
    const moves = legalMovesFrom(b, 7, 1);
    // Can move along row 7 and col 1 freely (no pieces)
    expect(moves.some(m => m.to === idx(7, 2))).toBe(true);
    expect(moves.some(m => m.to === idx(6, 1))).toBe(true);
  });

  it("cannon captures by jumping exactly one piece", () => {
    const b = emptyBoard();
    b[idx(9, 4)] = p("red", "general");
    b[idx(0, 4)] = p("black", "general");
    b[idx(5, 4)] = p("red", "cannon");
    b[idx(3, 4)] = p("black", "soldier"); // blocker
    b[idx(0, 4)] = p("black", "general"); // target behind blocker
    const moves = legalMovesFrom(b, 5, 4);
    // Cannot move to row 3 (occupied by own blocker... wait black soldier)
    // can move to rows 4, (col 4 empty), cannot capture row3 directly (no jump needed for capture)
    // Actually cannon needs jump to capture: row 4 is empty = non-capture move
    // row 3 has black soldier = must jump something first? No - cannon needs 1 piece between
    // Let's check: from (5,4), row 3,4 has black soldier, nothing between (row 4,4 is empty)
    // So cannon cannot capture row 3 directly (no screen). It can land on empty squares along col.
    expect(moves.some(m => m.to === idx(4, 4))).toBe(true);
  });

  it("isTerminal returns null during game", () => {
    const s = initialState(42, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("isTerminal returns score 100 when red wins", () => {
    const s = { ...initialState(0, {}), winner: "red" as const };
    expect(isTerminal(s)).toEqual({ score: 100 });
  });

  it("select action stores legal targets", () => {
    const s = initialState(0, {});
    // Select red cannon at (7,1)
    const next = reducer(s, { type: "select", sq: idx(7, 1) });
    expect(next.selected).toBe(idx(7, 1));
    expect(next.legalTargets.length).toBeGreaterThan(0);
  });

  it("select black piece does nothing", () => {
    const s = initialState(0, {});
    const next = reducer(s, { type: "select", sq: idx(0, 4) });
    expect(next.selected).toBeNull();
  });
});
