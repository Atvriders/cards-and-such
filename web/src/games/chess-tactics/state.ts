// Chess Tactics — forks, pins, skewers puzzle state
import type { Board, ChessCoord, ChessMove, CastlingRights, PieceColor, PieceType } from "../_chess-core/types.js";
import { emptyBoard, idx } from "../_chess-core/types.js";
import { legalMoves, applyMove } from "../_chess-core/moves.js";

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

export type TacticType = "fork" | "pin" | "skewer" | "discovered";

export interface Puzzle {
  fen: string;
  solution: ChessMove;
  tacticType: TacticType;
  description: string;
}

export const PUZZLES: Puzzle[] = [
  // Fork puzzles (knight/queen attacks two pieces)
  { fen: "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
    solution: { from: { row: 7, col: 6 }, to: { row: 5, col: 5 } },
    tacticType: "fork", description: "Knight fork!" },
  { fen: "r1bqkbnr/pppp1ppp/8/4p3/4n3/5N2/PPPPBPPP/RNBQK2R w KQkq - 0 1",
    solution: { from: { row: 7, col: 3 }, to: { row: 4, col: 3 } },
    tacticType: "fork", description: "Queen fork — attack rook and knight!" },
  // Knight fork: attacks king and rook
  { fen: "r4rk1/pppppppp/8/8/8/8/PPPPPPPP/R3K1NR w KQ - 0 1",
    solution: { from: { row: 7, col: 6 }, to: { row: 5, col: 5 } },
    tacticType: "fork", description: "Knight attacks king and rook!" },
  // Pin puzzle: pin opponent piece to king
  { fen: "rnbqk2r/ppp2ppp/3p1n2/4p3/2B5/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    solution: { from: { row: 4, col: 2 }, to: { row: 1, col: 5 } },
    tacticType: "pin", description: "Bishop pins the knight to the king!" },
  { fen: "rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    solution: { from: { row: 7, col: 1 }, to: { row: 5, col: 2 } },
    tacticType: "pin", description: "Pin the queen to the king with your bishop!" },
  // Skewer puzzle: attack high-value piece behind lower-value
  { fen: "4k3/8/8/8/8/8/8/4KR2 w - - 0 1",
    solution: { from: { row: 7, col: 5 }, to: { row: 0, col: 5 } },
    tacticType: "skewer", description: "Rook skewer — king must move, rook is taken!" },
  { fen: "4k3/4r3/8/8/8/8/8/4KQ2 w - - 0 1",
    solution: { from: { row: 7, col: 5 }, to: { row: 0, col: 5 } },
    tacticType: "skewer", description: "Queen skewer through the king!" },
  // Fork with queen
  { fen: "r1bk4/pppp4/2n5/8/8/8/PPPQ4/RNB1K3 w - - 0 1",
    solution: { from: { row: 6, col: 3 }, to: { row: 1, col: 3 } },
    tacticType: "fork", description: "Queen attacks king and knight simultaneously!" },
  // Discovered attack
  { fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
    solution: { from: { row: 4, col: 4 }, to: { row: 3, col: 3 } },
    tacticType: "discovered", description: "Capture and discover an attack!" },
  // Pin: rook pins to king
  { fen: "r3k3/8/8/8/8/8/8/R3K3 w Qq - - 0 1",
    solution: { from: { row: 7, col: 0 }, to: { row: 0, col: 0 } },
    tacticType: "pin", description: "Rook on open file pins enemy pieces!" },
  // Knight fork king and queen
  { fen: "r1bk1b1r/ppppqppp/8/4n3/8/5N2/PPPPPPPP/RNBQKB1R w KQ - 0 1",
    solution: { from: { row: 5, col: 5 }, to: { row: 3, col: 4 } },
    tacticType: "fork", description: "Knight forks king and queen!" },
  // Skewer bishop
  { fen: "4k3/8/4b3/8/8/8/8/4KB2 w - - 0 1",
    solution: { from: { row: 7, col: 5 }, to: { row: 2, col: 0 } },
    tacticType: "skewer", description: "Bishop skewer — force a trade!" },
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

export function initialState(): PuzzleState {
  const puzzle = PUZZLES[0]!;
  return {
    puzzleIndex: 0,
    board: fenToBoard(puzzle.fen),
    selected: null,
    status: "playing",
    message: `Tactic: ${puzzle.tacticType.toUpperCase()} — ${puzzle.description}`,
    puzzle,
  };
}

const noCastle: CastlingRights = { whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false };

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
    if (correct) {
      return { ...state, board: newBoard, selected: null, status: "solved", message: `Correct! ${state.puzzle.description}` };
    }
    return { ...state, board: newBoard, selected: null, status: "wrong", message: "Not the best tactic move. Try again!" };
  }

  if (action.type === "retry") {
    const puzzle = state.puzzle;
    return { ...state, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: `Tactic: ${puzzle.tacticType.toUpperCase()} — ${puzzle.description}` };
  }

  if (action.type === "next") {
    if (state.status !== "solved") return state;
    const next = state.puzzleIndex + 1;
    if (next >= PUZZLES.length) {
      return { ...state, status: "complete", message: "All tactics mastered! You're a tactical genius!" };
    }
    const puzzle = PUZZLES[next]!;
    return { puzzleIndex: next, board: fenToBoard(puzzle.fen), selected: null, status: "playing", message: `Tactic: ${puzzle.tacticType.toUpperCase()} — ${puzzle.description}`, puzzle };
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
