import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getLegalMoves, largestChain, rc } from "./state.js";
import type { SlitherState } from "./state.js";
import type { Cell } from "./state.js";

describe("Slither", () => {
  it("starts with 8 pieces each in rows", () => {
    const s = initialState(0);
    expect(s.turn).toBe(0);
    expect(s.winner).toBeNull();
    const h = s.board.filter((c) => c === 0).length;
    const b = s.board.filter((c) => c === 1).length;
    expect(h).toBe(8);
    expect(b).toBe(8);
  });

  it("largestChain returns 8 for full row of pieces", () => {
    const s = initialState(0);
    expect(largestChain(s.board, 0)).toBe(8);
    expect(largestChain(s.board, 1)).toBe(8);
  });

  it("getLegalMoves returns no moves for interior piece with disconnection risk", () => {
    const board: Cell[] = new Array(64).fill(null);
    // Single piece at center — removing it doesn't disconnect (only 1 piece)
    board[rc(4, 4)] = 0;
    // Single piece: no chain adjacency requirement for destination
    const moves = getLegalMoves(board, rc(4, 4), 0);
    // No adjacent own pieces, so no valid destinations
    expect(moves.length).toBe(0);
  });

  it("getLegalMoves allows end-of-chain piece to slide alongside", () => {
    const board: Cell[] = new Array(64).fill(null);
    // L-chain: (3,3) — (3,4) — (4,4). End piece (3,3) can move to (4,3) which stays adjacent to (4,4)
    board[rc(3, 3)] = 0;
    board[rc(3, 4)] = 0;
    board[rc(4, 4)] = 0;
    const moves = getLegalMoves(board, rc(3, 3), 0);
    expect(moves.length).toBeGreaterThan(0);
  });

  it("isTerminal returns null mid-game and correct scores", () => {
    const s = initialState(0);
    expect(isTerminal(s)).toBeNull();
    const won: SlitherState = { ...s, winner: 0 };
    expect(isTerminal(won)).toEqual({ score: 100 });
    const lost: SlitherState = { ...s, winner: 1 };
    expect(isTerminal(lost)).toEqual({ score: 0 });
  });
});
