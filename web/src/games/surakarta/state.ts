import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Surakarta — 6×6 board.
// Each player starts with 12 pieces on their two home rows.
// Normal move: 1 step to adjacent empty cell (orthogonal or diagonal).
// Loop capture: travel along the curved loops at corners to land on
// and capture an opponent piece. A loop capture MUST cross at least
// one of the 4 corner circles.
//
// We label the 4 loops by the corner arcs they serve:
//   Each corner has two arc radii (inner r=1 and outer r=2 in grid-units).
// Canonical loop paths (rows/cols 0-5):
//   TL-inner:  row1->row0 col1; col0->col1 row1 (wrap around q=0,r=0 corner, inner)
//   etc.
//
// Simplification: We enumerate loop-capture moves by tracing along
// the 8 loop tracks (4 corners × 2 arcs). A piece that travels the
// full arc (enters + exits the curve) and lands on an opponent piece
// captures it.

export type Player = 0 | 1; // 0 = human (bottom rows), 1 = bot (top rows)
export type Cell = Player | null;

export interface SurakartaState {
  board: Cell[]; // 6×6 row-major, row 0 = top
  turn: Player;
  winner: Player | null;
  selected: number | null; // index of selected piece
  rngSeed: number;
  movesMade: number;
}

export type SurakartaAction =
  | { type: "select"; idx: number }
  | { type: "move"; to: number };

// index helpers
export function rc(row: number, col: number): number { return row * 6 + col; }
export function row(idx: number): number { return Math.floor(idx / 6); }
export function col(idx: number): number { return idx % 6; }

// Orthogonal + diagonal neighbors
const DELTAS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

export function normalMoves(board: Cell[], from: number, player: Player): number[] {
  const r = row(from), c = col(from);
  const targets: number[] = [];
  for (const d of DELTAS) {
    const dr = d[0]!, dc = d[1]!;
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr > 5 || nc < 0 || nc > 5) continue;
    const ni = rc(nr, nc);
    if (board[ni] === null) targets.push(ni);
  }
  return targets;
}

// The 8 loop tracks. Each track is a sequence of board indices.
// A loop capture: piece travels along track from its starting position,
// through the arc, and captures the first opponent piece it hits AFTER
// crossing the arc (changing direction around a corner).
//
// Tracks are defined as [col/row sequences] traversing the arc.
// Inner arcs involve rows/cols 1 and outer arcs rows/cols 0 and cols 5/rows 5.

// We define each loop track as an ordered array of board cells it passes through.
// A piece enters the track, traverses any portion of it, and must pass the
// corner arc before it can capture.

// Simplified: define loops as cyclic sequences; piece can enter from any point
// and travel in one direction. Capture happens if it crosses an arc segment
// (the 4 curved cells near each corner) and hits an opponent.

// We define the 4 inner loops and 4 outer loops.
// Inner loop: the cells on the inner rail (row/col = 1 or 4).
// Outer loop: the cells on the outer rail (row/col = 0 or 5).

// Inner loop track (clockwise):
//   row1, col1..4  → col4, row1..4 → row4, col4..1 → col1, row4..1
// Outer loop track (clockwise):
//   row0, col0..5 → col5, row0..5 → row5, col5..0 → col0, row5..0

function buildLoop(cells: number[]): number[] { return cells; }

const INNER_LOOP: number[] = buildLoop([
  rc(1,1), rc(1,2), rc(1,3), rc(1,4),
  rc(2,4), rc(3,4), rc(4,4),
  rc(4,3), rc(4,2), rc(4,1),
  rc(3,1), rc(2,1),
]);

const OUTER_LOOP: number[] = buildLoop([
  rc(0,0), rc(0,1), rc(0,2), rc(0,3), rc(0,4), rc(0,5),
  rc(1,5), rc(2,5), rc(3,5), rc(4,5), rc(5,5),
  rc(5,4), rc(5,3), rc(5,2), rc(5,1), rc(5,0),
  rc(4,0), rc(3,0), rc(2,0), rc(1,0),
]);

// Arc segments (positions that mark "the corner arc" — crossing these counts as using the loop).
// We just require the piece to travel at least one "turn corner" in the sequence.
// Simplified: any move that uses the loop track and travels at least 2 steps captures.

