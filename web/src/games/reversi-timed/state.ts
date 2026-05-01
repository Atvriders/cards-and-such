import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Reversi (Timed): standard Othello on 8x8 with a per-move shot clock for the human.
// If the player runs out of clock on their move, they auto-pass (or auto-place a random
// legal move). Bot plays seat 1 (white). Player is seat 0 (black). Most discs wins.

export type Cell = 0 | 1 | null;

export interface ReversiTimedSettings {
  clockSeconds: "10" | "15" | "30";
  botStrength: "easy" | "hard";
}

export interface ReversiTimedState {
  settings: ReversiTimedSettings;
  board: readonly Cell[]; // 64 cells, row-major
  turn: 0 | 1;
  blackCount: number;
  whiteCount: number;
  lastPass: boolean;
  winner: 0 | 1 | "draw" | null;
  movesMade: number;
  rngSeed: number;
  timeLeft: number; // seconds remaining in human's clock for current move
  totalTimeUsed: number;
}

export type ReversiTimedAction =
  | { type: "place"; row: number; col: number }
  | { type: "pass" }
  | { type: "tick" };

export const SIZE = 8;

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

export function idx(r: number, c: number): number { return r * SIZE + c; }

export function flipsAt(board: readonly Cell[], seat: 0 | 1, r: number, c: number): number[] {
  if (board[idx(r, c)] !== null) return [];
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const all: number[] = [];
  for (const [dr, dc] of DIRS) {
    const line: number[] = [];
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[idx(nr, nc)] === opp) {
      line.push(idx(nr, nc));
      nr += dr;
      nc += dc;
    }
    if (line.length > 0 && nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[idx(nr, nc)] === seat) {
      all.push(...line);
    }
  }
  return all;
}

export function legalMoves(board: readonly Cell[], seat: 0 | 1): Array<{ row: number; col: number }> {
  const out: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[idx(r, c)] !== null) continue;
      if (flipsAt(board, seat, r, c).length > 0) out.push({ row: r, col: c });
    }
  }
  return out;
}

function applyPlace(board: readonly Cell[], seat: 0 | 1, r: number, c: number): Cell[] {
  const flips = flipsAt(board, seat, r, c);
  const next = [...board] as Cell[];
  next[idx(r, c)] = seat;
  for (const i of flips) next[i] = seat;
  return next;
}

function counts(board: readonly Cell[]): { black: number; white: number } {
  let black = 0, white = 0;
  for (const c of board) {
    if (c === 0) black++;
    else if (c === 1) white++;
  }
  return { black, white };
}

const CORNERS = [0, 7, 56, 63];

function evalBoard(board: readonly Cell[], seat: 0 | 1): number {
  const opp: 0 | 1 = seat === 0 ? 1 : 0;
  const { black, white } = counts(board);
  const me = seat === 0 ? black : white;
  const them = seat === 0 ? white : black;
  let s = (me - them);
  for (const ci of CORNERS) {
    if (board[ci] === seat) s += 25;
    else if (board[ci] === opp) s -= 25;
  }
  s += legalMoves(board, seat).length * 2;
  s -= legalMoves(board, opp).length * 2;
  return s;
}

function pickBotMove(board: readonly Cell[], strength: "easy" | "hard", rng: () => number): { row: number; col: number } | null {
  const moves = legalMoves(board, 1);
  if (moves.length === 0) return null;
  if (strength === "easy") {
    // Pick a corner if available, else most flips, else random
    const corners = moves.filter((m) => CORNERS.includes(idx(m.row, m.col)));
    if (corners.length > 0) return corners[Math.floor(rng() * corners.length)]!;
    return moves[Math.floor(rng() * moves.length)]!;
  }
  // Hard: 1-ply with eval
  let best = moves[0]!;
  let bestScore = -Infinity;
  for (const m of moves) {
    const after = applyPlace(board, 1, m.row, m.col);
    // Look one ahead: minimize player's best response
    const playerMoves = legalMoves(after, 0);
    let worst = Infinity;
    if (playerMoves.length === 0) {
      worst = evalBoard(after, 1);
    } else {
      for (const pm of playerMoves) {
        const after2 = applyPlace(after, 0, pm.row, pm.col);
        const s = evalBoard(after2, 1);
        if (s < worst) worst = s;
      }
    }
    if (worst > bestScore) {
      bestScore = worst;
      best = m;
    }
  }
  return best;
}

function endIfDone(board: readonly Cell[], lastPass: boolean): "draw" | 0 | 1 | null {
  const blackMoves = legalMoves(board, 0).length;
  const whiteMoves = legalMoves(board, 1).length;
  if (blackMoves === 0 && whiteMoves === 0) {
    const { black, white } = counts(board);
    if (black > white) return 0;
    if (white > black) return 1;
    return "draw";
  }
  // If both passed in succession (handled via lastPass)
  if (lastPass && blackMoves === 0 && whiteMoves === 0) {
    const { black, white } = counts(board);
    if (black > white) return 0;
    if (white > black) return 1;
    return "draw";
  }
  return null;
}

