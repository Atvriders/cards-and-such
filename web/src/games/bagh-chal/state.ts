import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Bagh Chal (Tigers and Goats) — Nepal traditional game
// 5×5 intersections with diagonal connections at alternating squares
// 4 Tigers vs 20 Goats (player controls Goats)
// Phase 1: Goats are placed one at a time (20 total); Tigers move each turn
// Phase 2: All goats placed; goats move to adjacent empty points
// Tigers win by capturing 5 goats (jump over adjacent goat to empty point beyond)
// Goats win by trapping all 4 tigers so none can move

export const INTERSECTIONS = 25; // 5×5
const SIZE = 5;

function pos(r: number, c: number): number { return r * SIZE + c; }
function rowOf(p: number): number { return Math.floor(p / SIZE); }
function colOf(p: number): number { return p % SIZE; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }

// Adjacency: orthogonal always; diagonal only when (r+c) is even
function getAdjacent(p: number): number[] {
  const r = rowOf(p); const c = colOf(p);
  const result: number[] = [];
  const orth: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of orth) {
    const nr = r + dr; const nc = c + dc;
    if (inBounds(nr, nc)) result.push(pos(nr, nc));
  }
  if ((r + c) % 2 === 0) {
    const diag: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diag) {
      const nr = r + dr; const nc = c + dc;
      if (inBounds(nr, nc)) result.push(pos(nr, nc));
    }
  }
  return result;
}

// Directions (dr, dc) available from a point
function getDirs(p: number): [number, number][] {
  const r = rowOf(p); const c = colOf(p);
  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  if ((r + c) % 2 === 0) {
    dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }
  return dirs;
}

export type Cell = "tiger" | "goat" | null;
export type Board = Cell[];

export interface BaghChalSettings {
  opponent: "bot";
}

// player = "goat" (human), bot = "tiger"
export interface BaghChalState {
  settings: BaghChalSettings;
  rngSeed: number;
  board: Board;
  phase: "place" | "move"; // goat placement vs full movement
  goatsToPlace: number;    // decreases from 20 to 0
  goatsCaptured: number;   // tigers win at 5
  turn: "goat" | "tiger";
  selected: number | null; // for goat move phase
  winner: "goat" | "tiger" | null;
}

export type BaghChalAction =
  | { type: "place"; at: number }           // place a goat (phase: place, turn: goat)
  | { type: "select"; pos: number }         // select goat for movement (phase: move)
  | { type: "move"; from: number; to: number }; // move selected goat

export function initialState(seed: number, settings: BaghChalSettings): BaghChalState {
  const board: Board = new Array(INTERSECTIONS).fill(null);
  // Tigers start at 4 corners
  board[pos(0, 0)] = "tiger";
  board[pos(0, 4)] = "tiger";
  board[pos(4, 0)] = "tiger";
  board[pos(4, 4)] = "tiger";

  return {
    settings,
    rngSeed: seed,
    board,
    phase: "place",
    goatsToPlace: 20,
    goatsCaptured: 0,
    turn: "goat",
    selected: null,
    winner: null,
  };
}

// ----- Tiger moves -----

export interface TigerMove {
  from: number;
  to: number;
  captured: number | null;
}

function tigerMoves(board: Board, from: number): TigerMove[] {
  const moves: TigerMove[] = [];
  for (const [dr, dc] of getDirs(from)) {
    const r = rowOf(from); const c = colOf(from);
    const nr = r + dr; const nc = c + dc;
    if (!inBounds(nr, nc)) continue;
    const adj = pos(nr, nc);
    if (board[adj] === null) {
      moves.push({ from, to: adj, captured: null });
    } else if (board[adj] === "goat") {
      // Try jump
      const lr = nr + dr; const lc = nc + dc;
      if (inBounds(lr, lc) && board[pos(lr, lc)] === null) {
        moves.push({ from, to: pos(lr, lc), captured: adj });
      }
    }
  }
  return moves;
}

export function allTigerMoves(board: Board): TigerMove[] {
  const moves: TigerMove[] = [];
  for (let p = 0; p < INTERSECTIONS; p++) {
    if (board[p] === "tiger") {
      moves.push(...tigerMoves(board, p));
    }
  }
  return moves;
}

// ----- Goat moves -----

export interface GoatMove {
  from: number;
  to: number;
}

export function allGoatMoves(board: Board): GoatMove[] {
  const moves: GoatMove[] = [];
  for (let p = 0; p < INTERSECTIONS; p++) {
    if (board[p] !== "goat") continue;
    for (const adj of getAdjacent(p)) {
      if (board[adj] === null) moves.push({ from: p, to: adj });
    }
  }
  return moves;
}

// ----- Bot (tiger, random) -----

function runTiger(state: BaghChalState): BaghChalState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const moves = allTigerMoves(state.board);

  if (moves.length === 0) {
    return { ...state, rngSeed: nextSeed, winner: "goat" };
  }

  // Prefer capture moves
  const captures = moves.filter((m) => m.captured !== null);
  const pool = captures.length > 0 ? captures : moves;
  const move = pool[Math.floor(rng() * pool.length)]!;

  const nb = [...state.board];
  nb[move.from] = null;
  nb[move.to] = "tiger";
  let captured = state.goatsCaptured;
  if (move.captured !== null) {
    nb[move.captured] = null;
    captured++;
  }

  if (captured >= 5) {
    return { ...state, rngSeed: nextSeed, board: nb, goatsCaptured: captured, winner: "tiger" };
  }

  // Check if goats can still move (in move phase)
  const nextPhase = state.phase;
  const nextGoatsToPlace = state.goatsToPlace;

  return {
    ...state,
    rngSeed: nextSeed,
    board: nb,
    goatsCaptured: captured,
    turn: "goat",
    phase: nextPhase,
    goatsToPlace: nextGoatsToPlace,
  };
}

// ----- Reducer -----

export function reducer(state: BaghChalState, action: BaghChalAction): BaghChalState {
  if (state.winner !== null) return state;

  if (action.type === "place") {
    if (state.turn !== "goat" || state.phase !== "place") return state;
    if (state.board[action.at] !== null) return state;

    const nb = [...state.board];
    nb[action.at] = "goat";
    const remaining = state.goatsToPlace - 1;
    const newPhase = remaining === 0 ? "move" : "place";

    const afterGoat: BaghChalState = {
      ...state,
      board: nb,
      goatsToPlace: remaining,
      phase: newPhase,
      turn: "tiger",
    };

    return runTiger(afterGoat);
  }

  if (action.type === "select") {
    if (state.turn !== "goat" || state.phase !== "move") return state;
    if (state.board[action.pos] !== "goat") return state;
    return { ...state, selected: action.pos };
  }

  if (action.type === "move") {
    if (state.turn !== "goat" || state.phase !== "move") return state;
    if (state.selected === null) return state;
    if (action.from !== state.selected) return state;

    const moves = allGoatMoves(state.board);
    const match = moves.find((m) => m.from === action.from && m.to === action.to);
    if (!match) return state;

    const nb = [...state.board];
    nb[match.from] = null;
    nb[match.to] = "goat";

    // Check if tigers are all trapped (goats win)
    const tigerMovesAfter = allTigerMoves(nb);
    if (tigerMovesAfter.length === 0) {
      return { ...state, board: nb, winner: "goat", selected: null };
    }

    return runTiger({ ...state, board: nb, turn: "tiger", selected: null });
  }

  return state;
}

export function isTerminal(state: BaghChalState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "goat" ? 25 : 0 };
}
