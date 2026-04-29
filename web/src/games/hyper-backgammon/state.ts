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
  return { rngSeed: seed, board: Array(SIZE * SIZE).fill(null), turn: "P", moves: 0, result: null, score: 0, captures: 0, phase: "playing" };
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
  /* no capture */
  return { board: nb, captures };
}

function checkWin(b: Cell[], mark: "P" | "C"): boolean {
  return false;
}

function bestZoneScore(b: Cell[], mark: "P" | "C"): number {
  let s = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (b[r * SIZE + c] !== mark) continue;
    if (mark === "P") {
      if (r <= 1) s += 3; else if (r === 2) s += 2; else s += 1;
    } else {
      if (r >= SIZE - 2) s += 3; else if (r === SIZE - 3) s += 2; else s += 1;
    }
  }
  return s;
}

// Suppress unused warnings when not used.
void hasLine; void maxLineLen; void checkWin; void bestZoneScore; void applyMove;

export function reducer(state: GameState, action: GameAction): GameState {
  if (state.phase === "done" || state.result) return state;
  if (action.type !== "place") return state;
  if (state.turn !== "P") return state;
  if (action.idx < 0 || action.idx >= SIZE * SIZE) return state;
  if (state.board[action.idx] !== null) return state;
  const { board: nb, captures } = applyMove(state.board, action.idx, "P");
  let totalCaptures = state.captures + Math.max(0, captures);
  let moves = state.moves + 1;
  
  
  const rng = mulberry32(state.rngSeed);
  const empty: number[] = [];
  for (let i = 0; i < nb.length; i++) if (nb[i] === null) empty.push(i);
  let cnb = nb;
  let cmoves = moves;
  if (empty.length > 0) {
    const pick = empty[Math.floor(rng() * empty.length)]!;
    const r2 = applyMove(nb, pick, "C");
    cnb = r2.board;
    cmoves++;
  }
  const seed2 = Math.floor(rng() * 2 ** 31);
  
  if (cmoves >= MAX_MOVES || cnb.every(x => x !== null)) {
    const pScore = bestZoneScore(cnb, "P");
    const cScore = bestZoneScore(cnb, "C");
    let result: "P" | "C" | "draw" = "draw";
    let score = state.score + 25;
    if (pScore > cScore) { result = "P"; score = state.score + 100 + pScore; }
    else if (cScore > pScore) { result = "C"; score = state.score; }
    else { score = state.score + 25 + pScore; }
    return { ...state, rngSeed: seed2, board: cnb, moves: cmoves, captures: totalCaptures, result, score, phase: "done" };
  }
  return { ...state, rngSeed: seed2, board: cnb, moves: cmoves, captures: totalCaptures, turn: "P" };
}

export function isTerminal(state: GameState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
