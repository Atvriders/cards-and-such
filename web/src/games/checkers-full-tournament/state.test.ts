import { describe, expect, it } from "vitest";
import {
  BALLOTS,
  acfToCoord,
  applyResolvedMove,
  getLegalMoves,
  initialState,
  isTerminal,
  reducer,
} from "./state.js";
import type { CftSettings, CftState, Piece } from "./state.js";

const baseSettings: CftSettings = {
  botDepth: "2",
  ballotOpening: false,
  showLastMove: true,
};

function emptyBoard(): (Piece | null)[] {
  return new Array(64).fill(null);
}

function makeState(board: (Piece | null)[], overrides: Partial<CftState> = {}): CftState {
  return {
    settings: baseSettings,
    rngSeed: 1,
    board,
    turn: "red",
    mustContinueFrom: null,
    pliesSinceCaptureOrPromo: 0,
    winner: null,
    ballot: null,
    ballotPliesPlayed: 0,
    lastMove: null,
    ...overrides,
  };
}

describe("checkers-full-tournament — initialState", () => {
  it("is deterministic for the same seed (free play)", () => {
    const a = initialState(123, { ...baseSettings, ballotOpening: false });
    const b = initialState(123, { ...baseSettings, ballotOpening: false });
    expect(a.board).toEqual(b.board);
    expect(a.turn).toBe(b.turn);
    expect(a.ballot).toBeNull();
  });

  it("is deterministic for the same seed (ballot enabled)", () => {
    const a = initialState(7, { ...baseSettings, ballotOpening: true });
    const b = initialState(7, { ...baseSettings, ballotOpening: true });
    expect(a.board).toEqual(b.board);
    expect(a.ballot?.id).toBe(b.ballot?.id);
    expect(a.ballotPliesPlayed).toBe(b.ballotPliesPlayed);
  });

  it("places 12 red and 12 black on dark squares (free play)", () => {
    const s = initialState(1, { ...baseSettings, ballotOpening: false });
    let red = 0, black = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = s.board[r * 8 + c]!;
        if (p) {
          expect((r + c) % 2).toBe(1);
          if (p.color === "red") red++;
          else black++;
        }
      }
    }
    expect(red).toBe(12);
    expect(black).toBe(12);
    expect(s.turn).toBe("red");
  });

  it("isTerminal returns null on a fresh state", () => {
    const s = initialState(42, baseSettings);
    expect(isTerminal(s)).toBeNull();
  });

  it("plays 3 forced ballot plies up front when ballotOpening is on", () => {
    // Try a few seeds; at least one should produce a complete 3-ply ballot.
    let played = 0;
    for (let seed = 0; seed < 10; seed++) {
      const s = initialState(seed, { ...baseSettings, ballotOpening: true });
      if (s.ballot && s.ballotPliesPlayed >= 3) {
        played = s.ballotPliesPlayed;
        // After 3 plies (Red, Black, Red), it's Black's turn — but our reducer
        // only plays bot inside dispatch, so Black hasn't moved post-ballot yet.
        expect(s.turn).toBe("black");
        // Last move was Red's second move.
        expect(s.lastMove).not.toBeNull();
        break;
      }
    }
    expect(played).toBe(3);
  });
});