function runBot(state: ReversiTimedState): ReversiTimedState {
  let s = state;
  while (s.winner === null && s.turn === 1) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const move = pickBotMove(s.board, s.settings.botStrength, rng);
    if (!move) {
      // bot passes
      if (s.lastPass) {
        const w = endIfDone(s.board, true);
        s = { ...s, rngSeed: nextSeed, winner: w ?? "draw" };
      } else {
        s = { ...s, rngSeed: nextSeed, turn: 0, lastPass: true };
      }
      break;
    }
    const newBoard = applyPlace(s.board, 1, move.row, move.col);
    const { black, white } = counts(newBoard);
    s = {
      ...s,
      rngSeed: nextSeed,
      board: newBoard,
      turn: 0,
      lastPass: false,
      blackCount: black,
      whiteCount: white,
      movesMade: s.movesMade + 1,
      timeLeft: parseInt(s.settings.clockSeconds, 10),
    };
    const w = endIfDone(newBoard, false);
    if (w !== null) s = { ...s, winner: w };
    // If player has no moves, auto-pass back to bot
    if (s.winner === null && legalMoves(s.board, 0).length === 0) {
      if (legalMoves(s.board, 1).length === 0) {
        const w2 = endIfDone(s.board, true);
        s = { ...s, winner: w2 ?? "draw" };
        break;
      }
      s = { ...s, turn: 1, lastPass: true };
      continue;
    }
    break;
  }
  return s;
}

export function initialState(seed: number, settings: ReversiTimedSettings): ReversiTimedState {
  const board = new Array<Cell>(64).fill(null);
  // Standard Othello opening: D4=W, E5=W, D5=B, E4=B (using row=0 at top)
  // Standard center: 3,3 = W; 3,4 = B; 4,3 = B; 4,4 = W
  board[idx(3, 3)] = 1;
  board[idx(3, 4)] = 0;
  board[idx(4, 3)] = 0;
  board[idx(4, 4)] = 1;
  return {
    settings,
    board,
    turn: 0,
    blackCount: 2,
    whiteCount: 2,
    lastPass: false,
    winner: null,
    movesMade: 0,
    rngSeed: seed,
    timeLeft: parseInt(settings.clockSeconds, 10),
    totalTimeUsed: 0,
  };
}

export function reducer(state: ReversiTimedState, action: ReversiTimedAction): ReversiTimedState {
  if (state.winner !== null) return state;

  if (action.type === "tick") {
    if (state.turn !== 0) return state;
    const t = state.timeLeft - 1;
    if (t <= 0) {
      // Auto-pass or auto-random
      const moves = legalMoves(state.board, 0);
      if (moves.length === 0) {
        // pass
        if (state.lastPass) {
          const w = endIfDone(state.board, true);
          return { ...state, winner: w ?? "draw", timeLeft: 0, totalTimeUsed: state.totalTimeUsed + 1 };
        }
        let next: ReversiTimedState = {
          ...state,
          turn: 1,
          lastPass: true,
          timeLeft: 0,
          totalTimeUsed: state.totalTimeUsed + 1,
        };
        next = runBot(next);
        return next;
      }
      // pick a random legal move using a deterministic rng
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const m = moves[Math.floor(rng() * moves.length)]!;
      const newBoard = applyPlace(state.board, 0, m.row, m.col);
      const { black, white } = counts(newBoard);
      let next: ReversiTimedState = {
        ...state,
        rngSeed: nextSeed,
        board: newBoard,
        turn: 1,
        lastPass: false,
        blackCount: black,
        whiteCount: white,
        movesMade: state.movesMade + 1,
        timeLeft: parseInt(state.settings.clockSeconds, 10),
        totalTimeUsed: state.totalTimeUsed + 1,
      };
      const w = endIfDone(newBoard, false);
      if (w !== null) return { ...next, winner: w };
      next = runBot(next);
      return next;
    }
    return { ...state, timeLeft: t, totalTimeUsed: state.totalTimeUsed + 1 };
  }

  if (action.type === "pass") {
    if (state.turn !== 0) return state;
    if (legalMoves(state.board, 0).length > 0) return state;
    if (state.lastPass) {
      const w = endIfDone(state.board, true);
      return { ...state, winner: w ?? "draw" };
    }
    let next: ReversiTimedState = { ...state, turn: 1, lastPass: true };
    next = runBot(next);
    return next;
  }

  if (action.type === "place") {
    if (state.turn !== 0) return state;
    const { row, col } = action;
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return state;
    if (state.board[idx(row, col)] !== null) return state;
    const flips = flipsAt(state.board, 0, row, col);
    if (flips.length === 0) return state;

    const newBoard = applyPlace(state.board, 0, row, col);
    const { black, white } = counts(newBoard);
    let next: ReversiTimedState = {
      ...state,
      board: newBoard,
      turn: 1,
      lastPass: false,
      blackCount: black,
      whiteCount: white,
      movesMade: state.movesMade + 1,
      timeLeft: parseInt(state.settings.clockSeconds, 10),
    };
    const w = endIfDone(newBoard, false);
    if (w !== null) return { ...next, winner: w };
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: ReversiTimedState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 + (state.blackCount - state.whiteCount) * 5 };
  if (state.winner === "draw") return { score: 50 };
  return { score: Math.max(0, state.blackCount - 10) };
}