function loopCaptures(board: Cell[], from: number, player: Player): number[] {
  const opp: Player = player === 0 ? 1 : 0;
  const targets: number[] = [];

  for (const loop of [INNER_LOOP, OUTER_LOOP]) {
    const pos = loop.indexOf(from);
    if (pos === -1) continue;
    const n = loop.length;

    // Travel clockwise
    for (let dir = 0; dir < 2; dir++) {
      let arcCrossed = false;
      for (let step = 1; step < n; step++) {
        const ni = dir === 0
          ? loop[(pos + step) % n]!
          : loop[(pos - step + n) % n]!;
        // Count as arc crossing after step 2 (at minimum traverses a corner-style segment)
        if (step >= 2) arcCrossed = true;
        const cell = board[ni];
        if (cell === player) break; // own piece blocks
        if (cell === opp) {
          if (arcCrossed) targets.push(ni);
          break; // can only capture first opponent piece
        }
        // empty cell: keep going (can only STOP on opponent, not empty via loop)
      }
    }
  }

  // deduplicate
  return [...new Set(targets)];
}

export function legalMoves(board: Cell[], from: number, player: Player): number[] {
  if (board[from] !== player) return [];
  const normals = normalMoves(board, from, player);
  const captures = loopCaptures(board, from, player);
  return [...normals, ...captures];
}

function countPieces(board: Cell[], player: Player): number {
  return board.filter((c) => c === player).length;
}

function evalSurakarta(board: Cell[]): number {
  return countPieces(board, 1) - countPieces(board, 0);
}

interface BotState { board: Cell[]; turn: Player }

interface BotMove { from: number; to: number }

function allMovesFor(board: Cell[], player: Player): BotMove[] {
  const moves: BotMove[] = [];
  for (let i = 0; i < 36; i++) {
    if (board[i] !== player) continue;
    for (const to of legalMoves(board, i, player)) {
      moves.push({ from: i, to });
    }
  }
  return moves;
}

function applyMove(board: Cell[], from: number, to: number, player: Player): Cell[] {
  const nb = [...board];
  nb[from] = null;
  nb[to] = player;
  return nb;
}

function getBotMove(state: SurakartaState): BotMove | null {
  const res = minimax<BotState, BotMove>(
    { board: state.board, turn: 1 },
    {
      depth: 2,
      moves(s) { return allMovesFor(s.board, s.turn); },
      apply(s, m) {
        const nb = applyMove(s.board, m.from, m.to, s.turn);
        return { board: nb, turn: s.turn === 0 ? 1 : 0 };
      },
      isTerminal(s) { return countPieces(s.board, 0) === 0 || countPieces(s.board, 1) === 0; },
      evaluate(s) { return evalSurakarta(s.board); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return res.move;
}

export function initialState(seed: number): SurakartaState {
  const board: Cell[] = new Array(36).fill(null);
  // Bot (1) = top two rows: 0-11
  for (let i = 0; i < 12; i++) board[i] = 1;
  // Human (0) = bottom two rows: 24-35
  for (let i = 24; i < 36; i++) board[i] = 0;
  return { board, turn: 0, winner: null, selected: null, rngSeed: seed, movesMade: 0 };
}

function checkWinner(board: Cell[]): Player | null {
  if (countPieces(board, 0) === 0) return 1;
  if (countPieces(board, 1) === 0) return 0;
  return null;
}

function runBot(state: SurakartaState): SurakartaState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const mv = getBotMove(s);
    if (!mv) return { ...s, winner: 0, rngSeed: nextSeed };
    const nb = applyMove(s.board, mv.from, mv.to, 1);
    const winner = checkWinner(nb);
    s = { ...s, board: nb, winner, turn: 0, selected: null, movesMade: s.movesMade + 1, rngSeed: nextSeed };
    break;
  }
  return s;
}

export function reducer(state: SurakartaState, action: SurakartaAction): SurakartaState {
  if (state.winner !== null || state.turn !== 0) return state;

  if (action.type === "select") {
    const { idx } = action;
    if (state.board[idx] === 0) {
      return { ...state, selected: state.selected === idx ? null : idx };
    }
    // Click on opponent or empty — deselect
    return { ...state, selected: null };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    const moves = legalMoves(state.board, state.selected, 0);
    if (!moves.includes(action.to)) return state;

    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nb = applyMove(state.board, state.selected, action.to, 0);
    const winner = checkWinner(nb);
    let next: SurakartaState = { ...state, board: nb, winner, turn: 1, selected: null, movesMade: state.movesMade + 1, rngSeed: nextSeed };
    if (winner !== null) return next;
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: SurakartaState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
