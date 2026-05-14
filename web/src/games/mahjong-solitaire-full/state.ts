import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Mahjong Solitaire — full 144-tile classic.
 *
 * Tile set (144 tiles total):
 *   - 9 dots (circles)     × 4 copies   = 36
 *   - 9 bamboo             × 4 copies   = 36
 *   - 9 characters (man)   × 4 copies   = 36
 *   - 4 winds (E,S,W,N)    × 4 copies   = 16
 *   - 3 dragons (R,G,W)    × 4 copies   = 12
 *   - 4 flowers (1 each)   match by category (any flower pairs with any flower) = 4
 *   - 4 seasons (1 each)   match by category (any season pairs with any season) = 4
 *   total                                = 144
 *
 * Pair-matching rule:
 *   Tiles match if their `matchKey` is equal. For suits/winds/dragons the
 *   matchKey is the exact face. For flowers/seasons it is the category
 *   ("flower" or "season"), so any two flowers match and any two seasons match.
 *
 * Free rule:
 *   A tile is free (selectable) when:
 *     1. It is not removed.
 *     2. No tile rests on top of it (layer + 1).
 *     3. At least one of its left or right edges is open at the same layer.
 */

export interface TilePos {
  row: number;
  col: number;
  layer: number;
}

function p(row: number, col: number, layer: number): TilePos {
  return { row, col, layer };
}

/**
 * Classic Turtle layout — 144 tiles across 5 layers.
 *
 *   Layer 0: 8 rows × 12 cols around a centre, plus 2 outliers on the sides
 *             = base layer of 84 tiles (we use 84 here)
 *   Layer 1: 6 rows × 8 cols = 48
 *   Layer 2: 4 rows × 6 cols = 24 — but we trim to fit the 144-cap
 *   Layer 3: 2 rows × 4 cols = 8
 *   Layer 4 (apex): 1 tile (resting at the centre)
 *
 * Many turtles in published shanghai-mahjong use this 1-2-4-6-8-… pattern.
 * We use an exact 144-tile arrangement that visually evokes the classic
 * turtle: a wide layer-0 mat with a small staircase of tiles on the left
 * and right, three pyramid stacks of layers 1/2/3, and a single apex.
 */
function buildClassicTurtleLayout(): TilePos[] {
  const tiles: TilePos[] = [];

  // ---- Layer 0 (base) — 84 tiles ----
  // Main body: 8 rows × 10 cols = 80
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 10; c++) {
      tiles.push(p(r, c, 0));
    }
  }
  // Two outliers on the far left/right (mid-row tiles that extend off the rectangle)
  // These are positioned past the main body so they act as side wings.
  tiles.push(p(3, -2, 0));
  tiles.push(p(4, -2, 0));
  tiles.push(p(3, 11, 0));
  tiles.push(p(4, 11, 0));
  // 80 + 4 = 84

  // ---- Layer 1 — 36 tiles ----
  // 6 rows × 6 cols, centred on rows 1-6, cols 2-7
  for (let r = 1; r < 7; r++) {
    for (let c = 2; c < 8; c++) {
      tiles.push(p(r, c, 1));
    }
  }
  // 36

  // ---- Layer 2 — 16 tiles ----
  // 4 rows × 4 cols, centred on rows 2-5, cols 3-6
  for (let r = 2; r < 6; r++) {
    for (let c = 3; c < 7; c++) {
      tiles.push(p(r, c, 2));
    }
  }
  // 16

  // ---- Layer 3 — 7 tiles ----
  // 2 rows × 3 cols + 1 extra to reach 7
  for (let r = 3; r < 5; r++) {
    for (let c = 4; c < 7; c++) {
      tiles.push(p(r, c, 3));
    }
  }
  // 2 × 3 = 6, add 1 more next to it
  tiles.push(p(3, 3, 3));
  // 7

  // ---- Layer 4 (apex) — 1 tile ----
  tiles.push(p(3, 5, 4));
  // 1

  // Total: 84 + 36 + 16 + 7 + 1 = 144 ✓
  return tiles;
}

export const TURTLE_LAYOUT: TilePos[] = buildClassicTurtleLayout();

/** Sanity check at module load: count must be exactly 144. */
if (TURTLE_LAYOUT.length !== 144) {
  // Should never trigger — defensive log for future refactors.
  // eslint-disable-next-line no-console
  console.warn(`Turtle layout has ${TURTLE_LAYOUT.length} tiles, expected 144.`);
}

