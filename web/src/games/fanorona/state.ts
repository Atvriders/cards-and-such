import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Fanorona — 5×9 grid with Alquerque-style adjacency
// Two players: seat 0 (White/player) vs seat 1 (Black/bot)
// Each starts with 22 pieces filling 2.5 rows.
// Captures: approach (move toward opponent line) or withdrawal (move away from opponent line)
// After a capture, must continue capturing if possible (different direction each time)
// Player who captures all opponent pieces wins.

export const ROWS = 5;
export const COLS = 9;
export const TOTAL = ROWS * COLS; // 45

export type Cell = 0 | 1 | null; // 0=White(player), 1=Black(bot)

// Adjacency: Alquerque-style — orthogonal always, diagonal only at alternate intersections
// A cell at (r,c) has diagonal adjacency if (r+c) is even
function buildAdjacency(): ReadonlyArray<readonly number[]> {
  const adj: number[][] = Array.from({ length: TOTAL }, () => []);
  function pos(r: number, c: number): number { return r * COLS + c; }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = pos(r, c);
      // Orthogonal
      const orth: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];
      for (const [dr, dc] of orth) {
        const nr = r + dr; const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) adj[p]!.push(pos(nr, nc));
      }
      // Diagonal only at even sum positions
      if ((r + c) % 2 === 0) {
        const diag: [number, number][] = [[-1,-1],[-1,1],[1,-1],[1,1]];
        for (const [dr, dc] of diag) {
          const nr = r + dr; const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) adj[p]!.push(pos(nr, nc));
        }
      }
    }
  }
  return adj;
}

export const ADJACENCY = buildAdjacency();

// Get the direction vector from pos a to pos b (assuming adjacent)
export function dirFrom(a: number, b: number): number | null {
  const ra = Math.floor(a / COLS); const ca = a % COLS;
  const rb = Math.floor(b / COLS); const cb = b % COLS;
  const dr = rb - ra; const dc = cb - ca;
  if (Math.abs(dr) > 1 || Math.abs(dc) > 1) return null;
  // Encode direction as single offset
  return (ra + dr) * COLS + (ca + dc) - a; // step offset
}

// Get all positions in direction (dr, dc) from pos that contain opponent pieces (for capture)
// Approach: after moving from->to, captures start at the square BEYOND to in the same direction
function captureLineApproach(board: readonly Cell[], from: number, to: number, opp: 0 | 1): number[] {
  const ra = Math.floor(from / COLS); const ca = from % COLS;
  const rb = Math.floor(to / COLS); const cb = to % COLS;
  const dr = rb - ra; const dc = cb - ca;
  const captured: number[] = [];
  // Start capturing from the square one step beyond 'to' in the direction of movement
  let r = rb + dr; let c = cb + dc;
  while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
    const p = r * COLS + c;
    if (board[p] === opp) captured.push(p);
    else break;
    r += dr; c += dc;
  }
  return captured;
}

function captureLineWithdrawal(board: readonly Cell[], from: number, to: number, opp: 0 | 1): number[] {
  const ra = Math.floor(from / COLS); const ca = from % COLS;
  const rb = Math.floor(to / COLS); const cb = to % COLS;
  const dr = ra - rb; const dc = ca - cb; // reverse direction
  const captured: number[] = [];
  let r = ra + dr; let c = ca + dc;
  while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
    const p = r * COLS + c;
    if (board[p] === opp) captured.push(p);
    else break;
    r += dr; c += dc;
  }
  return captured;
}

export function getCaptureType(board: readonly Cell[], from: number, to: number, seat: 0 | 1): "approach" | "withdrawal" | "none" {
  const opp = seat === 0 ? 1 : 0;
  if (captureLineApproach(board, from, to, opp).length > 0) return "approach";
  if (captureLineWithdrawal(board, from, to, opp).length > 0) return "withdrawal";
  return "none";
}

export interface FanoronaSettings { dummy?: string }

