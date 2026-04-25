// Back Rank Mate — puzzle state
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
  description: string;
}

export const PUZZLES: Puzzle[] = [
  // Back-rank mates: Black king trapped on back rank by own pawns, White delivers mate
  { fen: "5rk1/5ppp/8/8/8/8/5PPP/3QK3 w - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 5 } },
    description: "Qxf8#! Back-rank checkmate!" },
  { fen: "3r2k1/3pppp1/8/8/8/8/3PPPP1/3QK3 w - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } },
    description: "Qxd8#! Queen slices through the back rank!" },
  { fen: "r5k1/5ppp/8/8/8/8/5PPP/R4K2 w - - 0 1",
    solution: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } },
    description: "Rxa8#! Rook delivers back-rank mate!" },
  { fen: "6k1/5ppp/8/8/8/8/5PPP/3RK3 w - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } },
    description: "Rd8#! Rook on the d-file!" },
  { fen: "4r1k1/4pppp/8/8/8/8/4PPPP/3QK3 w - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 4 } },
    description: "Qxe8#! Take the rook and deliver checkmate!" },
  { fen: "3rr1k1/3ppp1p/8/8/8/8/3PPP1P/3QRK2 w - - 0 1",
    solution: { from: { row: 7, col: 4 }, to: { row: 0, col: 4 } },
    description: "Rxe8#! Rook takes rook, back-rank mate!" },
  { fen: "2r3k1/2p2ppp/8/8/8/8/2P2PPP/2R1K3 w - - 0 1",
    solution: { from: { row: 7, col: 2 }, to: { row: 0, col: 2 } },
    description: "Rxc8#! Rook on the c-file!" },
  { fen: "r4rk1/pppppppp/8/8/8/8/PPPPPPPP/R3QK2 w - - 0 1",
    solution: { from: { row: 7, col: 4 }, to: { row: 0, col: 4 } },
    description: "Qe8#! Queen bursts onto the back rank!" },
  { fen: "5rk1/r4ppp/8/8/8/8/5PPP/3R1K2 w - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } },
    description: "Rd8! Back-rank checkmate with the rook!" },
  { fen: "6k1/4pppp/8/8/8/8/4PPPP/3RK3 w - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } },
    description: "Rd8#!" },
  { fen: "r2r2k1/ppp2ppp/8/8/8/8/PPP2PPP/R2QK3 w Q - - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 0, col: 3 } },
    description: "Qd8#! Explosive queen sacrifice into back rank!" },
  { fen: "1r4k1/1p3ppp/8/8/8/8/1P3PPP/1R2K3 w - - 0 1",
    solution: { from: { row: 7, col: 1 }, to: { row: 0, col: 1 } },
    description: "Rb8#! Rook swoops to the back rank!" },
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
    message: "Back Rank — the enemy king is trapped! Find the checkmate!",
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
      return { ...state, board: newBoard, selected: null, status: "solved", message: `${state.puzzle.description}` };
    }
    if (correct) {
      return { ...state, board: newBoard, selected: null, status: "solved", message: "Correct! Well played." };
    }
    return { ...state, board: newBoard, selected: null, status: "wrong", message: "Not quite — that's not the back-rank mate. Try again!" };
  }

  if (action.type === "retry") {
    const puzzle = state.puzzle;
    return { ...state, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: "Back Rank — the enemy king is trapped! Find the checkmate!" };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLES.length) {
      return { ...state, status: "complete", message: "All 12 back-rank mates found! You're a back-rank expert!" };
    }
    const puzzle = PUZZLES[next]!;
    return { puzzleIndex: next, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: "Back Rank — the enemy king is trapped! Find the checkmate!", puzzle };
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
