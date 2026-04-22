import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Tablut — 9×9 Tafl variant (Finnish)
// Defenders: 8 soldiers + 1 King (center) vs Attackers: 16 pieces
// Seat 0 = Defenders (player), Seat 1 = Attackers (bot)
// Movement: rook-like (any distance, no jumping), restricted squares for non-kings
// Capture: sandwich orthogonally (same as Hnefatafl)
// King escapes to any EDGE square (not just corners — Finnish variant simplification)
// King captured: surrounded on all 4 sides by attackers (cross capture)
// Attackers move first in standard Tablut

export const SIZE = 9;
export const CENTER: readonly [number, number] = [4, 4];

export type Cell = "D" | "K" | "A" | null;

export interface TablutSettings { dummy?: string }

export interface TablutState {
  board: readonly Cell[];
  turn: 0 | 1; // 0 = defenders, 1 = attackers
  selected: number | null;
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: TablutSettings;
}

export type TablutAction =
  | { type: "select"; pos: number }
  | { type: "move"; to: number };

function idx(r: number, c: number): number { return r * SIZE + c; }
function coord(pos: number): [number, number] { return [Math.floor(pos / SIZE), pos % SIZE]; }

function inBounds(r: number, c: number): boolean { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }

function isEdge(r: number, c: number): boolean {
  return r === 0 || r === SIZE - 1 || c === 0 || c === SIZE - 1;
}

// Throne (center) is restricted for non-king pieces (acts hostile after king leaves)
function isThrone(r: number, c: number): boolean { return r === 4 && c === 4; }

export function initialState(seed: number, settings: TablutSettings): TablutState {
  const board: Cell[] = new Array(SIZE * SIZE).fill(null);

  // King at center
  board[idx(4, 4)] = "K";

  // Defenders (8) in cross around king
  const defPos: [number, number][] = [
    [2,4],[3,4],[5,4],[6,4],
    [4,2],[4,3],[4,5],[4,6],
  ];
  for (const [r, c] of defPos) board[idx(r, c)] = "D";

  // Attackers (16) on edges
  const atkPos: [number, number][] = [
    // top
    [0,3],[0,4],[0,5],
    [1,4],
    // bottom
    [8,3],[8,4],[8,5],
    [7,4],
    // left
    [3,0],[4,0],[5,0],
    [4,1],
    // right
    [3,8],[4,8],[5,8],
    [4,7],
  ];
  for (const [r, c] of atkPos) board[idx(r, c)] = "A";

  return { board, turn: 1, selected: null, winner: null, rngSeed: seed, settings };
}

export function legalMovesFrom(board: readonly Cell[], pos: number): number[] {
  const [r, c] = coord(pos);
  const piece = board[pos];
  if (piece === null) return [];
  const isKing = piece === "K";
  const moves: number[] = [];

  const DIRS: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]];
  for (const [dr, dc] of DIRS) {
    let nr = r + dr; let nc = c + dc;
    while (inBounds(nr, nc)) {
      if (board[idx(nr, nc)] !== null) break;
      // Throne is restricted for non-kings
      if (!isKing && isThrone(nr, nc)) { nr += dr; nc += dc; continue; }
      moves.push(idx(nr, nc));
      nr += dr; nc += dc;
    }
  }
  return moves;
}

// Check if a square is hostile (acts as an attacker for sandwiching)
function isHostileForDefenders(board: readonly Cell[], r: number, c: number): boolean {
  if (!inBounds(r, c)) return false;
  const p = board[idx(r, c)];
  return p === "A" || (isThrone(r, c) && p === null); // empty throne is hostile
}

function isHostileForAttackers(board: readonly Cell[], r: number, c: number): boolean {
  if (!inBounds(r, c)) return false;
  const p = board[idx(r, c)];
  return p === "D" || p === "K" || (isThrone(r, c) && p === null);
}

