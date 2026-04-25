import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface UltimateTTTSettings {
  opponent: "human" | "ai";
}

export type Player = "X" | "O";
export type BoardCell = Player | null;
export type BoardWinner = Player | "draw" | null;

export interface UltimateTTTState {
  settings: UltimateTTTSettings;
  // 9 mini-boards, each with 9 cells
  boards: readonly (readonly BoardCell[])[];
  // winner of each mini-board
  boardWinners: readonly BoardWinner[];
  // which mini-board must next player play in (null = any open board)
  nextBoard: number | null;
  currentPlayer: Player;
  winner: BoardWinner;
  seed: number;
}

export type UltimateTTTAction = { type: "move"; board: number; cell: number };

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(cells: readonly BoardCell[]): BoardWinner {
  for (const line of LINES) {
    const a = line[0]!, b = line[1]!, c = line[2]!;
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) return cells[a] as Player;
  }
  if (cells.every(c => c !== null)) return "draw";
  return null;
}

export function initialState(seed: number, settings: UltimateTTTSettings): UltimateTTTState {
  void mulberry32(seed);
  return {
    settings,
    boards: Array.from({ length: 9 }, () => new Array(9).fill(null) as BoardCell[]),
    boardWinners: new Array(9).fill(null),
    nextBoard: null,
    currentPlayer: "X",
    winner: null,
    seed,
  };
}

function applyMove(state: UltimateTTTState, board: number, cell: number): UltimateTTTState {
  if (state.winner) return state;
  if (board < 0 || board >= 9 || cell < 0 || cell >= 9) return state;
  if (state.nextBoard !== null && state.nextBoard !== board) return state;
  if (state.boardWinners[board] !== null) return state;
  if (state.boards[board]![cell] !== null) return state;

  const newBoard = state.boards[board]!.slice() as BoardCell[];
  newBoard[cell] = state.currentPlayer;

  const newBoards = state.boards.slice() as (readonly BoardCell[])[];
  newBoards[board] = newBoard;

  const newBoardWinners = state.boardWinners.slice() as BoardWinner[];
  newBoardWinners[board] = checkWinner(newBoard);

  const winner = checkWinner(newBoardWinners as BoardCell[]);

  // Next board = the cell index, unless that mini-board is already won
  const nextBoardCandidate = cell;
  const nextBoard = newBoardWinners[nextBoardCandidate] !== null ? null : nextBoardCandidate;

  return {
    ...state,
    boards: newBoards,
    boardWinners: newBoardWinners,
    nextBoard,
    currentPlayer: state.currentPlayer === "X" ? "O" : "X",
    winner: winner === "draw" ? "draw" : winner,
  };
}

function aiMove(state: UltimateTTTState): UltimateTTTState {
  const rng = mulberry32(state.seed + state.boards.flat().filter(Boolean).length * 17);
  // Pick valid boards
  const validBoards = state.nextBoard !== null
    ? (state.boardWinners[state.nextBoard] === null ? [state.nextBoard] : [])
    : Array.from({ length: 9 }, (_, i) => i).filter(i => state.boardWinners[i] === null);

  if (!validBoards.length) return state;

  const bIdx = validBoards[Math.floor(rng() * validBoards.length)]!;
  const board = state.boards[bIdx]!;
  const emptyCells = board.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
  if (!emptyCells.length) return state;

  const cIdx = emptyCells[Math.floor(rng() * emptyCells.length)]!;
  return applyMove(state, bIdx, cIdx);
}

export function reducer(state: UltimateTTTState, action: UltimateTTTAction): UltimateTTTState {
  if (action.type !== "move") return state;
  if (state.winner) return state;

  let next = applyMove(state, action.board, action.cell);

  // AI plays as O if enabled and it's now O's turn
  if (next.settings.opponent === "ai" && next.currentPlayer === "O" && !next.winner) {
    next = aiMove(next);
  }

  return next;
}

export function isTerminal(state: UltimateTTTState): { score: number } | null {
  if (!state.winner) return null;
  if (state.winner === "X") return { score: 1000 };
  if (state.winner === "draw") return { score: 500 };
  return { score: 0 };
}
