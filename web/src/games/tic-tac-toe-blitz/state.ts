import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TIMER_TICKS = 60;

export interface TicTacToeBlitzSettings { dummy: boolean; }
export type Cell = "X" | "O" | null;

export interface TicTacToeBlitzState {
  rngSeed: number;
  board: Cell[];
  turn: "X" | "O";
  ticksRemaining: number;
  score: number;
  wins: number;
  draws: number;
  losses: number;
  roundOver: boolean;
  phase: "playing" | "done";
}

export type TicTacToeBlitzAction = { type: "play"; idx: number } | { type: "next" } | { type: "tick" };

function checkWin(b: Cell[]): "X" | "O" | "draw" | null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,bi,c] of lines) {
    if (b[a!] && b[a!] === b[bi!] && b[a!] === b[c!]) return b[a!];
  }
  if (b.every(x => x !== null)) return "draw";
  return null;
}

function cpuMove(b: Cell[], rng: () => number): number {
  const empty: number[] = [];
  for (let i = 0; i < 9; i++) if (b[i] === null) empty.push(i);
  if (empty.length === 0) return -1;
  return empty[Math.floor(rng() * empty.length)]!;
}

export function initialState(seed: number, _settings: TicTacToeBlitzSettings): TicTacToeBlitzState {
  return { rngSeed: seed, board: Array(9).fill(null), turn: "X", ticksRemaining: TIMER_TICKS, score: 0, wins: 0, draws: 0, losses: 0, roundOver: false, phase: "playing" };
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
    return { ...state, board: Array(9).fill(null), turn: "X", roundOver: false };
  }
  if (action.type === "play") {
    if (state.roundOver) return state;
    if (state.board[action.idx] !== null) return state;
    if (state.turn !== "X") return state;
    const nb = state.board.slice();
    nb[action.idx] = "X";
    let result = checkWin(nb);
    if (result) {
      let score = state.score, wins = state.wins, draws = state.draws, losses = state.losses;
      if (result === "X") { score += 30; wins += 1; }
      else if (result === "draw") { score += 5; draws += 1; }
      else { losses += 1; }
      return { ...state, board: nb, turn: "O", roundOver: true, score, wins, draws, losses };
    }
    // CPU plays
    const rng = mulberry32(state.rngSeed);
    const m = cpuMove(nb, rng);
    const seed2 = Math.floor(rng() * 2 ** 31);
    if (m >= 0) nb[m] = "O";
    result = checkWin(nb);
    if (result) {
      let score = state.score, wins = state.wins, draws = state.draws, losses = state.losses;
      if (result === "X") { score += 30; wins += 1; }
      else if (result === "draw") { score += 5; draws += 1; }
      else { losses += 1; }
      return { ...state, rngSeed: seed2, board: nb, turn: "X", roundOver: true, score, wins, draws, losses };
    }
    return { ...state, rngSeed: seed2, board: nb, turn: "X" };
  }
  return state;
}

export function isTerminal(state: TicTacToeBlitzState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
