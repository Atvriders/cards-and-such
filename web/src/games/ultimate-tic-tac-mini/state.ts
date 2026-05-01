import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Ultimate Tic-Tac-Toe mini: 3x3 super-grid where each cell holds a mini 3x3 TTT.
// Player must play in the mini-board indicated by their opponent's last move.
// Win a mini-board by 3-in-a-row inside it; win overall by 3-in-a-row of mini-board winners.

export interface ConnectSettings { dummy: boolean; }
export type Mark = "P" | "C";
export type Cell = Mark | null;

export interface ConnectState {
  rngSeed: number;
  cells: Cell[];                 // 81 cells (9 minis × 9 cells)
  miniWinners: (Mark | "draw" | null)[];
  activeMini: number;            // mini-board index to play in, or -1 = any
  turn: Mark;
  result: Mark | "draw" | null;
  score: number;
  phase: "playing" | "done";
  pieces: number;
}

export type ConnectAction = { type: "place"; mini: number; cell: number };

const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function lineWinner(arr: (Mark | "draw" | null)[]): Mark | null {
  for (const [a, b, c] of LINES) {
    const v = arr[a];
    if ((v === "P" || v === "C") && arr[b] === v && arr[c] === v) return v;
  }
  return null;
}

function miniWinner(cells: Cell[], offset: number): Mark | "draw" | null {
  const sub: Cell[] = [];
  for (let i = 0; i < 9; i++) sub.push(cells[offset * 9 + i]!);
  for (const [a, b, c] of LINES) {
    const v = sub[a];
    if (v && sub[b] === v && sub[c] === v) return v;
  }
  if (sub.every((x) => x !== null)) return "draw";
  return null;
}

export function legalMoves(state: ConnectState): { mini: number; cell: number }[] {
  const out: { mini: number; cell: number }[] = [];
  const minisToTry: number[] = state.activeMini >= 0 && state.miniWinners[state.activeMini] === null
    ? [state.activeMini]
    : Array.from({ length: 9 }, (_, i) => i).filter((i) => state.miniWinners[i] === null);
  for (const m of minisToTry) {
    for (let c = 0; c < 9; c++) {
      if (state.cells[m * 9 + c] === null) out.push({ mini: m, cell: c });
    }
  }
  return out;
}

function applyMove(state: ConnectState, mini: number, cell: number, mark: Mark): ConnectState {
  const cells = state.cells.slice();
  cells[mini * 9 + cell] = mark;
  const miniWinners = state.miniWinners.slice();
  if (miniWinners[mini] === null) {
    miniWinners[mini] = miniWinner(cells, mini);
  }
  let activeMini = cell;
  if (miniWinners[activeMini] !== null) activeMini = -1;
  const overall = lineWinner(miniWinners);
  let result: Mark | "draw" | null = null;
  if (overall) result = overall;
  else if (miniWinners.every((w) => w !== null)) result = "draw";
  const phase: "playing" | "done" = result ? "done" : "playing";
  return {
    ...state,
    cells,
    miniWinners,
    activeMini,
    turn: mark === "P" ? "C" : "P",
    result,
    phase,
    pieces: state.pieces + 1,
  };
}

function cpuPick(state: ConnectState, rng: () => number): { mini: number; cell: number } | null {
  const moves = legalMoves(state);
  if (moves.length === 0) return null;
  for (const m of moves) {
    const t = applyMove(state, m.mini, m.cell, "C");
    if (t.miniWinners[m.mini] === "C" && state.miniWinners[m.mini] !== "C") return m;
  }
  for (const m of moves) {
    const t = applyMove(state, m.mini, m.cell, "P");
    if (t.miniWinners[m.mini] === "P" && state.miniWinners[m.mini] !== "P") return m;
  }
  return moves[Math.floor(rng() * moves.length)]!;
}

export function initialState(seed: number, _s: ConnectSettings): ConnectState {
  return {
    rngSeed: seed >>> 0,
    cells: Array(81).fill(null),
    miniWinners: Array(9).fill(null),
    activeMini: -1,
    turn: "P",
    result: null,
    score: 0,
    phase: "playing",
    pieces: 0,
  };
}

export function reducer(state: ConnectState, action: ConnectAction): ConnectState {
  if (state.phase === "done") return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  if (action.mini < 0 || action.mini >= 9 || action.cell < 0 || action.cell >= 9) return state;
  if (state.cells[action.mini * 9 + action.cell] !== null) return state;
  if (state.miniWinners[action.mini] !== null) return state;
  if (state.activeMini >= 0 && state.activeMini !== action.mini) return state;

  let next = applyMove(state, action.mini, action.cell, "P");
  if (next.phase === "done") {
    const score = next.result === "P" ? state.score + 100 + next.pieces
      : next.result === "draw" ? state.score + 25 + next.pieces
      : state.score;
    return { ...next, score };
  }
  const rng = mulberry32(state.rngSeed);
  const pick = cpuPick(next, rng);
  const seed2 = Math.floor(rng() * 2 ** 31);
  if (!pick) return { ...next, rngSeed: seed2 };
  next = applyMove(next, pick.mini, pick.cell, "C");
  if (next.phase === "done") {
    const score = next.result === "C" ? state.score + next.pieces
      : next.result === "draw" ? state.score + 25 + next.pieces
      : state.score;
    return { ...next, rngSeed: seed2, score };
  }
  return { ...next, rngSeed: seed2 };
}

export function isTerminal(state: ConnectState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
