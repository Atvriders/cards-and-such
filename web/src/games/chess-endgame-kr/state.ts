// Rook Endgame — King + Rook vs King puzzle state
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
  fen: string;   // KR vs K position, white to move, find checkmate in 1-3
  solution: ChessMove;
  label: string;
}

export const PUZZLES: Puzzle[] = [
  // All KR vs k positions where mate is achievable in 1 move
  // Rook on 8th rank, king supports
  { fen: "k7/8/1K6/8/8/8/8/R7 w - - 0 1",
    solution: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } },
    label: "Ra8#" },
  { fen: "8/8/8/8/8/8/k7/KR6 w - - 0 1",
    solution: { from: { row: 7, col: 1 }, to: { row: 6, col: 1 } },
    label: "Rb2#" },
  { fen: "7k/8/6KR/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 2, col: 7 }, to: { row: 0, col: 7 } },
    label: "Rh8#" },
  { fen: "8/8/8/8/8/8/7k/6KR w - - 0 1",
    solution: { from: { row: 7, col: 7 }, to: { row: 6, col: 7 } },
    label: "Rh2#" },
  { fen: "k7/8/KR6/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 2, col: 1 }, to: { row: 0, col: 1 } },
    label: "Rb8#" },
  { fen: "8/8/8/8/8/k7/8/K1R5 w - - 0 1",
    solution: { from: { row: 7, col: 2 }, to: { row: 5, col: 2 } },
    label: "Rc3#" },
  { fen: "7k/7R/6K1/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 7 }, to: { row: 0, col: 7 } },
    label: "Rh8#" },
  { fen: "8/8/8/8/k7/8/K7/1R6 w - - 0 1",
    solution: { from: { row: 7, col: 1 }, to: { row: 4, col: 1 } },
    label: "Rb5#" },
  { fen: "8/7k/8/8/8/8/7R/6K1 w - - 0 1",
    solution: { from: { row: 6, col: 7 }, to: { row: 1, col: 7 } },
    label: "Rh7#" },
  { fen: "k7/8/K7/R7/8/8/8/8 w - - 0 1",
    solution: { from: { row: 3, col: 0 }, to: { row: 0, col: 0 } },
    label: "Ra8#" },
  { fen: "8/8/8/8/8/8/1k6/K1R5 w - - 0 1",
    solution: { from: { row: 7, col: 2 }, to: { row: 6, col: 2 } },
    label: "Rc2#" },
  { fen: "1k6/8/1KR5/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 2, col: 2 }, to: { row: 0, col: 2 } },
    label: "Rc8#" },
];

export interface PuzzleState {
  puzzleIndex: number;
  board: Board;
  selected: ChessCoord | null;
  status: "playing" | "solved" | "wrong" | "complete";
  message: string;
  puzzle: Puzzle;
}

export type PuzzleAction =
  | { type: "select"; coord: ChessCoord }
  | { type: "move"; from: ChessCoord; to: ChessCoord }
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
    message: "King and Rook vs King — find the mating move!",
    puzzle,
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
    const move = legal.find(m =>
      m.from.row === action.from.row && m.from.col === action.from.col &&
      m.to.row === action.to.row && m.to.col === action.to.col);
    if (!move) return { ...state, selected: null };
    const sol = state.puzzle.solution;
    const correct = move.from.row === sol.from.row && move.from.col === sol.from.col &&
                    move.to.row === sol.to.row && move.to.col === sol.to.col;
    const newBoard = applyMove(state.board, move);
    const mated = isCheckmate(newBoard, "black");
    if (correct && mated) {
      return { ...state, board: newBoard, selected: null, status: "solved", message: `${state.puzzle.label} — Checkmate! Perfect endgame technique!` };
    }
    if (correct) {
      return { ...state, board: newBoard, selected: null, status: "solved", message: "Correct move! Well played." };
    }
    return { ...state, board: newBoard, selected: null, status: "wrong", message: "Not the best move. Try again!" };
  }

  if (action.type === "retry") {
    const puzzle = state.puzzle;
    return { ...state, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: "King and Rook vs King — find the mating move!" };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLES.length) {
      return { ...state, status: "complete", message: "All rook endgames conquered! You know your rook technique!" };
    }
    const puzzle = PUZZLES[next]!;
    return { puzzleIndex: next, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: "King and Rook vs King — find the mating move!", puzzle };
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
    .map(m => m.to);
}
