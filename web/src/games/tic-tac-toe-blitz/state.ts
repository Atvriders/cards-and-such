import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TIMER_TICKS = 60;
export const SIZE = 3;

export interface TicTacToeBlitzSettings { dummy: boolean; }
export type Cell = "X" | "O" | null;

export interface TicTacToeBlitzState {
  rngSeed: number;
  board: Cell[];
  ticksRemaining: number;
  score: number;
  wins: number;
  draws: number;
  losses: number;
  roundOver: boolean;
  result: "X" | "O" | "draw" | null;
  phase: "playing" | "done";
}

export type TicTacToeBlitzAction =
  | { type: "play"; idx: number }
  | { type: "next" }
  | { type: "tick" };

const LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWin(b: Cell[]): "X" | "O" | "draw" | null {
  for (const [a, bi, c] of LINES) {
    const v = b[a];
    if (v && v === b[bi] && v === b[c]) return v;
  }
  if (b.every((x) => x !== null)) return "draw";
  return null;
}

function emptyIndices(b: Cell[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < b.length; i++) if (b[i] === null) out.push(i);
  return out;
}

function cpuMove(b: Cell[], rng: () => number): number {
  const empties = emptyIndices(b);
  if (empties.length === 0) return -1;
  for (const i of empties) {
    const trial = b.slice(); trial[i] = "O";
    if (checkWin(trial) === "O") return i;
  }
  for (const i of empties) {
    const trial = b.slice(); trial[i] = "X";
    if (checkWin(trial) === "X") return i;
  }
  if (empties.includes(4)) return 4;
  return empties[Math.floor(rng() * empties.length)]!;
}

export function initialState(seed: number, _settings: TicTacToeBlitzSettings): TicTacToeBlitzState {
  return {
    rngSeed: seed >>> 0,
    board: Array(9).fill(null),
    ticksRemaining: TIMER_TICKS,
    score: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    roundOver: false,
    result: null,
    phase: "playing",
  };
}

export function reducer(state: TicTacToeBlitzState, action: TicTacToeBlitzAction): TicTacToeBlitzState {
  if (state.phase === "done") return state;

  if (action.type === "tick") {
    const t = state.ticksRemaining - 1;
    if (t <= 0) return { ...state, ticksRemaining: 0, phase: "done" };
    return { ...state, ticksRemaining: t };
  }

  if (action.type === "next") {
    if (!state.roundOver) return state;
    return { ...state, board: Array(9).fill(null), roundOver: false, result: null };
  }

  if (action.type === "play") {
    if (state.roundOver) return state;
    if (action.idx < 0 || action.idx >= 9) return state;
    if (state.board[action.idx] !== null) return state;

    const nb = state.board.slice();
    nb[action.idx] = "X";
    let result = checkWin(nb);
    if (result) {
      let { score, wins, draws, losses } = state;
      if (result === "X") { score += 30; wins += 1; }
      else if (result === "draw") { score += 5; draws += 1; }
      else { losses += 1; }
      return { ...state, board: nb, roundOver: true, result, score, wins, draws, losses };
    }
    const rng = mulberry32(state.rngSeed);
    const m = cpuMove(nb, rng);
    const seed2 = Math.floor(rng() * 2 ** 31);
    if (m >= 0) nb[m] = "O";
    result = checkWin(nb);
    if (result) {
      let { score, wins, draws, losses } = state;
      if (result === "X") { score += 30; wins += 1; }
      else if (result === "draw") { score += 5; draws += 1; }
      else { losses += 1; }
      return { ...state, rngSeed: seed2, board: nb, roundOver: true, result, score, wins, draws, losses };
    }
    return { ...state, rngSeed: seed2, board: nb };
  }
  return state;
}

export function isTerminal(state: TicTacToeBlitzState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
