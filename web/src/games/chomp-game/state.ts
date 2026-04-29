import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const SIZE = 5;
export const MAX_MOVES = 12;

export interface GameSettings { dummy: boolean; }
export type Cell = "P" | "C" | null;

export interface GameState {
  rngSeed: number;
  board: Cell[];
  turn: "P" | "C";
  moves: number;
  result: "P" | "C" | "draw" | null;
  score: number;
  captures: number;
  phase: "playing" | "done";
}

export type GameAction = { type: "place"; idx: number };

export function initialState(seed: number, _settings: GameSettings): GameState {
  const board: Cell[] = Array(SIZE * SIZE).fill("P");
  return { rngSeed: seed, board, turn: "P", moves: 0, result: null, score: 0, captures: 0, phase: "playing" };
}

function countLine(b: Cell[], r: number, c: number, dr: number, dc: number, mark: Cell): number {
  let n = 0; let rr = r; let cc = c;
  while (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && b[rr * SIZE + cc] === mark) { n++; rr += dr; cc += dc; }
  return n;
}

function hasLine(b: Cell[], mark: Cell, target: number): boolean {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (b[r * SIZE + c] !== mark) continue;
    for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]] as const) {
      const len = countLine(b, r, c, dr, dc, mark);
      if (len >= target) return true;
    }
  }
  return false;
}

function maxLineLen(b: Cell[], mark: Cell): number {
  let best = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (b[r * SIZE + c] !== mark) continue;
    for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]] as const) {
      const len = countLine(b, r, c, dr, dc, mark);
      if (len > best) best = len;
    }
  }
  return best;
}

function applyMove(b: Cell[], idx: number, mark: "P" | "C"): { board: Cell[]; captures: number } {
  const nb = b.slice();
  nb[idx] = mark;
  const opp: "P" | "C" = mark === "P" ? "C" : "P";
  let captures = 0;
  const r = Math.floor(idx / SIZE), c = idx % SIZE;
  /* no special effect */
  return { board: nb, captures };
}

function checkWin(b: Cell[], mark: "P" | "C"): boolean {
  return false;
}

function bestZoneScore(b: Cell[], mark: "P" | "C"): number {
  return 0;
}

// Suppress unused warnings when not used.
void hasLine; void maxLineLen; void checkWin; void bestZoneScore; void applyMove;

export function reducer(state: GameState, action: GameAction): GameState {
  if (state.phase === "done" || state.result) return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  if (action.idx < 0 || action.idx >= SIZE * SIZE) return state;
  if (state.board[action.idx] !== "P") return state;
  const r0 = Math.floor(action.idx / SIZE), c0 = action.idx % SIZE;
  const nbInit = state.board.slice();
  let atePoison = false;
  for (let r = 0; r <= r0; r++) for (let c = c0; c < SIZE; c++) {
    if (nbInit[r * SIZE + c] === "P") nbInit[r * SIZE + c] = null;
    if (r === 0 && c === 0) atePoison = true;
  }
  const totalCaptures = state.captures + 1;
  const moves = state.moves + 1;
  const nb = nbInit;
  if (atePoison) {
    return { ...state, board: nb, moves, result: "C", score: 0, phase: "done" };
  }
  const rng = mulberry32(state.rngSeed);
  const remainingP: number[] = [];
  for (let i = 0; i < nb.length; i++) if (nb[i] === "P" && i !== 0) remainingP.push(i);
  let cpuBoard = nb;
  let cpuMoves = moves;
  let cpuAtePoison = false;
  if (remainingP.length > 0) {
    const pick = remainingP[Math.floor(rng() * remainingP.length)]!;
    const cnb = nb.slice();
    const cr = Math.floor(pick / SIZE), cc = pick % SIZE;
    for (let r = 0; r <= cr; r++) for (let c = cc; c < SIZE; c++) {
      if (cnb[r * SIZE + c] === "P") cnb[r * SIZE + c] = null;
      if (r === 0 && c === 0) cpuAtePoison = true;
    }
    cpuBoard = cnb;
    cpuMoves++;
  }
  const seed2 = Math.floor(rng() * 2 ** 31);
  if (cpuAtePoison) {
    const remainingCount = cpuBoard.filter(x => x === "P").length;
    return { ...state, rngSeed: seed2, board: cpuBoard, moves: cpuMoves, result: "P", score: state.score + 100 + remainingCount * 5, phase: "done" };
  }
  if (cpuMoves >= MAX_MOVES) {
    const remainingCount = cpuBoard.filter(x => x === "P").length;
    return { ...state, rngSeed: seed2, board: cpuBoard, moves: cpuMoves, result: "draw", score: state.score + 25 + remainingCount * 2, phase: "done" };
  }
  return { ...state, rngSeed: seed2, board: cpuBoard, moves: cpuMoves, captures: totalCaptures, turn: "P" };
}

export function isTerminal(state: GameState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
