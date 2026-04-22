// Chess move generation

import type { Board, ChessCoord, ChessMove, CastlingRights, PieceColor } from "./types.js";
import { idx, inBounds, pieceAt } from "./types.js";

// Generate pseudo-legal moves (may leave king in check)
export function pseudoLegalMoves(
  board: Board,
  color: PieceColor,
  enPassantTarget: ChessCoord | null,
  castling: CastlingRights,
): ChessMove[] {
  const moves: ChessMove[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[idx(r, c)];
      if (!piece || piece.color !== color) continue;
      const from: ChessCoord = { row: r, col: c };

      switch (piece.type) {
        case "pawn":
          addPawnMoves(board, from, color, enPassantTarget, moves);
          break;
        case "knight":
          addKnightMoves(board, from, color, moves);
          break;
        case "bishop":
          addSlidingMoves(board, from, color, [[-1,-1],[-1,1],[1,-1],[1,1]], moves);
          break;
        case "rook":
          addSlidingMoves(board, from, color, [[-1,0],[1,0],[0,-1],[0,1]], moves);
          break;
        case "queen":
          addSlidingMoves(board, from, color, [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]], moves);
          break;
        case "king":
          addKingMoves(board, from, color, castling, moves);
          break;
      }
    }
  }

  return moves;
}

function addPawnMoves(
  board: Board,
  from: ChessCoord,
  color: PieceColor,
  enPassantTarget: ChessCoord | null,
  moves: ChessMove[],
): void {
  const { row: r, col: c } = from;
  const dir = color === "white" ? -1 : 1;
  const startRow = color === "white" ? 6 : 1;
  const promoteRow = color === "white" ? 0 : 7;
  const promotionPieces = ["queen", "rook", "bishop", "knight"] as const;

  // Forward one
  const r1 = r + dir;
  if (inBounds(r1, c) && board[idx(r1, c)] === null) {
    if (r1 === promoteRow) {
      for (const pt of promotionPieces) {
        moves.push({ from, to: { row: r1, col: c }, promotion: pt });
      }
    } else {
      moves.push({ from, to: { row: r1, col: c } });
    }
    // Forward two from start
    const r2 = r + dir * 2;
    if (r === startRow && inBounds(r2, c) && board[idx(r2, c)] === null) {
      moves.push({ from, to: { row: r2, col: c } });
    }
  }

  // Captures
  for (const dc of [-1, 1]) {
    const cr = r + dir;
    const cc = c + dc;
    if (!inBounds(cr, cc)) continue;
    const target = board[idx(cr, cc)];
    if (target && target.color !== color) {
      if (cr === promoteRow) {
        for (const pt of promotionPieces) {
          moves.push({ from, to: { row: cr, col: cc }, promotion: pt, capturedPiece: target });
        }
      } else {
        moves.push({ from, to: { row: cr, col: cc }, capturedPiece: target });
      }
    }
    // En passant
    if (enPassantTarget && cr === enPassantTarget.row && cc === enPassantTarget.col) {
      moves.push({ from, to: { row: cr, col: cc }, isEnPassant: true });
    }
  }
}

function addKnightMoves(board: Board, from: ChessCoord, color: PieceColor, moves: ChessMove[]): void {
  const { row: r, col: c } = from;
  const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] as const;
  for (const [dr, dc] of offsets) {
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(nr, nc)) continue;
    const target = board[idx(nr, nc)];
    if (target && target.color === color) continue;
    if (target) {
      moves.push({ from, to: { row: nr, col: nc }, capturedPiece: target });
    } else {
      moves.push({ from, to: { row: nr, col: nc } });
    }
  }
}

function addSlidingMoves(
  board: Board,
  from: ChessCoord,
  color: PieceColor,
  dirs: ReadonlyArray<readonly [number, number]>,
  moves: ChessMove[],
): void {
  const { row: r, col: c } = from;
  for (const [dr, dc] of dirs) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const target = board[idx(nr, nc)];
      if (target) {
        if (target.color !== color) {
          moves.push({ from, to: { row: nr, col: nc }, capturedPiece: target });
        }
        break;
      }
      moves.push({ from, to: { row: nr, col: nc } });
      nr += dr;
      nc += dc;
    }
  }
}

function addKingMoves(
  board: Board,
  from: ChessCoord,
  color: PieceColor,
  castling: CastlingRights,
  moves: ChessMove[],
): void {
  const { row: r, col: c } = from;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const target = board[idx(nr, nc)];
      if (target && target.color === color) continue;
      if (target) {
        moves.push({ from, to: { row: nr, col: nc }, capturedPiece: target });
      } else {
        moves.push({ from, to: { row: nr, col: nc } });
      }
    }
  }

  // Castling
  const backRow = color === "white" ? 7 : 0;
  if (r === backRow && c === 4) {
    // Kingside
    const ksRight = color === "white" ? castling.whiteKingside : castling.blackKingside;
    if (ksRight &&
        board[idx(backRow, 5)] === null &&
        board[idx(backRow, 6)] === null) {
      moves.push({ from, to: { row: backRow, col: 6 }, isCastling: true });
    }
    // Queenside
    const qsRight = color === "white" ? castling.whiteQueenside : castling.blackQueenside;
    if (qsRight &&
        board[idx(backRow, 3)] === null &&
        board[idx(backRow, 2)] === null &&
        board[idx(backRow, 1)] === null) {
      moves.push({ from, to: { row: backRow, col: 2 }, isCastling: true });
    }
  }
}

