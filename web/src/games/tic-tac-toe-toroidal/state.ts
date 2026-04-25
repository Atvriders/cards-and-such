import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Toroidal TTT: tic-tac-toe on a 3x3 board that wraps around.
// Rows and columns wrap (top connects to bottom, left connects to right).
// This adds 4 extra winning lines vs normal TTT.
// AI opponent uses simple strategy.

export type Cell = "X" | "O" | null;

export interface ToroidalTTTState {
  rngSeed: number;
  board: Cell[];   // 9 cells, row-major
  currentPlayer: "X" | "O";  // X = human, O = AI
  winner: "X" | "O" | "draw" | null;
  gameOver: boolean;
}

export type ToroidalTTTAction = { type: "place"; index: number };

// All lines including toroidal wraps
const LINES: [number, number, number][] = [
  // Normal rows
  [0,1,2],[3,4,5],[6,7,8],
  // Normal cols
  [0,3,6],[1,4,7],[2,5,8],
  // Normal diags
  [0,4,8],[2,4,6],
  // Toroidal rows (same as normal for 3x3 — they repeat)
  // Toroidal cols (same)
  // Toroidal diags (wrap-around diagonals)
  [2,4,6],[0,4,8], // already have these
  // Anti-wrap diagonals: col wrapping
  [1,5,6],[2,3,7],[0,5,7],[1,3,8], // broken diagonals via column wrap
  [2,4,3],[0,1,5], // broken diagonals via row wrap
];

// Deduplicate lines
const UNIQUE_LINES = Array.from(
  new Set(LINES.map((l) => JSON.stringify([...l].sort()))),
  (s) => JSON.parse(s) as [number,number,number]
);

function checkWinner(board: Cell[]): "X" | "O" | "draw" | null {
  for (const [a, b, c] of UNIQUE_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as "X" | "O";
    }
  }
  if (board.every((c) => c !== null)) return "draw";
  return null;
}

function aiMove(board: Cell[], rng: () => number): number {
  // Try to win
  for (const [a, b, c] of UNIQUE_LINES) {
    const cells = [board[a], board[b], board[c]];
    const oCount = cells.filter((x) => x === "O").length;
    const empty = cells.filter((x) => x === null).length;
    if (oCount === 2 && empty === 1) {
      const idx = [a, b, c][cells.indexOf(null)];
      if (idx !== undefined) return idx;
    }
  }
  // Block X
  for (const [a, b, c] of UNIQUE_LINES) {
    const cells = [board[a], board[b], board[c]];
    const xCount = cells.filter((x) => x === "X").length;
    const empty = cells.filter((x) => x === null).length;
    if (xCount === 2 && empty === 1) {
      const idx = [a, b, c][cells.indexOf(null)];
      if (idx !== undefined) return idx;
    }
  }
  // Take center or random
  if (!board[4]) return 4;
  const empties = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  return empties[Math.floor(rng() * empties.length)] ?? 0;
}

export function initialState(seed: number): ToroidalTTTState {
  return {
    rngSeed: seed,
    board: Array(9).fill(null),
    currentPlayer: "X",
    winner: null,
    gameOver: false,
  };
}

export function reducer(state: ToroidalTTTState, action: ToroidalTTTAction): ToroidalTTTState {
  if (state.gameOver) return state;
  if (action.type !== "place") return state;
  if (state.board[action.index] !== null) return state;
  if (state.currentPlayer !== "X") return state;

  const board = [...state.board] as Cell[];
  board[action.index] = "X";
  const winner = checkWinner(board);
  if (winner) {
    return { ...state, board, winner, gameOver: true };
  }

  // AI turn
  const rng = mulberry32(state.rngSeed);
  const aiIdx = aiMove(board, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  board[aiIdx] = "O";
  const winner2 = checkWinner(board);
  return {
    ...state,
    rngSeed: nextSeed,
    board,
    currentPlayer: "X",
    winner: winner2,
    gameOver: winner2 !== null,
  };
}

export function isTerminal(state: ToroidalTTTState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "X") return { score: 1000 };
  if (state.winner === "draw") return { score: 500 };
  return { score: 0 };
}