// ---------------------------------------------------------------------------
// Tile faces — 42 distinct faces (36 paired ×4, 4 flowers + 2 group seasons)
// ---------------------------------------------------------------------------

export interface TileFace {
  /** Visible glyph or short label. */
  face: string;
  /** Pair-match key: identical keys can be matched. */
  matchKey: string;
  /** Suit category, for display grouping. */
  category:
    | "dots"
    | "bamboo"
    | "characters"
    | "wind"
    | "dragon"
    | "flower"
    | "season";
}

/** 34 "standard" tiles — each appears 4 times in the wall. */
const STANDARD_FACES: TileFace[] = [
  // 9 dots (circles)
  ...["🀙","🀚","🀛","🀜","🀝","🀞","🀟","🀠","🀡"].map(
    (f): TileFace => ({ face: f, matchKey: `dot-${f}`, category: "dots" }),
  ),
  // 9 bamboo
  ...["🀐","🀑","🀒","🀓","🀔","🀕","🀖","🀗","🀘"].map(
    (f): TileFace => ({ face: f, matchKey: `bam-${f}`, category: "bamboo" }),
  ),
  // 9 characters (man)
  ...["🀇","🀈","🀉","🀊","🀋","🀌","🀍","🀎","🀏"].map(
    (f): TileFace => ({ face: f, matchKey: `chr-${f}`, category: "characters" }),
  ),
  // 4 winds: East, South, West, North
  { face: "🀀", matchKey: "wind-E", category: "wind" },
  { face: "🀁", matchKey: "wind-S", category: "wind" },
  { face: "🀂", matchKey: "wind-W", category: "wind" },
  { face: "🀃", matchKey: "wind-N", category: "wind" },
  // 3 dragons: Red, Green, White
  { face: "🀄", matchKey: "dragon-R", category: "dragon" },
  { face: "🀅", matchKey: "dragon-G", category: "dragon" },
  { face: "🀆", matchKey: "dragon-W", category: "dragon" },
];

/**
 * 4 flower tiles — each unique, all match by category. So any flower
 * pairs with any other flower. (Same rule for seasons.) That keeps the
 * 144 count correct while preserving the classic "category match" rule.
 */
const FLOWER_FACES: TileFace[] = [
  { face: "🌸", matchKey: "flower", category: "flower" }, // plum
  { face: "🌺", matchKey: "flower", category: "flower" }, // orchid
  { face: "🍀", matchKey: "flower", category: "flower" }, // chrysanthemum
  { face: "🌿", matchKey: "flower", category: "flower" }, // bamboo flower
];

const SEASON_FACES: TileFace[] = [
  { face: "🌱", matchKey: "season", category: "season" }, // spring
  { face: "☀", matchKey: "season", category: "season" }, // summer
  { face: "🍂", matchKey: "season", category: "season" }, // autumn
  { face: "❄", matchKey: "season", category: "season" }, // winter
];

/** Full deck builder: 34×4 standard + 4 flowers + 4 seasons = 144 tiles. */
export function buildDeck(): TileFace[] {
  const deck: TileFace[] = [];
  for (const f of STANDARD_FACES) {
    deck.push(f, f, f, f);
  }
  for (const f of FLOWER_FACES) deck.push(f);
  for (const f of SEASON_FACES) deck.push(f);
  return deck;
}

export interface MahjongTile {
  id: number;
  face: string;
  matchKey: string;
  category: TileFace["category"];
  pos: TilePos;
  removed: boolean;
  selected: boolean;
}

export interface MahjongState {
  tiles: MahjongTile[];
  selectedId: number | null;
  removed: number;
  total: number;
  moves: number;
  /** Set true when the player has cleared the entire wall. */
  won: boolean;
  /** Set true when no matching pair remains among free tiles. */
  stuck: boolean;
}

export type MahjongAction =
  | { type: "select"; id: number }
  | { type: "deselect" }
  | { type: "reset"; seed: number };

function seededShuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

export function buildTiles(layout: TilePos[], seed: number): MahjongTile[] {
  const rng = mulberry32(seed);
  const deck = buildDeck();
  // If the layout has more positions than deck size (shouldn't), pad with the
  // last face just to avoid undefined indexing. For our 144/144 case this is
  // a no-op.
  while (deck.length < layout.length) deck.push(deck[deck.length - 1]!);
  const shuffled = seededShuffle(deck, rng);
  return layout.map((pos, i) => {
    const f = shuffled[i]!;
    return {
      id: i,
      face: f.face,
      matchKey: f.matchKey,
      category: f.category,
      pos,
      removed: false,
      selected: false,
    };
  });
}

