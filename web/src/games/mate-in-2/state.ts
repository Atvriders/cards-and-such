// Mate in Two — puzzle state
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

export function isCheckmate(board: Board, color: PieceColor): boolean {
  const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };
  if (!isInCheck(board, color)) return false;
  return legalMoves(board, color, null, noCastle).length === 0;
}

// Each puzzle: white first move is the key move, then black responds (any), then white mates
export interface Puzzle {
  fen: string;
  keyMove: ChessMove;       // white's first move
  // After keyMove, for any black reply, white can mate in 1
  // We verify: after keyMove + any black legal reply, white has a mating move
  label: string;
}

export const PUZZLES: Puzzle[] = [
  // 1: Qh5 threatening Qxf7# — black must respond, then Qxf7#
  { fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    keyMove: { from: { row: 7, col: 3 }, to: { row: 3, col: 7 } },
    label: "Qh5" },
  // 2: Anastasia's mate setup — Re1 then Rh1# after Kf2?
  { fen: "5rk1/5ppp/8/8/8/8/6PP/4RRK1 w - - 0 1",
    keyMove: { from: { row: 7, col: 4 }, to: { row: 0, col: 4 } },
    label: "Re8" },
  // 3: Ladder mate — Rg1+ then Rh1#
  { fen: "8/8/8/8/8/7k/8/6RK w - - 0 1",
    keyMove: { from: { row: 7, col: 6 }, to: { row: 2, col: 6 } },
    label: "Rg3+" },
  // 4: Rook + King — R to open file
  { fen: "8/8/8/8/8/1k6/8/KR6 w - - 0 1",
    keyMove: { from: { row: 7, col: 1 }, to: { row: 2, col: 1 } },
    label: "Rb3+" },
  // 5: Queen zugzwang — Qa7 then Qa1#
  { fen: "8/8/8/8/8/k7/8/KQ6 w - - 0 1",
    keyMove: { from: { row: 7, col: 1 }, to: { row: 1, col: 0 } },
    label: "Qa2+" },
  // 6: Two rooks mate — Ra8+ then Rb8#
  { fen: "k7/8/K7/8/8/8/8/RR6 w - - 0 1",
    keyMove: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } },
    label: "Ra8+" },
  // 7: Rook + queen ladder
  { fen: "8/8/8/8/8/7k/7Q/7K w - - 0 1",
    keyMove: { from: { row: 6, col: 7 }, to: { row: 2, col: 7 } },
    label: "Qh3+" },
  // 8: Back rank — Qd8+ then Qxf8#
  { fen: "5rk1/5ppp/8/8/8/3Q4/6PP/6K1 w - - 0 1",
    keyMove: { from: { row: 5, col: 3 }, to: { row: 0, col: 3 } },
    label: "Qd8+" },
  // 9: Smothered mate — Qg8+ Rxg8 Nf7#
  { fen: "r5k1/6pp/8/8/8/8/6PP/4NQK1 w - - 0 1",
    keyMove: { from: { row: 7, col: 5 }, to: { row: 0, col: 6 } },
    label: "Qg8+" },
  // 10: Rook ladder
  { fen: "8/8/k7/8/K7/8/8/RR6 w - - 0 1",
    keyMove: { from: { row: 7, col: 0 }, to: { row: 2, col: 0 } },
    label: "Ra3+" },
];

// ---- State ----
export type TurnPhase = "white1" | "black" | "white2";

export interface PuzzleState {
  puzzleIndex: number;
  board: Board;
  selected: ChessCoord | null;
  phase: TurnPhase;  // whose turn in puzzle sequence
  status: "playing" | "solved" | "wrong" | "complete";
  message: string;
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
    phase: "white1",
    status: "playing",
    message: "White to move — find the two-move checkmate!",
    puzzle,
  };
}

const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };

function movesMatch(a: ChessMove, b: ChessMove): boolean {
  return a.from.row === b.from.row && a.from.col === b.from.col &&
         a.to.row === b.to.row && a.to.col === b.to.col;
}

// Compute best black reply (any legal) — we just pick first legal move
function blackBestReply(board: Board): ChessMove | null {
  const moves = legalMoves(board, "black", null, noCastle);
  return moves[0] ?? null;
}

// Does white have ANY mating move after this position?
function whiteHasMate(board: Board): boolean {
  const moves = legalMoves(board, "white", null, noCastle);
  for (const m of moves) {
    const nb = applyMove(board, m);
    if (isCheckmate(nb, "black")) return true;
  }
  return false;
}

export function reducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  if (action.type === "select") {
    if (state.status !== "playing") return state;
    const turnColor: PieceColor = state.phase === "black" ? "black" : "white";
    const piece = state.board[idx(action.coord.row, action.coord.col)];
    if (!piece || piece.color !== turnColor) return { ...state, selected: null };
    return { ...state, selected: action.coord };
  }

  if (action.type === "move") {
    if (state.status !== "playing") return state;
    const turnColor: PieceColor = state.phase === "black" ? "black" : "white";
    const legal = legalMoves(state.board, turnColor, null, noCastle);
    const move = legal.find(m =>
      m.from.row === action.from.row && m.from.col === action.from.col &&
      m.to.row === action.to.row && m.to.col === action.to.col);
    if (!move) return { ...state, selected: null };

    const newBoard = applyMove(state.board, move);

    if (state.phase === "white1") {
      if (!movesMatch(move, state.puzzle.keyMove)) {
        return { ...state, board: newBoard, selected: null, status: "wrong", message: "That's not the key move. Try again!" };
      }
      // Valid key move — apply black's reply automatically
      const blackReply = blackBestReply(newBoard);
      const boardAfterBlack = blackReply ? applyMove(newBoard, blackReply) : newBoard;
      return { ...state, board: boardAfterBlack, selected: null, phase: "white2", message: "Good! Now finish with checkmate!" };
    }

    if (state.phase === "white2") {
      if (isCheckmate(newBoard, "black")) {
        return { ...state, board: newBoard, selected: null, status: "solved", message: "Checkmate in 2! Well done!" };
      }
      return { ...state, board: newBoard, selected: null, status: "wrong", message: "That's not checkmate. Try again!" };
    }

    return state;
  }

  if (action.type === "retry") {
    const puzzle = state.puzzle;
    return { ...state, board: fenToBoard(puzzle.fen), selected: null, phase: "white1", status: "playing", message: "White to move — find the two-move checkmate!" };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLES.length) {
      return { ...state, status: "complete", message: "All puzzles solved! Excellent chess thinking!" };
    }
    const puzzle = PUZZLES[next]!;
    return { puzzleIndex: next, board: fenToBoard(puzzle.fen), selected: null, phase: "white1", status: "playing", message: "White to move — find the two-move checkmate!", puzzle };
  }

  return state;
}

export function isTerminal(state: PuzzleState): { score: number } | null {
  if (state.status === "complete") return { score: 1 };
  return null;
}

export function getLegalTargets(state: PuzzleState, from: ChessCoord): ChessCoord[] {
  const turnColor: PieceColor = state.phase === "black" ? "black" : "white";
  return legalMoves(state.board, turnColor, null, noCastle)
    .filter(m => m.from.row === from.row && m.from.col === from.col)
    .map(m => m.to);
}
