import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROWS = 4;
export const COLS = 4;
export const TARGET = 3;

export interface ConnectSettings { dummy: boolean; }
// In Notakto everyone plays X. We track who placed which X for scoring.
export type Cell = "P" | "C" | null;

export interface ConnectState {
  rngSeed: number;
  board: Cell[];
  // Whose turn is next
  turn: "P" | "C";
  // The loser is the one who completed 3-in-a-row of X. Result names the winner.
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
  pieces: number;
  loseLine: number[] | null;
}

export type ConnectAction = { type: "place"; row: number; col: number };

// Returns the line indices if any 3-in-a-row of X (any owner) exists.
export function findThreeLine(b: Cell[]): number[] | null {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!b[r * COLS + c]) continue;
    for (const d of dirs) {
      const dr = d[0]!, dc = d[1]!;
      const line: number[] = [];
      let ok = true;
      for (let k = 0; k < TARGET; k++) {
        const rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { ok = false; break; }
        if (!b[rr * COLS + cc]) { ok = false; break; }
        line.push(rr * COLS + cc);
      }
      if (ok) return line;
    }
  }
  return null;
}

function isFull(b: Cell[]): boolean { return b.every((x) => x !== null); }

function legalMoves(b: Cell[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.length; i++) if (b[i] === null) out.push(i);
  return out;
}

// CPU avoids creating 3-in-a-row if a safe move exists; otherwise random.
function cpuMove(b: Cell[], rng: () => number): number {
  const empties = legalMoves(b);
  if (empties.length === 0) return -1;
  const safe: number[] = [];
  for (const i of empties) {
    const t = b.slice(); t[i] = "C";
    if (!findThreeLine(t)) safe.push(i);
  }
  const pool = safe.length > 0 ? safe : empties;
  return pool[Math.floor(rng() * pool.length)]!;
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
    loseLine: null,
  };
}

export function reducer(state: ConnectState, action: ConnectAction): ConnectState {
  if (state.phase === "done") return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  const { row, col } = action;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return state;
  const idx = row * COLS + col;
  if (state.board[idx] !== null) return state;

  const nb = state.board.slice();
  nb[idx] = "P";
  let pieces = state.pieces + 1;
  // Did the player just complete 3-in-a-row? If so they LOSE.
  let line = findThreeLine(nb);
  if (line) {
    return { ...state, board: nb, result: "C", loseLine: line, score: state.score, phase: "done", pieces };
  }
  if (isFull(nb)) {
    // Board full with no 3-in-a-row -> draw (very rare on small boards)
    return { ...state, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };
  }

  const rng = mulberry32(state.rngSeed);
  const m = cpuMove(nb, rng);
  const seed2 = Math.floor(rng() * 2 ** 31);
  if (m >= 0) { nb[m] = "C"; pieces += 1; }
  line = findThreeLine(nb);
  if (line) {
    // CPU completed 3-in-a-row -> CPU loses, you win!
    return { ...state, rngSeed: seed2, board: nb, result: "P", loseLine: line, score: state.score + 100 + pieces, phase: "done", pieces };
  }
  if (isFull(nb)) {
    return { ...state, rngSeed: seed2, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };
  }
  return { ...state, rngSeed: seed2, board: nb, turn: "P", pieces };
}

export function isTerminal(state: ConnectState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
