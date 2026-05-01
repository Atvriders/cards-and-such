import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const ROWS = 3;
export const COLS = 3;
export const TARGET = 3;

export interface ConnectSettings { dummy: boolean; }
export type Mark = "X" | "O";
export type Cell = Mark | null;

export interface ConnectState {
  rngSeed: number;
  board: Cell[];
  // Whose turn it is to choose+place a mark
  turn: "P" | "C";
  // The player who completes a line (any X or O 3-in-a-row) wins
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
  pieces: number;
  pendingMark: Mark; // the symbol the player has selected this turn
  winLine: number[] | null;
}

export type ConnectAction =
  | { type: "selectMark"; mark: Mark }
  | { type: "place"; row: number; col: number };

const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function findCompletedLine(b: Cell[]): { mark: Mark; line: number[] } | null {
  for (const [a, bi, c] of LINES) {
    const v = b[a];
    if (v && v === b[bi] && v === b[c]) return { mark: v, line: [a, bi, c] };
  }
  return null;
}

function isFull(b: Cell[]): boolean { return b.every((x) => x !== null); }

function legalMoves(b: Cell[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.length; i++) if (b[i] === null) out.push(i);
  return out;
}

interface CpuChoice { idx: number; mark: Mark; }

// CPU picks (idx, mark) that completes a line if any; otherwise random legal placement with random mark.
function cpuChoose(b: Cell[], rng: () => number): CpuChoice | null {
  const empties = legalMoves(b);
  if (empties.length === 0) return null;
  for (const i of empties) {
    for (const m of ["X", "O"] as const) {
      const t = b.slice(); t[i] = m;
      if (findCompletedLine(t)) return { idx: i, mark: m };
    }
  }
  // Center if free
  if (empties.includes(4)) {
    return { idx: 4, mark: rng() < 0.5 ? "X" : "O" };
  }
  const i = empties[Math.floor(rng() * empties.length)]!;
  const mark = rng() < 0.5 ? "X" : "O";
  return { idx: i, mark };
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
    pendingMark: "X",
    winLine: null,
  };
}

export function reducer(state: ConnectState, action: ConnectAction): ConnectState {
  if (state.phase === "done") return state;

  if (action.type === "selectMark") {
    if (state.turn !== "P") return state;
    return { ...state, pendingMark: action.mark };
  }

  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  const { row, col } = action;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return state;
  const idx = row * COLS + col;
  if (state.board[idx] !== null) return state;

  const nb = state.board.slice();
  nb[idx] = state.pendingMark;
  let pieces = state.pieces + 1;
  const w = findCompletedLine(nb);
  if (w) {
    return { ...state, board: nb, result: "P", winLine: w.line, score: state.score + 100 + pieces, phase: "done", pieces };
  }
  if (isFull(nb)) {
    return { ...state, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };
  }

  // CPU
  const rng = mulberry32(state.rngSeed);
  const choice = cpuChoose(nb, rng);
  const seed2 = Math.floor(rng() * 2 ** 31);
  if (choice) { nb[choice.idx] = choice.mark; pieces += 1; }
  const w2 = findCompletedLine(nb);
  if (w2) {
    return { ...state, rngSeed: seed2, board: nb, result: "C", winLine: w2.line, score: state.score + pieces, phase: "done", pieces };
  }
  if (isFull(nb)) {
    return { ...state, rngSeed: seed2, board: nb, result: "draw", score: state.score + 25 + pieces, phase: "done", pieces };
  }
  return { ...state, rngSeed: seed2, board: nb, turn: "P", pieces };
}

export function isTerminal(state: ConnectState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
