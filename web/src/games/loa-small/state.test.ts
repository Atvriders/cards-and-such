import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMovesFrom, isConnected, rc } from "./state.js";
import type { LoaSmallState } from "./state.js";
import type { Cell } from "./state.js";

describe("Lines of Action (6×6)", () => {
  it("starts with 8 pieces each (4 columns × 2 sides excl corners)", () => {
    const s = initialState(0);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    const human = s.board.filter((c) => c === 0).length;
    const bot = s.board.filter((c) => c === 1).length;
    expect(human).toBe(8); // col 0 rows 1-4, col 5 rows 1-4
    expect(bot).toBe(8);   // row 0 cols 1-4, row 5 cols 1-4
  });

  it("isConnected returns true for single piece", () => {
    const board: Cell[] = new Array(36).fill(null);
    board[0] = 0;
    expect(isConnected(board, 0)).toBe(true);
  });

  it("isConnected detects connected and disconnected groups", () => {
    const board: Cell[] = new Array(36).fill(null);
    board[rc(0, 0)] = 0;
    board[rc(0, 1)] = 0; // adjacent → connected
    expect(isConnected(board, 0)).toBe(true);

    board[rc(5, 5)] = 0; // isolated → not connected
    expect(isConnected(board, 0)).toBe(false);
  });

  it("getLegalMovesFrom generates moves for piece in opening position", () => {
    const s = initialState(0);
    // Human piece at col 0, row 1
    const idx = rc(1, 0);
    expect(s.board[idx]).toBe(0);
    const moves = getLegalMovesFrom(s.board, idx, 0);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("isTerminal returns null mid-game and correct scores on win/loss", () => {
    const s = initialState(0);
    expect(isTerminal(s)).toBeNull();
    const won: LoaSmallState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: LoaSmallState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
