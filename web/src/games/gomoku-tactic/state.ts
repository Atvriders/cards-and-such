import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Gomoku Tactic: smaller board (9x9), one AI (uses random + block logic).
// Player is Black, AI is White. First to 5-in-a-row wins.

export type Stone = "B" | "W" | null;

const SIZE = 9;

export interface GomokuTacticState {
  rngSeed: number;
  board: Stone[];   // SIZE*SIZE, row-major
  currentPlayer: "B" | "W";
  winner: "B" | "W" | "draw" | null;
  winLine: number[] | null;
  moveCount: number;
  gameOver: boolean;
}

export type GomokuTacticAction = { type: "place"; index: number };

function checkWinner(board: Stone[], lastIdx: number): { winner: "B" | "W"; line: number[] } | null {
  const player = board[lastIdx];
  if (!player) return null;
  const row = Math.floor(lastIdx / SIZE);
  const col = lastIdx % SIZE;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr, dc] of dirs) {
    const line = [lastIdx];
    for (let d = 1; d <= 4; d++) {
      const r = row + dr! * d, c = col + dc! * d;
      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) break;
      if (board[r * SIZE + c] !== player) break;
      line.push(r * SIZE + c);
    }
    for (let d = 1; d <= 4; d++) {
      const r = row - dr! * d, c = col - dc! * d;
      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) break;
      if (board[r * SIZE + c] !== player) break;
      line.push(r * SIZE + c);
    }
    if (line.length >= 5) return { winner: player as "B" | "W", line };
  }
  return null;
}

function aiMove(board: Stone[], rng: () => number): number {
  // Check if AI can win
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (board[i] !== null) continue;
    const test = [...board] as Stone[];
    test[i] = "W";
    if (checkWinner(test, i)) return i;
  }
  // Block player
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (board[i] !== null) continue;
    const test = [...board] as Stone[];
    test[i] = "B";
    if (checkWinner(test, i)) return i;
  }
  // Prefer center area
  const center = Math.floor(SIZE / 2);
  const candidates: number[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r * SIZE + c] === null) {
        const dist = Math.abs(r - center) + Math.abs(c - center);
        if (dist <= 3) candidates.push(r * SIZE + c);
      }
    }
  }
  if (candidates.length > 0) return candidates[Math.floor(rng() * candidates.length)]!;
  const empties = board.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
  return empties[Math.floor(rng() * empties.length)] ?? 0;
}

export function initialState(seed: number): GomokuTacticState {
  return {
    rngSeed: seed,
    board: Array(SIZE * SIZE).fill(null),
    currentPlayer: "B",
    winner: null,
    winLine: null,
    moveCount: 0,
    gameOver: false,
  };
}

export function reducer(state: GomokuTacticState, action: GomokuTacticAction): GomokuTacticState {
  if (state.gameOver) return state;
  if (action.type !== "place") return state;
  if (state.board[action.index] !== null) return state;
  if (state.currentPlayer !== "B") return state;

  const board = [...state.board] as Stone[];
  board[action.index] = "B";
  const bResult = checkWinner(board, action.index);
  if (bResult) {
    return { ...state, board, winner: "B", winLine: bResult.line, moveCount: state.moveCount + 1, gameOver: true };
  }
  const empties = board.filter((v) => v === null).length;
  if (empties === 0) {
    return { ...state, board, winner: "draw", winLine: null, moveCount: state.moveCount + 1, gameOver: true };
  }

  // AI turn
  const rng = mulberry32(state.rngSeed);
  const aiIdx = aiMove(board, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  board[aiIdx] = "W";
  const wResult = checkWinner(board, aiIdx);
  const moveCount = state.moveCount + 2;
  if (wResult) {
    return { ...state, rngSeed: nextSeed, board, winner: "W", winLine: wResult.line, moveCount, gameOver: true };
  }
  const empties2 = board.filter((v) => v === null).length;
  if (empties2 === 0) {
    return { ...state, rngSeed: nextSeed, board, winner: "draw", winLine: null, moveCount, gameOver: true };
  }

  return { ...state, rngSeed: nextSeed, board, currentPlayer: "B", moveCount };
}

export function isTerminal(state: GomokuTacticState): { score: number } | null {
  if (!state.gameOver) return null;
  if (state.winner === "B") return { score: 1000 };
  if (state.winner === "draw") return { score: 300 };
  return { score: 0 };
}
