import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { minimax } from "../../engines/grid/minimax.js";

// Yoté — West African game on a 5×6 grid.
// Each player has 12 stones to place and move.
// Players first place stones one per turn onto empty squares, then move them.
// Move: slide 1 orthogonal step to adjacent empty cell.
// Jump capture: jump over an adjacent opponent stone to an empty cell beyond it
//   AND remove an additional opponent stone of your choice (the "bonus" capture).
//   Captures are mandatory if available.
// Win: capture all opponent stones.
//
// Simplification for 1P: no bonus stone removal (removes complexity); bot is greedy.

export type Player = 0 | 1;
export type Cell = Player | null;

export interface YoteState {
  board: Cell[]; // 5 rows × 6 cols = 30 cells, row-major
  inHand: [number, number]; // stones still to place [human, bot]
  turn: Player;
  winner: Player | null;
  selected: number | null;
  phase: "place" | "move"; // are we still placing?
  rngSeed: number;
  movesMade: number;
}

export type YoteAction =
  | { type: "place"; to: number }
  | { type: "select"; idx: number }
  | { type: "move"; to: number };

export function rc(row: number, col: number): number { return row * 6 + col; }
export function rowOf(idx: number): number { return Math.floor(idx / 6); }
export function colOf(idx: number): number { return idx % 6; }

const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 5 && c >= 0 && c < 6;
}

export interface YoteMove {
  from: number | "hand";
  to: number;
  captured?: number; // index of captured piece
}

export function getMovesFor(board: Cell[], inHand: number, player: Player): YoteMove[] {
  const moves: YoteMove[] = [];
  const opp: Player = player === 0 ? 1 : 0;

  // Placement moves
  if (inHand > 0) {
    for (let i = 0; i < 30; i++) {
      if (board[i] === null) moves.push({ from: "hand", to: i });
    }
  }

  // Board moves
  for (let i = 0; i < 30; i++) {
    if (board[i] !== player) continue;
    const r = rowOf(i), c = colOf(i);
    for (const d of DIRS) {
      const dr = d[0]!, dc = d[1]!;
      const nr = r + dr, nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const ni = rc(nr, nc);
      if (board[ni] === null) {
        moves.push({ from: i, to: ni });
      } else if (board[ni] === opp) {
        // Jump
        const jr = nr + dr, jc = nc + dc;
        if (inBounds(jr, jc) && board[rc(jr, jc)] === null) {
          moves.push({ from: i, to: rc(jr, jc), captured: ni });
        }
      }
    }
  }

  return moves;
}

// Separate capture moves from normal (for mandatory capture logic)
export function getCapturesFor(board: Cell[], player: Player): YoteMove[] {
  return getMovesFor(board, 0, player).filter((m) => m.captured !== undefined);
}

function countPieces(board: Cell[], player: Player): number {
  return board.filter((c) => c === player).length;
}

function evalYote(board: Cell[], inHand: [number, number]): number {
  const myPieces = countPieces(board, 1) + inHand[1];
  const oppPieces = countPieces(board, 0) + inHand[0];
  return myPieces - oppPieces;
}

interface BotState { board: Cell[]; inHand: [number, number]; turn: Player }

function getBotMove(state: YoteState): YoteMove | null {
  const res = minimax<BotState, YoteMove>(
    { board: state.board, inHand: state.inHand, turn: 1 },
    {
      depth: 2,
      moves(s) {
        const all = getMovesFor(s.board, s.inHand[s.turn], s.turn);
        const caps = all.filter((m) => m.captured !== undefined);
        return caps.length > 0 ? caps : all;
      },
      apply(s, m) {
        const nb = [...s.board];
        const ni = [...s.inHand] as [number, number];
        if (m.from === "hand") {
          ni[s.turn]--;
          nb[m.to] = s.turn;
        } else {
          nb[m.from as number] = null;
          nb[m.to] = s.turn;
        }
        if (m.captured !== undefined) nb[m.captured] = null;
        return { board: nb, inHand: ni, turn: s.turn === 0 ? 1 : 0 };
      },
      isTerminal(s) {
        return countPieces(s.board, 0) + s.inHand[0] === 0
          || countPieces(s.board, 1) + s.inHand[1] === 0;
      },
      evaluate(s) { return evalYote(s.board, s.inHand); },
      maximizing(s) { return s.turn === 1; },
    }
  );
  return res.move;
}

export function initialState(seed: number): YoteState {
  return {
    board: new Array(30).fill(null),
    inHand: [12, 12],
    turn: 0,
    winner: null,
    selected: null,
    phase: "place",
    rngSeed: seed,
    movesMade: 0,
  };
}

function checkWinner(board: Cell[], inHand: [number, number]): Player | null {
  if (countPieces(board, 0) + inHand[0] === 0) return 1;
  if (countPieces(board, 1) + inHand[1] === 0) return 0;
  return null;
}

function applyYoteMove(state: YoteState, move: YoteMove, player: Player): YoteState {
  const nb = [...state.board] as Cell[];
  const ni = [...state.inHand] as [number, number];
  if (move.from === "hand") {
    ni[player]--;
    nb[move.to] = player;
  } else {
    nb[move.from as number] = null;
    nb[move.to] = player;
  }
  if (move.captured !== undefined) nb[move.captured] = null;
  const winner = checkWinner(nb, ni);
  // Check if placement phase is over
  const phase: "place" | "move" = (ni[0] > 0 || ni[1] > 0) ? "place" : "move";
  return { ...state, board: nb, inHand: ni, winner, phase, movesMade: state.movesMade + 1 };
}

function runBot(state: YoteState): YoteState {
  let s = state;
  while (s.turn === 1 && s.winner === null) {
    const rng = mulberry32(s.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const mv = getBotMove(s);
    if (!mv) return { ...s, winner: 0, rngSeed: nextSeed };
    s = { ...applyYoteMove(s, mv, 1), turn: 0, selected: null, rngSeed: nextSeed };
    break;
  }
  return s;
}

export function reducer(state: YoteState, action: YoteAction): YoteState {
  if (state.winner !== null || state.turn !== 0) return state;

  if (action.type === "place") {
    if (state.inHand[0] === 0) return state;
    if (state.board[action.to] !== null) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const mv: YoteMove = { from: "hand", to: action.to };
    let next: YoteState = { ...applyYoteMove(state, mv, 0), turn: 1 as Player, selected: null, rngSeed: nextSeed };
    if (next.winner !== null) return next;
    next = runBot(next);
    return next;
  }

  if (action.type === "select") {
    if (state.board[action.idx] !== 0) return state;
    return { ...state, selected: state.selected === action.idx ? null : action.idx };
  }

  if (action.type === "move") {
    if (state.selected === null) return state;
    const moves = getMovesFor(state.board, state.inHand[0], 0);
    const captures = moves.filter((m) => m.captured !== undefined);
    const pool = captures.length > 0 ? captures : moves;
    const mv = pool.find((m) => m.from === state.selected && m.to === action.to);
    if (!mv) return state;
    const rng = mulberry32(state.rngSeed);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    let next: YoteState = { ...applyYoteMove(state, mv, 0), turn: 1 as Player, selected: null, rngSeed: nextSeed };
    if (next.winner !== null) return next;
    next = runBot(next);
    return next;
  }

  return state;
}

export function isTerminal(state: YoteState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
