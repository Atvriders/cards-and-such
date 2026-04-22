import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Hnefatafl (Tafl) — 11×11 board
// Seat 0 = Defenders (King + 12 soldiers), Seat 1 = Attackers (24 pieces)
// King starts at center (5,5). Defenders surround center. Attackers start at edges.
// Pieces move like rooks (any distance, no jumping).
// Capture: sandwich opponent orthogonally between two of yours.
// King captured if surrounded on all 4 orthogonal sides.
// Defenders win if King reaches a corner. Attackers win if they capture the King.

export const SIZE = 11;
export const CENTER: readonly [number, number] = [5, 5];
export const CORNERS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [0, 10], [10, 0], [10, 10],
];

export type Cell = "D" | "K" | "A" | null; // Defender, King, Attacker, empty

export interface HnefataflSettings { dummy?: string }

export interface HnefataflState {
  board: readonly Cell[];
  turn: 0 | 1; // 0 = defenders, 1 = attackers
  selected: number | null;
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: HnefataflSettings;
}

export type HnefataflAction =
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

function idx(r: number, c: number): number { return r * SIZE + c; }
function coord(pos: number): [number, number] { return [Math.floor(pos / SIZE), pos % SIZE]; }

export function initialState(seed: number, settings: HnefataflSettings): HnefataflState {
  const board: Cell[] = new Array(SIZE * SIZE).fill(null);

  // King at center
  board[idx(5, 5)] = "K";

  // Defenders around center (cross pattern)
  const defPositions: [number, number][] = [
    [3,5],[4,5],[6,5],[7,5],
    [5,3],[5,4],[5,6],[5,7],
    [4,4],[4,6],[6,4],[6,6],
  ];
  for (const [r, c] of defPositions) board[idx(r, c)] = "D";

  // Attackers on edges
  const atkPositions: [number, number][] = [
    // top
    [0,3],[0,4],[0,5],[0,6],[0,7],
    [1,5],
    // bottom
    [10,3],[10,4],[10,5],[10,6],[10,7],
    [9,5],
    // left
    [3,0],[4,0],[5,0],[6,0],[7,0],
    [5,1],
    // right
    [3,10],[4,10],[5,10],[6,10],[7,10],
    [5,9],
  ];
  for (const [r, c] of atkPositions) board[idx(r, c)] = "A";

  return { board, turn: 1, selected: null, winner: null, rngSeed: seed, settings };
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function isCorner(r: number, c: number): boolean {
  return CORNERS.some(([cr, cc]) => cr === r && cc === c);
}

// Restricted squares: corners and center — only King can enter
function isRestricted(r: number, c: number): boolean {
  return isCorner(r, c) || (r === 5 && c === 5);
}

export function legalMovesFrom(board: readonly Cell[], pos: number): number[] {
  const [r, c] = coord(pos);
  const piece = board[pos];
  if (piece === null) return [];
  const isKing = piece === "K";
  const moves: number[] = [];

  const DIRS: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]];
  for (const [dr, dc] of DIRS) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const target = board[idx(nr, nc)];
      if (target !== null) break;
      // Non-king pieces cannot enter restricted squares
      if (!isKing && isRestricted(nr, nc)) { nr += dr; nc += dc; continue; }
      moves.push(idx(nr, nc));
      nr += dr;
      nc += dc;
    }
  }
  return moves;
}

function captureAt(board: Cell[], r: number, c: number, attackerTurn: boolean): void {
  // After a move, check if pieces adjacent to (r,c) are captured
  const movedSeat = attackerTurn ? "A" : ["D", "K"];
  const oppPieces = attackerTurn ? ["D", "K"] : ["A"];

  const CAPTURE_DIRS: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]];
  for (const [dr, dc] of CAPTURE_DIRS) {
    const mr = r + dr; const mc = c + dc;
    if (!inBounds(mr, mc)) continue;
    const middle = board[idx(mr, mc)];
    if (!oppPieces.includes(middle as string)) continue;
    if (middle === "K") continue; // King needs special handling

    const br = r + 2 * dr; const bc = c + 2 * dc;
    const isHostile = (row: number, col: number): boolean => {
      if (!inBounds(row, col)) return false;
      const p = board[idx(row, col)];
      if (attackerTurn) return p === "A" || isCorner(row, col) || (row === 5 && col === 5 && p === null);
      return p === "D" || p === "K" || isCorner(row, col) || (row === 5 && col === 5 && p === null);
    };

    if (isHostile(br, bc)) {
      // Captured!
      board[idx(mr, mc)] = null;
    }
  }
  void movedSeat;
}

function isKingCaptured(board: readonly Cell[], kr: number, kc: number): boolean {
  // King is captured if surrounded on all 4 sides by attackers or board edge treated hostile
  let count = 0;
  const KDIRS: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]];
  for (const [dr, dc] of KDIRS) {
    const nr = kr + dr; const nc = kc + dc;
    if (!inBounds(nr, nc)) { count++; continue; }
    if (board[idx(nr, nc)] === "A") count++;
  }
  return count === 4;
}

