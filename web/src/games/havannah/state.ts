import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Havannah: hex board size 6 (11x11 hex grid, 91 cells).
// Two players alternate placing stones. Win by forming:
// 1. Ring: closed loop of your stones
// 2. Bridge: connects two corners
// 3. Fork: connects three edges (not corners)
//
// We use a simplified size-5 board (61 cells) for playability.

export const BASE = 5; // board "size" (radius)
// Hex grid stored with cube coordinates clamped to rhombus
// Offset coordinates: row 0..(2*BASE-2), col offset per row
// Total cells for size BASE: 3*BASE^2 - 3*BASE + 1

export function hexCells(base: number): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < 2 * base - 1; r++) {
    const colStart = Math.max(0, base - 1 - r);
    const colEnd = Math.min(2 * base - 2, 3 * base - 3 - r);
    for (let c = colStart; c <= colEnd; c++) {
      cells.push([r, c]);
    }
  }
  return cells;
}

const CELLS = hexCells(BASE);
export const CELL_COUNT = CELLS.length; // 61

// Build index map
const cellMap = new Map<string, number>();
CELLS.forEach(([r, c], i) => cellMap.set(`${r},${c}`, i));
function cellIdx(r: number, c: number): number | undefined { return cellMap.get(`${r},${c}`); }

// Hex neighbors (6 directions in offset coordinates)
function hexNeighbors(r: number, c: number): number[] {
  const dirs: [number,number][] = [[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0]];
  const result: number[] = [];
  for (const [dr, dc] of dirs) {
    const ni = cellIdx(r + dr, c + dc);
    if (ni !== undefined) result.push(ni);
  }
  return result;
}

export const NEIGHBORS: number[][] = CELLS.map(([r, c]) => hexNeighbors(r, c));

// Classify cells as corners, edges
function classifyCell(i: number): { corner: boolean; edge: number | null } {
  const [r, c] = CELLS[i]!;
  const B = BASE - 1;
  const maxR = 2 * B;
  const isTopLeft = r === 0 && c === B;
  const isTopRight = r === 0 && c === maxR;
  const isLeft = r === B && c === 0;
  const isRight = r === B && c === maxR;
  const isBotLeft = r === maxR && c === 0;
  const isBotRight = r === maxR && c === B;
  const corner = isTopLeft || isTopRight || isLeft || isRight || isBotLeft || isBotRight;

  // Edges (not corners):
  let edge: number | null = null;
  if (!corner) {
    if (r === 0) edge = 0;
    else if (r === maxR) edge = 1;
    else if (c === 0) edge = 2;
    else if (c === maxR) edge = 3;
    else {
      // Two diagonal edges
      const colStart = Math.max(0, B - r);
      const colEnd = Math.min(maxR, 3 * B - r);
      if (c === colStart && r > 0 && r < maxR) edge = 4;
      else if (c === colEnd && r > 0 && r < maxR) edge = 5;
    }
  }
  return { corner, edge };
}

const CELL_CLASS = CELLS.map((_, i) => classifyCell(i));

export type Cell = 0 | 1 | null;
export interface HavannahSettings { dummy?: string; }
export interface HavannahState {
  board: readonly Cell[];
  turn: 0 | 1;
  winner: 0 | 1 | null;
  rngSeed: number;
  settings: HavannahSettings;
  lastMove: number | null;
}

export type HavannahAction = { type: "place"; cell: number };

export function initialState(seed: number, settings: HavannahSettings): HavannahState {
  return {
    board: new Array<Cell>(CELL_COUNT).fill(null),
    turn: 0, winner: null, rngSeed: seed, settings, lastMove: null,
  };
}

// Union-Find for connectivity
class UF {
  parent: number[];
  constructor(n: number) { this.parent = Array.from({ length: n }, (_, i) => i); }
  find(x: number): number { if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]!); return this.parent[x]!; }
  union(a: number, b: number): void { this.parent[this.find(a)] = this.find(b); }
  same(a: number, b: number): boolean { return this.find(a) === this.find(b); }
}

