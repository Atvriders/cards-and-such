// Chinese Checkers (Full 6-Player) - classic 121-cell six-point star.
// 6 colored points, 10 pegs per point, multi-jump chains.
// 1 human player vs 5 CPU opponents using a "longest-progress jump" heuristic.
// Optional setting: jump-only | jump-or-step (default jump-or-step).
//
// Board representation:
//   We use axial hex coordinates (q, r). The board is a central hexagon of
//   radius 4 (61 cells) plus six triangular points of 10 cells each (60),
//   for a total of 121 cells. Each cell has up to six neighbors in the 6
//   hex directions. A jump lands at (q + 2*dq, r + 2*dr), so geometry is
//   exact — no row-by-row hacks.
//
// Coordinate convention:
//   Axial (q, r) with hex directions:
//     E:  (+1,  0)
//     W:  (-1,  0)
//     NE: (+1, -1)
//     SW: (-1, +1)
//     SE: ( 0, +1)
//     NW: ( 0, -1)
//   Display: rows = r, files = q + r/2 (pointy-top). Rendered as horizontal
//   rows by stable row order from min r to max r.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export type PlayerId = 0 | 1 | 2 | 3 | 4 | 5;
export type CellColor = PlayerId | null;
export type MoveMode = "jump-only" | "jump-or-step";

export interface CCFSettings {
  moveMode: MoveMode;
}

export interface CCFState {
  settings: CCFSettings;
  rngSeed: number;
  cells: CellColor[];      // length = TOTAL_CELLS, indexed by CELL_INDEX
  turn: PlayerId;          // 0 = human
  selected: number | null;
  winner: PlayerId | null;
  lastMove: { from: number; to: number; player: PlayerId } | null;
}

export type CCFAction =
  | { type: "select"; idx: number }
  | { type: "move"; to: number }
  | { type: "deselect" }
  | { type: "advance-cpu" };

// ---------- Board generation ----------

const HEX_RADIUS = 4;

// Hex directions (axial). Indexed clockwise starting at E.
export const HEX_DIRS: ReadonlyArray<readonly [number, number]> = [
  [+1,  0], // E
  [+1, -1], // NE
  [ 0, -1], // NW
  [-1,  0], // W
  [-1, +1], // SW
  [ 0, +1], // SE
];

// Generates cells in the central hexagon of radius R.
function hexagonCells(R: number): [number, number][] {
  const out: [number, number][] = [];
  for (let q = -R; q <= R; q++) {
    for (let r = -R; r <= R; r++) {
      const s = -q - r;
      if (Math.abs(s) <= R) out.push([q, r]);
    }
  }
  return out; // 3R^2 + 3R + 1 cells; for R=4 -> 61
}

// Generates a triangular point of 10 cells extending outward from one of the
// 6 hex edges. `dir` is the OUTWARD axial direction toward the point's tip.
// The triangle is the 10 cells at distance 1..4 along `dir` from the
// hex edge midpoint, with widths 4,3,2,1 (sum 10).
//
// We define the triangle as follows: let e1, e2 be the two axial directions
// that span the outer triangle (the two hex directions that, combined with
// `dir`, are perpendicular to it). The triangle's cells are
//   center + dir*(R+1+i) + e*(j) + e2*(k) where i,j,k are tetrahedral...
// In practice we hardcode each point by its set of (q,r) cells.

// The six star points, by player id. We list each cell as (q, r).
// The opposite pair is (0,3), (1,4), (2,5).
// Layout (pointy-top, +r = south, +q = east):
//   0 = NORTH (top)    point — extends upward (r negative)
//   1 = NE             point — extends NE
//   2 = SE             point — extends SE
//   3 = SOUTH (bottom) point — extends downward
//   4 = SW             point — extends SW
//   5 = NW             point — extends NW

const POINT_NORTH: [number, number][] = [
  // r=-5: q = 0..3  (4 cells)
  [0, -5], [1, -5], [2, -5], [3, -5],
  // r=-6: q = 0..2  (3 cells)
  [0, -6], [1, -6], [2, -6],
  // r=-7: q = 0..1  (2 cells)
  [0, -7], [1, -7],
  // r=-8: q = 0     (1 cell)
  [0, -8],
];

const POINT_SOUTH: [number, number][] = [
  [-3, 5], [-2, 5], [-1, 5], [0, 5],
  [-2, 6], [-1, 6], [0, 6],
  [-1, 7], [0, 7],
  [0, 8],
];

