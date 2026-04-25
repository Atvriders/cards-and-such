import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Hare and Hounds: 5x4 grid (5 cols, 4 rows). 20 cells.
// Hounds (3) start left; Hare starts right center. Hounds move right/up/down.
// Hare moves any direction. Hounds win by trapping Hare; Hare wins by slipping past hounds.
//
// Board layout: standard "military board" of 20 positions.
// We use a 5×4 grid with adjacency that matches the classic layout.
// Even rows have cross connections on certain diagonals.
//
// Simplified: full rectangular grid, hounds can move right/up/down (not left), hare any direction.

export const COLS = 5;
export const ROWS = 4;
export const N = COLS * ROWS; // 20 cells

function rc(i: number): [number, number] { return [Math.floor(i / COLS), i % COLS]; }
function idx(r: number, c: number): number { return r * COLS + c; }
function inB(r: number, c: number): boolean { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

// Adjacency: orthogonal + diagonal connections (standard hare-and-hounds board)
// Diagonals only on specific cells to form the traditional shape
function neighbors(i: number): number[] {
  const [r, c] = rc(i);
  const adj: number[] = [];
  const dirs: [number,number][] = [[-1,0],[1,0],[0,-1],[0,1]];
  // Add diagonals on alternating cols
  if ((r + c) % 2 === 0) {
    dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
  }
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (inB(nr, nc)) adj.push(idx(nr, nc));
  }
  return adj;
}

export interface HareSettings { dummy?: string; }

export interface HareState {
  hounds: readonly number[]; // 3 hound positions
  hare: number;
  turn: "hounds" | "hare";
  winner: "hounds" | "hare" | null;
  selected: number | null; // selected hound index (0-2) for hounds turn
  rngSeed: number;
  settings: HareSettings;
  houndMoves: number; // total hound moves (stalemate detection)
}

export type HareAction =
  | { type: "selectHound"; idx: number }
  | { type: "move"; to: number };

export function initialState(seed: number, settings: HareSettings): HareState {
  // Hounds at col 0, rows 0,1,2; Hare at center-right: (1, 4)
  const hounds = [idx(0, 0), idx(1, 0), idx(2, 0)];
  const hare = idx(1, 4);
  return { hounds, hare, turn: "hounds", winner: null, selected: null, rngSeed: seed, settings, houndMoves: 0 };
}

export function getHoundMoves(hounds: readonly number[], houndIdx: number, hare: number): number[] {
  const pos = hounds[houndIdx]!;
  const occupied = new Set([...hounds, hare]);
  return neighbors(pos).filter((n) => {
    if (occupied.has(n)) return false;
    // Hounds may NOT move left (decreasing column)
    const [, pc] = rc(pos);
    const [, nc] = rc(n);
    return nc >= pc; // can move same col (up/down) or right
  });
}

export function getHareMoves(hounds: readonly number[], hare: number): number[] {
  const occupied = new Set([...hounds]);
  return neighbors(hare).filter((n) => !occupied.has(n));
}

function isHareTrapped(hounds: readonly number[], hare: number): boolean {
  return getHareMoves(hounds, hare).length === 0;
}

function hareEscaped(hounds: readonly number[], hare: number): boolean {
  // Hare has passed all hounds (hare column < all hound columns is not escape)
  // Classic rule: hare wins if it gets to the left of all hounds and hounds can't catch up
  // Simplified: hare wins if its column <= min hound column AND hounds can't surround it
  const minHoundCol = Math.min(...hounds.map((h) => rc(h)[1]));
  const [, hareCol] = rc(hare);
  return hareCol < minHoundCol;
}

function botHoundMove(state: HareState, rng: () => number): HareState {
  // Simple greedy: try to advance hounds toward hare while trapping
  let best: [number, number] | null = null;
  let bestScore = -Infinity;
  for (let hi = 0; hi < 3; hi++) {
    const moves = getHoundMoves(state.hounds, hi, state.hare);
    for (const m of moves) {
      const newHounds = [...state.hounds] as number[];
      newHounds[hi] = m;
      const [hr, hc] = rc(state.hare);
      const [mr, mc] = rc(m);
      const dist = Math.abs(hr - mr) + Math.abs(hc - mc);
      const score = -dist + (isHareTrapped(newHounds, state.hare) ? 100 : 0) + rng() * 0.1;
      if (score > bestScore) { bestScore = score; best = [hi, m]; }
    }
  }
  if (!best) return { ...state, winner: "hare" }; // no moves = hare wins
  const newHounds = [...state.hounds] as number[];
  newHounds[best[0]] = best[1];
  const rng2 = mulberry32(state.rngSeed);
  const ns = Math.floor(rng2() * 2 ** 31);
  const newMoves = state.houndMoves + 1;
  if (isHareTrapped(newHounds, state.hare)) {
    return { ...state, rngSeed: ns, hounds: newHounds, winner: "hounds", selected: null, houndMoves: newMoves };
  }
  if (newMoves > 100) return { ...state, rngSeed: ns, hounds: newHounds, winner: "hare", houndMoves: newMoves }; // stalemate
  return { ...state, rngSeed: ns, hounds: newHounds, turn: "hare", selected: null, houndMoves: newMoves };
}

export function reducer(state: HareState, action: HareAction): HareState {
  if (state.winner !== null) return state;

  if (action.type === "selectHound") {
    // Player is hare; bot is hounds. So selecting a hound is invalid
    return state;
  }

  if (action.type === "move") {
    if (state.turn !== "hare") return state;
    const { to } = action;
    const hareMoves = getHareMoves(state.hounds, state.hare);
    if (!hareMoves.includes(to)) return state;
    const rng = mulberry32(state.rngSeed);
    const ns = Math.floor(rng() * 2 ** 31);
    const newHare = to;
    if (hareEscaped(state.hounds, newHare)) {
      return { ...state, rngSeed: ns, hare: newHare, winner: "hare", selected: null };
    }
    let next: HareState = { ...state, rngSeed: ns, hare: newHare, turn: "hounds", selected: null };
    // Bot plays hounds
    const rng2 = mulberry32(next.rngSeed);
    next = botHoundMove(next, rng2);
    return next;
  }

  return state;
}

export function isTerminal(state: HareState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === "hare" ? 100 : 0 };
}