function checkWin(board: readonly Cell[], player: 0 | 1): boolean {
  // Check fork (3 different edges connected) and bridge (2 corners connected)
  const uf = new UF(CELL_COUNT);
  const playerCells: number[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    if (board[i] !== player) continue;
    playerCells.push(i);
    for (const nb of NEIGHBORS[i]!) {
      if (board[nb] === player) uf.union(i, nb);
    }
  }

  // For each connected component, collect corners and edges it touches
  const compCorners = new Map<number, Set<number>>();
  const compEdges = new Map<number, Set<number>>();
  for (const i of playerCells) {
    const root = uf.find(i);
    if (!compCorners.has(root)) compCorners.set(root, new Set());
    if (!compEdges.has(root)) compEdges.set(root, new Set());
    const { corner, edge } = CELL_CLASS[i]!;
    if (corner) compCorners.get(root)!.add(i);
    if (edge !== null) compEdges.get(root)!.add(edge);
  }

  for (const [root, corners] of compCorners) {
    if (corners.size >= 2) return true; // bridge
    const edges = compEdges.get(root)!;
    if (edges.size >= 3) return true; // fork
  }

  // Check ring: a cell has >= 2 neighbors in same component that are connected without going through the cell
  // Simplified ring check: look for cycle via DFS
  for (let start = 0; start < CELL_COUNT; start++) {
    if (board[start] !== player) continue;
    // DFS from start to see if we can reach start again
    const visited = new Set<number>();
    const stack: Array<{ node: number; parent: number }> = [{ node: start, parent: -1 }];
    while (stack.length > 0) {
      const { node, parent } = stack.pop()!;
      if (visited.has(node)) { return true; } // ring found
      visited.add(node);
      for (const nb of NEIGHBORS[node]!) {
        if (nb !== parent && board[nb] === player) {
          stack.push({ node: nb, parent: node });
        }
      }
    }
  }

  return false;
}

function getBotMove(board: readonly Cell[], rng: () => number): number | null {
  const empty: number[] = [];
  for (let i = 0; i < CELL_COUNT; i++) if (board[i] === null) empty.push(i);
  if (empty.length === 0) return null;
  // Prefer edges and corners for connectivity
  const scored = empty.map((i) => {
    const { corner, edge } = CELL_CLASS[i]!;
    const nb1 = NEIGHBORS[i]!.filter((n) => board[n] === 1).length;
    return { i, score: nb1 * 2 + (corner ? 1 : 0) + (edge !== null ? 0.5 : 0) + rng() * 0.2 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]!.i;
}

export function reducer(state: HavannahState, action: HavannahAction): HavannahState {
  if (action.type !== "place") return state;
  if (state.winner !== null) return state;
  if (state.turn !== 0) return state;
  const { cell } = action;
  if (cell < 0 || cell >= CELL_COUNT || state.board[cell] !== null) return state;

  const rng = mulberry32(state.rngSeed);
  const ns = Math.floor(rng() * 2 ** 31);
  const board = [...state.board] as Cell[];
  board[cell] = 0;
  if (checkWin(board, 0)) return { ...state, rngSeed: ns, board, winner: 0, lastMove: cell };

  // Bot plays
  const rng2 = mulberry32(ns);
  const ns2 = Math.floor(rng2() * 2 ** 31);
  const botMove = getBotMove(board, rng2);
  if (botMove === null) return { ...state, rngSeed: ns2, board, turn: 0, lastMove: cell };
  board[botMove] = 1;
  if (checkWin(board, 1)) return { ...state, rngSeed: ns2, board, winner: 1, lastMove: botMove };
  return { ...state, rngSeed: ns2, board, turn: 0, lastMove: botMove };
}

export function isTerminal(state: HavannahState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