export interface FanoronaState {
  board: readonly Cell[];
  turn: 0 | 1;
  selected: number | null;
  // During a capturing chain, track which pos is the current piece and used directions
  chainFrom: number | null;
  usedDirections: readonly string[]; // directions already used in this chain (encoded)
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: FanoronaSettings;
}

export type FanoronaAction =
  | { type: "select"; pos: number }
  | { type: "move"; to: number }
  | { type: "end-chain" }; // pass on further captures

export function initialState(seed: number, settings: FanoronaSettings): FanoronaState {
  const board: Cell[] = new Array(TOTAL).fill(null);
  // White fills rows 3,4 + half of row 2 (left half)
  // Black fills rows 0,1 + half of row 2 (right half)
  // Middle row 2 alternates
  for (let c = 0; c < COLS; c++) {
    board[0 * COLS + c] = 1; // Black
    board[1 * COLS + c] = 1;
    board[3 * COLS + c] = 0; // White
    board[4 * COLS + c] = 0;
  }
  // Row 2: left 4 = white, center empty, right 4 = black
  for (let c = 0; c < 4; c++) board[2 * COLS + c] = 0;
  board[2 * COLS + 4] = null; // center empty
  for (let c = 5; c < 9; c++) board[2 * COLS + c] = 1;

  return {
    board,
    turn: 0,
    selected: null,
    chainFrom: null,
    usedDirections: [],
    winner: null,
    rngSeed: seed,
    settings,
  };
}

function encodeDir(from: number, to: number): string {
  const dr = Math.floor(to / COLS) - Math.floor(from / COLS);
  const dc = (to % COLS) - (from % COLS);
  return `${dr},${dc}`;
}

export function adjacentMoves(board: readonly Cell[], pos: number): number[] {
  return ADJACENCY[pos]!.filter(t => board[t] === null);
}

export function capturingMoves(board: readonly Cell[], pos: number, seat: 0 | 1, usedDirs: readonly string[] = []): number[] {
  return adjacentMoves(board, pos).filter(to => {
    const dir = encodeDir(pos, to);
    if (usedDirs.includes(dir)) return false;
    return getCaptureType(board, pos, to, seat) !== "none";
  });
}

function applyCapture(board: Cell[], from: number, to: number, seat: 0 | 1): void {
  const opp = seat === 0 ? 1 : 0;
  const ct = getCaptureType(board, from, to, seat);
  let captured: number[];
  if (ct === "approach") captured = captureLineApproach(board, from, to, opp);
  else if (ct === "withdrawal") captured = captureLineWithdrawal(board, from, to, opp);
  else captured = [];
  for (const p of captured) board[p] = null;
}

function checkWinner(board: readonly Cell[]): 0 | 1 | null {
  const hasW = board.some(c => c === 0);
  const hasB = board.some(c => c === 1);
  if (!hasW) return 1;
  if (!hasB) return 0;
  return null;
}

// Bot minimax
interface BotState {
  board: readonly Cell[];
  turn: 0 | 1;
}

type BotMove = { from: number; to: number; captureType: "approach" | "withdrawal" | "none" };

function botMovesList(s: BotState): BotMove[] {
  const seat = s.turn;
  const moves: BotMove[] = [];
  s.board.forEach((cell, from) => {
    if (cell !== seat) return;
    for (const to of adjacentMoves(s.board, from)) {
      const ct = getCaptureType(s.board, from, to, seat);
      moves.push({ from, to, captureType: ct });
    }
  });
  // If any capture moves exist, only allow captures
  const captures = moves.filter(m => m.captureType !== "none");
  return captures.length > 0 ? captures : moves.filter(m => m.captureType === "none");
}

function applyBotMove(s: BotState, move: BotMove): BotState {
  const board = [...s.board] as Cell[];
  board[move.to] = board[move.from] ?? null;
  board[move.from] = null;
  if (move.captureType !== "none") applyCapture(board, move.from, move.to, s.turn);
  const winner = checkWinner(board);
  if (winner !== null) return { board, turn: s.turn };
  return { board, turn: s.turn === 0 ? 1 : 0 };
}

