import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Gomoku Mini: 9×9 board, 5 in a row wins. Player = X, Bot = O.

export const SIZE = 9;
export const TARGET = 5;

export interface GomokuMiniSettings {
  aiStrength: "easy" | "hard";
}

export type Cell = "X" | "O" | null;

export interface GomokuMiniState {
  rngSeed: number;
  board: Cell[];
  winner: "X" | "O" | "draw" | null;
  phase: "playing" | "gameover";
  settings: GomokuMiniSettings;
  winningLine: number[] | null;
  lastBotMove: number | null;
  pieces: number;
}

export type GomokuMiniAction = { type: "move"; index: number } | { type: "reset" };

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 0], [1, 1], [1, -1],
];

export function check5(board: readonly Cell[]): { winner: Cell | "draw" | null; line: number[] | null } {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r * SIZE + c];
      if (!v) continue;
      for (const [dr, dc] of DIRS) {
        const line: number[] = [];
        let ok = true;
        for (let k = 0; k < TARGET; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || rr >= SIZE || cc < 0 || cc >= SIZE) { ok = false; break; }
          if (board[rr * SIZE + cc] !== v) { ok = false; break; }
          line.push(rr * SIZE + cc);
        }
        if (ok) return { winner: v, line };
      }
    }
  }
  if (board.every((c) => c !== null)) return { winner: "draw", line: null };
  return { winner: null, line: null };
}

function candidates(b: readonly Cell[]): number[] {
  const out = new Set<number>();
  let any = false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (b[r * SIZE + c] === null) continue;
      any = true;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (dr === 0 && dc === 0) continue;
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= SIZE || cc < 0 || cc >= SIZE) continue;
          if (b[rr * SIZE + cc] === null) out.add(rr * SIZE + cc);
        }
      }
    }
  }
  if (!any) return [Math.floor(SIZE / 2) * SIZE + Math.floor(SIZE / 2)];
  return [...out];
}

function scoreAt(b: readonly Cell[], idx: number, who: "X" | "O"): number {
  const r = Math.floor(idx / SIZE), c = idx % SIZE;
  let total = 0;
  for (const [dr, dc] of DIRS) {
    let mine = 1;
    let openL = 0, openR = 0;
    for (let k = 1; k < TARGET; k++) {
      const rr = r + dr * k, cc = c + dc * k;
      if (rr < 0 || rr >= SIZE || cc < 0 || cc >= SIZE) break;
      const v = b[rr * SIZE + cc];
      if (v === who) mine++;
      else if (v === null) { openR = 1; break; }
      else break;
    }
    for (let k = 1; k < TARGET; k++) {
      const rr = r - dr * k, cc = c - dc * k;
      if (rr < 0 || rr >= SIZE || cc < 0 || cc >= SIZE) break;
      const v = b[rr * SIZE + cc];
      if (v === who) mine++;
      else if (v === null) { openL = 1; break; }
      else break;
    }
    const open = openL + openR;
    if (mine >= TARGET) total += 1_000_000;
    else if (mine === 4 && open === 2) total += 50_000;
    else if (mine === 4 && open === 1) total += 8_000;
    else if (mine === 3 && open === 2) total += 3_000;
    else if (mine === 3 && open === 1) total += 400;
    else if (mine === 2 && open === 2) total += 100;
    else if (mine === 2 && open === 1) total += 20;
    else total += mine;
  }
  return total;
}

function aiMove(board: readonly Cell[], strength: "easy" | "hard", rng: () => number): number {
  // First, win if possible
  const empty: number[] = [];
  for (let i = 0; i < board.length; i++) if (board[i] === null) empty.push(i);
  for (const idx of empty) {
    const t = [...board];
    t[idx] = "O";
    if (check5(t).winner === "O") return idx;
  }
  // Block immediate wins
  for (const idx of empty) {
    const t = [...board];
    t[idx] = "X";
    if (check5(t).winner === "X") return idx;
  }
  const cells = candidates(board);
  if (cells.length === 0) return empty[0] ?? 0;
  if (strength === "easy") {
    let best = cells[0]!;
    let bs = -Infinity;
    for (const i of cells) {
      const s = scoreAt(board, i, "O") - scoreAt(board, i, "X") * 0.4 + rng() * 0.001;
      if (s > bs) { bs = s; best = i; }
    }
    return best;
  }
  let best = cells[0]!;
  let bs = -Infinity;
  for (const i of cells) {
    const myS = scoreAt(board, i, "O");
    const oppS = scoreAt(board, i, "X");
    const s = Math.max(myS, oppS * 1.15) + rng() * 0.001;
    if (s > bs) { bs = s; best = i; }
  }
  return best;
}

export function initialState(seed: number, settings: GomokuMiniSettings): GomokuMiniState {
  return {
    rngSeed: seed,
    board: Array(SIZE * SIZE).fill(null),
    winner: null,
    phase: "playing",
    settings,
    winningLine: null,
    lastBotMove: null,
    pieces: 0,
  };
}

export function reducer(state: GomokuMiniState, action: GomokuMiniAction): GomokuMiniState {
  if (action.type === "reset") return initialState(state.rngSeed + 1, state.settings);
  if (action.type !== "move") return state;
  if (state.phase === "gameover") return state;
  if (state.board[action.index] !== null) return state;

  const board = [...state.board] as Cell[];
  board[action.index] = "X";
  let pieces = state.pieces + 1;

  let result = check5(board);
  if (result.winner === "X") {
    return { ...state, board, winner: "X", phase: "gameover", winningLine: result.line, pieces };
  }
  if (result.winner === "draw") {
    return { ...state, board, winner: "draw", phase: "gameover", pieces };
  }

  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const aiIdx = aiMove(board, state.settings.aiStrength, rng);
  board[aiIdx] = "O";
  pieces++;

  result = check5(board);
  return {
    ...state,
    rngSeed: nextSeed,
    board,
    winner: result.winner ?? null,
    phase: result.winner ? "gameover" : "playing",
    winningLine: result.line,
    lastBotMove: aiIdx,
    pieces,
  };
}

export function isTerminal(state: GomokuMiniState): { score: number } | null {
  if (state.phase !== "gameover") return null;
  return { score: state.winner === "X" ? 100 : state.winner === "draw" ? 50 : 0 };
}
