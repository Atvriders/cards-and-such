// Pawn Promotion Puzzle — state
import type { Board, ChessCoord, ChessMove, CastlingRights, PieceColor, PieceType } from "../_chess-core/types.js";
import { emptyBoard, idx } from "../_chess-core/types.js";
import { legalMoves, applyMove, isInCheck } from "../_chess-core/moves.js";

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

export interface Puzzle {
  fen: string;
  // The pawn must promote — solution includes the promotion piece
  solution: ChessMove;
  hint: string;
}

export const PUZZLES: Puzzle[] = [
  // Puzzle 1: pawn on a7 (row1,col0), black king on b8 (row0,col1) — advance a7-a8=Q (checkmate!)
  { fen: "1k6/P7/1K6/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 0 }, to: { row: 0, col: 0 }, promotion: "queen" },
    hint: "Promote to Queen for checkmate!" },
  // Puzzle 2: pawn on h7 (row1,col7), black king on g8 (row0,col6) — h7-h8=Q#
  { fen: "6k1/7P/6K1/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 7 }, to: { row: 0, col: 7 }, promotion: "queen" },
    hint: "Promote to Queen for checkmate!" },
  // Puzzle 3: pawn on b7, black king on a8 — b7-b8=Q#
  { fen: "k7/1P6/2K5/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 1 }, to: { row: 0, col: 1 }, promotion: "queen" },
    hint: "Promote — and checkmate!" },
  // Puzzle 4: pawn on c7, black king on b8 — c7-c8=Q#
  { fen: "1k6/2P5/2K5/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 2 }, to: { row: 0, col: 2 }, promotion: "queen" },
    hint: "Advance the pawn and promote!" },
  // Puzzle 5: pawn on d7, black king on e8 — d7-d8=Q#
  { fen: "4k3/3P4/3K4/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 3 }, to: { row: 0, col: 3 }, promotion: "queen" },
    hint: "Advance and promote — checkmate!" },
  // Puzzle 6: capture and promote — rk6/1P6/1K6 — pawn on b7 captures rook on a8=Q#
  { fen: "rk6/1P6/1K6/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 1 }, to: { row: 0, col: 0 }, promotion: "queen" },
    hint: "Capture and promote to Queen for checkmate!" },
  // Puzzle 7: pawn on g7 captures rook on h8 with promotion — black king on f8
  { fen: "5k1r/6P1/5K2/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 6 }, to: { row: 0, col: 7 }, promotion: "queen" },
    hint: "Capture the rook and promote!" },
  // Puzzle 8: pawn on f7, black king on g8 — f7-f8=Q#
  { fen: "6k1/5P2/5K2/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 5 }, to: { row: 0, col: 5 }, promotion: "queen" },
    hint: "Promote the pawn!" },
  // Puzzle 9: pawn on e7, black king on d8 — e7-e8=Q#
  { fen: "3k4/4P3/4K3/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 4 }, to: { row: 0, col: 4 }, promotion: "queen" },
    hint: "Promote to Queen!" },
  // Puzzle 10: pawn on g7, black king on h8 — g7-g8=Q#
  { fen: "7k/6P1/6K1/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 6 }, to: { row: 0, col: 6 }, promotion: "queen" },
    hint: "Promote for checkmate!" },
  // Puzzle 11: pawn on b7, black king on a8 + rook on b8 — capture Rb8 with promotion
  { fen: "kr6/1P6/1K6/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 1 }, to: { row: 0, col: 2 }, promotion: "queen" },
    hint: "Capture and promote to finish!" },
  // Puzzle 12: pawn on c7, black king on d8 with rook on c8 — capture Rc8=Q#
  { fen: "2rk4/2P5/2K5/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 2 }, to: { row: 0, col: 2 }, promotion: "queen" },
    hint: "Capture the rook and promote!" },
];

export interface PuzzleState {
  puzzleIndex: number;
  board: Board;
  selected: ChessCoord | null;
  status: "playing" | "solved" | "wrong" | "complete" | "promoting";
  message: string;
  puzzle: Puzzle;
  pendingPromote: { from: ChessCoord; to: ChessCoord } | null;
}

