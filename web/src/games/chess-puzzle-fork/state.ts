// Chess Fork Puzzles — dedicated fork-only puzzle set
import type { Board, ChessCoord, ChessMove, CastlingRights } from "../_chess-core/types.js";
import { emptyBoard, idx } from "../_chess-core/types.js";
import { legalMoves, applyMove } from "../_chess-core/moves.js";
import type { PieceColor, PieceType } from "../_chess-core/types.js";

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

export interface ForkPuzzle {
  fen: string;
  solution: ChessMove;
  description: string;
}

export const FORK_PUZZLES: ForkPuzzle[] = [
  {
    fen: "r3k3/pppppppp/8/8/8/5N2/PPPPPPPP/R3K3 w Qq - 0 1",
    solution: { from: { row: 5, col: 5 }, to: { row: 3, col: 6 } },
    description: "Knight fork — attack rook and pawn!",
  },
  {
    fen: "r1b1k2r/ppppqppp/8/4n3/4N3/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1",
    solution: { from: { row: 4, col: 4 }, to: { row: 2, col: 5 } },
    description: "Knight fork — attack king and rook!",
  },
  {
    fen: "rnb1kbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    solution: { from: { row: 5, col: 5 }, to: { row: 3, col: 4 } },
    description: "Knight forks two pawns — win material!",
  },
  {
    fen: "r3k2r/ppp2ppp/2n5/8/8/2N5/PPP2PPP/R3K2R w KQkq - 0 1",
    solution: { from: { row: 5, col: 2 }, to: { row: 3, col: 1 } },
    description: "Knight springs into a fork!",
  },
  {
    fen: "r1bqk1nr/pppp1ppp/4p3/8/4P3/8/PPPPQPPP/RNB1KBNR w KQkq - 0 1",
    solution: { from: { row: 6, col: 4 }, to: { row: 1, col: 4 } },
    description: "Queen fork — threatens knight and rook!",
  },
  {
    fen: "rnb1k2r/ppp2ppp/5n2/3qp3/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 1",
    solution: { from: { row: 7, col: 1 }, to: { row: 5, col: 2 } },
    description: "Knight fork on queen and rook!",
  },
];

export interface ForkPuzzleState {
  puzzleIndex: number;
  board: Board;
  selected: ChessCoord | null;
  status: "playing" | "solved" | "wrong" | "complete";
  message: string;
  puzzle: ForkPuzzle;
  score: number;
}

export type ForkPuzzleAction =
  | { type: "select"; coord: ChessCoord }
  | { type: "move"; from: ChessCoord; to: ChessCoord }
  | { type: "next" }
  | { type: "retry" };

export function initialState(): ForkPuzzleState {
  const puzzle = FORK_PUZZLES[0]!;
  return {
    puzzleIndex: 0,
    board: fenToBoard(puzzle.fen),
    selected: null,
    status: "playing",
    message: `Fork Puzzle 1/${FORK_PUZZLES.length}: ${puzzle.description}`,
    puzzle,
    score: 0,
  };
}

const noCastle: CastlingRights = {
  whiteKingside: false,
  whiteQueenside: false,
  blackKingside: false,
  blackQueenside: false,
};

export function reducer(state: ForkPuzzleState, action: ForkPuzzleAction): ForkPuzzleState {
  if (action.type === "select") {
    if (state.status !== "playing") return state;
    const piece = state.board[idx(action.coord.row, action.coord.col)];
    if (!piece || piece.color !== "white") return { ...state, selected: null };
    return { ...state, selected: action.coord };
  }

  if (action.type === "move") {
    if (state.status !== "playing") return state;
    const legal = legalMoves(state.board, "white", null, noCastle);
    const move = legal.find(
      (m) =>
        m.from.row === action.from.row && m.from.col === action.from.col &&
        m.to.row === action.to.row && m.to.col === action.to.col
    );
    if (!move) return { ...state, selected: null };
    const sol = state.puzzle.solution;
    const correct =
      move.from.row === sol.from.row && move.from.col === sol.from.col &&
      move.to.row === sol.to.row && move.to.col === sol.to.col;
    const newBoard = applyMove(state.board, move);
    if (correct) {
      return {
        ...state,
        board: newBoard,
        selected: null,
        status: "solved",
        message: `Correct! ${state.puzzle.description}`,
        score: state.score + 100,
      };
    }
    return {
      ...state,
      board: newBoard,
      selected: null,
      status: "wrong",
      message: "Not a fork — try a different move!",
    };
  }

  if (action.type === "retry") {
    return {
      ...state,
      board: fenToBoard(state.puzzle.fen),
      selected: null,
      status: "playing",
      message: `Fork Puzzle ${state.puzzleIndex + 1}/${FORK_PUZZLES.length}: ${state.puzzle.description}`,
    };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= FORK_PUZZLES.length) {
      return { ...state, status: "complete", message: `All ${FORK_PUZZLES.length} forks solved! Score: ${state.score}` };
    }
    const puzzle = FORK_PUZZLES[next]!;
    return {
      ...state,
      puzzleIndex: next,
      board: fenToBoard(puzzle.fen),
      selected: null,
      status: "playing",
      message: `Fork Puzzle ${next + 1}/${FORK_PUZZLES.length}: ${puzzle.description}`,
      puzzle,
    };
  }

  return state;
}

export function isTerminal(state: ForkPuzzleState): { score: number } | null {
  if (state.status === "complete") return { score: state.score };
  return null;
}

export function getLegalTargets(state: ForkPuzzleState, from: ChessCoord): ChessCoord[] {
  return legalMoves(state.board, "white", null, noCastle)
    .filter((m) => m.from.row === from.row && m.from.col === from.col)
    .map((m) => m.to);
}
