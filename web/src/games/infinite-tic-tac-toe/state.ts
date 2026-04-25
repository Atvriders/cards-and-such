import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface InfiniteTTTSettings {
  opponent: "human" | "bot";
}

// Infinite Tic-Tac-Toe: 5x5 board, need 4-in-a-row to win.
// After placing 6 pieces per side, the oldest piece of the moving player disappears.
export type Cell = "X" | "O" | null;

export interface InfiniteTTTState {
  settings: InfiniteTTTSettings;
  rngSeed: number;
  board: Cell[];
  currentPlayer: "X" | "O";
  xMoves: number[];   // indices of X placements in order
  oMoves: number[];   // indices of O placements in order
  maxPerSide: number; // 6 — after this, oldest vanishes
  winner: "X" | "O" | "draw" | null;
  gameOver: boolean;
  moveCount: number;
}

export type InfiniteTTTAction =
  | { type: "place"; index: number }
  | { type: "bot-move" };

const LINES_5x5 = (() => {
  const lines: number[][] = [];
  // Need 4-in-a-row on a 5x5 board
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      // horizontal
      if (c + 3 < 5) lines.push([idx, idx + 1, idx + 2, idx + 3]);
      // vertical
      if (r + 3 < 5) lines.push([idx, idx + 5, idx + 10, idx + 15]);
      // diagonal down-right
      if (c + 3 < 5 && r + 3 < 5) lines.push([idx, idx + 6, idx + 12, idx + 18]);
      // diagonal down-left
      if (c - 3 >= 0 && r + 3 < 5) lines.push([idx, idx + 4, idx + 8, idx + 12]);
    }
  }
  return lines;
})();

function checkWinner(board: Cell[]): "X" | "O" | null {
  for (const line of LINES_5x5) {
    const [a, b, c, d] = line as [number, number, number, number];
    if (board[a] && board[a] === board[b] && board[b] === board[c] && board[c] === board[d]) {
      return board[a] as "X" | "O";
    }
  }
  return null;
}

function applyPlace(state: InfiniteTTTState, index: number): InfiniteTTTState {
  if (state.board[index] !== null) return state;

  const newBoard = [...state.board];
  const isX = state.currentPlayer === "X";
  let xMoves = [...state.xMoves];
  let oMoves = [...state.oMoves];

  // Remove oldest piece if at max
  if (isX && xMoves.length >= state.maxPerSide) {
    const oldest = xMoves.shift()!;
    newBoard[oldest] = null;
  }
  if (!isX && oMoves.length >= state.maxPerSide) {
    const oldest = oMoves.shift()!;
    newBoard[oldest] = null;
  }

  newBoard[index] = state.currentPlayer;
  if (isX) xMoves.push(index);
  else oMoves.push(index);

  const winner = checkWinner(newBoard);
  const moveCount = state.moveCount + 1;
  const draw = !winner && moveCount > 200;

  return {
    ...state,
    board: newBoard,
    xMoves,
    oMoves,
    currentPlayer: isX ? "O" : "X",
    winner: winner ?? (draw ? "draw" : null),
    gameOver: winner !== null || draw,
    moveCount,
  };
}

export function initialState(seed: number, settings: InfiniteTTTSettings): InfiniteTTTState {
  return {
    settings,
    rngSeed: mulberry32(seed)() * 2 ** 31 >>> 0,
    board: Array(25).fill(null),
    currentPlayer: "X",
    xMoves: [],
    oMoves: [],
    maxPerSide: 6,
    winner: null,
    gameOver: false,
    moveCount: 0,
  };
}

export function reducer(state: InfiniteTTTState, action: InfiniteTTTAction): InfiniteTTTState {
  if (state.gameOver) return state;

  if (action.type === "place") {
    return applyPlace(state, action.index);
  }

  if (action.type === "bot-move" && state.settings.opponent === "bot") {
    const rng = mulberry32(state.rngSeed);
    const empties = state.board.map((c, i) => c === null ? i : -1).filter(i => i >= 0);
    if (empties.length === 0) return state;
    const choice = empties[Math.floor(rng() * empties.length)]!;
    const newSeed = (state.rngSeed + 0xabcd) >>> 0;
    return applyPlace({ ...state, rngSeed: newSeed }, choice);
  }

  return state;
}

export function isTerminal(state: InfiniteTTTState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "X") return { score: 500 };
  if (state.winner === "draw") return { score: 200 };
  return { score: 0 };
}
