import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 3;
export const TARGET = 3;

export interface GameSettings { dummy: boolean; }
export type Cell = "P" | "C" | null;

export interface GameState {
  rngSeed: number;
  board: Cell[];
  turn: "P" | "C";
  moves: number;
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
  loseLine: number[] | null;
}

export type GameAction = { type: "place"; idx: number };

const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Returns the line indices if the given mark has 3-in-a-row.
export function findLineFor(b: Cell[], mark: "P" | "C"): number[] | null {
  for (const [a, bi, c] of LINES) {
    if (b[a] === mark && b[bi] === mark && b[c] === mark) return [a, bi, c];
  }
  return null;
}

function legalMoves(b: Cell[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.length; i++) if (b[i] === null) out.push(i);
  return out;
}

// Misere CPU: avoid creating 3-in-a-row of own; force opponent into making one if possible.
function cpuMove(b: Cell[], rng: () => number): number {
  const empties = legalMoves(b);
  if (empties.length === 0) return -1;
  // Safe = doesn't make own 3-in-a-row
  const safe: number[] = [];
  for (const i of empties) {
    const t = b.slice(); t[i] = "C";
    if (!findLineFor(t, "C")) safe.push(i);
  }
  const pool = safe.length > 0 ? safe : empties;
  return pool[Math.floor(rng() * pool.length)]!;
}

export function initialState(seed: number, _settings: GameSettings): GameState {
  return {
    rngSeed: seed >>> 0,
    board: Array(SIZE * SIZE).fill(null),
    turn: "P",
    moves: 0,
    result: null,
    score: 0,
    phase: "playing",
    loseLine: null,
  };
}

export function reducer(state: GameState, action: GameAction): GameState {
  if (state.phase === "done") return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  if (action.idx < 0 || action.idx >= SIZE * SIZE) return state;
  if (state.board[action.idx] !== null) return state;

  const nb = state.board.slice();
  nb[action.idx] = "P";
  let moves = state.moves + 1;
  // Did player just complete 3-in-a-row of P? They LOSE.
  const pLine = findLineFor(nb, "P");
  if (pLine) {
    return { ...state, board: nb, moves, result: "C", loseLine: pLine, score: state.score, phase: "done" };
  }
  if (nb.every((x) => x !== null)) {
    return { ...state, board: nb, moves, result: "draw", score: state.score + 25 + moves, phase: "done" };
  }

  const rng = mulberry32(state.rngSeed);
  const m = cpuMove(nb, rng);
  const seed2 = Math.floor(rng() * 2 ** 31);
  if (m >= 0) { nb[m] = "C"; moves += 1; }
  const cLine = findLineFor(nb, "C");
  if (cLine) {
    // CPU completed 3-in-a-row of C -> CPU loses, player wins
    return { ...state, rngSeed: seed2, board: nb, moves, result: "P", loseLine: cLine, score: state.score + 100 + moves, phase: "done" };
  }
  if (nb.every((x) => x !== null)) {
    return { ...state, rngSeed: seed2, board: nb, moves, result: "draw", score: state.score + 25 + moves, phase: "done" };
  }
  return { ...state, rngSeed: seed2, board: nb, moves, turn: "P" };
}

export function isTerminal(state: GameState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
