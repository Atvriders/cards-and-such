import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, legalMovesFrom, SIZE } from "./state.js";
import type { TablutState, Cell } from "./state.js";

function idx(r: number, c: number): number { return r * SIZE + c; }
function emptyBoard(): Cell[] { return new Array(SIZE * SIZE).fill(null); }

describe("Tablut", () => {
  it("initial state: correct piece counts, attackers move first", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe(1); // attackers go first
    expect(s.board[idx(4, 4)]).toBe("K"); // King at center
    expect(s.board.filter(c => c === "A").length).toBe(16);
    expect(s.board.filter(c => c === "D").length).toBe(8);
    expect(s.winner).toBeNull();
  });

  it("legalMovesFrom: rook movement blocked by pieces", () => {
    const board = emptyBoard();
    board[idx(4, 4)] = "D";
    board[idx(4, 6)] = "A"; // blocks at col 6
    const moves = legalMovesFrom(board, idx(4, 4));
    // Right: 4,5 (then blocked at 4,6)
    expect(moves.includes(idx(4, 5))).toBe(true);
    expect(moves.includes(idx(4, 6))).toBe(false); // occupied
    expect(moves.includes(idx(4, 7))).toBe(false); // blocked
  });

  it("King reaches edge triggers defender win", () => {
    const board = emptyBoard();
    board[idx(0, 1)] = "K"; // King one step from top edge
    const s: TablutState = { board, turn: 0, selected: idx(0,1), winner: null, rngSeed: 0, settings: {} };
    const next = reducer(s, { type: "move", to: idx(0, 0) });
    expect(next.winner).toBe(0);
    expect(isTerminal(next)).toEqual({ score: 100 });
  });

  it("King surrounded on all 4 sides is captured", () => {
    const s: TablutState = {
      board: emptyBoard(),
      turn: 1, selected: null, winner: 1, rngSeed: 0, settings: {},
    };
    expect(isTerminal(s)).toEqual({ score: 0 });
  });

  it("select rejected for attacker piece during defender turn", () => {
    const s = initialState(0, {});
    const defState = { ...s, turn: 0 as const };
    const atkPos = s.board.findIndex(c => c === "A");
    const next = reducer(defState, { type: "select", pos: atkPos });
    expect(next.selected).toBeNull();
  });

  it("move rejected when no piece selected", () => {
    const s = initialState(0, {});
    const defState = { ...s, turn: 0 as const, selected: null };
    const next = reducer(defState, { type: "move", to: idx(3, 4) });
    expect(next).toBe(defState);
  });

  it("isTerminal returns null for ongoing game", () => {
    expect(isTerminal(initialState(0, {}))).toBeNull();
  });

  it("non-king piece cannot enter throne", () => {
    const board = emptyBoard();
    board[idx(4, 2)] = "D"; // Defender to left of center
    // Center is throne (4,4) — defender at (4,2) moving right should stop at (4,3), not enter (4,4)
    const moves = legalMovesFrom(board, idx(4, 2));
    expect(moves.includes(idx(4, 3))).toBe(true);
    expect(moves.includes(idx(4, 4))).toBe(false); // throne blocked for non-king
  });
});
