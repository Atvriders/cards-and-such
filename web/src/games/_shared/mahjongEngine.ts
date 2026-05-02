import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface TilePos {
  row: number;
  col: number;
  layer: number;
}

// 36 distinct tile faces (truncated to satisfy 36 × 4 = 144 / or scaled smaller)
export const TILE_FACES: string[] = [
  "🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘",
  "🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡",
  "🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏",
  "🀀","🀁","🀂","🀃",
  "🀄","🀅","🀆",
  "🌸","🌺","🍀",
];

if (TILE_FACES.length !== 36) {
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

export interface MahjongState {
  tiles: MahjongTile[];
  selectedId: number | null;
  removed: number;
  total: number;
  gameOver: boolean;
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

/** Build tile array from a layout. Each face copies = layout.length / 36 (rounded up). */
export function buildTiles(layout: TilePos[], seed: number): MahjongTile[] {
  const rng = mulberry32(seed);
  const n = layout.length;
  // Need exactly n tiles, in pairs of matching faces (so n must be even).
  // We pair tiles in groups of 4 from TILE_FACES; if leftover, use pairs of 2.
  const faces: string[] = [];
  let f = 0;
  while (faces.length + 4 <= n) {
    const face = TILE_FACES[f % TILE_FACES.length]!;
    faces.push(face, face, face, face);
    f++;
  }
  while (faces.length + 2 <= n) {
    const face = TILE_FACES[f % TILE_FACES.length]!;
    faces.push(face, face);
    f++;
  }
  // Pad with single fillers (shouldn't happen — layouts are even-sized)
  while (faces.length < n) faces.push("★");
  const shuffled = seededShuffle(faces, rng);
  return layout.map((pos, i) => ({
    id: i,
    face: shuffled[i]!,
    pos,
    removed: false,
    selected: false,
  }));
}

export function isFree(tile: MahjongTile, tiles: MahjongTile[]): boolean {
  if (tile.removed) return false;
  const { row, col, layer } = tile.pos;

  const coveredAbove = tiles.some(
    (t) =>
      !t.removed &&
      t.pos.layer === layer + 1 &&
      Math.abs(t.pos.row - row) === 0 &&
      Math.abs(t.pos.col - col) <= 1,
  );
  if (coveredAbove) return false;

  const hasLeft = tiles.some(
    (t) =>
      !t.removed &&
      t.pos.layer === layer &&
      t.pos.row === row &&
      (t.pos.col === col - 1 || t.pos.col === col - 2),
  );
  const hasRight = tiles.some(
    (t) =>
      !t.removed &&
      t.pos.layer === layer &&
      t.pos.row === row &&
      (t.pos.col === col + 1 || t.pos.col === col + 2),
  );

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

/** Find the first free tile with a matching free partner. Returns its id, or null
 *  if no legal pair exists. Used by plugin `hint` to pulse a hint-worthy tile. */
export function findHintTileId(state: MahjongState): number | null {
  if (state.won || state.gameOver) return null;
  const free = state.tiles.filter((t) => !t.removed && isFree(t, state.tiles));
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (free[i]!.face === free[j]!.face) return free[i]!.id;
    }
  }
  return null;
}

/** Returns a hint-target object pointing at the first tile of the first
 *  available legal pair, or null if none. Suitable for plugin `hint` field. */
export function mahjongHint(state: MahjongState): { selector: string; pulses?: number } | null {
  const id = findHintTileId(state);
  if (id === null) return null;
  return { selector: `[data-testid="hint-target-mahjong-tile-${id}"]`, pulses: 3 };
}

export function makeInitialState(layout: TilePos[], seed: number): MahjongState {
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

export function reducer(state: MahjongState, action: MahjongAction): MahjongState {
  if (state.won || state.gameOver) return state;

  switch (action.type) {
    case "select": {
      const clickedTile = state.tiles.find((t) => t.id === action.id);
      if (!clickedTile || clickedTile.removed) return state;
      if (!isFree(clickedTile, state.tiles)) return state;

      if (state.selectedId === action.id) {
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: false } : t)),
          selectedId: null,
        };
      }

      if (state.selectedId === null) {
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: true } : t)),
          selectedId: action.id,
        };
      }

      const firstTile = state.tiles.find((t) => t.id === state.selectedId)!;
      if (firstTile.face === clickedTile.face) {
        const newTiles = state.tiles.map((t) =>
          t.id === firstTile.id || t.id === clickedTile.id
            ? { ...t, removed: true, selected: false }
            : t,
        );
        const newRemoved = state.removed + 2;
        const won = newRemoved === state.total;
        return {
          ...state,
          tiles: newTiles,
          selectedId: null,
          removed: newRemoved,
          won,
          moves: state.moves + 1,
          gameOver: won ? false : !hasMatchingPair(newTiles),
        };
      } else {
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

export function isTerminal(state: MahjongState): { score: number } | null {
  if (state.won) {
    const score = Math.max(100, 10000 - state.moves * 50);
    return { score };
  }
  if (state.gameOver) return { score: Math.floor((state.removed / state.total) * 5000) };
  return null;
}
