// Queen vs King Endgame — puzzle state
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
  solution: ChessMove;
  label: string;
}

export const PUZZLES: Puzzle[] = [
  // KQ vs k — find checkmate in 1
  { fen: "k7/8/KQ6/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 2, col: 1 }, to: { row: 0, col: 0 } },
    label: "Qa8#" },
  { fen: "8/8/8/8/8/8/k7/KQ6 w - - 0 1",
    solution: { from: { row: 7, col: 1 }, to: { row: 6, col: 0 } },
    label: "Qa2#" },
  { fen: "7k/8/6KQ/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 2, col: 7 }, to: { row: 0, col: 7 } },
    label: "Qh8#" },
  { fen: "8/8/8/8/8/8/7k/6KQ w - - 0 1",
    solution: { from: { row: 7, col: 7 }, to: { row: 6, col: 7 } },
    label: "Qh2#" },
  { fen: "k7/Q7/K7/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 1, col: 0 }, to: { row: 0, col: 1 } },
    label: "Qb8#" },
  { fen: "8/8/8/8/8/k7/Q7/K7 w - - 0 1",
    solution: { from: { row: 6, col: 0 }, to: { row: 5, col: 1 } },
    label: "Qb3#" },
  { fen: "1k6/8/1KQ5/8/8/8/8/8 w - - 0 1",
    solution: { from: { row: 2, col: 2 }, to: { row: 0, col: 2 } },
    label: "Qc8#" },
  { fen: "8/8/8/8/8/1k6/8/1KQ5 w - - 0 1",
    solution: { from: { row: 7, col: 2 }, to: { row: 5, col: 0 } },
    label: "Qa3#" },
  { fen: "k7/8/1K6/Q7/8/8/8/8 w - - 0 1",
    solution: { from: { row: 3, col: 0 }, to: { row: 0, col: 0 } },
    label: "Qa8#" },
  { fen: "8/8/8/8/Q7/1K6/8/k7 w - - 0 1",
    solution: { from: { row: 4, col: 0 }, to: { row: 7, col: 0 } },
    label: "Qa1#" },
  { fen: "8/k7/8/K7/Q7/8/8/8 w - - 0 1",
    solution: { from: { row: 4, col: 0 }, to: { row: 1, col: 3 } },
    label: "Qd7#" },
  { fen: "8/8/8/8/k7/8/K7/Q7 w - - 0 1",
    solution: { from: { row: 7, col: 0 }, to: { row: 4, col: 3 } },
    label: "Qd4#" },
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
    message: "Queen vs King — deliver checkmate!",
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
      return { ...state, board: newBoard, selected: null, status: "solved", message: `${state.puzzle.label} — Checkmate! Queen delivers!` };
    }
    if (correct) {
      return { ...state, board: newBoard, selected: null, status: "solved", message: "Correct! Well done." };
    }
    return { ...state, board: newBoard, selected: null, status: "wrong", message: "Not checkmate. Try again!" };
  }

  if (action.type === "retry") {
    const puzzle = state.puzzle;
    return { ...state, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: "Queen vs King — deliver checkmate!" };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLES.length) {
      return { ...state, status: "complete", message: "All 12 queen endgames solved! You know your queen endings!" };
    }
    const puzzle = PUZZLES[next]!;
    return { puzzleIndex: next, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: "Queen vs King — deliver checkmate!", puzzle };
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
