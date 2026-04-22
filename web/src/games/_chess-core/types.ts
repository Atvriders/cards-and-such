// Shared chess types and constants

export type PieceColor = "white" | "black";
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export interface ChessPiece {
  color: PieceColor;
  type: PieceType;
}

export interface ChessCoord {
  row: number; // 0 = rank 8 (top for display), 7 = rank 1
  col: number; // 0 = file a, 7 = file h
}

export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

export interface ChessMove {
  from: ChessCoord;
  to: ChessCoord;
  promotion?: PieceType; // only for pawn promotion
  // metadata (computed, not used for equality)
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
}

export type Board = (ChessPiece | null)[];
// 64 entries, index = row*8 + col

export function idx(r: number, c: number): number {
  return r * 8 + c;
}

export function coordToIdx(c: ChessCoord): number {
  return c.row * 8 + c.col;
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function emptyBoard(): Board {
  return new Array(64).fill(null);
}

export function standardBoard(): Board {
  const b = emptyBoard();
  const backRank: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  for (let c = 0; c < 8; c++) {
    b[idx(0, c)] = { color: "black", type: backRank[c]! };
    b[idx(1, c)] = { color: "black", type: "pawn" };
    b[idx(6, c)] = { color: "white", type: "pawn" };
    b[idx(7, c)] = { color: "white", type: backRank[c]! };
  }
  return b;
}

export function cloneBoard(b: Board): Board {
  return [...b];
}

export function pieceAt(b: Board, r: number, c: number): ChessPiece | null {
  if (!inBounds(r, c)) return null;
  return b[idx(r, c)] ?? null;
}
