import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tawlbwrdd: Welsh tafl game on an 11×11 board.
// King at center (5,5). 12 defenders surrounding king. 24 attackers on edges.
// Same rules as hnefatafl: custodian capture, king needs 4 sides to capture,
// king reaches corner to win.

export const N = 11;
export const CENTER = 5 * N + 5; // index 60

export type Piece = "king" | "defender" | "attacker";
export type Cell = Piece | null;

export interface TawlbwrddSettings { dummy?: string; }

export interface TawlbwrddState {
  board: readonly Cell[];
  turn: "defender" | "attacker";
  winner: "defender" | "attacker" | null;
  selected: number | null;
  rngSeed: number;
  settings: TawlbwrddSettings;
}

export type TawlbwrddAction =
  | { type: "select"; cell: number }
  | { type: "move"; from: number; to: number };

function rc(i: number): [number, number] { return [Math.floor(i / N), i % N]; }
function idx(r: number, c: number): number { return r * N + c; }
function inB(r: number, c: number): boolean { return r >= 0 && r < N && c >= 0 && c < N; }
function isCorner(i: number): boolean {
  const [r, c] = rc(i);
  return (r === 0 || r === N - 1) && (c === 0 || c === N - 1);
}

function sideOf(p: Cell): "defender" | "attacker" | null {
  if (p === "king" || p === "defender") return "defender";
  if (p === "attacker") return "attacker";
  return null;
}

export function initialState(seed: number, settings: TawlbwrddSettings): TawlbwrddState {
  const board: Cell[] = new Array(N * N).fill(null);
  board[CENTER] = "king";

  // 12 defenders in cross around king
  const defOffsets: [number, number][] = [
    [-1,0],[-2,0],[-3,0],[1,0],[2,0],[3,0],
    [0,-1],[0,-2],[0,-3],[0,1],[0,2],[0,3],
  ];
  for (const [dr, dc] of defOffsets) {
    board[idx(5 + dr, 5 + dc)] = "defender";
  }

  // 24 attackers: 6 on each side edge group
  const atkPositions: [number,number][] = [
    // top
    [0,3],[0,4],[0,5],[0,6],[0,7],[1,5],
    // bottom
    [10,3],[10,4],[10,5],[10,6],[10,7],[9,5],
    // left
    [3,0],[4,0],[5,0],[6,0],[7,0],[5,1],
    // right
    [3,10],[4,10],[5,10],[6,10],[7,10],[5,9],
  ];
  for (const [r, c] of atkPositions) board[idx(r, c)] = "attacker";

  return { board, turn: "attacker", winner: null, selected: null, rngSeed: seed, settings };
}

function isHostile(board: readonly Cell[], pos: number, forSide: "defender" | "attacker"): boolean {
  if (isCorner(pos)) return true;
  if (pos === CENTER && board[CENTER] === null) return true;
  const p = board[pos] ?? null;
  return sideOf(p) !== null && sideOf(p) !== forSide;
}

function getCaptures(board: Cell[], to: number, movingSide: "defender" | "attacker"): number[] {
  const [tr, tc] = rc(to);
  const captured: number[] = [];
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
    const nr = tr + dr, nc = tc + dc;
    if (!inB(nr, nc)) continue;
    const neighbor = idx(nr, nc);
    const np = board[neighbor] ?? null;
    if (!np || sideOf(np) === movingSide || np === "king") continue;
    const fr = nr + dr, fc = nc + dc;
    if (!inB(fr, fc)) continue;
    if (isHostile(board, idx(fr, fc), sideOf(np)!)) captured.push(neighbor);
  }
  return captured;
}

function isKingCaptured(board: readonly Cell[], kingPos: number): boolean {
  const [kr, kc] = rc(kingPos);
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]] as [number,number][]) {
    const nr = kr + dr, nc = kc + dc;
    if (!inB(nr, nc)) return false;
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
    while (inB(nr, nc)) {
      const ni = idx(nr, nc);
      if (board[ni] !== null) break;
      if (isCorner(ni) && piece !== "king") break;
      if (ni === CENTER && piece !== "king") { nr += dr; nc += dc; continue; }
      moves.push(ni);
      nr += dr; nc += dc;
    }
  }
  return moves;
}

function applyMove(state: TawlbwrddState, from: number, to: number): TawlbwrddState {
  const rng = mulberry32(state.rngSeed);
  const ns = Math.floor(rng() * 2 ** 31);
  const board = [...state.board] as Cell[];
  const piece = board[from]!;
  board[to] = piece; board[from] = null;
  const movingSide = sideOf(piece)!;
  for (const c of getCaptures(board, to, movingSide)) board[c] = null;
  if (piece === "king" && isCorner(to)) return { ...state, rngSeed: ns, board, winner: "defender", selected: null };
  const kingPos = board.indexOf("king");
  if (kingPos < 0 || isKingCaptured(board, kingPos)) return { ...state, rngSeed: ns, board, winner: "attacker", selected: null };
  const nextTurn = movingSide === "attacker" ? "defender" : "attacker";
  return { ...state, rngSeed: ns, board, turn: nextTurn, selected: null };
}

function allMoves(board: readonly Cell[], side: "defender" | "attacker"): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let i = 0; i < N * N; i++) {
    if (sideOf(board[i] ?? null) !== side) continue;
    for (const to of getLegalMoves(board, i)) result.push([i, to]);
  }
  return result;
}

function runBot(state: TawlbwrddState): TawlbwrddState {
  const rng = mulberry32(state.rngSeed);
  const moves = allMoves(state.board, state.turn);
  if (moves.length === 0) return state;
  const pick = moves[Math.floor(rng() * moves.length)]!;
  return applyMove(state, pick[0], pick[1]);
}

export function reducer(state: TawlbwrddState, action: TawlbwrddAction): TawlbwrddState {
  if (state.winner !== null) return state;
  if (action.type === "select") {
    const p = state.board[action.cell] ?? null;
    if (!p || sideOf(p) !== "defender") return { ...state, selected: null };
    return { ...state, selected: action.cell };
  }
  if (action.type === "move") {
    if (state.turn !== "defender" || state.board[action.from] === null) return state;
    if (sideOf(state.board[action.from] ?? null) !== "defender") return state;
    if (!getLegalMoves(state.board, action.from).includes(action.to)) return state;
    const next = applyMove(state, action.from, action.to);
    if (next.winner !== null || next.turn !== "attacker") return next;
    return runBot(next);
  }
  return state;
}

export function isTerminal(state: TawlbwrddState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "defender" ? 100 : 0 };
}