function evaluateBot(s: BotState): number {
  const whites = s.board.filter(c => c === 0).length;
  const blacks = s.board.filter(c => c === 1).length;
  return blacks - whites; // bot = black (seat 1) maximizes
}

function botIsTerminal(s: BotState): boolean {
  return checkWinner(s.board) !== null || botMovesList(s).length === 0;
}

function getBotMove(state: FanoronaState): BotMove | null {
  const bs: BotState = { board: state.board, turn: state.turn };
  const result = minimax<BotState, BotMove>(bs, {
    depth: 2,
    moves: botMovesList,
    apply: applyBotMove,
    isTerminal: botIsTerminal,
    evaluate: evaluateBot,
    maximizing: (s) => s.turn === 1,
  });
  return result.move;
}

function applyMoveToState(state: FanoronaState, from: number, to: number): FanoronaState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const board = [...state.board] as Cell[];
  const ct = getCaptureType(board, from, to, state.turn);
  board[to] = board[from] ?? null;
  board[from] = null;
  if (ct !== "none") applyCapture(board, from, to, state.turn);

  const winner = checkWinner(board);
  const nextTurn = (state.turn === 0 ? 1 : 0) as 0 | 1;

  // Check if capturing chain continues
  const dir = encodeDir(from, to);
  const newUsedDirs = ct !== "none" ? [...state.usedDirections, dir] : [];
  const canContinue = ct !== "none" && capturingMoves(board, to, state.turn, newUsedDirs).length > 0;

  if (canContinue) {
    return {
      ...state, board, rngSeed: nextSeed, winner,
      chainFrom: to, selected: to, usedDirections: newUsedDirs,
    };
  }

  return {
    ...state, board, turn: nextTurn, selected: null, chainFrom: null,
    usedDirections: [], winner, rngSeed: nextSeed,
  };
}

function runBotMoves(state: FanoronaState): FanoronaState {
  let s = state;
  let limit = 10;
  while (s.winner === null && s.turn === 1 && limit-- > 0) {
    const move = getBotMove(s);
    if (!move) break;
    s = applyMoveToState(s, move.from, move.to);
    // Simplified bot: ends chain after one capture
    if (s.chainFrom !== null) {
      s = { ...s, turn: 0 as const, chainFrom: null, selected: null, usedDirections: [] };
    }
  }
  return s;
}

export function reducer(state: FanoronaState, action: FanoronaAction): FanoronaState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;

  if (action.type === "end-chain") {
    if (state.chainFrom === null) return state;
    const endState: FanoronaState = { ...state, turn: 1 as const, chainFrom: null, selected: null, usedDirections: [] };
    return runBotMoves(endState);
  }

  if (action.type === "select") {
    if (state.chainFrom !== null && action.pos !== state.chainFrom) return state;
    if (state.board[action.pos] !== 0) return state;
    return { ...state, selected: action.pos };
  }

  if (action.type === "move") {
    const from = state.chainFrom ?? state.selected;
    if (from === null) return state;
    if (state.board[from] !== 0) return state;
    if (!ADJACENCY[from]!.includes(action.to)) return state;
    if (state.board[action.to] !== null) return state;

    // In chain mode, only capture moves allowed, and not previously used direction
    if (state.chainFrom !== null) {
      const dir = encodeDir(from, action.to);
      if (state.usedDirections.includes(dir)) return state;
      const ct = getCaptureType(state.board, from, action.to, 0);
      if (ct === "none") return state;
    }

    const next = applyMoveToState(state, from, action.to);
    if (next.winner !== null) return next;
    if (next.chainFrom !== null) return next; // continue chain
    return runBotMoves(next);
  }

  return state;
}

export function isTerminal(state: FanoronaState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
