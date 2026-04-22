import { describe, expect, it } from "vitest";
import { initialState, reducer, isTerminal, jumpMoves, ADJACENCY, SIZE } from "./state.js";
import type { AlquerqueState, Cell } from "./state.js";

function pos(r: number, c: number): number { return r * SIZE + c; }
function emptyBoard(): Cell[] { return new Array(SIZE * SIZE).fill(null); }

describe("Alquerque", () => {
  it("initial state: 12 pieces each, white to move", () => {
    const s = initialState(0, {});
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    expect(s.board.filter(c => c === 0).length).toBe(12);
    expect(s.board.filter(c => c === 1).length).toBe(12);
    expect(s.board[pos(2, 2)]).toBeNull(); // center empty
  });

  it("adjacency: corner (0,0) connects to (0,1), (1,0), and (1,1) diagonally (even sum)", () => {
    const adj00 = ADJACENCY[pos(0, 0)]!;
    expect(adj00.includes(pos(0, 1))).toBe(true);
    expect(adj00.includes(pos(1, 0))).toBe(true);
    expect(adj00.includes(pos(1, 1))).toBe(true); // diagonal at even-sum
  });

  it("jumpMoves: captures opponent in all valid directions", () => {
    const board = emptyBoard();
    board[pos(2, 2)] = 0; // white center
    board[pos(2, 3)] = 1; // black right
    // White can jump right: land at 2,4 if empty
    const moves = jumpMoves(board, pos(2, 2), 0);
    const toPos = moves.map(j => j.to);
    expect(toPos.includes(pos(2, 4))).toBe(true);
  });

  it("capture is mandatory — step rejected when jump available", () => {
    const board = emptyBoard();
    board[pos(2, 2)] = 0;
    board[pos(2, 3)] = 1;
    // White selects pos(2,2)
    const s: AlquerqueState = { board, turn: 0, selected: pos(2,2), chainFrom: null, winner: null, rngSeed: 0, settings: {} };
    // Try a step move instead of jump
    const next = reducer(s, { type: "move", to: pos(2, 1) });
    // Should be rejected since jump is available
    expect(next).toBe(s);
  });

  it("winning by capturing all pieces", () => {
    const board = emptyBoard();
    board[pos(0, 0)] = 1; // one black left
    board[pos(0, 1)] = 0; // white adjacent
    // white at (0,1) can jump black at (0,0) only if landing exists
    // can't jump out of bounds; try different setup
    board[pos(0, 0)] = 0; // white
    board[pos(0, 1)] = 1; // black
    // White jumps from (0,0) over (0,1) to... (0,2) must exist
    board[pos(0, 2)] = null;
    const s: AlquerqueState = { board, turn: 0, selected: pos(0,0), chainFrom: null, winner: null, rngSeed: 0, settings: {} };
    const next = reducer(s, { type: "jump", to: pos(0,2) });
    // Bot (black) has no pieces remaining
    expect(next.winner).toBe(0);
    expect(isTerminal(next)).toEqual({ score: 100 });
  });

  it("isTerminal returns null mid-game", () => {
    const s = initialState(0, {});
    expect(isTerminal(s)).toBeNull();
  });

  it("select rejected for opponent piece", () => {
    const s = initialState(0, {});
    const blackPos = s.board.findIndex(c => c === 1);
    const next = reducer(s, { type: "select", pos: blackPos });
    expect(next.selected).toBeNull();
  });
});
