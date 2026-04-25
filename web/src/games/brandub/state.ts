import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Brandub: Irish 7x7 tafl. King starts center, 4 defenders adjacent.
// 8 attackers on the sides. Attackers try to surround king; defenders escort king to corner.
// Custodian capture: piece flanked on 2 sides by enemies along rank/col is removed.
// King captured when surrounded on all 4 sides (or 3 + throne).

export const BOARD_SIZE = 7;
export const CENTER = 3 + 3 * BOARD_SIZE; // index 24

export type Piece = "king" | "defender" | "attacker";
export type Cell = Piece | null;

export interface BrandubSettings { dummy?: string; }

export interface BrandubState {
  board: readonly Cell[];
  turn: "defender" | "attacker";
  winner: "defender" | "attacker" | null;
  selected: number | null;
  rngSeed: number;
  settings: BrandubSettings;
}

export type BrandubAction =
  | { type: "select"; cell: number }
  | { type: "move"; from: number; to: number };

const N = BOARD_SIZE;

function rc(idx: number): [number, number] { return [Math.floor(idx / N), idx % N]; }
function idx(r: number, c: number): number { return r * N + c; }
function inBounds(r: number, c: number): boolean { return r >= 0 && r < N && c >= 0 && c < N; }

function isCorner(i: number): boolean {
  const [r, c] = rc(i);
  return (r === 0 || r === N - 1) && (c === 0 || c === N - 1);
}

export function initialState(seed: number, settings: BrandubSettings): BrandubState {
  const board: Cell[] = new Array(N * N).fill(null);
  // King at center (3,3)
  board[CENTER] = "king";
  // 4 defenders adjacent to king
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
    board[idx(3 + dr, 3 + dc)] = "defender";
  }
  // 8 attackers: 2 on each edge side
  const edgePositions: [number,number][] = [
    [0,3],[1,3],[5,3],[6,3], // top/bottom col 3
    [3,0],[3,1],[3,5],[3,6], // left/right row 3
  ];
  for (const [r, c] of edgePositions) board[idx(r, c)] = "attacker";
  return { board, turn: "attacker", winner: null, selected: null, rngSeed: seed, settings };
}

function sideOf(piece: Cell): "defender" | "attacker" | null {
  if (piece === "king" || piece === "defender") return "defender";
  if (piece === "attacker") return "attacker";
  return null;
}

function isHostile(board: readonly Cell[], pos: number, forSide: "defender" | "attacker"): boolean {
  // Corners and throne are hostile to everyone for capture purposes
  if (isCorner(pos)) return true;
  if (pos === CENTER && board[CENTER] === null) return true; // empty throne
  const p = board[pos] ?? null;
  return sideOf(p) !== null && sideOf(p) !== forSide;
}

function getCaptures(board: Cell[], from: number, to: number, movingSide: "defender" | "attacker"): number[] {
  const captured: number[] = [];
  const [tr, tc] = rc(to);
  const dirs: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    const nr = tr + dr, nc = tc + dc;
    if (!inBounds(nr, nc)) continue;
    const neighbor = idx(nr, nc);
    const np = board[neighbor] ?? null;
    if (np === null || sideOf(np) === movingSide || np === "king") continue;
    // Check flanker on other side
    const fr2 = nr + dr, fc2 = nc + dc;
    if (!inBounds(fr2, fc2)) continue;
    const flanker = idx(fr2, fc2);
    if (isHostile(board, flanker, sideOf(np as Cell)!)) {
      captured.push(neighbor);
    }
  }
  return captured;
}

function isKingCaptured(board: readonly Cell[], kingPos: number): boolean {
  // King captured if surrounded on 4 sides by attackers (or hostile squares)
  const [kr, kc] = rc(kingPos);
  const dirs: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    const nr = kr + dr, nc = kc + dc;
    if (!inBounds(nr, nc)) continue;
    const ni = idx(nr, nc);
    if (board[ni] !== "attacker" && !(ni === CENTER && board[CENTER] !== "king")) return false;
  }
  return true;
}

export function getLegalMoves(board: readonly Cell[], from: number): number[] {
  const piece = board[from];
  if (!piece) return [];
  const [fr, fc] = rc(from);
  const moves: number[] = [];
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
    let nr = fr + dr, nc = fc + dc;
    while (inBounds(nr, nc)) {
      const ni = idx(nr, nc);
      if (board[ni] !== null) break;
      // Only king can enter corner; no piece can stop on throne (CENTER) unless king
      if (isCorner(ni) && piece !== "king") break;
      if (ni === CENTER && piece !== "king") { nr += dr; nc += dc; continue; }
      moves.push(ni);
      nr += dr; nc += dc;
    }
  }
  return moves;
}

function applyMove(state: BrandubState, from: number, to: number): BrandubState {
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const board = [...state.board] as Cell[];
  const piece = board[from]!;
  board[to] = piece;
  board[from] = null;
  const movingSide = sideOf(piece)!;

  // Captures
  const caps = getCaptures(board, from, to, movingSide);
  for (const c of caps) board[c] = null;

  // Check win conditions
  // King reaches corner
  if (piece === "king" && isCorner(to)) {
    return { ...state, rngSeed: nextSeed, board, winner: "defender", selected: null };
  }
  // King captured
  const kingPos = board.indexOf("king");
  if (kingPos >= 0 && isKingCaptured(board, kingPos)) {
    return { ...state, rngSeed: nextSeed, board, winner: "attacker", selected: null };
  }
  if (kingPos < 0) {
    return { ...state, rngSeed: nextSeed, board, winner: "attacker", selected: null };
  }

  const nextTurn = movingSide === "attacker" ? "defender" : "attacker";
  return { ...state, rngSeed: nextSeed, board, turn: nextTurn, selected: null };
}

function getAllMoves(board: readonly Cell[], side: "defender" | "attacker"): Array<[number, number]> {
  const moves: Array<[number, number]> = [];
  for (let i = 0; i < N * N; i++) {
    if (sideOf(board[i] ?? null) !== side) continue;
    for (const to of getLegalMoves(board, i)) moves.push([i, to]);
  }
  return moves;
}

function runBot(state: BrandubState): BrandubState {
  const rng = mulberry32(state.rngSeed);
  const moves = getAllMoves(state.board, state.turn);
  if (moves.length === 0) return state;
  // Pick random move (simple bot)
  const pick = moves[Math.floor(rng() * moves.length)]!;
  return applyMove(state, pick[0], pick[1]);
}

export function reducer(state: BrandubState, action: BrandubAction): BrandubState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    const piece = state.board[action.cell];
    if (!piece || sideOf(piece) !== "defender") return { ...state, selected: null };
    return { ...state, selected: action.cell };
  }

  if (action.type === "move") {
    if (state.turn !== "defender") return state;
    const { from, to } = action;
    if (state.board[from] === null || sideOf(state.board[from] ?? null) !== "defender") return state;
    if (!getLegalMoves(state.board, from).includes(to)) return state;
    const next = applyMove(state, from, to);
    if (next.winner !== null || next.turn !== "attacker") return next;
    return runBot(next);
  }

  return state;
}

export function isTerminal(state: BrandubState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "defender" ? 100 : 0 };
}
