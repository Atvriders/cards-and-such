// ─── Hexa Match 3 state ────────────────────────────────────────────────────────
// Hexagonal grid (axial coords). Swap adjacent tiles to match 3+. Score for chains.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const GRID_RADIUS = 4; // hex radius; total cells = 3*r*r+3*r+1 = 61
export const NUM_COLORS = 5;

// Axial coord hex: q in [-R,R], r in [-R,R], s = -q-r
export interface HexCoord { q: number; r: number }

function hexKey(q: number, r: number): string { return `${q},${r}`; }

function hexNeighbors(q: number, r: number): HexCoord[] {
  return [
    { q: q + 1, r },
    { q: q - 1, r },
    { q, r: r + 1 },
    { q, r: r - 1 },
    { q: q + 1, r: r - 1 },
    { q: q - 1, r: r + 1 },
  ];
}

export function allHexCells(radius: number): HexCoord[] {
  const cells: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      cells.push({ q, r });
    }
  }
  return cells;
}

export interface HexMatchState {
  settings: HexMatchSettings;
  tiles: Map<string, number>; // hexKey -> color index
  selected: HexCoord | null;
  score: number;
  moves: number;
  maxMoves: number;
  over: boolean;
}

export interface HexMatchSettings {
  radius: "3" | "4";
}

export type HexMatchAction =
  | { type: "select"; q: number; r: number };

function makeGrid(seed: number, radius: number): Map<string, number> {
  const rng = mulberry32(seed);
  const tiles = new Map<string, number>();
  for (const { q, r } of allHexCells(radius)) {
    tiles.set(hexKey(q, r), Math.floor(rng() * NUM_COLORS));
  }
  return tiles;
}

export function findMatches(tiles: Map<string, number>, radius: number): Set<string> {
  const matched = new Set<string>();
  const cells = allHexCells(radius);

  // Axial directions for lines: (1,0), (0,1), (1,-1)
  const lineDirections: [number, number][] = [[1, 0], [0, 1], [1, -1]];

  for (const { q, r } of cells) {
    const color = tiles.get(hexKey(q, r));
    if (color === undefined) continue;
    for (const [dq, dr] of lineDirections) {
      let line: string[] = [hexKey(q, r)];
      let nq = q + dq, nr = r + dr;
      while (tiles.get(hexKey(nq, nr)) === color) {
        line.push(hexKey(nq, nr));
        nq += dq; nr += dr;
      }
      if (line.length >= 3) line.forEach((k) => matched.add(k));
    }
  }
  return matched;
}

function refill(tiles: Map<string, number>, matched: Set<string>, seed: number): Map<string, number> {
  const rng = mulberry32(seed);
  const newTiles = new Map(tiles);
  for (const key of matched) {
    newTiles.set(key, Math.floor(rng() * NUM_COLORS));
  }
  return newTiles;
}

export function initialState(seed: number, settings: HexMatchSettings): HexMatchState {
  const radius = parseInt(settings.radius, 10);
  const rng = mulberry32(seed);
  let tiles = makeGrid(seed, radius);
  // Re-roll initial matches to avoid starting with matches
  let matched = findMatches(tiles, radius);
  let attempts = 0;
  while (matched.size > 0 && attempts < 10) {
    tiles = makeGrid(seed + ++attempts * 37, radius);
    matched = findMatches(tiles, radius);
  }
  return {
    settings,
    tiles,
    selected: null,
    score: 0,
    moves: 0,
    maxMoves: 30,
    over: false,
  };
}

function swapTiles(tiles: Map<string, number>, c1: HexCoord, c2: HexCoord): Map<string, number> {
  const k1 = hexKey(c1.q, c1.r), k2 = hexKey(c2.q, c2.r);
  const v1 = tiles.get(k1)!, v2 = tiles.get(k2)!;
  const next = new Map(tiles);
  next.set(k1, v2);
  next.set(k2, v1);
  return next;
}

function isNeighbor(c1: HexCoord, c2: HexCoord): boolean {
  return hexNeighbors(c1.q, c1.r).some(({ q, r }) => q === c2.q && r === c2.r);
}

export function reducer(state: HexMatchState, action: HexMatchAction): HexMatchState {
  if (state.over) return state;
  const radius = parseInt(state.settings.radius, 10);

  switch (action.type) {
    case "select": {
      const { q, r } = action;
      if (!state.tiles.has(hexKey(q, r))) return state;

      if (state.selected === null) {
        return { ...state, selected: { q, r } };
      }

      const sel = state.selected;
      if (sel.q === q && sel.r === r) return { ...state, selected: null };

      if (!isNeighbor(sel, { q, r })) {
        return { ...state, selected: { q, r } };
      }

      // Swap
      let tiles = swapTiles(state.tiles, sel, { q, r });
      const matched = findMatches(tiles, radius);

      if (matched.size === 0) {
        // Swap back (no match)
        return { ...state, selected: null };
      }

      // Clear matches and refill
      const points = matched.size * 10;
      tiles = refill(tiles, matched, state.moves * 997 + 31337);

      const moves = state.moves + 1;
      const over = moves >= state.maxMoves;

      return { ...state, tiles, selected: null, score: state.score + points, moves, over };
    }
    default:
      return state;
  }
}

export function isTerminal(state: HexMatchState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
