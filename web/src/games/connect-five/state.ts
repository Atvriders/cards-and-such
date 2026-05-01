import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Connect Five: Connect-Four-style gravity drop on a 9-wide × 8-tall grid; 5 in a row wins.

export const ROWS = 8;
export const COLS = 9;
export const TARGET = 5;

export interface ConnectFiveSettings {
  botStrength: "easy" | "hard";
}

export type Cell = "P" | "C" | null;

export interface ConnectFiveState {
  rngSeed: number;
  board: Cell[];
  turn: "P" | "C";
  result: "P" | "C" | "draw" | null;
  phase: "playing" | "done";
  pieces: number;
  winningLine: number[] | null;
  lastDropCol: number | null;
  settings: ConnectFiveSettings;
}

export type ConnectFiveAction = { type: "drop"; col: number };

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 0], [1, 1], [1, -1],
];

export function topRow(board: readonly Cell[], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (board[r * COLS + col] === null) return r;
  return -1;
}

export function checkWin(b: readonly Cell[]): { winner: Cell | "draw" | null; line: number[] | null } {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = b[r * COLS + c];
      if (!v) continue;
      for (const [dr, dc] of DIRS) {
        const line: number[] = [];
        let ok = true;
        for (let k = 0; k < TARGET; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { ok = false; break; }
          if (b[rr * COLS + cc] !== v) { ok = false; break; }
          line.push(rr * COLS + cc);
        }
        if (ok) return { winner: v, line };
      }
    }
  }
  if (b.every((x) => x !== null)) return { winner: "draw", line: null };
  return { winner: null, line: null };
}

function dropAt(board: readonly Cell[], col: number, who: "P" | "C"): { board: Cell[]; row: number } | null {
  const r = topRow(board, col);
  if (r < 0) return null;
  const nb = [...board] as Cell[];
  nb[r * COLS + col] = who;
  return { board: nb, row: r };
}

function scoreCol(board: readonly Cell[], col: number, who: "P" | "C"): number {
  const r = topRow(board, col);
  if (r < 0) return -Infinity;
  // Score the resulting position
  const nb = [...board] as Cell[];
  nb[r * COLS + col] = who;
  // count windows of TARGET
  const opp: "P" | "C" = who === "P" ? "C" : "P";
  let score = 0;
  for (let rr = 0; rr < ROWS; rr++) {
    for (let cc = 0; cc < COLS; cc++) {
      for (const [dr, dc] of DIRS) {
        const window: Cell[] = [];
        let ok = true;
        for (let k = 0; k < TARGET; k++) {
          const ar = rr + dr * k, ac = cc + dc * k;
          if (ar < 0 || ar >= ROWS || ac < 0 || ac >= COLS) { ok = false; break; }
          window.push(nb[ar * COLS + ac]!);
        }
        if (!ok) continue;
        const me = window.filter((x) => x === who).length;
        const them = window.filter((x) => x === opp).length;
        if (them === 0) {
          if (me === TARGET) score += 100000;
          else if (me === TARGET - 1) score += 200;
          else if (me === TARGET - 2) score += 20;
          else if (me === TARGET - 3) score += 2;
        } else if (me === 0) {
          if (them === TARGET - 1) score -= 250;
          else if (them === TARGET - 2) score -= 25;
        }
      }
    }
  }
  // Center preference
  const center = Math.floor(COLS / 2);
  score -= Math.abs(col - center) * 1;
  return score;
}

function pickBotMove(board: readonly Cell[], strength: "easy" | "hard", rng: () => number): number | null {
  const validCols: number[] = [];
  for (let c = 0; c < COLS; c++) if (topRow(board, c) >= 0) validCols.push(c);
  if (validCols.length === 0) return null;

  // Win immediately
  for (const c of validCols) {
    const dr = dropAt(board, c, "C")!;
    if (checkWin(dr.board).winner === "C") return c;
  }
  // Block immediate win
  for (const c of validCols) {
    const dr = dropAt(board, c, "P")!;
    if (checkWin(dr.board).winner === "P") return c;
  }

  if (strength === "easy") {
    // Random + slight center preference
    const center = Math.floor(COLS / 2);
    const sorted = [...validCols].sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
    return sorted[Math.min(sorted.length - 1, Math.floor(rng() * 3))]!;
  }
  let best = validCols[0]!;
  let bs = -Infinity;
  for (const c of validCols) {
    const s = scoreCol(board, c, "C") + rng() * 0.001;
    if (s > bs) { bs = s; best = c; }
  }
  return best;
}

export function initialState(seed: number, settings: ConnectFiveSettings): ConnectFiveState {
  return {
    rngSeed: seed,
    board: Array(ROWS * COLS).fill(null),
    turn: "P",
    result: null,
    phase: "playing",
    pieces: 0,
    winningLine: null,
    lastDropCol: null,
    settings,
  };
}

export function reducer(state: ConnectFiveState, action: ConnectFiveAction): ConnectFiveState {
  if (state.phase === "done") return state;
  if (action.type !== "drop") return state;
  if (state.turn !== "P") return state;
  const { col } = action;
  if (col < 0 || col >= COLS) return state;
  const drop = dropAt(state.board, col, "P");
  if (!drop) return state;

  let board = drop.board;
  let pieces = state.pieces + 1;
  let res = checkWin(board);
  if (res.winner === "P") {
    return { ...state, board, result: "P", phase: "done", pieces, winningLine: res.line, lastDropCol: col };
  }
  if (res.winner === "draw") {
    return { ...state, board, result: "draw", phase: "done", pieces, lastDropCol: col };
  }

  const rng = mulberry32(state.rngSeed);
  const seed2 = Math.floor(rng() * 2 ** 31);
  const botCol = pickBotMove(board, state.settings.botStrength, rng);
  if (botCol !== null) {
    const dropC = dropAt(board, botCol, "C")!;
    board = dropC.board;
    pieces++;
    res = checkWin(board);
    if (res.winner === "C") {
      return { ...state, rngSeed: seed2, board, result: "C", phase: "done", pieces, winningLine: res.line, lastDropCol: botCol };
    }
    if (res.winner === "draw") {
      return { ...state, rngSeed: seed2, board, result: "draw", phase: "done", pieces, lastDropCol: botCol };
    }
    return { ...state, rngSeed: seed2, board, turn: "P", pieces, lastDropCol: botCol };
  }
  return { ...state, rngSeed: seed2, board, turn: "P", pieces, lastDropCol: col };
}

export function isTerminal(state: ConnectFiveState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.result === "P") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}