function captureAfterMove(board: Cell[], r: number, c: number, attackerMoved: boolean): void {
  const CAPTURE_DIRS: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]];
  for (const [dr, dc] of CAPTURE_DIRS) {
    const mr = r + dr; const mc = c + dc;
    if (!inBounds(mr, mc)) continue;
    const mid = board[idx(mr, mc)];
    const opp = attackerMoved ? ["D"] : ["A"]; // King handled separately
    if (!opp.includes(mid as string)) continue;

    const br = r + 2 * dr; const bc = c + 2 * dc;
    const hostile = attackerMoved
      ? isHostileForDefenders(board, br, bc)
      : isHostileForAttackers(board, br, bc);

    if (hostile) board[idx(mr, mc)] = null;
  }
}

function isKingCaptured(board: readonly Cell[], kr: number, kc: number): boolean {
  let count = 0;
  const KDIRS: [number, number][] = [[0,1],[0,-1],[1,0],[-1,0]];
  for (const [dr, dc] of KDIRS) {
    const nr = kr + dr; const nc = kc + dc;
    if (!inBounds(nr, nc)) { count++; continue; }
    if (board[idx(nr, nc)] === "A" || (isThrone(nr, nc) && board[idx(nr, nc)] === null)) count++;
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
  if (!kPos) return 1; // King captured
  const [kr, kc] = kPos;
  if (isEdge(kr, kc)) return 0; // King escaped to edge
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

interface BotState { board: readonly Cell[]; turn: 0 | 1 }
type BotMove = { from: number; to: number };

function botMoves(s: BotState): BotMove[] {
  const moves: BotMove[] = [];
  s.board.forEach((cell, from) => {
    if (s.turn === 0 && cell !== "D" && cell !== "K") return;
    if (s.turn === 1 && cell !== "A") return;
    for (const to of legalMovesFrom(s.board, from)) moves.push({ from, to });
  });
  return moves;
}

function applyBotMove(s: BotState, move: BotMove): BotState {
  const board = [...s.board] as Cell[];
  const [tr, tc] = coord(move.to);
  board[move.to] = board[move.from] ?? null;
  board[move.from] = null;

  captureAfterMove(board, tr, tc, s.turn === 1);

  const kPos = findKing(board);
  if (kPos) {
    const [kr, kc] = kPos;
    if (isKingCaptured(board, kr, kc)) board[idx(kr, kc)] = null;
  }

  return { board, turn: s.turn === 0 ? 1 : 0 };
}

function evaluateBot(s: BotState): number {
  const kPos = findKing(s.board);
  if (!kPos) return 1000;
  const [kr, kc] = kPos;
  if (isEdge(kr, kc)) return -1000;
  // Distance to nearest edge
  const distToEdge = Math.min(kr, SIZE - 1 - kr, kc, SIZE - 1 - kc);
  const attackers = s.board.filter(c => c === "A").length;
  const defenders = s.board.filter(c => c === "D").length;
  return (8 - defenders) * 4 - distToEdge * 5 + (16 - attackers) * (-2);
}

function botIsTerminal(s: BotState): boolean {
  const w = checkWinner(s.board);
  if (w !== null) return true;
  return !hasAnyMove(s.board, s.turn);
}

function getBotMove(state: TablutState): BotMove | null {
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

function applyMoveToState(state: TablutState, from: number, to: number): TablutState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const board = [...state.board] as Cell[];
  const [tr, tc] = coord(to);
  board[to] = board[from] ?? null;
  board[from] = null;

  captureAfterMove(board, tr, tc, state.turn === 1);

  const kPos = findKing(board);
  if (kPos) {
    const [kr, kc] = kPos;
    if (isKingCaptured(board, kr, kc)) board[idx(kr, kc)] = null;
  }

  const winner = checkWinner(board);
  const nextTurn = (state.turn === 0 ? 1 : 0) as 0 | 1;
  return { ...state, board, turn: nextTurn, selected: null, winner, rngSeed: nextSeed };
}

function runBotMoves(state: TablutState): TablutState {
  let s = state;
  let limit = 5;
  while (s.winner === null && s.turn === 1 && limit-- > 0) {
    const move = getBotMove(s);
    if (!move) break;
    s = applyMoveToState(s, move.from, move.to);
  }
  return s;
}

export function reducer(state: TablutState, action: TablutAction): TablutState {
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;

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

export function isTerminal(state: TablutState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
