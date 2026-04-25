import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Connect6: 19x19 board. Black plays first (1 stone), then each player plays 2 per turn.
// First to get 6 in a row (hor/ver/diag) wins.

export const SIZE = 19;
export type Cell = 0 | 1 | null; // 0 = human (black), 1 = bot (white)

export interface Connect6Settings { dummy?: string; }

export interface Connect6State {
  board: readonly Cell[];
  turn: 0 | 1;
  stonesLeft: number; // stones remaining in current turn (1 for black's first move, else 2)
  moveCount: number;
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: Connect6Settings;
  lastPlaced: number[];
}

export type Connect6Action = { type: "place"; cell: number };

export function initialState(seed: number, settings: Connect6Settings): Connect6State {
  return {
    board: new Array<Cell>(SIZE * SIZE).fill(null),
    turn: 0,
    stonesLeft: 1,
    moveCount: 0,
    winner: null,
    rngSeed: seed,
    settings,
    lastPlaced: [],
  };
}

function checkWin(board: readonly Cell[], player: 0 | 1): boolean {
  const b = board;
  const N = SIZE;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (b[r * N + c] !== player) continue;
      // horizontal
      if (c + 5 < N) {
        let win = true;
        for (let k = 1; k < 6; k++) if (b[r * N + c + k] !== player) { win = false; break; }
        if (win) return true;
      }
      // vertical
      if (r + 5 < N) {
        let win = true;
        for (let k = 1; k < 6; k++) if (b[(r + k) * N + c] !== player) { win = false; break; }
        if (win) return true;
      }
      // diagonal down-right
      if (r + 5 < N && c + 5 < N) {
        let win = true;
        for (let k = 1; k < 6; k++) if (b[(r + k) * N + c + k] !== player) { win = false; break; }
        if (win) return true;
      }
      // diagonal down-left
      if (r + 5 < N && c - 5 >= 0) {
        let win = true;
        for (let k = 1; k < 6; k++) if (b[(r + k) * N + c - k] !== player) { win = false; break; }
        if (win) return true;
      }
    }
  }
  return false;
}

function countLine(board: readonly Cell[], start: number, dr: number, dc: number, player: 0 | 1): number {
  const N = SIZE;
  let count = 0;
  let r = Math.floor(start / N), c = start % N;
  for (let k = 0; k < 6; k++) {
    const nr = r + dr * k, nc = c + dc * k;
    if (nr < 0 || nr >= N || nc < 0 || nc >= N) break;
    if (board[nr * N + nc] === player) count++;
    else if (board[nr * N + nc] !== null) { count = -100; break; }
  }
  return count;
}

function scoreCell(board: readonly Cell[], cell: number, player: 0 | 1): number {
  const N = SIZE;
  const r = Math.floor(cell / N), c = cell % N;
  let score = 0;
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    for (let offset = -5; offset <= 0; offset++) {
      const sr = r + dr * offset, sc = c + dc * offset;
      if (sr < 0 || sr >= N || sc < 0 || sc >= N) continue;
      const cnt = countLine(board, sr * N + sc, dr, dc, player);
      if (cnt >= 0) score += cnt * cnt;
    }
  }
  return score;
}

function getBotMoves(board: readonly Cell[], count: number, rng: () => number): number[] {
  const N = SIZE;
  const empty: number[] = [];
  for (let i = 0; i < N * N; i++) if (board[i] === null) empty.push(i);
  if (empty.length === 0) return [];

  // Score each empty cell as bot (1) then pick top candidates
  const scored = empty.map((i) => ({
    i,
    score: scoreCell(board, i, 1) * 2 + scoreCell(board, i, 0) + rng() * 0.1,
  }));
  scored.sort((a, b) => b.score - a.score);

  const chosen: number[] = [];
  const tempBoard = [...board] as Cell[];
  for (let k = 0; k < count && scored.length > 0; k++) {
    const pick = scored.shift()!;
    chosen.push(pick.i);
    tempBoard[pick.i] = 1;
    // Re-score remaining? No — simple greedy is fine
  }
  return chosen;
}

export function reducer(state: Connect6State, action: Connect6Action): Connect6State {
  if (action.type !== "place") return state;
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;
  const { cell } = action;
  if (cell < 0 || cell >= SIZE * SIZE) return state;
  if (state.board[cell] !== null) return state;

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const board = [...state.board] as Cell[];
  board[cell] = 0;
  const lastPlaced = [cell];

  if (checkWin(board, 0)) {
    return { ...state, rngSeed: nextSeed, board, winner: 0, stonesLeft: 0, lastPlaced };
  }

  const newStonesLeft = state.stonesLeft - 1;
  if (newStonesLeft > 0) {
    // Human still has another stone this turn
    return { ...state, rngSeed: nextSeed, board, stonesLeft: newStonesLeft, lastPlaced: [...state.lastPlaced, cell] };
  }

  // Bot turn: play 2 stones (or 1 if first move was opponent's)
  const rng2 = mulberry32(nextSeed);
  const ns2 = Math.floor(rng2() * 2 ** 31);
  const botCount = state.moveCount === 0 ? 1 : 2; // first human move = 1 stone; thereafter 2
  const botMoves = getBotMoves(board, botCount, rng2);
  const board2 = [...board] as Cell[];
  const botPlaced: number[] = [];
  for (const bm of botMoves) { board2[bm] = 1; botPlaced.push(bm); }

  if (checkWin(board2, 1)) {
    return { ...state, rngSeed: ns2, board: board2, winner: 1, stonesLeft: 2, moveCount: state.moveCount + 1, lastPlaced: botPlaced };
  }

  const nextStonesLeft = 2; // human always plays 2 next turn (after first move)
  return {
    ...state, rngSeed: ns2, board: board2, turn: 0, stonesLeft: nextStonesLeft,
    moveCount: state.moveCount + 1, lastPlaced: botPlaced,
  };
}

export function isTerminal(state: Connect6State): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
