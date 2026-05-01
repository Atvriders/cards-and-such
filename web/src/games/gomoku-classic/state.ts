import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Gomoku Classic: 15×15 free-placement, first to 5 in a row wins.

export const ROWS = 15;
export const COLS = 15;
export const TARGET = 5;

export interface ConnectSettings {
  botStrength: "easy" | "hard";
}

export type Cell = "P" | "C" | null;

export interface ConnectState {
  rngSeed: number;
  board: Cell[];
  turn: "P" | "C";
  result: "P" | "C" | "draw" | null;
  phase: "playing" | "done";
  pieces: number;
  winningLine: number[] | null;
  lastBotMove: number | null;
  settings: ConnectSettings;
}

export type ConnectAction = { type: "place"; row: number; col: number };

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 0], [1, 1], [1, -1],
];

export function checkWin(b: readonly Cell[]): { winner: Cell | "draw" | null; line: number[] | null } {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = b[r * COLS + c];
      if (!v) continue;
      for (const [dr, dc] of DIRS) {
        const line: number[] = [];
        let ok = true;
        for (let k = 0; k < TARGET; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { ok = false; break; }
          if (b[rr * COLS + cc] !== v) { ok = false; break; }
          line.push(rr * COLS + cc);
        }
        if (ok) return { winner: v, line };
      }
    }
  }
  if (b.every((x) => x !== null)) return { winner: "draw", line: null };
  return { winner: null, line: null };
}

function candidates(b: readonly Cell[]): number[] {
  const seen = new Set<number>();
  let any = false;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (b[r * COLS + c] === null) continue;
      any = true;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          if (dr === 0 && dc === 0) continue;
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) continue;
          if (b[rr * COLS + cc] === null) seen.add(rr * COLS + cc);
        }
      }
    }
  }
  if (!any) return [Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2)];
  return [...seen];
}

function scoreAt(b: readonly Cell[], idx: number, who: "P" | "C"): number {
  const r = Math.floor(idx / COLS), c = idx % COLS;
  let total = 0;
  for (const [dr, dc] of DIRS) {
    let mine = 1; // counting hypothetical placement
    let openL = 0, openR = 0;
    let blockedL = false, blockedR = false;
    // forward
    for (let k = 1; k < TARGET; k++) {
      const rr = r + dr * k, cc = c + dc * k;
      if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { blockedR = true; break; }
      const v = b[rr * COLS + cc];
      if (v === who) mine++;
      else if (v === null) { openR = 1; break; }
      else { blockedR = true; break; }
    }
    // backward
    for (let k = 1; k < TARGET; k++) {
      const rr = r - dr * k, cc = c - dc * k;
      if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { blockedL = true; break; }
      const v = b[rr * COLS + cc];
      if (v === who) mine++;
      else if (v === null) { openL = 1; break; }
      else { blockedL = true; break; }
    }
    const openEnds = openL + openR;
    if (mine >= TARGET) total += 1_000_000;
    else if (mine === 4 && openEnds === 2) total += 50_000;
    else if (mine === 4 && openEnds === 1) total += 8_000;
    else if (mine === 3 && openEnds === 2) total += 3_000;
    else if (mine === 3 && openEnds === 1) total += 400;
    else if (mine === 2 && openEnds === 2) total += 100;
    else if (mine === 2 && openEnds === 1) total += 20;
    else total += mine;
    if (blockedL && blockedR && mine < TARGET) total -= 1;
  }
  return total;
}

function pickBotMove(b: readonly Cell[], strength: "easy" | "hard", rng: () => number): number | null {
  const cells = candidates(b);
  if (cells.length === 0) return null;
  if (strength === "easy") {
    // Greedy: maximize own score - 0.5 * opp threat
    let best = cells[0]!;
    let bestScore = -Infinity;
    for (const i of cells) {
      const s = scoreAt(b, i, "C") - scoreAt(b, i, "P") * 0.5 + rng() * 0.001;
      if (s > bestScore) { bestScore = s; best = i; }
    }
    return best;
  }
  // Hard: weight blocking strongly
  let best = cells[0]!;
  let bestScore = -Infinity;
  for (const i of cells) {
    const myS = scoreAt(b, i, "C");
    const oppS = scoreAt(b, i, "P");
    const s = Math.max(myS, oppS * 1.1) + rng() * 0.001;
    if (s > bestScore) { bestScore = s; best = i; }
  }
  return best;
}

export function initialState(seed: number, settings: ConnectSettings): ConnectState {
  return {
    rngSeed: seed,
    board: Array(ROWS * COLS).fill(null),
    turn: "P",
    result: null,
    phase: "playing",
    pieces: 0,
    winningLine: null,
    lastBotMove: null,
    settings,
  };
}

export function reducer(state: ConnectState, action: ConnectAction): ConnectState {
  if (state.phase === "done" || state.result) return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;

  const { row, col } = action;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return state;
  if (state.board[row * COLS + col] !== null) return state;

  const nb = state.board.slice();
  nb[row * COLS + col] = "P";
  let pieces = state.pieces + 1;
  let { winner, line } = checkWin(nb);
  if (winner === "P") {
    return { ...state, board: nb, result: "P", phase: "done", pieces, winningLine: line };
  }
  if (winner === "draw") {
    return { ...state, board: nb, result: "draw", phase: "done", pieces, winningLine: null };
  }

  const rng = mulberry32(state.rngSeed);
  const seed2 = Math.floor(rng() * 2 ** 31);
  const botIdx = pickBotMove(nb, state.settings.botStrength, rng);
  if (botIdx !== null) {
    nb[botIdx] = "C";
    pieces += 1;
  }
  const winRes = checkWin(nb);
  winner = winRes.winner;
  line = winRes.line;

  if (winner === "C") {
    return { ...state, rngSeed: seed2, board: nb, result: "C", phase: "done", pieces, winningLine: line, lastBotMove: botIdx };
  }
  if (winner === "draw") {
    return { ...state, rngSeed: seed2, board: nb, result: "draw", phase: "done", pieces, winningLine: null, lastBotMove: botIdx };
  }

  return { ...state, rngSeed: seed2, board: nb, turn: "P", pieces, lastBotMove: botIdx };
}

export function isTerminal(state: ConnectState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.result === "P") return { score: 100 };
  if (state.result === "draw") return { score: 50 };
  return { score: 0 };
}
