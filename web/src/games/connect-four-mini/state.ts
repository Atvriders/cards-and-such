import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const COLS = 5;
export const ROWS = 5;

export interface ConnectFourMiniSettings { dummy: boolean; }
export type Cell = "P" | "C" | null;

export interface ConnectFourMiniState {
  rngSeed: number;
  board: Cell[];        // ROWS*COLS, [r*COLS+c]
  turn: "P" | "C";
  result: "P" | "C" | "draw" | null;
  score: number;
  phase: "playing" | "done";
}

export type ConnectFourMiniAction = { type: "drop"; col: number };

function topRow(b: Cell[], col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (b[r * COLS + col] === null) return r;
  return -1;
}

function checkWin(b: Cell[]): Cell | "draw" {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const v = b[r * COLS + c]; if (!v) continue;
    for (const [dr, dc] of dirs) {
      let ok = true;
      for (let k = 0; k < 4; k++) {
        const rr = r + dr! * k, cc = c + dc! * k;
        if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) { ok = false; break; }
        if (b[rr * COLS + cc] !== v) { ok = false; break; }
      }
      if (ok) return v;
    }
  }
  if (b.every(x => x !== null)) return "draw";
  return null;
}

export function initialState(seed: number, _settings: ConnectFourMiniSettings): ConnectFourMiniState {
  return { rngSeed: seed, board: Array(ROWS * COLS).fill(null), turn: "P", result: null, score: 0, phase: "playing" };
}

export function reducer(state: ConnectFourMiniState, action: ConnectFourMiniAction): ConnectFourMiniState {
  if (state.phase === "done" || state.result) return state;
  if (action.type !== "drop") return state;
  if (state.turn !== "P") return state;
  const r = topRow(state.board, action.col);
  if (r < 0) return state;
  const nb = state.board.slice();
  nb[r * COLS + action.col] = "P";
  let result = checkWin(nb);
  if (result === "P") return { ...state, board: nb, result: "P", score: state.score + 100, phase: "done" };
  if (result === "draw") return { ...state, board: nb, result: "draw", score: state.score + 25, phase: "done" };
  // CPU random
  const rng = mulberry32(state.rngSeed);
  const validCols: number[] = [];
  for (let c = 0; c < COLS; c++) if (topRow(nb, c) >= 0) validCols.push(c);
  if (validCols.length > 0) {
    const cc = validCols[Math.floor(rng() * validCols.length)]!;
    const rr = topRow(nb, cc);
    nb[rr * COLS + cc] = "C";
  }
  const seed2 = Math.floor(rng() * 2 ** 31);
  result = checkWin(nb);
  if (result === "C") return { ...state, rngSeed: seed2, board: nb, result: "C", score: state.score, phase: "done" };
  if (result === "draw") return { ...state, rngSeed: seed2, board: nb, result: "draw", score: state.score + 25, phase: "done" };
  return { ...state, rngSeed: seed2, board: nb, turn: "P" };
}

export function isTerminal(state: ConnectFourMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