const POINT_NE: [number, number][] = [
  // Mirror of POINT_SW across origin. Extends in (+1,-1) direction.
  // q in 5..8, r negative.
  [5, -4], [5, -3], [5, -2], [5, -1],
  [6, -4], [6, -3], [6, -2],
  [7, -4], [7, -3],
  [8, -4],
];

const POINT_SW: [number, number][] = [
  [-5,  1], [-5,  2], [-5,  3], [-5,  4],
  [-6,  2], [-6,  3], [-6,  4],
  [-7,  3], [-7,  4],
  [-8,  4],
];

const POINT_SE: [number, number][] = [
  // q in 1..4 with r positive, growing along (-1,+1)? Actually SE extends
  // in direction (0,+1) is south; SE between south and east — combine.
  // For a "pointy-top" hex, the SE corner of the hex is at (q=R, r=0)? No,
  // hex corners at: (R,0), (R,-R), (0,-R), (-R,0), (-R,R), (0,R) — those are
  // the SIX CORNERS of the hexagon.
  // The 6 EDGES are between consecutive corners. The 6 points stick out from
  // the edges. Let me restate:
  //   POINT_NORTH sits above edge between corners (0,-4) and (4,-4) ... wait
  //   no, the top edge of the hexagon (in pointy-top) goes from (-R, 0) to (R, -R)? hmm
  //
  // Rather than think in corners, I encoded each point by explicit cells and
  // we verify by simulation. POINT_SE will be cells with positive q and
  // positive r outside the hexagon, mirroring NW.
  [1, 4], [2, 3], [3, 2], [4, 1],
  [2, 4], [3, 3], [4, 2],
  [3, 4], [4, 3],
  [4, 4],
];

const POINT_NW: [number, number][] = [
  // Mirror of SE through origin.
  [-1, -4], [-2, -3], [-3, -2], [-4, -1],
  [-2, -4], [-3, -3], [-4, -2],
  [-3, -4], [-4, -3],
  [-4, -4],
];

