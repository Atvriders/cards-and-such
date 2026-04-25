// Antichess (also called Giveaway Chess)
// - If you can capture, you MUST capture (forced captures)
// - If multiple captures are available, you can choose which one
// - The king has no special status: it can be captured, moved into check, etc.
// - No check or checkmate concept; the king is just a regular piece
// - Win condition: lose all your pieces (be the first to have no pieces)
// - If a player has no legal move and no pieces, they win
// - Stalemate: player with no legal moves wins
// - Castling is NOT available in antichess
// - Pawns can promote (including to king)
// - En passant is allowed (it is a capture)

import { minimax } from "../../engines/grid/minimax.js";
import type { Board, ChessCoord, ChessMove, PieceColor, PieceType } from "../_chess-core/types.js";
import { standardBoard, idx, inBounds } from "../_chess-core/types.js";
import { applyMove, computeEnPassantTarget } from "../_chess-core/moves.js";

export type { ChessMove, ChessCoord };

export interface AntichessSettings {
  opponent: "easy" | "medium" | "hard";
}

export type GameResult = "white" | "black" | "draw" | null;

export interface AntichessState {
  settings: AntichessSettings;
  rngSeed: number;
  board: Board;
  turn: PieceColor;
  enPassantTarget: ChessCoord | null;
  result: GameResult;
  selected: ChessCoord | null;
  promotionPending: { from: ChessCoord; to: ChessCoord } | null;
}

export type AntichessAction =
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: PieceType };

// Generate pseudo-legal moves for antichess (no castling, no check concerns, king is regular)
function antichessAllMoves(board: Board, color: PieceColor, ep: ChessCoord | null): ChessMove[] {
  const moves: ChessMove[] = [];
  const opp: PieceColor = color === "white" ? "black" : "white";
  const noCastling = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[idx(r, c)];
      if (!piece || piece.color !== color) continue;
      const from: ChessCoord = { row: r, col: c };

      if (piece.type === "pawn") {
        const dir = color === "white" ? -1 : 1;
        const startRow = color === "white" ? 6 : 1;
        const promRow = color === "white" ? 0 : 7;
        const promos: PieceType[] = ["queen","rook","bishop","knight","king"];

        // Forward
        const r1 = r + dir;
        if (inBounds(r1, c) && board[idx(r1, c)] === null) {
          if (r1 === promRow) {
            for (const pt of promos) moves.push({ from, to: { row: r1, col: c }, promotion: pt });
          } else {
            moves.push({ from, to: { row: r1, col: c } });
          }
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
          const t = board[idx(cr, cc)];
          if (t && t.color === opp) {
            if (cr === promRow) {
              for (const pt of promos) moves.push({ from, to: { row: cr, col: cc }, promotion: pt, capturedPiece: t });
            } else {
              moves.push({ from, to: { row: cr, col: cc }, capturedPiece: t });
            }
          }
          if (ep && cr === ep.row && cc === ep.col) {
            moves.push({ from, to: { row: cr, col: cc }, isEnPassant: true });
          }
        }
      } else if (piece.type === "knight") {
        const offs = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] as const;
        for (const [dr, dc] of offs) {
          const nr = r+dr; const nc = c+dc;
          if (!inBounds(nr,nc)) continue;
          const t = board[idx(nr,nc)];
          if (t && t.color === color) continue;
          if (t) {
            moves.push({ from, to: { row: nr, col: nc }, capturedPiece: t });
          } else {
            moves.push({ from, to: { row: nr, col: nc } });
          }
        }
      } else if (piece.type === "king") {
        // King moves like king but no castling
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          if (dr===0&&dc===0) continue;
          const nr=r+dr;const nc=c+dc;
          if (!inBounds(nr,nc)) continue;
          const t=board[idx(nr,nc)];
          if (t&&t.color===color) continue;
          if (t) {
            moves.push({ from, to: { row:nr,col:nc }, capturedPiece: t });
          } else {
            moves.push({ from, to: { row:nr,col:nc } });
          }
        }
      } else {
        // Sliding pieces
        const dirs: [number,number][] = piece.type==="bishop"?[[-1,-1],[-1,1],[1,-1],[1,1]]:
          piece.type==="rook"?[[-1,0],[1,0],[0,-1],[0,1]]:
          [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dr,dc] of dirs) {
          let nr=r+dr;let nc=c+dc;
          while (inBounds(nr,nc)) {
            const t=board[idx(nr,nc)];
            if (t) {
              if (t.color!==color) moves.push({ from, to:{row:nr,col:nc}, capturedPiece:t });
              break;
            }
            moves.push({ from, to:{row:nr,col:nc} });
            nr+=dr;nc+=dc;
          }
        }
      }
      void noCastling;
    }
  }
  return moves;
}

