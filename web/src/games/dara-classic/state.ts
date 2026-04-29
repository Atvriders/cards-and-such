import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROWS = 5;
export const COLS = 6;
export const TARGET = 3;
export const MODE: "place" | "gravity" = "place";

export interface ConnectSettings { dummy: boolean }
export type Cell = "P" | "C" | null;

export interface ConnectState {
  rngSeed: number;
  board: Cell[];
  turn: "P" | "C";
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
  pieces: number;
}

export type ConnectAction = { type: "place"; row: number; col: number };

function topRow(b: Cell[], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (b[r * COLS + col] === null) return r;
  return -1;
}

function checkWin(b: Cell[]): Cell | "draw" {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const v = b[r * COLS + c]; if (!v) continue;
    for (const d of dirs) {
      const dr = d[0]!, dc = d[1]!;
      let ok = true;
      for (let k = 0; k < TARGET; k++) {
        const rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { ok = false; break; }
        if (b[rr * COLS + cc] !== v) { ok = false; break; }
      }
      if (ok) return v;
    }
  }
  if (b.every(x => x !== null)) return "draw";
  return null;
}

export function initialState(seed: number, _s: ConnectSettings): ConnectState {
  return { rngSeed: seed, board: Array(ROWS * COLS).fill(null), turn: "P", result: null, score: 0, phase: "playing", pieces: 0 };
}

function legalForGravity(b: Cell[]): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = [];
  for (let c = 0; c < COLS; c++) {
    const r = topRow(b, c);
    if (r >= 0) out.push({ row: r, col: c });
  }
  return out;
}

function legalForFree(b: Cell[]): { row: number; col: number }[] {
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (b[r * COLS + c] === null) out.push({ row: r, col: c });
  return out;
}

export function reducer(state: ConnectState, action: ConnectAction): ConnectState {
  if (state.phase === "done" || state.result) return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;

  const { row, col } = action;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return state;
  if (state.board[row * COLS + col] !== null) return state;

  if (MODE === "gravity") {
    const expectedRow = topRow(state.board, col);
    if (expectedRow !== row) return state;
  }

  const nb = state.board.slice();
  nb[row * COLS + col] = "P";
  let pieces = state.pieces + 1;
  let result = checkWin(nb);
  if (result === "P") return { ...state, board: nb, result: "P", score: state.score + 100 + pieces, phase: "done", pieces };
  if (result === "draw") return { ...state, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };

  const rng = mulberry32(state.rngSeed);
  const legal = MODE === "gravity" ? legalForGravity(nb) : legalForFree(nb);
  if (legal.length > 0) {
    const pick = legal[Math.floor(rng() * legal.length)]!;
    nb[pick.row * COLS + pick.col] = "C";
    pieces += 1;
  }
  const seed2 = Math.floor(rng() * 2 ** 31);
  result = checkWin(nb);
  if (result === "C") return { ...state, rngSeed: seed2, board: nb, result: "C", score: state.score + pieces, phase: "done", pieces };
  if (result === "draw") return { ...state, rngSeed: seed2, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };

  return { ...state, rngSeed: seed2, board: nb, turn: "P", pieces };
}

export function isTerminal(state: ConnectState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