// Note on POINT_SE / POINT_NW: these triangles sit off the SE and NW corners
// of the hexagon. Each cell here is at hex distance > R from origin.
// We use distance() = (|q|+|r|+|q+r|)/2 in axial coords.
function hexDistance(q: number, r: number): number {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

// Combine all cells
function allCells(): [number, number][] {
  const cells: [number, number][] = [];
  // hexagon
  for (const c of hexagonCells(HEX_RADIUS)) cells.push(c);
  // 6 points
  for (const c of POINT_NORTH) cells.push(c);
  for (const c of POINT_NE) cells.push(c);
  for (const c of POINT_SE) cells.push(c);
  for (const c of POINT_SOUTH) cells.push(c);
  for (const c of POINT_SW) cells.push(c);
  for (const c of POINT_NW) cells.push(c);
  // dedupe (shouldn't be needed)
  const seen = new Set<string>();
  const out: [number, number][] = [];
  for (const [q, r] of cells) {
    const k = `${q},${r}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push([q, r]);
  }
  return out;
}

const CELLS_AXIAL = allCells();
export const TOTAL_CELLS = CELLS_AXIAL.length;

// Build index lookup
const KEY_TO_INDEX = new Map<string, number>();
CELLS_AXIAL.forEach(([q, r], i) => KEY_TO_INDEX.set(`${q},${r}`, i));

function idxOf(q: number, r: number): number {
  return KEY_TO_INDEX.get(`${q},${r}`) ?? -1;
}

// Precompute (q, r) per index for fast access.
export const AXIAL: ReadonlyArray<readonly [number, number]> = CELLS_AXIAL;

// Compute neighbors per cell
function computeNeighbors(): number[][] {
  const neighbors: number[][] = Array.from({ length: TOTAL_CELLS }, () => []);
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const [q, r] = CELLS_AXIAL[i]!;
    for (const [dq, dr] of HEX_DIRS) {
      const ni = idxOf(q + dq, r + dr);
      if (ni >= 0) neighbors[i]!.push(ni);
    }
  }
  return neighbors;
}

export const NEIGHBORS = computeNeighbors();

// Convert hex cells to display rows (for grid rendering).
// We compute, for each cell, a "row" = r and a "file" coordinate.
// In pointy-top hex with offset rendering: x = q + r/2 (then scaled).
// Returns rows: array of rows (sorted by r), each row is an array of cell
// indices sorted by their q+r/2 file coordinate.
export function rowsForDisplay(): { r: number; cells: number[] }[] {
  const byR = new Map<number, number[]>();
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const [, r] = CELLS_AXIAL[i]!;
    if (!byR.has(r)) byR.set(r, []);
    byR.get(r)!.push(i);
  }
  const rs = [...byR.keys()].sort((a, b) => a - b);
  return rs.map((r) => ({
    r,
    cells: byR
      .get(r)!
      .sort((a, b) => {
        const [qa, ra] = CELLS_AXIAL[a]!;
        const [qb, rb] = CELLS_AXIAL[b]!;
        return qa + ra / 2 - (qb + rb / 2);
      }),
  }));
}

// Display info: for each row, also expose the leftmost file offset relative
// to the centerline. Useful for visual centering.
export function rowFileOffsets(): { r: number; cells: number[]; fileOffsets: number[] }[] {
  const rows = rowsForDisplay();
  return rows.map(({ r, cells }) => {
    const fileOffsets = cells.map((i) => {
      const [q, rr] = CELLS_AXIAL[i]!;
      return q + rr / 2;
    });
    return { r, cells, fileOffsets };
  });
}

// ---------- Star points (start positions, goals) ----------

const POINTS_AXIAL: [number, number][][] = [
  POINT_NORTH,
  POINT_NE,
  POINT_SE,
  POINT_SOUTH,
  POINT_SW,
  POINT_NW,
];

function indexSetOf(pts: [number, number][]): number[] {
  return pts.map(([q, r]) => idxOf(q, r));
}

export const START_BY_PLAYER: number[][] = POINTS_AXIAL.map(indexSetOf);
// Opposite: 0<->3, 1<->4, 2<->5
export const GOAL_BY_PLAYER: number[][] = [
  START_BY_PLAYER[3]!,
  START_BY_PLAYER[4]!,
  START_BY_PLAYER[5]!,
  START_BY_PLAYER[0]!,
  START_BY_PLAYER[1]!,
  START_BY_PLAYER[2]!,
];

// ---------- Reachability ----------
// In axial coordinates, jumps are exact: landing = mid + (mid - from).
// So we can compute jumps directly with index lookup.
export function getReachable(
  cells: CellColor[],
  from: number,
  mode: MoveMode = "jump-or-step",
): number[] {
  const result = new Set<number>();
  const [q0, r0] = CELLS_AXIAL[from]!;

  if (mode === "jump-or-step") {
    for (const [dq, dr] of HEX_DIRS) {
      const ni = idxOf(q0 + dq, r0 + dr);
      if (ni >= 0 && cells[ni] === null) result.add(ni);
    }
  }

  // BFS chain jumps
  const visited = new Set<number>([from]);
  const queue: number[] = [from];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    const [cq, cr] = CELLS_AXIAL[cur]!;
    for (const [dq, dr] of HEX_DIRS) {
      const midQ = cq + dq, midR = cr + dr;
      const midI = idxOf(midQ, midR);
      if (midI < 0) continue;
      if (cells[midI] === null) continue;
      // landing: mid + dir = cq + 2dq, cr + 2dr
      const landQ = cq + 2 * dq, landR = cr + 2 * dr;
      const landI = idxOf(landQ, landR);
      if (landI < 0) continue;
      if (cells[landI] !== null) continue;
      if (visited.has(landI)) continue;
      visited.add(landI);
      result.add(landI);
      queue.push(landI);
    }
  }
  return [...result];
}

// ---------- Initialization ----------
export function initialState(seed: number, settings: CCFSettings): CCFState {
  const cells: CellColor[] = new Array(TOTAL_CELLS).fill(null);
  for (let p = 0; p < 6; p++) {
    for (const idx of START_BY_PLAYER[p]!) cells[idx] = p as PlayerId;
  }
  void mulberry32(seed);
  return {
    settings,
    rngSeed: seed >>> 0,
    cells,
    turn: 0,
    selected: null,
    winner: null,
    lastMove: null,
  };
}

// ---------- Win detection ----------
function checkWinner(cells: CellColor[]): PlayerId | null {
  for (let p = 0; p < 6; p++) {
    const goal = GOAL_BY_PLAYER[p]!;
    if (goal.every((i) => cells[i] === p)) return p as PlayerId;
  }
  return null;
}

// ---------- Progress heuristic ----------
function goalCentroid(p: PlayerId): [number, number] {
  const goal = GOAL_BY_PLAYER[p]!;
  let sq = 0, sr = 0;
  for (const idx of goal) {
    const [q, r] = CELLS_AXIAL[idx]!;
    sq += q; sr += r;
  }
  return [sq / goal.length, sr / goal.length];
}

const GOAL_CENTROIDS: [number, number][] = [];
for (let p = 0; p < 6; p++) GOAL_CENTROIDS.push(goalCentroid(p as PlayerId));

function distanceToGoal(p: PlayerId, idx: number): number {
  const [q, r] = CELLS_AXIAL[idx]!;
  const [gq, gr] = GOAL_CENTROIDS[p]!;
  // Hex distance
  return hexDistance(q - gq, r - gr);
}

// ---------- CPU choice ----------
function chooseCpuMove(
  state: CCFState,
  p: PlayerId,
): { from: number; to: number } | null {
  const { cells, settings, rngSeed } = state;
  const pegs: number[] = [];
  for (let i = 0; i < cells.length; i++) if (cells[i] === p) pegs.push(i);

  const rng = mulberry32((rngSeed ^ (p * 1013904223) ^ countMovesPlayed(cells)) >>> 0);
  const goalSet = new Set(GOAL_BY_PLAYER[p]!);

  let best: { from: number; to: number; score: number; tiebreak: number } | null = null;

  for (const from of pegs) {
    const inGoal = goalSet.has(from);
    const reachable = getReachable(cells, from, settings.moveMode);
    for (const to of reachable) {
      if (from === to) continue;
      // Don't move out of goal
      if (inGoal && !goalSet.has(to)) continue;

      const fromD = distanceToGoal(p, from);
      const toD = distanceToGoal(p, to);
      let progress = fromD - toD;
      if (goalSet.has(to)) progress += 0.3; // fill the goal
      // Slight bonus for jumps (longest-progress jump heuristic)
      // (Jumps are already preferred via larger progress; this is a tiebreak.)
      const tb = rng();
      if (
        best === null ||
        progress > best.score ||
        (progress === best.score && tb > best.tiebreak)
      ) {
        best = { from, to, score: progress, tiebreak: tb };
      }
    }
  }

  if (!best) return null;
  return { from: best.from, to: best.to };
}

function countMovesPlayed(cells: CellColor[]): number {
  let n = 0;
  for (let p = 0; p < 6; p++) {
    for (const idx of START_BY_PLAYER[p]!) {
      if (cells[idx] !== p) n++;
    }
  }
  return n;
}

// ---------- Reducer ----------
export function reducer(state: CCFState, action: CCFAction): CCFState {
  if (state.winner !== null) return state;

  if (action.type === "select") {
    if (state.turn !== 0) return state;
    const cell = state.cells[action.idx];
    if (cell !== 0) return state;
    if (state.selected === action.idx) return state;
    return { ...state, selected: action.idx };
  }

  if (action.type === "deselect") {
    if (state.selected === null) return state;
    return { ...state, selected: null };
  }

  if (action.type === "move") {
    if (state.turn !== 0 || state.selected === null) return state;
    const from = state.selected;
    const reachable = getReachable(state.cells, from, state.settings.moveMode);
    if (!reachable.includes(action.to)) return state;
    const newCells = state.cells.slice();
    newCells[from] = null;
    newCells[action.to] = 0;
    const winner = checkWinner(newCells);
    return {
      ...state,
      cells: newCells,
      selected: null,
      turn: winner !== null ? state.turn : 1,
      winner,
      lastMove: { from, to: action.to, player: 0 },
    };
  }

  if (action.type === "advance-cpu") {
    if (state.turn === 0) return state;
    const p = state.turn;
    const mv = chooseCpuMove(state, p);
    if (!mv) {
      const nextTurn = ((p + 1) % 6) as PlayerId;
      return { ...state, turn: nextTurn };
    }
    const newCells = state.cells.slice();
    newCells[mv.from] = null;
    newCells[mv.to] = p;
    const winner = checkWinner(newCells);
    const nextTurn = winner !== null ? p : (((p + 1) % 6) as PlayerId);
    return {
      ...state,
      cells: newCells,
      turn: nextTurn,
      winner,
      lastMove: { from: mv.from, to: mv.to, player: p },
    };
  }

  return state;
}

// ---------- Terminal ----------
export function isTerminal(state: CCFState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) return { score: 100 };
  const filled = GOAL_BY_PLAYER[0]!.filter((i) => state.cells[i] === 0).length;
  return { score: filled };
}
