import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 6;
export const ROWS = 6;
export const TARGET = 4;

export interface ConnectFourMiniSettings { dummy: boolean }
export type Cell = "P" | "C" | null;

export interface ConnectFourMiniState {
  rngSeed: number;
  board: Cell[];                              // ROWS*COLS, [r*COLS+c]
  turn: "P" | "C";
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
  pieces: number;
  lastDrop: { row: number; col: number; who: "P" | "C" } | null;
  winLine: number[] | null;                   // indices of 4 winning cells
  moveCount: number;                          // for animation key
}

export type ConnectFourMiniAction =
  | { type: "drop"; col: number }
  | { type: "reset"; seed?: number };

function topRow(b: Cell[], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (b[r * COLS + col] === null) return r;
  return -1;
}

interface WinResult { who: Cell; line: number[] | null; }

function findWin(b: Cell[]): WinResult {
  const dirs: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = b[r * COLS + c];
      if (!v) continue;
      for (const [dr, dc] of dirs) {
        const line: number[] = [];
        let ok = true;
        for (let k = 0; k < TARGET; k++) {
          const rr = r + dr * k;
          const cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { ok = false; break; }
          if (b[rr * COLS + cc] !== v) { ok = false; break; }
          line.push(rr * COLS + cc);
        }
        if (ok) return { who: v, line };
      }
    }
  }
  return { who: null, line: null };
}

function checkTerminal(b: Cell[]): { who: Cell | "draw"; line: number[] | null } {
  const w = findWin(b);
  if (w.who) return { who: w.who, line: w.line };
  if (b.every(x => x !== null)) return { who: "draw", line: null };
  return { who: null, line: null };
}

function legalCols(b: Cell[]): number[] {
  const out: number[] = [];
  for (let c = 0; c < COLS; c++) if (topRow(b, c) >= 0) out.push(c);
  return out;
}

// CPU strategy: 1) take immediate winning move, 2) block immediate player win, 3) random.
function cpuChoose(b: Cell[], rng: () => number): number | null {
  const cols = legalCols(b);
  if (cols.length === 0) return null;

  // 1. Try to win immediately
  for (const c of cols) {
    const r = topRow(b, c);
    const test = b.slice();
    test[r * COLS + c] = "C";
    if (findWin(test).who === "C") return c;
  }
  // 2. Block immediate player win
  for (const c of cols) {
    const r = topRow(b, c);
    const test = b.slice();
    test[r * COLS + c] = "P";
    if (findWin(test).who === "P") return c;
  }
  // 3. Random
  return cols[Math.floor(rng() * cols.length)] ?? null;
}

export function initialState(seed: number, _settings: ConnectFourMiniSettings): ConnectFourMiniState {
  return {
    rngSeed: seed,
    board: Array(ROWS * COLS).fill(null),
    turn: "P",
    result: null,
    score: 0,
    phase: "playing",
    pieces: 0,
    lastDrop: null,
    winLine: null,
    moveCount: 0,
  };
}

export function reducer(state: ConnectFourMiniState, action: ConnectFourMiniAction): ConnectFourMiniState {
  if (action.type === "reset") {
    const nextSeed = action.seed ?? Math.floor(Math.random() * 2 ** 31);
    return initialState(nextSeed, { dummy: false });
  }
  if (state.phase === "done" || state.result) return state;
  if (action.type !== "drop") return state;
  if (state.turn !== "P") return state;

  const r = topRow(state.board, action.col);
  if (r < 0) return state;

  const nb = state.board.slice();
  nb[r * COLS + action.col] = "P";
  let pieces = state.pieces + 1;
  let moveCount = state.moveCount + 1;
  let term = checkTerminal(nb);
  if (term.who === "P") {
    return {
      ...state,
      board: nb,
      result: "P",
      score: state.score + 100 + pieces,
      phase: "done",
      pieces,
      lastDrop: { row: r, col: action.col, who: "P" },
      winLine: term.line,
      moveCount,
    };
  }
  if (term.who === "draw") {
    return {
      ...state,
      board: nb,
      result: "draw",
      score: state.score + 25 + pieces,
      phase: "done",
      pieces,
      lastDrop: { row: r, col: action.col, who: "P" },
      winLine: null,
      moveCount,
    };
  }

  // CPU move
  const rng = mulberry32(state.rngSeed);
  const cpuCol = cpuChoose(nb, rng);
  let cpuDrop: { row: number; col: number; who: "P" | "C" } | null = null;
  if (cpuCol !== null) {
    const cr = topRow(nb, cpuCol);
    nb[cr * COLS + cpuCol] = "C";
    pieces += 1;
    moveCount += 1;
    cpuDrop = { row: cr, col: cpuCol, who: "C" };
  }
  const seed2 = Math.floor(rng() * 2 ** 31);
  term = checkTerminal(nb);
  if (term.who === "C") {
    return {
      ...state,
      rngSeed: seed2,
      board: nb,
      result: "C",
      score: state.score + pieces,
      phase: "done",
      pieces,
      lastDrop: cpuDrop ?? state.lastDrop,
      winLine: term.line,
      moveCount,
    };
  }
  if (term.who === "draw") {
    return {
      ...state,
      rngSeed: seed2,
      board: nb,
      result: "draw",
      score: state.score + 25 + pieces,
      phase: "done",
      pieces,
      lastDrop: cpuDrop ?? state.lastDrop,
      winLine: null,
      moveCount,
    };
  }

  return {
    ...state,
    rngSeed: seed2,
    board: nb,
    turn: "P",
    pieces,
    lastDrop: cpuDrop ?? state.lastDrop,
    moveCount,
  };
}

export function isTerminal(state: ConnectFourMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
