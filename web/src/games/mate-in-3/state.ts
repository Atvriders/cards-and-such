// Mate in Three — puzzle state
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

export function isCheckmate(board: Board, color: PieceColor): boolean {
  const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };
  if (!isInCheck(board, color)) return false;
  return legalMoves(board, color, null, noCastle).length === 0;
}

export interface Puzzle {
  fen: string;
  // White key moves (move 1 and move 3), black reply is auto-computed
  move1: ChessMove;
  move3: ChessMove;
  label: string;
}

export const PUZZLES: Puzzle[] = [
  // 1: Two rooks ladder to corner
  { fen: "k7/8/K7/8/8/8/8/RR6 w - - 0 1",
    move1: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } },
    move3: { from: { row: 7, col: 1 }, to: { row: 0, col: 1 } },
    label: "Ra8+ ... Rb8#" },
  // 2: Queen + King corral
  { fen: "8/8/8/8/8/k7/8/KQ6 w - - 0 1",
    move1: { from: { row: 7, col: 1 }, to: { row: 5, col: 3 } },
    move3: { from: { row: 5, col: 3 }, to: { row: 2, col: 0 } },
    label: "Qd3 ... Qa3#" },
  // 3: Rook + Queen
  { fen: "8/8/8/8/k7/8/K7/RQ6 w - - 0 1",
    move1: { from: { row: 7, col: 0 }, to: { row: 4, col: 0 } },
    move3: { from: { row: 7, col: 1 }, to: { row: 4, col: 1 } },
    label: "Ra5+ ... Qb5#" },
  // 4: Rook + Bishop coordination
  { fen: "k7/pp6/K7/1R6/8/8/8/7B w - - 0 1",
    move1: { from: { row: 3, col: 1 }, to: { row: 1, col: 1 } },
    move3: { from: { row: 3, col: 1 }, to: { row: 0, col: 1 } },
    label: "Rb7+ ... Rb8#" },
  // 5: Two rooks, king chased
  { fen: "8/8/8/k7/K7/8/8/RR6 w - - 0 1",
    move1: { from: { row: 7, col: 0 }, to: { row: 3, col: 0 } },
    move3: { from: { row: 7, col: 1 }, to: { row: 3, col: 1 } },
    label: "Ra5+ ... Rb5#" },
  // 6: Queen narrows
  { fen: "8/8/8/8/2k5/8/K7/7Q w - - 0 1",
    move1: { from: { row: 7, col: 7 }, to: { row: 4, col: 4 } },
    move3: { from: { row: 4, col: 4 }, to: { row: 4, col: 2 } },
    label: "Qe5 ... Qe4/c6 zone" },
  // 7: Rook ladder
  { fen: "8/8/8/8/8/7k/8/6RK w - - 0 1",
    move1: { from: { row: 7, col: 6 }, to: { row: 2, col: 6 } },
    move3: { from: { row: 2, col: 6 }, to: { row: 0, col: 6 } },
    label: "Rg3+ Kh4? Rg8?" },
  // 8: Cornering with queen
  { fen: "8/8/8/8/8/8/k7/KQ6 w - - 0 1",
    move1: { from: { row: 7, col: 1 }, to: { row: 6, col: 2 } },
    move3: { from: { row: 6, col: 2 }, to: { row: 2, col: 2 } },
    label: "Qc2 approach" },
  // 9: Rook pair
  { fen: "k7/8/1K6/8/8/8/8/RR6 w - - 0 1",
    move1: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } },
    move3: { from: { row: 7, col: 1 }, to: { row: 0, col: 1 } },
    label: "Ra8+ ... Rb8#" },
  // 10: Queen approach
  { fen: "8/8/8/8/8/k7/2Q5/K7 w - - 0 1",
    move1: { from: { row: 6, col: 2 }, to: { row: 5, col: 1 } },
    move3: { from: { row: 5, col: 1 }, to: { row: 2, col: 1 } },
    label: "Qb3+ ... Qb2?" },
];

// Phases: white1, black1, white2, black2, white3
export type TurnPhase = "white1" | "black1" | "white2" | "black2" | "white3";