export type PuzzleAction =
  | { type: "select"; coord: ChessCoord }
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "promote"; piece: PieceType }
  | { type: "next" }
  | { type: "retry" };

const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };

export function initialState(): PuzzleState {
  const puzzle = PUZZLES[0]!;
  return {
    puzzleIndex: 0,
    board: fenToBoard(puzzle.fen),
    selected: null,
    status: "playing",
    message: `Pawn Promotion — ${puzzle.hint}`,
    puzzle,
    pendingPromote: null,
  };
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
    const legal = legalMoves(state.board, "white", null, noCastle);
    // Check if move lands on promotion row
    const promotionMoves = legal.filter(m =>
      m.from.row === action.from.row && m.from.col === action.from.col &&
      m.to.row === action.to.row && m.to.col === action.to.col);
    if (promotionMoves.length === 0) return { ...state, selected: null };

    // If promotion needed, go to promoting state
    if (promotionMoves[0]?.promotion !== undefined) {
      return { ...state, selected: null, status: "promoting", pendingPromote: { from: action.from, to: action.to }, message: "Choose your promotion piece!" };
    }

    // Normal move
    const move = promotionMoves[0]!;
    const sol = state.puzzle.solution;
    const correct = move.from.row === sol.from.row && move.from.col === sol.from.col &&
                    move.to.row === sol.to.row && move.to.col === sol.to.col;
    const newBoard = applyMove(state.board, move);
    if (correct) {
      return { ...state, board: newBoard, selected: null, status: "solved", message: "Correct! Pawn promoted!" };
    }
    return { ...state, board: newBoard, selected: null, status: "wrong", message: "Not the right move. Try again!" };
  }

  if (action.type === "promote") {
    if (state.status !== "promoting" || !state.pendingPromote) return state;
    const { from, to } = state.pendingPromote;
    const move: ChessMove = { from, to, promotion: action.piece };
    const sol = state.puzzle.solution;
    const correctFrom = from.row === sol.from.row && from.col === sol.from.col && to.row === sol.to.row && to.col === sol.to.col;
    const correctPiece = action.piece === (sol.promotion ?? "queen");
    const newBoard = applyMove(state.board, move);
    const mated = isCheckmate(newBoard, "black");

    if (correctFrom && correctPiece) {
      return { ...state, board: newBoard, status: "solved", message: `Promoted to ${action.piece}! ${mated ? "Checkmate!" : "Well played!"}`, pendingPromote: null };
    }
    // Even if square is correct but piece choice wrong, let them try — evaluate if it's at least valid
    if (mated) {
      return { ...state, board: newBoard, status: "solved", message: `Promoted to ${action.piece} — Checkmate! Creative!`, pendingPromote: null };
    }
    return { ...state, board: newBoard, status: "wrong", message: "That promotion didn't work. Try again!", pendingPromote: null };
  }

  if (action.type === "retry") {
    const puzzle = state.puzzle;
    return { ...state, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: `Pawn Promotion — ${puzzle.hint}`, pendingPromote: null };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLES.length) {
      return { ...state, status: "complete", message: "All promotions achieved! Pawn power mastered!" };
    }
    const puzzle = PUZZLES[next]!;
    return { puzzleIndex: next, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: `Pawn Promotion — ${puzzle.hint}`, puzzle, pendingPromote: null };
  }

  return state;
}

export function isTerminal(state: PuzzleState): { score: number } | null {
  if (state.status === "complete") return { score: 1 };
  return null;
}

export function getLegalTargets(state: PuzzleState, from: ChessCoord): ChessCoord[] {
  return legalMoves(state.board, "white", null, noCastle)
    .filter(m => m.from.row === from.row && m.from.col === from.col)
    .map(m => m.to)
    .filter((t, i, arr) => arr.findIndex(x => x.row === t.row && x.col === t.col) === i); // deduplicate
}