// Apply a move to a board, returning a new board
export function applyMove(board: Board, move: ChessMove): Board {
  const b = [...board];
  const piece = b[idx(move.from.row, move.from.col)]!;

  b[idx(move.from.row, move.from.col)] = null;

  // En passant capture
  if (move.isEnPassant) {
    const capturedPawnRow = move.from.row;
    b[idx(capturedPawnRow, move.to.col)] = null;
  }

  // Promotion
  const placedPiece = move.promotion
    ? { color: piece.color, type: move.promotion }
    : piece;

  b[idx(move.to.row, move.to.col)] = placedPiece;

  // Castling: move rook
  if (move.isCastling) {
    const row = move.from.row;
    if (move.to.col === 6) {
      // Kingside
      b[idx(row, 5)] = b[idx(row, 7)] ?? null;
      b[idx(row, 7)] = null;
    } else {
      // Queenside
      b[idx(row, 3)] = b[idx(row, 0)] ?? null;
      b[idx(row, 0)] = null;
    }
  }

  return b;
}

// Find king position
export function findKing(board: Board, color: PieceColor): ChessCoord | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[idx(r, c)];
      if (p && p.color === color && p.type === "king") {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

// Is a square attacked by any piece of the given color?
export function isSquareAttacked(board: Board, sq: ChessCoord, byColor: PieceColor): boolean {
  const opp = byColor;
  const { row: r, col: c } = sq;

  // Knight
  const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] as const;
  for (const [dr, dc] of knightOffsets) {
    const p = pieceAt(board, r + dr, c + dc);
    if (p && p.color === opp && p.type === "knight") return true;
  }

  // Pawn attacks
  const pawnDir = opp === "white" ? 1 : -1; // white pawns attack upward (from high row to low), so attack from below
  for (const dc of [-1, 1]) {
    const p = pieceAt(board, r + pawnDir, c + dc);
    if (p && p.color === opp && p.type === "pawn") return true;
  }

  // King
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const p = pieceAt(board, r + dr, c + dc);
      if (p && p.color === opp && p.type === "king") return true;
    }
  }

  // Sliding pieces
  const diagDirs = [[-1,-1],[-1,1],[1,-1],[1,1]] as const;
  for (const [dr, dc] of diagDirs) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[idx(nr, nc)];
      if (p) {
        if (p.color === opp && (p.type === "bishop" || p.type === "queen")) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  const straightDirs = [[-1,0],[1,0],[0,-1],[0,1]] as const;
  for (const [dr, dc] of straightDirs) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = board[idx(nr, nc)];
      if (p) {
        if (p.color === opp && (p.type === "rook" || p.type === "queen")) return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return false;
}

// Is the king in check?
export function isInCheck(board: Board, color: PieceColor): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  const opp: PieceColor = color === "white" ? "black" : "white";
  return isSquareAttacked(board, king, opp);
}

// Get legal moves (filter pseudo-legal to exclude moves leaving king in check)
export function legalMoves(
  board: Board,
  color: PieceColor,
  enPassantTarget: ChessCoord | null,
  castling: CastlingRights,
): ChessMove[] {
  const pseudo = pseudoLegalMoves(board, color, enPassantTarget, castling);
  const result: ChessMove[] = [];

  for (const move of pseudo) {
    // For castling, verify king doesn't pass through check
    if (move.isCastling) {
      const row = move.from.row;
      const opp: PieceColor = color === "white" ? "black" : "white";
      // King must not be in check currently
      if (isSquareAttacked(board, move.from, opp)) continue;
      // King must not pass through attacked square
      const passThroughCol = move.to.col === 6 ? 5 : 3;
      if (isSquareAttacked(board, { row, col: passThroughCol }, opp)) continue;
      // King must not land on attacked square
      if (isSquareAttacked(board, move.to, opp)) continue;
    }

    const newBoard = applyMove(board, move);
    if (!isInCheck(newBoard, color)) {
      result.push(move);
    }
  }

  return result;
}

// Update castling rights after a move
export function updateCastlingRights(
  castling: CastlingRights,
  move: ChessMove,
  board: Board,
): CastlingRights {
  let c = { ...castling };
  const piece = board[idx(move.from.row, move.from.col)];

  if (piece?.type === "king") {
    if (piece.color === "white") {
      c.whiteKingside = false;
      c.whiteQueenside = false;
    } else {
      c.blackKingside = false;
      c.blackQueenside = false;
    }
  }
  if (piece?.type === "rook") {
    if (move.from.row === 7 && move.from.col === 7) c.whiteKingside = false;
    if (move.from.row === 7 && move.from.col === 0) c.whiteQueenside = false;
    if (move.from.row === 0 && move.from.col === 7) c.blackKingside = false;
    if (move.from.row === 0 && move.from.col === 0) c.blackQueenside = false;
  }
  // If rook is captured
  if (move.to.row === 7 && move.to.col === 7) c.whiteKingside = false;
  if (move.to.row === 7 && move.to.col === 0) c.whiteQueenside = false;
  if (move.to.row === 0 && move.to.col === 7) c.blackKingside = false;
  if (move.to.row === 0 && move.to.col === 0) c.blackQueenside = false;

  return c;
}

// Compute en passant target after a move
export function computeEnPassantTarget(move: ChessMove, board: Board): ChessCoord | null {
  const piece = board[idx(move.from.row, move.from.col)];
  if (piece?.type === "pawn") {
    const rowDiff = move.to.row - move.from.row;
    if (Math.abs(rowDiff) === 2) {
      return { row: (move.from.row + move.to.row) / 2, col: move.from.col };
    }
  }
  return null;
}