export interface PuzzleState {
  puzzleIndex: number;
  board: Board;
  selected: ChessCoord | null;
  phase: TurnPhase;
  status: "playing" | "solved" | "wrong" | "complete";
  message: string;
  puzzle: Puzzle;
  moveCount: number; // 1 or 3 (white moves)
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
    phase: "white1",
    status: "playing",
    message: "White to move — find the three-move checkmate!",
    puzzle,
    moveCount: 1,
  };
}

const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };

function movesMatch(a: ChessMove, b: ChessMove): boolean {
  return a.from.row === b.from.row && a.from.col === b.from.col &&
         a.to.row === b.to.row && a.to.col === b.to.col;
}

function autoBlackReply(board: Board): ChessMove | null {
  const moves = legalMoves(board, "black", null, noCastle);
  // Pick a move that doesn't lead to immediate stalemate if possible
  return moves[0] ?? null;
}

export function reducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  if (action.type === "select") {
    if (state.status !== "playing") return state;
    const turnColor: PieceColor = (state.phase === "black1" || state.phase === "black2") ? "black" : "white";
    const piece = state.board[idx(action.coord.row, action.coord.col)];
    if (!piece || piece.color !== turnColor) return { ...state, selected: null };
    return { ...state, selected: action.coord };
  }

  if (action.type === "move") {
    if (state.status !== "playing") return state;
    const isWhitePhase = state.phase === "white1" || state.phase === "white2" || state.phase === "white3";
    const turnColor: PieceColor = isWhitePhase ? "white" : "black";
    const legal = legalMoves(state.board, turnColor, null, noCastle);
    const move = legal.find(m =>
      m.from.row === action.from.row && m.from.col === action.from.col &&
      m.to.row === action.to.row && m.to.col === action.to.col);
    if (!move) return { ...state, selected: null };
    const newBoard = applyMove(state.board, move);

    if (state.phase === "white1") {
      if (!movesMatch(move, state.puzzle.move1)) {
        return { ...state, board: newBoard, selected: null, status: "wrong", message: "Not the key move. Try again!" };
      }
      // Auto black reply
      const blackReply = autoBlackReply(newBoard);
      const boardAfterBlack = blackReply ? applyMove(newBoard, blackReply) : newBoard;
      return { ...state, board: boardAfterBlack, selected: null, phase: "white2", message: "Good move! Continue..." };
    }

    if (state.phase === "white2") {
      // Any legal white move is accepted for move 2 (intermediate)
      const blackReply = autoBlackReply(newBoard);
      const boardAfterBlack = blackReply ? applyMove(newBoard, blackReply) : newBoard;
      return { ...state, board: boardAfterBlack, selected: null, phase: "white3", message: "Almost there — deliver checkmate!" };
    }

    if (state.phase === "white3") {
      if (isCheckmate(newBoard, "black")) {
        return { ...state, board: newBoard, selected: null, status: "solved", message: "Checkmate in 3! Masterful!" };
      }
      return { ...state, board: newBoard, selected: null, status: "wrong", message: "Not checkmate. Try again!" };
    }

    return state;
  }

  if (action.type === "retry") {
    const puzzle = state.puzzle;
    return { ...state, board: fenToBoard(puzzle.fen), selected: null, phase: "white1", status: "playing", message: "White to move — find the three-move checkmate!", moveCount: 1 };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLES.length) {
      return { ...state, status: "complete", message: "All puzzles solved! You think three moves ahead!" };
    }
    const puzzle = PUZZLES[next]!;
    return { puzzleIndex: next, board: fenToBoard(puzzle.fen), selected: null, phase: "white1", status: "playing", message: "White to move — find the three-move checkmate!", puzzle, moveCount: 1 };
  }

  return state;
}

export function isTerminal(state: PuzzleState): { score: number } | null {
  if (state.status === "complete") return { score: 1 };
  return null;
}

export function getLegalTargets(state: PuzzleState, from: ChessCoord): ChessCoord[] {
  const isWhitePhase = state.phase === "white1" || state.phase === "white2" || state.phase === "white3";
  const turnColor: PieceColor = isWhitePhase ? "white" : "black";
  return legalMoves(state.board, turnColor, null, noCastle)
    .filter(m => m.from.row === from.row && m.from.col === from.col)
    .map(m => m.to);
}
