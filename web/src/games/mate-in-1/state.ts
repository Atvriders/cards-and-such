// Mate in One — puzzle state
import type { Board, ChessCoord, ChessMove, CastlingRights, PieceColor, PieceType } from "../_chess-core/types.js";
import { emptyBoard, idx } from "../_chess-core/types.js";
import { legalMoves, applyMove, isInCheck } from "../_chess-core/moves.js";

// ---- FEN helpers ----
function fenToBoard(fen: string): Board {
  const b = emptyBoard();
  const rows = fen.split(" ")[0]!.split("/");
  const pieceMap: Record<string, { color: PieceColor; type: PieceType }> = {
    p: { color: "black", type: "pawn" }, r: { color: "black", type: "rook" },
    n: { color: "black", type: "knight" }, b: { color: "black", type: "bishop" },
    q: { color: "black", type: "queen" }, k: { color: "black", type: "king" },
    P: { color: "white", type: "pawn" }, R: { color: "white", type: "rook" },
    N: { color: "white", type: "knight" }, B: { color: "white", type: "bishop" },
    Q: { color: "white", type: "queen" }, K: { color: "white", type: "king" },
  };
  for (let r = 0; r < 8; r++) {
    let c = 0;
    for (const ch of rows[r] ?? "") {
      if (ch >= "1" && ch <= "8") { c += parseInt(ch); }
      else { b[idx(r, c)] = pieceMap[ch] ?? null; c++; }
    }
  }
  return b;
}

function isCheckmate(board: Board, color: PieceColor): boolean {
  const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };
  if (!isInCheck(board, color)) return false;
  return legalMoves(board, color, null, noCastle).length === 0;
}

// ---- Puzzles ----
export interface Puzzle {
  fen: string;   // position, white to move
  solution: ChessMove; // first (and only) correct move
}

export const PUZZLES: Puzzle[] = [
  // 1: White Qh5#  (Scholar's mate variant)
  { fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: { from: { row: 3, col: 7 }, to: { row: 0, col: 4 } } },
  // 2: Back rank mate Qe8#
  { fen: "6k1/5ppp/8/8/8/8/5PPP/3QK3 w - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 4 } } },
  // 3: Rook mate Ra8#
  { fen: "8/8/8/8/8/8/6KR/7k w - - 0 1",
    solution: { from: { row: 6, col: 7 }, to: { row: 7, col: 7 } } },
  // 4: Queen mate Qg7#
  { fen: "5r1k/6pp/7Q/8/8/8/6PP/6K1 w - - 0 1",
    solution: { from: { row: 2, col: 7 }, to: { row: 1, col: 6 } } },
  // 5: Knight mate Nf7#  (smothered)
  { fen: "6rk/6pp/7N/8/8/8/6PP/6K1 w - - 0 1",
    solution: { from: { row: 2, col: 7 }, to: { row: 1, col: 5 } } },
  // 6: Qd8# back rank
  { fen: "3rk3/3ppp2/8/8/8/8/8/3QK3 w - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } } },
  // 7: Queen h7#
  { fen: "5rk1/5p1p/8/6Q1/8/8/6PP/6K1 w - - 0 1",
    solution: { from: { row: 3, col: 6 }, to: { row: 1, col: 7 } } },
  // 8: Rook g8#
  { fen: "6k1/5ppp/8/8/8/8/5PPP/5RK1 w - - 0 1",
    solution: { from: { row: 7, col: 5 }, to: { row: 0, col: 5 } } },
  // 9: Bishop delivers check forcing mate via Bf7#? — use straightforward Qd7#
  { fen: "r1bk4/pp1p4/2p5/8/8/8/PPPPPPPP/RNBQKBNR w KQ - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 1, col: 3 } } },
  // 10: Rook a1#
  { fen: "k7/8/KR6/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 2, col: 1 }, to: { row: 0, col: 1 } } },
  // 11: Queen a8#
  { fen: "k7/8/KQ6/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 2, col: 1 }, to: { row: 0, col: 0 } } },
  // 12: Rook h8#
  { fen: "7k/6pp/8/8/8/8/6PP/6KR w - - 0 1",
    solution: { from: { row: 7, col: 7 }, to: { row: 0, col: 7 } } },
];

// ---- State ----
export interface PuzzleState {
  puzzleIndex: number;
  board: Board;
  selected: ChessCoord | null;
  status: "playing" | "solved" | "wrong" | "complete";
  message: string;
  wrongMove: ChessMove | null;
  puzzle: Puzzle;
}

export type PuzzleAction =
  | { type: "select"; coord: ChessCoord }
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "next" }
  | { type: "retry" };

export function initialState(): PuzzleState {
  const puzzle = PUZZLES[0]!;
  return {
    puzzleIndex: 0,
    board: fenToBoard(puzzle.fen),
    selected: null,
    status: "playing",
    message: "Find the checkmate in one move!",
    wrongMove: null,
    puzzle,
  };
}

function movesMatch(a: ChessMove, b: ChessMove): boolean {
  return a.from.row === b.from.row && a.from.col === b.from.col &&
         a.to.row === b.to.row && a.to.col === b.to.col;
}

export function reducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  if (action.type === "select") {
    if (state.status !== "playing") return state;
    const piece = state.board[idx(action.coord.row, action.coord.col)];
    if (!piece || piece.color !== "white") return { ...state, selected: null };
    return { ...state, selected: action.coord };
  }

  if (action.type === "move") {
    if (state.status !== "playing") return state;
    const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };
    const legal = legalMoves(state.board, "white", null, noCastle);
    const move = legal.find(m => m.from.row === action.from.row && m.from.col === action.from.col &&
                                  m.to.row === action.to.row && m.to.col === action.to.col);
    if (!move) return { ...state, selected: null };
    const correct = movesMatch(move, state.puzzle.solution);
    const newBoard = applyMove(state.board, move);
    const checkmate = isCheckmate(newBoard, "black");

    if (correct && checkmate) {
      return { ...state, board: newBoard, selected: null, status: "solved", message: "Checkmate! Brilliant!", wrongMove: null };
    }
    return { ...state, board: newBoard, selected: null, status: "wrong", message: "That's not the right move. Try again!", wrongMove: move };
  }

  if (action.type === "retry") {
    return { ...state, board: fenToBoard(state.puzzle.fen), selected: null, status: "playing", message: "Find the checkmate in one move!", wrongMove: null };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLES.length) {
      return { ...state, status: "complete", message: "All puzzles solved! You're a chess master!" };
    }
    const puzzle = PUZZLES[next]!;
    return { puzzleIndex: next, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: "Find the checkmate in one move!", wrongMove: null, puzzle };
  }

  return state;
}

export function isTerminal(state: PuzzleState): { score: number } | null {
  if (state.status === "complete") return { score: 1 };
  return null;
}

export function getLegalTargets(state: PuzzleState, from: ChessCoord): ChessCoord[] {
  const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };
  return legalMoves(state.board, "white", null, noCastle)
    .filter(m => m.from.row === from.row && m.from.col === from.col)
    .map(m => m.to);
}
