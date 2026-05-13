import { describe, expect, it } from "vitest";
import {
  applyPlace,
  detectOpening,
  flipsAt,
  idx,
  initialState,
  isTerminal,
  legalMoves,
  reducer,
  SIZE,
  type Cell,
  type OthelloFTState,
} from "./state.js";

function emptyBoard(): Cell[] {
  return new Array<Cell>(64).fill(null);
}

describe("Othello (Full Tournament) — state", () => {
  it("initialState is deterministic for a given seed", () => {
    const a = initialState(12345, { difficulty: "normal" });
    const b = initialState(12345, { difficulty: "normal" });
    expect(a.board).toEqual(b.board);
    expect(a.rngSeed).toBe(b.rngSeed);
    expect(a.turn).toBe(0);
    expect(a.blackCount).toBe(2);
    expect(a.whiteCount).toBe(2);
    expect(a.completedThisSession).toBe(0);
    expect(a.openingName).toBeNull();
    expect(a.history).toHaveLength(0);
    expect(a.winner).toBeNull();
  });

  it("initialState seats discs in the canonical Othello pattern", () => {
    const s = initialState(0, { difficulty: "normal" });
    expect(s.board[idx(3, 3)]).toBe(1); // white
    expect(s.board[idx(4, 4)]).toBe(1); // white
    expect(s.board[idx(3, 4)]).toBe(0); // black
    expect(s.board[idx(4, 3)]).toBe(0); // black
    // and nothing else
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if ((r === 3 || r === 4) && (c === 3 || c === 4)) continue;
        expect(s.board[idx(r, c)]).toBeNull();
      }
    }
  });

  it("isTerminal returns null on a fresh game", () => {
    const s = initialState(1, { difficulty: "easy" });
    expect(isTerminal(s)).toBeNull();
  });

  it("Black has exactly four legal opening moves from the start", () => {
    const s = initialState(0, { difficulty: "easy" });
    const moves = legalMoves(s.board, 0);
    // Standard Othello: Black's opening moves are d3, c4, f5, e6 — i.e.
    // (2,3), (3,2), (4,5), (5,4).
    expect(moves).toHaveLength(4);
    const set = new Set(moves.map((m) => `${m.row},${m.col}`));
    expect(set.has("2,3")).toBe(true);
    expect(set.has("3,2")).toBe(true);
    expect(set.has("4,5")).toBe(true);
    expect(set.has("5,4")).toBe(true);
  });

  it("flipsAt returns the sandwiched line for a real placement", () => {
    const s = initialState(0, { difficulty: "easy" });
    // Black plays at (4,5): this should flip the white at (4,4).
    const flips = flipsAt(s.board, 0, 4, 5);
    expect(flips).toContain(idx(4, 4));
    expect(flips).toHaveLength(1);
  });

  it("applyPlace mutates the board correctly (immutable return)", () => {
    const s = initialState(0, { difficulty: "easy" });
    const next = applyPlace(s.board, 0, 4, 5);
    expect(next[idx(4, 5)]).toBe(0); // placed
    expect(next[idx(4, 4)]).toBe(0); // flipped
    expect(s.board[idx(4, 5)]).toBeNull(); // original untouched
    expect(s.board[idx(4, 4)]).toBe(1);
  });

  it("reducer ignores illegal placements (same reference returned)", () => {
    const s = initialState(0, { difficulty: "easy" });
    // (0,0) is empty but has no sandwiched discs — illegal.
    const out = reducer(s, { type: "place", row: 0, col: 0 });
    expect(out).toBe(s);
    // Occupied cell also illegal.
    const out2 = reducer(s, { type: "place", row: 3, col: 3 });
    expect(out2).toBe(s);
  });

  it("reducer applies a legal Black placement, flips, and hands turn to CPU", () => {
    const s = initialState(0, { difficulty: "easy" });
    const out = reducer(s, { type: "place", row: 4, col: 5 });
    // After Black plays f5, Black's placement square must still be Black
    // (the CPU can't flip it since it's adjacent only to Black after the move).
    expect(out.board[idx(4, 5)]).toBe(0);
    // Move counter advanced at least once for Black; CPU has also moved.
    expect(out.movesMade).toBeGreaterThanOrEqual(1);
    expect(out.history.length).toBeGreaterThanOrEqual(1);
    expect(out.history[0]).toEqual({ seat: 0, row: 4, col: 5, pass: false });
    // After the CPU's reply, turn should be back to Black unless terminal.
    if (out.winner === null) expect(out.turn).toBe(0);
    // Total disc count went up (Black placed + flips + CPU placed + flips).
    const total = out.blackCount + out.whiteCount;
    expect(total).toBeGreaterThan(4);
  });

  it("opening detector names F5 d6 as the Diagonal Opening", () => {
    const history = [
      { seat: 0 as const, row: 4, col: 5, pass: false }, // F5
      { seat: 1 as const, row: 5, col: 3, pass: false }, // d6
    ];
    expect(detectOpening(history)).toBe("Diagonal Opening");
  });

  it("opening detector returns the longest matching line (Tiger > Diagonal)", () => {
    const history = [
      { seat: 0 as const, row: 4, col: 5, pass: false }, // F5
      { seat: 1 as const, row: 5, col: 3, pass: false }, // d6
      { seat: 0 as const, row: 2, col: 2, pass: false }, // c3
    ];
    expect(detectOpening(history)).toBe("Tiger");
  });

  it("isTerminal: Black-win returns score >= 100, CPU-win returns 0, draw returns 50", () => {
    const base = initialState(0, { difficulty: "easy" });
    const blackWin: OthelloFTState = { ...base, winner: 0, blackCount: 40, whiteCount: 24 };
    const cpuWin:   OthelloFTState = { ...base, winner: 1, blackCount: 20, whiteCount: 44 };
    const draw:     OthelloFTState = { ...base, winner: "draw", blackCount: 32, whiteCount: 32 };
    expect(isTerminal(blackWin)).toEqual({ score: 100 + (40 - 24) * 2 });
    expect(isTerminal(cpuWin)).toEqual({ score: 0 });
    expect(isTerminal(draw)).toEqual({ score: 50 });
  });

  it("double-pass terminates the game and the winner is determined by disc count", () => {
    const base = initialState(0, { difficulty: "easy" });
    // Construct a board with no legal moves for either side: completely
    // empty except a few isolated discs that can't sandwich anything.
    const board = emptyBoard();
    board[idx(0, 0)] = 0;
    board[idx(7, 7)] = 1;
    board[idx(0, 7)] = 0;
    // Both sides have no legal moves on this scattered board.
    expect(legalMoves(board, 0)).toHaveLength(0);
    expect(legalMoves(board, 1)).toHaveLength(0);
    // Simulate the state where the bot already passed and now it's Black's
    // turn to pass.
    const s: OthelloFTState = {
      ...base,
      board,
      blackCount: 2,
      whiteCount: 1,
      lastPass: true,
      turn: 0,
    };
    const out = reducer(s, { type: "pass" });
    expect(out.winner).toBe(0); // Black has more discs
    expect(isTerminal(out)).not.toBeNull();
  });

  it("newGame action increments the session counter and only fires after a finished game", () => {
    const base = initialState(7, { difficulty: "hard" });
    // Cannot start a new game while one is in progress.
    const ignored = reducer(base, { type: "newGame" });
    expect(ignored).toBe(base);
    // Finish a game artificially.
    const finished: OthelloFTState = { ...base, winner: 0, blackCount: 33, whiteCount: 31 };
    const next = reducer(finished, { type: "newGame" });
    expect(next.completedThisSession).toBe(1);
    expect(next.winner).toBeNull();
    expect(next.blackCount).toBe(2);
    expect(next.whiteCount).toBe(2);
    expect(next.settings.difficulty).toBe("hard"); // settings preserved
  });
});
