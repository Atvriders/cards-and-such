import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { TilePos } from "./layouts.js";
import { TURTLE_LAYOUT } from "./layouts.js";

// 36 distinct tile faces × 4 copies = 144 tiles
export const TILE_FACES: string[] = [
  // 9 bamboo
  "🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘",
  // 9 circles
  "🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡",
  // 9 characters (man)
  "🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏",
  // 4 winds
  "🀀","🀁","🀂","🀃",
  // 3 dragons
  "🀄","🀅","🀆",
  // 4 flowers + 3 seasons (2 unique faces × 4 copies via pairing)
  "🌸","🌺","🍀","🎑","🌿","🍂","🌱",
];

// Exactly 36 unique faces × 4 = 144
if (TILE_FACES.length !== 36) {
  // Truncate or pad to 36
  while (TILE_FACES.length < 36) TILE_FACES.push("★");
  TILE_FACES.splice(36);
}

export interface MahjongTile {
  id: number;
  face: string;
  pos: TilePos;
  removed: boolean;
  selected: boolean;
}

export interface MahjongSolitaireState {
  tiles: MahjongTile[];
  selectedId: number | null;
  removed: number;
  total: number;
  gameOver: boolean; // no more moves
  won: boolean;
  moves: number;
}

export type MahjongAction =
  | { type: "select"; id: number }
  | { type: "check-dead" };

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!; a[i] = a[j]!; a[j] = tmp;
  }
  return a;
}

export function buildTiles(layout: TilePos[], seed: number): MahjongTile[] {
  const rng = mulberry32(seed);
  const faces: string[] = [];
  for (const f of TILE_FACES) {
    faces.push(f, f, f, f);
  }
  const shuffled = seededShuffle(faces, rng);
  return layout.map((pos, i) => ({
    id: i,
    face: shuffled[i]!,
    pos,
    removed: false,
    selected: false,
  }));
}

/** A tile is "free" (selectable) if:
 * 1. Not removed
 * 2. No tile above it (same or adjacent row/col at layer+1)
 * 3. Has at least one empty side (no tile to left OR no tile to right at same layer)
 */
export function isFree(tile: MahjongTile, tiles: MahjongTile[]): boolean {
  if (tile.removed) return false;
  const { row, col, layer } = tile.pos;

  // Check if any tile above covers this one
  // A tile at (r2, c2, layer+1) covers (row, col, layer) if |r2-row|<=0 and |c2-col|<=1
  const coveredAbove = tiles.some(
    (t) =>
      !t.removed &&
      t.pos.layer === layer + 1 &&
      Math.abs(t.pos.row - row) === 0 &&
      Math.abs(t.pos.col - col) <= 1,
  );
  if (coveredAbove) return false;

  // Check left neighbor: tile at (row, col-1, layer) or (row, col-2, layer)
  const hasLeft = tiles.some(
    (t) =>
      !t.removed &&
      t.pos.layer === layer &&
      t.pos.row === row &&
      (t.pos.col === col - 1 || t.pos.col === col - 2),
  );

  // Check right neighbor: tile at (row, col+1, layer) or (row, col+2, layer)
  const hasRight = tiles.some(
    (t) =>
      !t.removed &&
      t.pos.layer === layer &&
      t.pos.row === row &&
      (t.pos.col === col + 1 || t.pos.col === col + 2),
  );

  // Free if at least one side is open
  return !hasLeft || !hasRight;
}

export function hasMatchingPair(tiles: MahjongTile[]): boolean {
  const free = tiles.filter((t) => !t.removed && isFree(t, tiles));
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (free[i]!.face === free[j]!.face) return true;
    }
  }
  return false;
}

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongSolitaireState {
  void _settings;
  const tiles = buildTiles(TURTLE_LAYOUT, seed);
  return {
    tiles,
    selectedId: null,
    removed: 0,
    total: TURTLE_LAYOUT.length,
    gameOver: false,
    won: false,
    moves: 0,
  };
}

export function initialStateWithLayout(layout: TilePos[], seed: number): MahjongSolitaireState {
  const tiles = buildTiles(layout, seed);
  return {
    tiles,
    selectedId: null,
    removed: 0,
    total: layout.length,
    gameOver: false,
    won: false,
    moves: 0,
  };
}

export function reducer(state: MahjongSolitaireState, action: MahjongAction): MahjongSolitaireState {
  if (state.won || state.gameOver) return state;

  switch (action.type) {
    case "select": {
      const clickedTile = state.tiles.find((t) => t.id === action.id);
      if (!clickedTile || clickedTile.removed) return state;
      if (!isFree(clickedTile, state.tiles)) return state;

      // If clicking already-selected tile, deselect
      if (state.selectedId === action.id) {
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: false } : t)),
          selectedId: null,
        };
      }

      if (state.selectedId === null) {
        // First selection
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: true } : t)),
          selectedId: action.id,
        };
      }

      // Second selection — check for match
      const firstTile = state.tiles.find((t) => t.id === state.selectedId)!;
      if (firstTile.face === clickedTile.face) {
        // Match! Remove both
        const newTiles = state.tiles.map((t) =>
          t.id === firstTile.id || t.id === clickedTile.id
            ? { ...t, removed: true, selected: false }
            : t,
        );
        const newRemoved = state.removed + 2;
        const won = newRemoved === state.total;
        const newState: MahjongSolitaireState = {
          ...state,
          tiles: newTiles,
          selectedId: null,
          removed: newRemoved,
          won,
          moves: state.moves + 1,
          gameOver: won ? false : !hasMatchingPair(newTiles),
        };
        return newState;
      } else {
        // No match — deselect first, select new
        return {
          ...state,
          tiles: state.tiles.map((t) => {
            if (t.id === firstTile.id) return { ...t, selected: false };
            if (t.id === action.id) return { ...t, selected: true };
            return t;
          }),
          selectedId: action.id,
        };
      }
    }

    case "check-dead": {
      if (!hasMatchingPair(state.tiles)) {
        return { ...state, gameOver: true };
      }
      return state;
    }

    default:
      return state;
  }
}

export function isTerminal(state: MahjongSolitaireState): { score: number } | null {
  if (state.won) {
    const score = Math.max(100, 10000 - state.moves * 50);
    return { score };
  }
  if (state.gameOver) return { score: Math.floor((state.removed / state.total) * 5000) };
  return null;
}
