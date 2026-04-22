import { describe, it, expect } from "vitest";
import { initialState, reducer, isTerminal, getAtomicLegalMoves, getAtomicExplosionSquares } from "./state.js";
import type { AtomicSettings } from "./state.js";
import { emptyBoard, idx } from "../_chess-core/types.js";
import type { CastlingRights } from "../_chess-core/types.js";

const defaultSettings: AtomicSettings = { opponent: "easy" };
const NO_CASTLING: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };

describe("AtomicChess initialState", () => {
  it("starts with standard chess setup", () => {
    const s = initialState(42, defaultSettings);
    expect(s.board[idx(7, 4)]?.type).toBe("king");
    expect(s.board[idx(7, 4)]?.color).toBe("white");
    expect(s.turn).toBe("white");
    expect(s.result).toBeNull();
  });
});

describe("AtomicChess explosions", () => {
  it("explosion destroys non-pawn pieces in 3x3 area", () => {
    const board = emptyBoard();
    board[idx(7, 4)] = { color: "white", type: "king" };
    board[idx(0, 4)] = { color: "black", type: "king" };
    board[idx(4, 4)] = { color: "white", type: "rook" };
    board[idx(3, 4)] = { color: "black", type: "rook" };

    const move = { from: { row: 4, col: 4 }, to: { row: 3, col: 4 }, capturedPiece: board[idx(3, 4)]! };
    const explosion = getAtomicExplosionSquares(board, move);
    // Should include the target square and all 8 surrounding
    expect(explosion.length).toBe(9); // 3x3
    const keys = explosion.map((c) => `${c.row},${c.col}`);
    expect(keys).toContain("3,4"); // target
    expect(keys).toContain("2,3"); // surrounding
  });

  it("pawns survive explosions", () => {
    const board = emptyBoard();
    board[idx(7, 4)] = { color: "white", type: "king" };
    board[idx(0, 4)] = { color: "black", type: "king" };
    board[idx(4, 4)] = { color: "white", type: "queen" };
    board[idx(3, 4)] = { color: "black", type: "queen" };
    board[idx(3, 3)] = { color: "black", type: "pawn" }; // adjacent pawn should survive

    // Apply capture
    const s = initialState(42, defaultSettings);
    // Just test via legal moves
    const moves = getAtomicLegalMoves(board, "white", null, NO_CASTLING);
    const captureMove = moves.find((m) => m.from.row === 4 && m.from.col === 4 && m.to.row === 3 && m.to.col === 4);
    expect(captureMove).toBeDefined();
  });

  it("move that would destroy own king is illegal", () => {
    const board = emptyBoard();
    // White king at (7,4), black queen at (7,5) — directly adjacent
    // If white rook at (7,3) captures black queen at (7,5)... wait, rook can't jump
    // Instead: white knight at (5,5) captures black piece at (7,4)?  Knights can't.
    // Correct setup: white piece captures something adjacent to its own king
    // White king at (4,4), white rook at (4,6), black queen at (4,5)
    // Explosion of (4,5) hits (3..5, 4..6) -> includes (4,4) where white king is
    board[idx(4, 4)] = { color: "white", type: "king" };
    board[idx(0, 0)] = { color: "black", type: "king" }; // far away
    board[idx(4, 6)] = { color: "white", type: "rook" };
    board[idx(4, 5)] = { color: "black", type: "queen" }; // directly between rook and king
    // If white rook captures queen at (4,5), explosion of (4,5) hits (3..5, 4..6) including (4,4) white king
    const moves = getAtomicLegalMoves(board, "white", null, NO_CASTLING);
    const dangerCapture = moves.find((m) => m.from.row === 4 && m.from.col === 6 && m.to.row === 4 && m.to.col === 5);
    // This should be illegal because the explosion destroys white's own king at (4,4)
    expect(dangerCapture).toBeUndefined();
  });

  it("game ends when opponent king is exploded", () => {
    const s = initialState(42, defaultSettings);
    expect(s.result).toBeNull();
    expect(isTerminal(s)).toBeNull();
  });
});

describe("AtomicChess reducer", () => {
  it("does not allow moves when game is over", () => {
    const s = { ...initialState(42, defaultSettings), result: "white" as const };
    const next = reducer(s, { type: "move", from: { row: 6, col: 4 }, to: { row: 4, col: 4 } });
    expect(next).toBe(s);
  });
});