function findKing(board: readonly Cell[]): [number, number] | null {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "K") return coord(i);
  }
  return null;
}

function checkWinner(board: readonly Cell[]): 0 | 1 | null {
  const kPos = findKing(board);
  if (kPos === null) return 1; // King captured
  const [kr, kc] = kPos;
  if (isCorner(kr, kc)) return 0; // King escaped
  if (isKingCaptured(board, kr, kc)) return 1;
  return null;
}

function hasAnyMove(board: readonly Cell[], seat: 0 | 1): boolean {
  return board.some((cell, pos) => {
    if (seat === 0 && cell !== "D" && cell !== "K") return false;
    if (seat === 1 && cell !== "A") return false;
    return legalMovesFrom(board, pos).length > 0;
  });
}

// Minimax bot
interface BotState {
  board: readonly Cell[];
  turn: 0 | 1;
}

type BotMove = { from: number; to: number };

function botMoves(s: BotState): BotMove[] {
  const moves: BotMove[] = [];
  s.board.forEach((cell, from) => {
    if (s.turn === 0 && cell !== "D" && cell !== "K") return;
    if (s.turn === 1 && cell !== "A") return;
    for (const to of legalMovesFrom(s.board, from)) {
      moves.push({ from, to });
    }
  });
  return moves;
}

function applyBotMove(s: BotState, move: BotMove): BotState {
  const board = [...s.board] as Cell[];
  const [tr, tc] = coord(move.to);
  board[move.to] = board[move.from] ?? null;
  board[move.from] = null;

  // Capture check
  captureAt(board, tr, tc, s.turn === 1);

  // King capture check
  const kPos = findKing(board);
  if (kPos) {
    const [kr, kc] = kPos;
    if (isKingCaptured(board, kr, kc)) board[idx(kr, kc)] = null;
  }

  return { board, turn: s.turn === 0 ? 1 : 0 };
}

function evaluateBot(s: BotState): number {
  const kPos = findKing(s.board);
  if (!kPos) return 1000; // attacker wins
  const [kr, kc] = kPos;
  if (isCorner(kr, kc)) return -1000; // defender wins
  // Attacker heuristic: minimize distance of king to nearest corner
  const minDist = CORNERS.reduce((d, [cr, cc]) => Math.min(d, Math.abs(kr - cr) + Math.abs(kc - cc)), 999);
  const attackers = s.board.filter(c => c === "A").length;
  const defenders = s.board.filter(c => c === "D").length;
  // bot = attacker (seat 1) maximizes
  return (16 - defenders) * 5 - minDist * 3 + (24 - attackers) * (-2);
}

function botIsTerminal(s: BotState): boolean {
  const w = checkWinner(s.board);
  if (w !== null) return true;
  return !hasAnyMove(s.board, s.turn);
}

function getBotMove(state: HnefataflState): BotMove | null {
  const bs: BotState = { board: state.board, turn: state.turn };
  const result = minimax<BotState, BotMove>(bs, {
    depth: 2,
    moves: botMoves,
    apply: applyBotMove,
    isTerminal: botIsTerminal,
    evaluate: evaluateBot,
    maximizing: (s) => s.turn === 1,
  });
  return result.move;
}

function applyMoveToState(state: HnefataflState, from: number, to: number): HnefataflState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const board = [...state.board] as Cell[];
  const [tr, tc] = coord(to);
  board[to] = board[from] ?? null;
  board[from] = null;

  captureAt(board, tr, tc, state.turn === 1);

  const kPos = findKing(board);
  if (kPos) {
    const [kr, kc] = kPos;
    if (isKingCaptured(board, kr, kc)) board[idx(kr, kc)] = null;
  }

  const winner = checkWinner(board);
  const nextTurn = (state.turn === 0 ? 1 : 0) as 0 | 1;
  return { ...state, board, turn: nextTurn, selected: null, winner, rngSeed: nextSeed };
}

function runBotMoves(state: HnefataflState): HnefataflState {
  let s = state;
  let limit = 5;
  while (s.winner === null && s.turn === 1 && limit-- > 0) {
    const move = getBotMove(s);
    if (!move) break;
    s = applyMoveToState(s, move.from, move.to);
  }
  return s;
}

export function reducer(state: HnefataflState, action: HnefataflAction): HnefataflState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state; // only player (defenders) can act

  if (action.type === "select") {
    const cell = state.board[action.pos];
    if (cell !== "D" && cell !== "K") return state;
    return { ...state, selected: action.pos };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    const legal = legalMovesFrom(state.board, state.selected);
    if (!legal.includes(action.to)) return state;
    const next = applyMoveToState(state, state.selected, action.to);
    if (next.winner !== null) return next;
    return runBotMoves(next);
  }

  return state;
}

export function isTerminal(state: HnefataflState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