export function antichessLegalMoves(board: Board, color: PieceColor, ep: ChessCoord | null): ChessMove[] {
  const all = antichessAllMoves(board, color, ep);
  // If any captures available, must capture
  const captures = all.filter(m => m.capturedPiece || m.isEnPassant);
  if (captures.length > 0) return captures;
  return all;
}

function countPieces(board: Board, color: PieceColor): number {
  return board.filter(p => p?.color === color).length;
}

function applyMoveToState(s: AntichessState, move: ChessMove): AntichessState {
  const newBoard = applyMove(s.board, move);
  const newEP = computeEnPassantTarget(move, s.board);
  const nextTurn: PieceColor = s.turn === "white" ? "black" : "white";

  let result: GameResult = null;
  // Win: have no pieces (or: opponent has no legal moves)
  if (countPieces(newBoard, s.turn) === 0) {
    result = s.turn; // you gave away all your pieces!
  }
  if (!result) {
    const nextMoves = antichessLegalMoves(newBoard, nextTurn, newEP);
    if (nextMoves.length === 0) {
      // The player with no moves wins (stalemate = win in antichess)
      result = nextTurn;
    }
  }

  return {
    ...s,
    board: newBoard,
    turn: nextTurn,
    enPassantTarget: newEP,
    result,
    selected: null,
    promotionPending: null,
  };
}

function antichessEval(board: Board): number {
  // Fewer white pieces = better for white (want to lose pieces)
  const wCount = countPieces(board, "white");
  const bCount = countPieces(board, "black");
  return bCount - wCount; // white wants fewer of own pieces
}

function runBot(state: AntichessState): AntichessState {
  const depth = state.settings.opponent === "easy" ? 2 : state.settings.opponent === "medium" ? 3 : 4;
  interface BotState { board: Board; turn: PieceColor; ep: ChessCoord | null; }
  const result = minimax<BotState, ChessMove>(
    { board: state.board, turn: state.turn, ep: state.enPassantTarget },
    {
      depth,
      moves(s) { return antichessLegalMoves(s.board, s.turn, s.ep); },
      apply(s, move) {
        return { board: applyMove(s.board, move), turn: s.turn==="white"?"black":"white", ep: computeEnPassantTarget(move, s.board) };
      },
      isTerminal(s) {
        if (countPieces(s.board, s.turn) === 0) return true;
        return antichessLegalMoves(s.board, s.turn, s.ep).length === 0;
      },
      evaluate(s) { return antichessEval(s.board); },
      maximizing(s) { return s.turn === "white"; },
    },
  );
  if (!result.move) return state;
  return applyMoveToState(state, result.move);
}

export function initialState(seed: number, settings: AntichessSettings): AntichessState {
  return {
    settings,
    rngSeed: seed,
    board: standardBoard(),
    turn: "white",
    enPassantTarget: null,
    result: null,
    selected: null,
    promotionPending: null,
  };
}

export function getLegalMovesForPiece(state: AntichessState, from: ChessCoord): ChessMove[] {
  return antichessLegalMoves(state.board, state.turn, state.enPassantTarget)
    .filter(m => m.from.row === from.row && m.from.col === from.col);
}

export function hasForcedCaptures(state: AntichessState): boolean {
  const all = antichessAllMoves(state.board, state.turn, state.enPassantTarget);
  return all.some(m => m.capturedPiece || m.isEnPassant);
}

export function reducer(state: AntichessState, action: AntichessAction): AntichessState {
  if (state.result !== null) return state;

  if (state.promotionPending) {
    if (action.type !== "promote") return state;
    const { from, to } = state.promotionPending;
    const move: ChessMove = { from, to, promotion: action.piece };
    let next = applyMoveToState(state, move);
    if (next.result === null && next.turn === "black") next = runBot(next);
    return next;
  }

  if (action.type !== "move") return state;
  const { from, to } = action;
  const moves = antichessLegalMoves(state.board, state.turn, state.enPassantTarget);
  const matching = moves.filter(m =>
    m.from.row === from.row && m.from.col === from.col &&
    m.to.row === to.row && m.to.col === to.col,
  );
  if (matching.length === 0) return state;

  const piece = state.board[idx(from.row, from.col)];
  const promRow = state.turn === "white" ? 0 : 7;
  if (piece?.type === "pawn" && to.row === promRow) {
    return { ...state, promotionPending: { from, to }, selected: null };
  }

  let next = applyMoveToState(state, matching[0]!);
  if (next.result === null && next.turn === "black") next = runBot(next);
  return next;
}

export function isTerminal(state: AntichessState): { score: number } | null {
  if (state.result === null) return null;
  if (state.result === "white") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}
