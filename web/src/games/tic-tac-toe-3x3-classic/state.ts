import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROWS = 3;
export const COLS = 3;
export const TARGET = 3;

export interface ConnectSettings { dummy: boolean; }
export type Cell = "P" | "C" | null;

export interface ConnectState {
  rngSeed: number;
  board: Cell[];
  turn: "P" | "C";
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
  pieces: number;
  winLine: number[] | null;
}

export type ConnectAction = { type: "place"; row: number; col: number };

export function checkWin(b: Cell[]): { winner: "P" | "C" | "draw" | null; line: number[] | null } {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const v = b[r * COLS + c]; if (!v) continue;
    for (const d of dirs) {
      const dr = d[0]!, dc = d[1]!;
      const line: number[] = [];
      let ok = true;
      for (let k = 0; k < TARGET; k++) {
        const rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { ok = false; break; }
        if (b[rr * COLS + cc] !== v) { ok = false; break; }
        line.push(rr * COLS + cc);
      }
      if (ok) return { winner: v as "P" | "C", line };
    }
  }
  if (b.every((x) => x !== null)) return { winner: "draw", line: null };
  return { winner: null, line: null };
}

function legalMoves(b: Cell[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.length; i++) if (b[i] === null) out.push(i);
  return out;
}

function cpuMove(b: Cell[], rng: () => number): number {
  const empties = legalMoves(b);
  if (empties.length === 0) return -1;
  // win
  for (const i of empties) {
    const t = b.slice(); t[i] = "C";
    if (checkWin(t).winner === "C") return i;
  }
  // block
  for (const i of empties) {
    const t = b.slice(); t[i] = "P";
    if (checkWin(t).winner === "P") return i;
  }
  // center then corners then random
  const center = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2);
  if (empties.includes(center)) return center;
  const corners = [0, COLS - 1, (ROWS - 1) * COLS, ROWS * COLS - 1].filter((i) => empties.includes(i));
  if (corners.length > 0) return corners[Math.floor(rng() * corners.length)]!;
  return empties[Math.floor(rng() * empties.length)]!;
}

export function initialState(seed: number, _s: ConnectSettings): ConnectState {
  return {
    rngSeed: seed >>> 0,
    board: Array(ROWS * COLS).fill(null),
    turn: "P",
    result: null,
    score: 0,
    phase: "playing",
    pieces: 0,
    winLine: null,
  };
}

export function reducer(state: ConnectState, action: ConnectAction): ConnectState {
  if (state.phase === "done" || state.result) return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  const { row, col } = action;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return state;
  const idx = row * COLS + col;
  if (state.board[idx] !== null) return state;

  const nb = state.board.slice();
  nb[idx] = "P";
  let pieces = state.pieces + 1;
  let res = checkWin(nb);
  if (res.winner === "P") {
    return { ...state, board: nb, result: "P", winLine: res.line, score: state.score + 100 + pieces, phase: "done", pieces };
  }
  if (res.winner === "draw") {
    return { ...state, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };
  }

  // CPU
  const rng = mulberry32(state.rngSeed);
  const m = cpuMove(nb, rng);
  const seed2 = Math.floor(rng() * 2 ** 31);
  if (m >= 0) { nb[m] = "C"; pieces += 1; }
  res = checkWin(nb);
  if (res.winner === "C") {
    return { ...state, rngSeed: seed2, board: nb, result: "C", winLine: res.line, score: state.score + pieces, phase: "done", pieces };
  }
  if (res.winner === "draw") {
    return { ...state, rngSeed: seed2, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };
  }
  return { ...state, rngSeed: seed2, board: nb, turn: "P", pieces };
}

export function isTerminal(state: ConnectState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