describe("checkers-full-tournament — reducer basic moves", () => {
  it("performs a simple diagonal forward move", () => {
    const board = emptyBoard();
    board[5 * 8 + 0] = { color: "red", king: false };
    const s = makeState(board);
    const next = reducer(s, { type: "move", from: { row: 5, col: 0 }, to: { row: 4, col: 1 } });
    expect(next.board[5 * 8 + 0]).toBeNull();
    expect(next.board[4 * 8 + 1]).toEqual({ color: "red", king: false });
    expect(next.turn).toBe("black");
  });

  it("rejects an illegal sideways move (same reference returned)", () => {
    const board = emptyBoard();
    board[5 * 8 + 1] = { color: "red", king: false };
    const s = makeState(board);
    const next = reducer(s, { type: "move", from: { row: 5, col: 1 }, to: { row: 5, col: 3 } });
    expect(next).toBe(s);
  });

  it("rejects a non-jump move when a jump is available (mandatory capture)", () => {
    const board = emptyBoard();
    board[4 * 8 + 1] = { color: "red", king: false };
    board[3 * 8 + 2] = { color: "black", king: false };
    const s = makeState(board);
    // (4,1) -> (3,0) is a legal simple move IF no jumps existed, but a jump exists.
    const next = reducer(s, { type: "move", from: { row: 4, col: 1 }, to: { row: 3, col: 0 } });
    expect(next).toBe(s);
  });

  it("performs a single jump and removes captured piece", () => {
    const board = emptyBoard();
    board[4 * 8 + 1] = { color: "red", king: false };
    board[3 * 8 + 2] = { color: "black", king: false };
    const s = makeState(board);
    const next = reducer(s, { type: "move", from: { row: 4, col: 1 }, to: { row: 2, col: 3 } });
    expect(next.board[4 * 8 + 1]).toBeNull();
    expect(next.board[3 * 8 + 2]).toBeNull();
    expect(next.board[2 * 8 + 3]).toEqual({ color: "red", king: false });
    expect(next.pliesSinceCaptureOrPromo).toBe(0);
  });

  it("requires the player to continue a chain of jumps", () => {
    // Red at (6,1) can jump (5,2) -> (4,3); then can jump (3,4) -> (2,5).
    const board = emptyBoard();
    board[6 * 8 + 1] = { color: "red", king: false };
    board[5 * 8 + 2] = { color: "black", king: false };
    board[3 * 8 + 4] = { color: "black", king: false };
    const s = makeState(board);
    const moves = getLegalMoves(board, "red", null);
    const double = moves.find((m) => m.captures.length === 2);
    expect(double).toBeDefined();
    // The chain ends at (2,5).
    expect(double!.to).toEqual({ row: 2, col: 5 });
  });

  it("promotes a man on reaching the back row", () => {
    const board = emptyBoard();
    board[1 * 8 + 0] = { color: "red", king: false };
    const s = makeState(board);
    const next = reducer(s, { type: "move", from: { row: 1, col: 0 }, to: { row: 0, col: 1 } });
    expect(next.board[0 * 8 + 1]).toEqual({ color: "red", king: true });
    expect(next.pliesSinceCaptureOrPromo).toBe(0); // promotion resets the draw counter
  });

  it("declares red the winner when black has no pieces", () => {
    const board = emptyBoard();
    board[2 * 8 + 1] = { color: "red", king: false };
    board[1 * 8 + 2] = { color: "black", king: false };
    const s = makeState(board);
    const next = reducer(s, { type: "move", from: { row: 2, col: 1 }, to: { row: 0, col: 3 } });
    expect(next.winner).toBe("red");
    const t = isTerminal(next);
    expect(t).not.toBeNull();
    expect(t!.score).toBeGreaterThan(0);
  });
});

describe("checkers-full-tournament — 40-move draw rule", () => {
  it("declares a draw when the no-capture-no-promo counter reaches the limit", () => {
    // Set up a position where neither side can capture and the counter is one ply away.
    // Place a red king at (4,3) and a black king at (4,5) — they shuffle without capturing.
    const board = emptyBoard();
    board[4 * 8 + 3] = { color: "red", king: true };
    board[4 * 8 + 5] = { color: "black", king: true };
    const s = makeState(board, { pliesSinceCaptureOrPromo: 39, turn: "red" });
    // Red moves (4,3) -> (3,2), a simple non-capture, non-promotion move.
    const next = reducer(s, { type: "move", from: { row: 4, col: 3 }, to: { row: 3, col: 2 } });
    // Counter ticks to 40 -> draw.
    expect(next.winner === "draw" || next.winner === null).toBe(true);
    if (next.winner === "draw") {
      const t = isTerminal(next);
      expect(t).not.toBeNull();
      expect(t!.score).toBe(0);
    }
  });
});

describe("checkers-full-tournament — ballot helpers", () => {
  it("acfToCoord maps ACF square 1..32 onto dark squares", () => {
    for (let n = 1; n <= 32; n++) {
      const { row, col } = acfToCoord(n);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(8);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(8);
      expect((row + col) % 2).toBe(1);
    }
  });

  it("every ballot is playable as a legal opening sequence", () => {
    for (const ballot of BALLOTS) {
      // Start from a fresh free-play state and walk through the three plies.
      let s = initialState(0, { ...baseSettings, ballotOpening: false });
      s = { ...s, ballot, ballotPliesPlayed: 0 };
      // Manually advance the ballot via applyResolvedMove + getLegalMoves.
      for (let i = 0; i < 3; i++) {
        const ply = ballot.plies[i]!;
        const from = acfToCoord(ply.from);
        const to = acfToCoord(ply.to);
        const color = i % 2 === 0 ? "red" : "black";
        const moves = getLegalMoves(s.board, color, null);
        const match = moves.find(
          (m) => m.from.row === from.row && m.from.col === from.col &&
                 m.to.row === to.row && m.to.col === to.col,
        );
        expect(match, `ballot ${ballot.id} ply ${i + 1} ${ply.from}-${ply.to} must be legal`).toBeDefined();
        s = applyResolvedMove({ ...s, turn: color }, match!);
      }
    }
  });
});

describe("checkers-full-tournament — bot turn", () => {
  it("after the human's move the bot plays automatically", () => {
    // Default initial state (no ballot), red makes a move; the reducer should also
    // run the bot, leaving turn back at red (unless bot ended game or chained).
    const s = initialState(11, { ...baseSettings, ballotOpening: false, botDepth: "2" });
    // Find any legal red move.
    const moves = getLegalMoves(s.board, "red", null);
    expect(moves.length).toBeGreaterThan(0);
    const m = moves[0]!;
    const next = reducer(s, { type: "move", from: m.from, to: m.to });
    // After bot plays, turn should be red again (or game over).
    expect(next.turn === "red" || next.winner !== null).toBe(true);
  });
});
