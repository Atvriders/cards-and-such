import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, queenReach, rcToPos } from "./state.js";
import type { AmazonsState, Cell } from "./state.js";

describe("Amazons", () => {
  it("starts with 4 human and 4 bot queens, human to move", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.phase).toBe("selectQueen");
    const q0Count = s.board.filter((c) => c === "Q0").length;
    const q1Count = s.board.filter((c) => c === "Q1").length;
    expect(q0Count).toBe(4);
    expect(q1Count).toBe(4);
  });

  it("selecting a non-queen cell does nothing", () => {
    const s = initialState(0, {});
    const s1 = reducer(s, { type: "selectQueen", pos: 0 }); // empty cell
    expect(s1).toBe(s);
  });

  it("selecting a human queen transitions to moveQueen phase", () => {
    const s = initialState(0, {});
    // Find a Q0 position
    const qPos = s.board.findIndex((c) => c === "Q0");
    expect(qPos).toBeGreaterThanOrEqual(0);
    const s1 = reducer(s, { type: "selectQueen", pos: qPos });
    expect(s1.phase).toBe("moveQueen");
    expect(s1.selectedQueen).toBe(qPos);
  });

  it("queenReach returns empty cells in all 8 directions without jumping", () => {
    const board: Cell[] = new Array(100).fill(null);
    board[rcToPos(5, 5)] = "Q0";
    const reach = queenReach(board, rcToPos(5, 5));
    // Should not include pos 55 itself
    expect(reach).not.toContain(rcToPos(5, 5));
    // Should include cells along rank, file, diagonals
    expect(reach).toContain(rcToPos(5, 0)); // left
    expect(reach).toContain(rcToPos(5, 9)); // right
    expect(reach).toContain(rcToPos(0, 5)); // up
    expect(reach).toContain(rcToPos(9, 5)); // down
    expect(reach).toContain(rcToPos(0, 0)); // diagonal
  });

  it("queenReach stops at blocking pieces", () => {
    const board: Cell[] = new Array(100).fill(null);
    board[rcToPos(5, 5)] = "Q0";
    board[rcToPos(5, 7)] = "arrow"; // block to the right
    const reach = queenReach(board, rcToPos(5, 5));
    expect(reach).toContain(rcToPos(5, 6));
    expect(reach).not.toContain(rcToPos(5, 7)); // blocked cell itself
    expect(reach).not.toContain(rcToPos(5, 8)); // behind block
  });

  it("full turn: select, move, shoot — bot responds", () => {
    const s = initialState(42, {});
    const qPos = s.board.findIndex((c) => c === "Q0");
    const s1 = reducer(s, { type: "selectQueen", pos: qPos });
    // Find a reachable move
    const reach = queenReach(s.board, qPos);
    expect(reach.length).toBeGreaterThan(0);
    const moveTo = reach[0]!;
    const s2 = reducer(s1, { type: "moveQueen", pos: moveTo });
    expect(s2.phase).toBe("shootArrow");
    expect(s2.movedTo).toBe(moveTo);
    // Find a reachable arrow target
    const arrowReach = queenReach(s2.board, moveTo, qPos);
    expect(arrowReach.length).toBeGreaterThan(0);
    const arrowAt = arrowReach[0]!;
    const s3 = reducer(s2, { type: "shootArrow", pos: arrowAt });
    // After human turn, bot moves, back to human
    expect(s3.turn).toBe(0);
    expect(s3.phase).toBe("selectQueen");
    expect(s3.board[arrowAt]).toBe("arrow");
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
    const won: AmazonsState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: AmazonsState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