/**
 * A tile is "free" (selectable) when:
 *   1. It is not removed.
 *   2. No tile sits directly above it (layer + 1, overlapping its footprint).
 *   3. Either its left edge OR its right edge is fully unblocked at the same layer.
 *
 * Tile footprints are 1 row × 2 cols (mahjong tiles are taller than wide),
 * so an above-tile at (r, c±0..±1, layer+1) covers it. A same-layer left
 * neighbour is at (r, c-1) or (r, c-2). Same for right.
 */
export function isFree(tile: MahjongTile, tiles: readonly MahjongTile[]): boolean {
  if (tile.removed) return false;
  const { row, col, layer } = tile.pos;

  for (const t of tiles) {
    if (t.removed) continue;
    if (t.id === tile.id) continue;
    if (t.pos.layer === layer + 1 && t.pos.row === row && Math.abs(t.pos.col - col) <= 1) {
      return false;
    }
  }

  let hasLeft = false;
  let hasRight = false;
  for (const t of tiles) {
    if (t.removed) continue;
    if (t.id === tile.id) continue;
    if (t.pos.layer !== layer) continue;
    if (t.pos.row !== row) continue;
    if (t.pos.col === col - 1 || t.pos.col === col - 2) hasLeft = true;
    else if (t.pos.col === col + 1 || t.pos.col === col + 2) hasRight = true;
    if (hasLeft && hasRight) break;
  }

  return !hasLeft || !hasRight;
}

/** Does at least one matching pair exist among currently free tiles? */
export function hasMatchingPair(tiles: readonly MahjongTile[]): boolean {
  const free: MahjongTile[] = [];
  for (const t of tiles) {
    if (!t.removed && isFree(t, tiles)) free.push(t);
  }
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (free[i]!.matchKey === free[j]!.matchKey) return true;
    }
  }
  return false;
}

export function initialState(seed: number, _settings: Record<string, never> = {}): MahjongState {
  void _settings;
  const tiles = buildTiles(TURTLE_LAYOUT, seed);
  return {
    tiles,
    selectedId: null,
    removed: 0,
    total: tiles.length,
    moves: 0,
    won: false,
    stuck: false,
  };
}

export function reducer(state: MahjongState, action: MahjongAction): MahjongState {
  if (action.type === "reset") {
    return initialState(action.seed);
  }
  if (state.won || state.stuck) return state;

  switch (action.type) {
    case "deselect": {
      if (state.selectedId === null) return state;
      return {
        ...state,
        tiles: state.tiles.map((t) => (t.selected ? { ...t, selected: false } : t)),
        selectedId: null,
      };
    }
    case "select": {
      const clicked = state.tiles.find((t) => t.id === action.id);
      if (!clicked || clicked.removed) return state;
      if (!isFree(clicked, state.tiles)) return state;

      // Click already-selected tile → deselect.
      if (state.selectedId === action.id) {
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: false } : t)),
          selectedId: null,
        };
      }

      // No current selection → make this the first selection.
      if (state.selectedId === null) {
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: true } : t)),
          selectedId: action.id,
        };
      }

      // Have a previous selection — try to match.
      const first = state.tiles.find((t) => t.id === state.selectedId);
      if (!first) {
        // Recover from inconsistent state.
        return {
          ...state,
          tiles: state.tiles.map((t) => (t.id === action.id ? { ...t, selected: true } : t)),
          selectedId: action.id,
        };
      }

      if (first.matchKey === clicked.matchKey) {
        // Match — remove both.
        const newTiles = state.tiles.map((t) =>
          t.id === first.id || t.id === clicked.id
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
          moves: state.moves + 1,
          won,
          stuck: !won && !hasMatchingPair(newTiles),
        };
      }

      // No match — first stays in place, new becomes selected.
      return {
        ...state,
        tiles: state.tiles.map((t) => {
          if (t.id === first.id) return { ...t, selected: false };
          if (t.id === action.id) return { ...t, selected: true };
          return t;
        }),
        selectedId: action.id,
      };
    }
    default:
      return state;
  }
}

/**
 * Scoring (per task brief):
 *   - Win → score = tiles matched (always 144)
 *   - Stuck/loss → score = 0
 */
export function isTerminal(state: MahjongState): { score: number } | null {
  if (state.won) return { score: state.removed };
  if (state.stuck) return { score: 0 };
  return null;
}
