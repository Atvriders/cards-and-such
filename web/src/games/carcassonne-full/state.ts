// Carcassonne (Full Base Game) — 72-tile classic edition, 1 human vs 2 CPUs.
//
// L-complexity scaffold. Implemented:
//   * 72-tile base deck with the canonical distribution (see TILE_DISTRIBUTION
//     in this file for the exact mix used).
//   * Edge-typed tiles (city/road/field) with optional cloister + city shield.
//   * Tile placement with edge-match validation (city↔city, road↔road,
//     field↔field) against every existing orthogonal neighbour.
//   * Within-tile feature merging: each tile carries an explicit `joins`
//     list describing which of its N/E/S/W edges belong to the same internal
//     segment (so a straight road tile joins N+S, a curve joins N+E, etc.).
//   * Across-tile feature merging via union-find: when two tiles touch on
//     matching edges, the two edge-segments fuse into one feature.
//   * Meeple placement on a feature of the just-placed tile (only legal if
//     NO meeple of any colour currently sits on that feature group).
//   * Mid-game scoring of completed cities (2 per tile, 3 if shield),
//     completed roads (1 per tile when both ends terminate), and completed
//     cloisters (1 + 1 per occupied neighbour, fully surrounded).
//   * Meeples return to their owner when their feature scores.
//   * End-of-bag final scoring: incomplete cities/roads/cloisters credited
//     at 1 per tile, and farmer (field) meeples credited 3 points per
//     completed city the field borders.
//   * 3-player turn order (seat 0 = human, seats 1/2 = CPUs) with greedy
//     CPU play (prefers placements that immediately complete features, then
//     smallest-pending features, and avoids fields until the bag is small).
//
// TODO: rules omitted in this L-complexity build:
//   * Optional 1-point bonus for completing a feature mid-turn ("merci"
//     variant — base game doesn't use it anyway).
//   * Rotation of the tile before placement is fully supported, but the
//     CPU only tries each rotation greedily — it does not look ahead.
//   * Field-scoring uses a simplified model: each *completed* city
//     touching a farmer's field counts once per field group, regardless
//     of how many tiles of the field touch that city (which matches the
//     1st-edition rule). 2nd-edition cities-per-field variants are
//     omitted.
//   * No tie-break between players with multiple meeples on a feature —
//     we use the standard "majority wins, split evenly on tie" rule.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// --------------------------------------------------------------------------
// Constants & types
// --------------------------------------------------------------------------

/** Edge kinds. Internal segments use the same string. */
export type EdgeKind = "city" | "road" | "field";

/** Edge sides indexed 0..3 = N, E, S, W. */
export const N = 0 as const;
export const E = 1 as const;
export const S = 2 as const;
export const W = 3 as const;
export type Side = 0 | 1 | 2 | 3;

/** Opposite side lookup. */
const OPP: readonly Side[] = [S, W, N, E];

/** Tile prototype before rotation. Edges always listed N,E,S,W. */
export interface TileProto {
  /** Stable ID used by tests/UI. */
  id: string;
  /** Edge kinds N,E,S,W. */
  edges: readonly [EdgeKind, EdgeKind, EdgeKind, EdgeKind];
  /** Internal joins: each group is a set of side indices that belong to
   *  the same segment (e.g. [[0,2]] = straight road joining N+S).
   *  Sides not listed in any group are their own singleton segment. */
  joins: readonly (readonly number[])[];
  /** True if this tile has a cloister/monastery in the centre. */
  cloister: boolean;
  /** True if a city segment on this tile has a coat-of-arms shield.
   *  We assume there is at most one city segment per tile; the shield
   *  attaches to the largest city group on the tile. */
  shield: boolean;
  /** Whether this is the starting tile (placed at origin). */
  start?: boolean;
}

/** Player count is fixed at 3 (human + 2 CPUs). */
export const NUM_PLAYERS = 3;
export const MEEPLES_PER_PLAYER = 7;

/** Board grid coordinates. We use a finite 17×17 grid with the start tile
 *  in the centre at (8, 8). With 72 tiles in the bag, no row/column can
 *  ever span more than 9 tiles in either direction from the start, so 17
 *  is comfortable headroom. */
export const BOARD_SIZE = 17;
export const ORIGIN = Math.floor(BOARD_SIZE / 2);

// --------------------------------------------------------------------------
// Tile distribution (totals 72 with the start tile)
// --------------------------------------------------------------------------
//
// Counts roughly match the canonical base game (small simplifications for
// the L-complexity build):
//   * 4 four-sided cities (1 with shield)              =  4
//   * 5 three-sided cities (2 with shield)             =  5
//   * 4 three-sided city + road (1 with shield)        =  4
//   * 3 two-sided city straight (2 with shield)        =  3
//   * 3 two-sided city curved (1 with shield)          =  3
//   * 5 one-sided city blocks                          =  5
//   * 8 straight roads                                 =  8
//   * 9 curved roads                                   =  9
//   * 4 T-junctions                                    =  4
//   * 1 4-way crossroad                                =  1
//   * 4 plain cloisters                                =  4
//   * 2 cloisters with road                            =  2
//   * 8 city + curved road                             =  8
//   * 3 city + straight road                           =  3
//   * 8 small city/road/field corner pieces            =  8
//   * 1 starter tile (city-road-field corner)          =  1
//   ---------------------------------------------------- = 72

export const TILE_DISTRIBUTION: ReadonlyArray<{ proto: TileProto; count: number }> = (() => {
  const protos: Array<{ proto: TileProto; count: number }> = [];

  // 4-sided city (all four edges city, joined as one feature)
  protos.push({
    proto: {
      id: "city4",
      edges: ["city", "city", "city", "city"],
      joins: [[0, 1, 2, 3]],
      cloister: false,
      shield: false,
    },
    count: 3,
  });
  protos.push({
    proto: {
      id: "city4s",
      edges: ["city", "city", "city", "city"],
      joins: [[0, 1, 2, 3]],
      cloister: false,
      shield: true,
    },
    count: 1,
  });

  // 3-sided city (N,E,W city joined; S field). Plain and shielded variants.
  protos.push({
    proto: {
      id: "city3",
      edges: ["city", "city", "field", "city"],
      joins: [[0, 1, 3]],
      cloister: false,
      shield: false,
    },
    count: 3,
  });
  protos.push({
    proto: {
      id: "city3s",
      edges: ["city", "city", "field", "city"],
      joins: [[0, 1, 3]],
      cloister: false,
      shield: true,
    },
    count: 2,
  });

  // 3-sided city + road on the 4th side (N,E,W city joined; S road).
  protos.push({
    proto: {
      id: "city3r",
      edges: ["city", "city", "road", "city"],
      joins: [[0, 1, 3]],
      cloister: false,
      shield: false,
    },
    count: 3,
  });
  protos.push({
    proto: {
      id: "city3rs",
      edges: ["city", "city", "road", "city"],
      joins: [[0, 1, 3]],
      cloister: false,
      shield: true,
    },
    count: 1,
  });

  // 2-sided city straight (N+S city joined into one wall across, E+W field)
  protos.push({
    proto: {
      id: "city2straight",
      edges: ["city", "field", "city", "field"],
      joins: [[0, 2]],
      cloister: false,
      shield: false,
    },
    count: 1,
  });
  protos.push({
    proto: {
      id: "city2straights",
      edges: ["city", "field", "city", "field"],
      joins: [[0, 2]],
      cloister: false,
      shield: true,
    },
    count: 2,
  });

  // 2-sided city curve (N+E joined, S+W field)
  protos.push({
    proto: {
      id: "city2curve",
      edges: ["city", "city", "field", "field"],
      joins: [[0, 1]],
      cloister: false,
      shield: false,
    },
    count: 2,
  });
  protos.push({
    proto: {
      id: "city2curves",
      edges: ["city", "city", "field", "field"],
      joins: [[0, 1]],
      cloister: false,
      shield: true,
    },
    count: 1,
  });

  // 1-sided city block (N city; E/S/W field, all field joined)
  protos.push({
    proto: {
      id: "city1",
      edges: ["city", "field", "field", "field"],
      joins: [[1, 2, 3]],
      cloister: false,
      shield: false,
    },
    count: 5,
  });

  // Straight road (N+S road joined, E/W field joined separately)
  protos.push({
    proto: {
      id: "roadStraight",
      edges: ["field", "field", "field", "field"], // overwritten below
      joins: [],
      cloister: false,
      shield: false,
    },
    count: 0,
  });
  protos[protos.length - 1] = {
    proto: {
      id: "roadStraight",
      edges: ["road", "field", "road", "field"],
      joins: [[0, 2]],
      cloister: false,
      shield: false,
    },
    count: 8,
  };

  // Curved road (N+E road joined, S+W field joined)
  protos.push({
    proto: {
      id: "roadCurve",
      edges: ["road", "road", "field", "field"],
      joins: [[0, 1]],
      cloister: false,
      shield: false,
    },
    count: 9,
  });

  // T-junction (3 road ends, 1 field side): each road end is its own
  // segment so a T-junction never completes a single road on its own.
  protos.push({
    proto: {
      id: "roadT",
      edges: ["road", "road", "field", "road"],
      joins: [],
      cloister: false,
      shield: false,
    },
    count: 4,
  });

  // 4-way crossroad: 4 road ends, all distinct
  protos.push({
    proto: {
      id: "roadCross",
      edges: ["road", "road", "road", "road"],
      joins: [],
      cloister: false,
      shield: false,
    },
    count: 1,
  });

  // Cloister, plain (all 4 sides field, joined)
  protos.push({
    proto: {
      id: "cloister",
      edges: ["field", "field", "field", "field"],
      joins: [[0, 1, 2, 3]],
      cloister: true,
      shield: false,
    },
    count: 4,
  });

  // Cloister with road on S
  protos.push({
    proto: {
      id: "cloisterRoad",
      edges: ["field", "field", "road", "field"],
      joins: [[0, 1, 3]],
      cloister: true,
      shield: false,
    },
    count: 2,
  });

  // City + curved road: N city, E road, S road, W field. Roads join (E+S
  // curve), W field is its own segment.
  protos.push({
    proto: {
      id: "cityRoadCurve",
      edges: ["city", "road", "road", "field"],
      joins: [[1, 2]],
      cloister: false,
      shield: false,
    },
    count: 8,
  });

  // City + straight road: N city, E road, S field, W road. E+W roads join.
  protos.push({
    proto: {
      id: "cityRoadStraight",
      edges: ["city", "road", "field", "road"],
      joins: [[1, 3]],
      cloister: false,
      shield: false,
    },
    count: 3,
  });

  // Small corner pieces: N city, E field, S road, W road (curve in SW).
  // City is its own segment; the two roads join into one curving road;
  // the E field is its own segment.
  protos.push({
    proto: {
      id: "cityRoadCornerA",
      edges: ["city", "field", "road", "road"],
      joins: [[2, 3]],
      cloister: false,
      shield: false,
    },
    count: 4,
  });
  // Mirror: N city, E road, S road, W field. (E+S join)
  protos.push({
    proto: {
      id: "cityRoadCornerB",
      edges: ["city", "road", "road", "field"],
      joins: [[1, 2]],
      cloister: false,
      shield: false,
    },
    count: 4,
  });

  // Starter tile (placed at origin, NOT drawn): N city, E road, S field, W road.
  // The two roads join.
  protos.push({
    proto: {
      id: "starter",
      edges: ["city", "road", "field", "road"],
      joins: [[1, 3]],
      cloister: false,
      shield: false,
      start: true,
    },
    count: 1,
  });

  return protos;
})();

/** Build the full deck (array of TileProto, one per copy). The starter tile
 *  is included so the total is exactly 72, but it is placed before play
 *  rather than drawn. */
export function buildDeck(): TileProto[] {
  const out: TileProto[] = [];
  for (const { proto, count } of TILE_DISTRIBUTION) {
    for (let i = 0; i < count; i++) out.push(proto);
  }
  return out;
}

// Sanity check at module load: deck should be exactly 72 tiles.
const _DECK_SIZE_CHECK = buildDeck().length;
if (_DECK_SIZE_CHECK !== 72) {
  // eslint-disable-next-line no-console
  console.warn(`[carcassonne-full] expected 72 tiles, got ${_DECK_SIZE_CHECK}`);
}

// --------------------------------------------------------------------------
// Placed tile + feature graph
// --------------------------------------------------------------------------

/** A placed tile on the board: which prototype + rotation. */
export interface PlacedTile {
  proto: TileProto;
  /** 0..3 rotations clockwise. */
  rot: 0 | 1 | 2 | 3;
  /** Grid coordinate. */
  x: number;
  y: number;
  /** Tile index in `state.placed` (filled by reducer). */
  idx: number;
}

/** A unique segment ID: tileIdx * 4 + sideIdx for an edge segment, or
 *  tileIdx * 4 + 4 for the cloister centre. We pack both into a string
 *  keyed map for clarity. */
export type SegmentId = string;

export function edgeSeg(tileIdx: number, side: Side): SegmentId {
  return `${tileIdx}:e${side}`;
}
export function cloisterSeg(tileIdx: number): SegmentId {
  return `${tileIdx}:c`;
}

/** A meeple placed on a feature. */
export interface Meeple {
  /** Owner seat. */
  owner: number;
  /** The segment ID the meeple was placed on. Used to look up the feature
   *  group through the union-find structure. */
  seg: SegmentId;
}

/** Game-wide phase. */
export type Phase =
  | "place"      // waiting for current player to place the just-drawn tile
  | "meeple"     // tile placed, waiting for current player to place meeple (or skip)
  | "done";

/** Settings: which CPU difficulty to use. */
export interface CarcassonneFullSettings {
  cpu: "greedy";
}

export interface CarcassonneFullState {
  settings: CarcassonneFullSettings;
  /** Tiles remaining to draw, last element drawn first. */
  bag: TileProto[];
  /** Currently held tile (drawn at start of turn). null when phase=done. */
  current: TileProto | null;
  /** All tiles placed on the board, in placement order. */
  placed: PlacedTile[];
  /** board[y][x] = idx into `placed`, or -1 if empty. */
  board: number[][];
  /** Whose turn it is (0=human, 1=cpu1, 2=cpu2). */
  turn: number;
  /** Phase. */
  phase: Phase;
  /** Meeples on the board (active). */
  meeples: Meeple[];
  /** Meeples each player has in their supply. */
  supply: number[];
  /** Cumulative scores per player. */
  scores: number[];
  /** Union-find parent table over segment IDs. */
  ufParent: Record<SegmentId, SegmentId>;
  /** Segment "kind" lookup: which feature kind a segment belongs to. */
  segKind: Record<SegmentId, EdgeKind | "cloister">;
  /** RNG seed (used for deterministic shuffles + CPU tie-breaks). */
  rngSeed: number;
  /** Last log line, for the UI. */
  log: string;
  /** Pre-computed candidate placements for the current tile (for human UI).
   *  Filled lazily by the reducer/Game. */
  candidates?: ReadonlyArray<{ x: number; y: number; rot: 0 | 1 | 2 | 3 }>;
}

// --------------------------------------------------------------------------
// Action types
// --------------------------------------------------------------------------

export type CarcassonneFullAction =
  | { type: "place"; x: number; y: number; rot: 0 | 1 | 2 | 3 }
  | { type: "meeple"; side: Side | "cloister" | null } // null = skip
  | { type: "cpuStep" };

// --------------------------------------------------------------------------
// Helpers — rotation, edges, neighbours
// --------------------------------------------------------------------------

/** Returns the rotated edge kind on a given side of a tile. A rotation of
 *  1 (90° clockwise) sends north→east etc. So `edgeAfterRot(proto, rot, side)`
 *  is `proto.edges[(side - rot + 4) % 4]`. */
export function edgeAfterRot(proto: TileProto, rot: number, side: Side): EdgeKind {
  return proto.edges[(side - rot + 4) % 4]!;
}

/** Rotated join groups: each side index in a join group rotates by `rot`. */
export function joinsAfterRot(proto: TileProto, rot: number): number[][] {
  return proto.joins.map((g) => g.map((s) => (s + rot) % 4));
}

/** Resolve which sides belong to the same internal segment under rotation.
 *  Returns a map: side → segment leader side (smallest side in its group). */
export function sideToSegLeader(proto: TileProto, rot: number): Record<Side, Side> {
  const groups = joinsAfterRot(proto, rot);
  const leader: Record<number, number> = {};
  for (const side of [0, 1, 2, 3]) leader[side] = side;
  for (const g of groups) {
    const minSide = Math.min(...g);
    for (const s of g) leader[s] = minSide;
  }
  return leader as Record<Side, Side>;
}

const NEIGHBOUR_DELTAS: ReadonlyArray<{ dx: number; dy: number; side: Side }> = [
  { dx: 0, dy: -1, side: N },
  { dx: 1, dy: 0, side: E },
  { dx: 0, dy: 1, side: S },
  { dx: -1, dy: 0, side: W },
];

function inBounds(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;
}

export function neighborsOf(board: number[][], x: number, y: number): Array<{ side: Side; nIdx: number }> {
  const out: Array<{ side: Side; nIdx: number }> = [];
  for (const { dx, dy, side } of NEIGHBOUR_DELTAS) {
    const nx = x + dx;
    const ny = y + dy;
    if (!inBounds(nx, ny)) continue;
    const idx = board[ny]![nx]!;
    if (idx >= 0) out.push({ side, nIdx: idx });
  }
  return out;
}

// --------------------------------------------------------------------------
// Union-find on segments
// --------------------------------------------------------------------------

function ufFind(parent: Record<SegmentId, SegmentId>, id: SegmentId): SegmentId {
  let cur = id;
  while (parent[cur] !== undefined && parent[cur] !== cur) {
    cur = parent[cur]!;
  }
  // Path compression
  let walk = id;
  while (parent[walk] !== undefined && parent[walk] !== walk) {
    const next = parent[walk]!;
    parent[walk] = cur;
    walk = next;
  }
  return cur;
}

function ufUnion(parent: Record<SegmentId, SegmentId>, a: SegmentId, b: SegmentId): SegmentId {
  const ra = ufFind(parent, a);
  const rb = ufFind(parent, b);
  if (ra === rb) return ra;
  // Lexicographic union for determinism.
  if (ra < rb) {
    parent[rb] = ra;
    return ra;
  } else {
    parent[ra] = rb;
    return rb;
  }
}

// --------------------------------------------------------------------------
// Placement validation
// --------------------------------------------------------------------------

/** Can this tile be placed at (x,y) with rotation `rot` given the current
 *  board? Rules: must be empty, must be orthogonally adjacent to at least
 *  one existing tile, and every shared edge with a neighbour must have
 *  matching edge kind. */
export function canPlace(
  state: CarcassonneFullState,
  proto: TileProto,
  x: number,
  y: number,
  rot: 0 | 1 | 2 | 3,
): boolean {
  if (!inBounds(x, y)) return false;
  if (state.board[y]![x]! >= 0) return false;
  const neighbours = neighborsOf(state.board, x, y);
  if (neighbours.length === 0) {
    // First placement (other than starter) must touch existing board.
    // Starter is placed during initialState, never via canPlace, so:
    return false;
  }
  for (const { side, nIdx } of neighbours) {
    const myEdge = edgeAfterRot(proto, rot, side);
    const nbr = state.placed[nIdx]!;
    const nbrEdge = edgeAfterRot(nbr.proto, nbr.rot, OPP[side]!);
    if (myEdge !== nbrEdge) return false;
  }
  return true;
}

/** Returns every legal (x, y, rot) placement for `proto` on the current
 *  board. Used by the human UI and the CPU. */
export function allLegalPlacements(
  state: CarcassonneFullState,
  proto: TileProto,
): Array<{ x: number; y: number; rot: 0 | 1 | 2 | 3 }> {
  const out: Array<{ x: number; y: number; rot: 0 | 1 | 2 | 3 }> = [];
  // Only consider cells adjacent to at least one placed tile.
  const seen = new Set<string>();
  for (const pl of state.placed) {
    for (const { dx, dy } of NEIGHBOUR_DELTAS) {
      const x = pl.x + dx;
      const y = pl.y + dy;
      const k = `${x},${y}`;
      if (seen.has(k)) continue;
      seen.add(k);
      if (!inBounds(x, y)) continue;
      if (state.board[y]![x]! >= 0) continue;
      for (const rot of [0, 1, 2, 3] as const) {
        if (canPlace(state, proto, x, y, rot)) {
          out.push({ x, y, rot });
        }
      }
    }
  }
  return out;
}

// --------------------------------------------------------------------------
// Feature graph maintenance — after each placement
// --------------------------------------------------------------------------

/** Add segments for a newly placed tile to the UF structure, and merge
 *  with neighbouring segments where edges touch. Returns the segment
 *  group leaders affected (so the caller can check completion). */
function addTileToFeatureGraph(state: CarcassonneFullState, pt: PlacedTile): SegmentId[] {
  const tIdx = pt.idx;
  // Create one segment ID per "leader side" on the tile. Sides sharing a
  // join group share a segment ID.
  const leader = sideToSegLeader(pt.proto, pt.rot);
  const myLeaders = new Set<number>();
  for (const side of [0, 1, 2, 3]) myLeaders.add(leader[side as Side]!);

  for (const lead of myLeaders) {
    const sid = edgeSeg(tIdx, lead as Side);
    state.ufParent[sid] = sid;
    state.segKind[sid] = edgeAfterRot(pt.proto, pt.rot, lead as Side);
  }

  // Cloister centre, if any.
  if (pt.proto.cloister) {
    const csid = cloisterSeg(tIdx);
    state.ufParent[csid] = csid;
    state.segKind[csid] = "cloister";
  }

  // Merge across every adjacent neighbour edge.
  const touched: SegmentId[] = [];
  for (const { dx, dy, side } of NEIGHBOUR_DELTAS) {
    const nx = pt.x + dx;
    const ny = pt.y + dy;
    if (!inBounds(nx, ny)) continue;
    const nIdx = state.board[ny]![nx]!;
    if (nIdx < 0) continue;
    const nbr = state.placed[nIdx]!;
    const nbrLeader = sideToSegLeader(nbr.proto, nbr.rot);
    const mySeg = edgeSeg(tIdx, leader[side]! as Side);
    const nbrSeg = edgeSeg(nIdx, nbrLeader[OPP[side]!]! as Side);
    const merged = ufUnion(state.ufParent, mySeg, nbrSeg);
    touched.push(merged);
  }
  // Always include the tile's own leaders (so cloister-only or city-only
  // tiles get evaluated for completion / cloister-completion too).
  for (const lead of myLeaders) touched.push(ufFind(state.ufParent, edgeSeg(tIdx, lead as Side)));
  if (pt.proto.cloister) touched.push(cloisterSeg(tIdx));

  return touched;
}

// --------------------------------------------------------------------------
// Feature inspection (tile members, completion test, scoring)
// --------------------------------------------------------------------------

/** Walk every placed tile's segments, collect those that belong to the
 *  same UF root as `rootSeg`. Returns the set of (tileIdx, side) pairs
 *  and the set of tile indices. */
export function featureMembers(state: CarcassonneFullState, rootSeg: SegmentId): {
  tiles: Set<number>;
  segs: Array<{ tileIdx: number; side: Side | "cloister" }>;
} {
  const tiles = new Set<number>();
  const segs: Array<{ tileIdx: number; side: Side | "cloister" }> = [];
  const target = ufFind(state.ufParent, rootSeg);
  for (let tIdx = 0; tIdx < state.placed.length; tIdx++) {
    const pl = state.placed[tIdx]!;
    const leader = sideToSegLeader(pl.proto, pl.rot);
    // Walk every leader side
    const seen = new Set<number>();
    for (const side of [0, 1, 2, 3]) {
      const ls = leader[side as Side]!;
      if (seen.has(ls)) continue;
      seen.add(ls);
      const sid = edgeSeg(tIdx, ls as Side);
      if (state.ufParent[sid] === undefined) continue;
      if (ufFind(state.ufParent, sid) === target) {
        tiles.add(tIdx);
        segs.push({ tileIdx: tIdx, side: ls as Side });
      }
    }
    if (pl.proto.cloister) {
      const csid = cloisterSeg(tIdx);
      if (state.ufParent[csid] !== undefined && ufFind(state.ufParent, csid) === target) {
        tiles.add(tIdx);
        segs.push({ tileIdx: tIdx, side: "cloister" });
      }
    }
  }
  return { tiles, segs };
}

/** Is a city or road feature complete? A city is complete when every edge
 *  in the feature has a neighbouring tile (i.e. the wall is closed). A
 *  road is complete when every road end either (a) terminates in a road
 *  junction (T/X) — represented in our model by being its own singleton
 *  segment — or (b) closes back on the feature itself, i.e. all leaf
 *  edges have a neighbour. */
export function isFeatureComplete(state: CarcassonneFullState, rootSeg: SegmentId): boolean {
  const kind = state.segKind[ufFind(state.ufParent, rootSeg)] ?? state.segKind[rootSeg];
  if (kind === "cloister") {
    // Cloister: complete when its tile + 8 surrounding cells are all placed.
    const { tiles } = featureMembers(state, rootSeg);
    if (tiles.size !== 1) return false;
    const tIdx = [...tiles][0]!;
    const pl = state.placed[tIdx]!;
    let neighbourCount = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = pl.x + dx;
        const ny = pl.y + dy;
        if (!inBounds(nx, ny)) continue;
        if (state.board[ny]![nx]! >= 0) neighbourCount++;
      }
    }
    return neighbourCount === 8;
  }
  if (kind === "field") return false; // fields never "complete" mid-game
  // city or road: walk each segment; for each side index in the segment's
  // group, the tile must have a neighbour on that side.
  const { segs } = featureMembers(state, rootSeg);
  for (const s of segs) {
    if (s.side === "cloister") continue;
    const pl = state.placed[s.tileIdx]!;
    const leader = sideToSegLeader(pl.proto, pl.rot);
    // For every side that maps to this segment leader, check neighbour exists.
    for (const side of [0, 1, 2, 3]) {
      if (leader[side as Side] !== s.side) continue;
      const dx = side === E ? 1 : side === W ? -1 : 0;
      const dy = side === S ? 1 : side === N ? -1 : 0;
      const nx = pl.x + dx;
      const ny = pl.y + dy;
      if (!inBounds(nx, ny) || state.board[ny]![nx]! < 0) return false;
    }
  }
  return true;
}

/** Score a completed feature. */
export function scoreCompleted(state: CarcassonneFullState, rootSeg: SegmentId): number {
  const kind = state.segKind[ufFind(state.ufParent, rootSeg)] ?? state.segKind[rootSeg];
  const { tiles, segs } = featureMembers(state, rootSeg);
  if (kind === "cloister") {
    // 1 + 1 per occupied neighbour (= 9 when fully surrounded).
    return 9;
  }
  if (kind === "city") {
    // 2 per tile, +1 per tile that has a shield in this city's segments.
    let shields = 0;
    for (const t of tiles) {
      const pl = state.placed[t]!;
      // Shield applies if the tile has shield === true and the city
      // segment on this tile is the segment belonging to the feature.
      if (!pl.proto.shield) continue;
      // Find this tile's city segment that belongs to the feature
      const found = segs.find((s) => s.tileIdx === t && s.side !== "cloister");
      if (found) shields++;
    }
    return tiles.size * 2 + shields;
  }
  if (kind === "road") return tiles.size; // 1 per tile
  return 0;
}

/** End-game scoring for an incomplete feature. */
export function scoreIncomplete(state: CarcassonneFullState, rootSeg: SegmentId): number {
  const kind = state.segKind[ufFind(state.ufParent, rootSeg)] ?? state.segKind[rootSeg];
  const { tiles } = featureMembers(state, rootSeg);
  if (kind === "cloister") {
    // 1 + 1 per occupied neighbour.
    const tIdx = [...tiles][0];
    if (tIdx === undefined) return 0;
    const pl = state.placed[tIdx]!;
    let neighbours = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = pl.x + dx;
        const ny = pl.y + dy;
        if (!inBounds(nx, ny)) continue;
        if (state.board[ny]![nx]! >= 0) neighbours++;
      }
    }
    return 1 + neighbours;
  }
  if (kind === "city" || kind === "road") return tiles.size; // 1 per tile
  return 0;
}

/** Who "controls" a feature? Returns the seat with the most meeples on it,
 *  or null if no meeples. On tie, returns all tied seats. */
export function featureOwners(state: CarcassonneFullState, rootSeg: SegmentId): number[] {
  const target = ufFind(state.ufParent, rootSeg);
  const counts = new Map<number, number>();
  for (const m of state.meeples) {
    if (state.ufParent[m.seg] === undefined) continue;
    if (ufFind(state.ufParent, m.seg) !== target) continue;
    counts.set(m.owner, (counts.get(m.owner) ?? 0) + 1);
  }
  if (counts.size === 0) return [];
  const max = Math.max(...counts.values());
  return [...counts.entries()].filter(([, c]) => c === max).map(([s]) => s);
}

/** Compute the field segments adjacent to a city feature, used in end-game
 *  field scoring. For each completed city, every farmer-feature that
 *  touches the city gets 3 points (per owner). */
function fieldsTouchingCity(state: CarcassonneFullState, cityRoot: SegmentId): Set<SegmentId> {
  const target = ufFind(state.ufParent, cityRoot);
  const out = new Set<SegmentId>();
  // For each tile in the city, look at every leader side that is "field"
  // on this tile — those fields touch the city if they are on the same
  // tile as a city side belonging to the feature.
  for (let tIdx = 0; tIdx < state.placed.length; tIdx++) {
    const pl = state.placed[tIdx]!;
    const leader = sideToSegLeader(pl.proto, pl.rot);
    const tileCitySegs = new Set<number>();
    for (const side of [0, 1, 2, 3]) {
      const ls = leader[side as Side]!;
      const sid = edgeSeg(tIdx, ls as Side);
      if (state.ufParent[sid] === undefined) continue;
      if (ufFind(state.ufParent, sid) === target) tileCitySegs.add(ls);
    }
    if (tileCitySegs.size === 0) continue;
    // The tile contributes its fields if it has any field segment.
    for (const side of [0, 1, 2, 3]) {
      const ls = leader[side as Side]!;
      const sid = edgeSeg(tIdx, ls as Side);
      if (state.segKind[sid] === "field") {
        out.add(ufFind(state.ufParent, sid));
      }
    }
  }
  return out;
}

// --------------------------------------------------------------------------
// Reducer helpers — scoring + meeple return
// --------------------------------------------------------------------------

/** Award `pts` to feature owners (split evenly on tie). */
function awardPoints(state: CarcassonneFullState, rootSeg: SegmentId, pts: number): void {
  const owners = featureOwners(state, rootSeg);
  if (owners.length === 0) return;
  // Standard Carcassonne rule: each majority owner gets the full points
  // (no division). This mirrors "split evenly" for cities/roads where
  // tied players each get the full score in the official rules.
  for (const o of owners) state.scores[o] = (state.scores[o] ?? 0) + pts;
}

/** Return meeples sitting on a given feature root to their owners' supply. */
function returnMeeples(state: CarcassonneFullState, rootSeg: SegmentId): number {
  const target = ufFind(state.ufParent, rootSeg);
  const keep: Meeple[] = [];
  let removed = 0;
  for (const m of state.meeples) {
    if (state.ufParent[m.seg] === undefined) { keep.push(m); continue; }
    if (ufFind(state.ufParent, m.seg) === target) {
      state.supply[m.owner] = (state.supply[m.owner] ?? 0) + 1;
      removed++;
    } else {
      keep.push(m);
    }
  }
  state.meeples = keep;
  return removed;
}

/** After placing a tile, score any features (cities, roads, cloisters)
 *  that just completed. Cloisters can also complete on neighbour tiles
 *  — we check every cloister within the 3x3 around the placed tile. */
function scoreAfterPlacement(state: CarcassonneFullState, pt: PlacedTile): string[] {
  const log: string[] = [];
  const checkedRoots = new Set<SegmentId>();

  // Collect all candidate roots: this tile's segments + any cloister
  // segments within the 3x3 neighbourhood.
  const candidates: SegmentId[] = [];
  const leader = sideToSegLeader(pt.proto, pt.rot);
  for (const side of [0, 1, 2, 3]) {
    const ls = leader[side as Side]!;
    candidates.push(edgeSeg(pt.idx, ls as Side));
  }
  if (pt.proto.cloister) candidates.push(cloisterSeg(pt.idx));
  // Also include cloisters on the 8 surrounding tiles.
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = pt.x + dx;
      const ny = pt.y + dy;
      if (!inBounds(nx, ny)) continue;
      const nIdx = state.board[ny]![nx]!;
      if (nIdx < 0) continue;
      const nbr = state.placed[nIdx]!;
      if (nbr.proto.cloister) candidates.push(cloisterSeg(nIdx));
    }
  }

  for (const sid of candidates) {
    if (state.ufParent[sid] === undefined) continue;
    const root = ufFind(state.ufParent, sid);
    if (checkedRoots.has(root)) continue;
    checkedRoots.add(root);
    const kind = state.segKind[root];
    if (kind === "field") continue; // fields are end-game only
    if (!isFeatureComplete(state, root)) continue;
    const pts = scoreCompleted(state, root);
    const owners = featureOwners(state, root);
    if (owners.length > 0) {
      awardPoints(state, root, pts);
      log.push(`${kind} completed → ${pts} pts to seat${owners.length > 1 ? "s " : " "}${owners.join("/")}`);
    }
    // Meeples always come back when a feature scores.
    if (state.meeples.some((m) => state.ufParent[m.seg] !== undefined && ufFind(state.ufParent, m.seg) === root)) {
      const got = returnMeeples(state, root);
      if (got > 0 && owners.length === 0) {
        log.push(`${kind} completed (no meeples — no points)`);
      }
    }
  }
  return log;
}

/** Final scoring: incomplete features (1 per tile, or 1+neighbours for
 *  cloisters), plus farmer scoring (3 per completed city touched). */
function finalScoring(state: CarcassonneFullState): string[] {
  const log: string[] = ["--- final scoring ---"];

  // Pass 1: per-feature roots present in the UF map.
  const roots = new Set<SegmentId>();
  for (const sid of Object.keys(state.ufParent)) {
    roots.add(ufFind(state.ufParent, sid));
  }

  // Identify completed cities (used by field scoring) — track BEFORE we
  // do any farmer scoring so completion status doesn't change.
  const completedCities = new Set<SegmentId>();
  for (const root of roots) {
    if (state.segKind[root] === "city" && isFeatureComplete(state, root)) {
      completedCities.add(root);
    }
  }

  for (const root of roots) {
    const kind = state.segKind[root];
    if (kind === "cloister") {
      // Cloisters always score as incomplete unless they completed in play
      // — but if they completed in play their meeples were already removed
      // and they were already awarded. We re-evaluate based on current
      // meeples: if a meeple is still on this cloister, it's incomplete.
      const stillHas = state.meeples.some((m) => state.ufParent[m.seg] !== undefined && ufFind(state.ufParent, m.seg) === root);
      if (!stillHas) continue;
      const pts = scoreIncomplete(state, root);
      const owners = featureOwners(state, root);
      if (owners.length > 0) {
        awardPoints(state, root, pts);
        log.push(`cloister (incomplete) → ${pts} pts to seat ${owners.join("/")}`);
      }
      continue;
    }
    if (kind === "city" || kind === "road") {
      // Was this feature already completed/scored? If meeples were removed,
      // it was. Skip if no meeples sit on it.
      const stillHas = state.meeples.some((m) => state.ufParent[m.seg] !== undefined && ufFind(state.ufParent, m.seg) === root);
      if (!stillHas) continue;
      const pts = scoreIncomplete(state, root);
      const owners = featureOwners(state, root);
      if (owners.length > 0) {
        awardPoints(state, root, pts);
        log.push(`${kind} (incomplete) → ${pts} pts to seat ${owners.join("/")}`);
      }
      continue;
    }
    if (kind === "field") {
      // Farmer scoring: 3 points per *completed* city this field touches,
      // to the field's majority owner.
      const stillHas = state.meeples.some((m) => state.ufParent[m.seg] !== undefined && ufFind(state.ufParent, m.seg) === root);
      if (!stillHas) continue;
      let citiesTouched = 0;
      for (const cityRoot of completedCities) {
        const fields = fieldsTouchingCity(state, cityRoot);
        if (fields.has(root)) citiesTouched++;
      }
      if (citiesTouched === 0) continue;
      const pts = citiesTouched * 3;
      const owners = featureOwners(state, root);
      if (owners.length > 0) {
        awardPoints(state, root, pts);
        log.push(`field → ${pts} pts (${citiesTouched} cities) to seat ${owners.join("/")}`);
      }
    }
  }
  return log;
}

// --------------------------------------------------------------------------
// CPU strategy (greedy)
// --------------------------------------------------------------------------

interface CpuPlan {
  x: number;
  y: number;
  rot: 0 | 1 | 2 | 3;
  meepleSide: Side | "cloister" | null;
  score: number;
}

/** Score a candidate placement from the CPU's point of view. We don't
 *  fully simulate the placement — we use a fast heuristic:
 *    + (immediate completion expected points) × big weight
 *    - (current feature size to be claimed) × small weight (prefers small
 *       features that will close fast)
 *    + 1 for a cloister neighbour count (cloisters score fast)
 *    - 5 for placing a farmer when bag has > 10 tiles left
 */
function evaluateCpuPlan(
  state: CarcassonneFullState,
  proto: TileProto,
  x: number,
  y: number,
  rot: 0 | 1 | 2 | 3,
  seat: number,
): CpuPlan {
  // Quick clone of just the parts we mutate.
  const board = state.board.map((row) => row.slice());
  const placed = state.placed.slice();
  const ufParent: Record<SegmentId, SegmentId> = { ...state.ufParent };
  const segKind = { ...state.segKind };
  const tIdx = placed.length;
  const pt: PlacedTile = { proto, rot, x, y, idx: tIdx };
  placed.push(pt);
  board[y]![x] = tIdx;
  const sim: CarcassonneFullState = {
    ...state,
    board,
    placed,
    ufParent,
    segKind,
  };
  addTileToFeatureGraph(sim, pt);

  // Pick best meeple option (or none).
  const leader = sideToSegLeader(proto, rot);
  const candidates: Array<{ side: Side | "cloister" | null; score: number }> = [{ side: null, score: 0 }];

  // Consider each unique segment on this tile.
  const seenLeaders = new Set<number>();
  for (const side of [0, 1, 2, 3]) {
    const ls = leader[side as Side]!;
    if (seenLeaders.has(ls)) continue;
    seenLeaders.add(ls);
    const sid = edgeSeg(tIdx, ls as Side);
    const root = ufFind(sim.ufParent, sid);
    // Skip if any meeple already on this feature
    const occupied = sim.meeples.some((m) => sim.ufParent[m.seg] !== undefined && ufFind(sim.ufParent, m.seg) === root);
    if (occupied) continue;
    const kind = sim.segKind[root];
    let evalScore = 0;
    if (kind === "city") {
      const { tiles } = featureMembers(sim, root);
      const complete = isFeatureComplete(sim, root);
      evalScore = complete ? tiles.size * 2 + 10 : -tiles.size + 4;
    } else if (kind === "road") {
      const { tiles } = featureMembers(sim, root);
      const complete = isFeatureComplete(sim, root);
      evalScore = complete ? tiles.size + 6 : -tiles.size * 0.5 + 3;
    } else if (kind === "field") {
      // Avoid farmers until the bag is small.
      if (sim.bag.length > 10) evalScore = -5;
      else evalScore = 4;
    }
    candidates.push({ side: ls as Side, score: evalScore });
  }
  if (proto.cloister) {
    const csid = cloisterSeg(tIdx);
    const root = ufFind(sim.ufParent, csid);
    const occupied = sim.meeples.some((m) => sim.ufParent[m.seg] !== undefined && ufFind(sim.ufParent, m.seg) === root);
    if (!occupied) {
      // Score: count surrounding tiles
      let neighbourCount = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (!inBounds(nx, ny)) continue;
          if (sim.board[ny]![nx]! >= 0) neighbourCount++;
        }
      }
      candidates.push({ side: "cloister", score: 5 + neighbourCount });
    }
  }
  // If the player has no meeples left in supply, force null.
  const supply = sim.supply[seat] ?? 0;
  let bestMeeple: { side: Side | "cloister" | null; score: number } = { side: null, score: 0 };
  if (supply > 0) {
    for (const c of candidates) {
      if (c.score > bestMeeple.score) bestMeeple = c;
    }
  }

  // Compute placement quality (independent of meeple): bonus for completing
  // any opponent-free feature this turn.
  let placementScore = 0;
  // Check each segment on this tile to see if it just got completed.
  for (const side of [0, 1, 2, 3]) {
    const sid = edgeSeg(tIdx, side as Side);
    if (sim.ufParent[sid] === undefined) continue;
    const root = ufFind(sim.ufParent, sid);
    if (sim.segKind[root] === "field") continue;
    if (isFeatureComplete(sim, root)) {
      const pts = scoreCompleted(sim, root);
      const owners = featureOwners(sim, root);
      if (owners.length === 0) {
        // Could be our placement if we put a meeple here.
        placementScore += pts * 0.5;
      } else if (owners.includes(seat)) {
        placementScore += pts;
      } else {
        placementScore -= pts * 0.7; // helping opponent
      }
    }
  }

  return {
    x,
    y,
    rot,
    meepleSide: bestMeeple.side,
    score: placementScore + bestMeeple.score,
  };
}

export function cpuPickPlan(state: CarcassonneFullState, proto: TileProto, seat: number): CpuPlan | null {
  const legals = allLegalPlacements(state, proto);
  if (legals.length === 0) return null;
  let best: CpuPlan | null = null;
  // Deterministic tie-break via seed.
  const rng = mulberry32(state.rngSeed);
  for (const { x, y, rot } of legals) {
    const p = evaluateCpuPlan(state, proto, x, y, rot, seat);
    // Add tiny noise for tie-break.
    const noisy = p.score + rng() * 0.001;
    if (best === null || noisy > best.score) {
      best = { ...p, score: noisy };
    }
  }
  return best;
}

// --------------------------------------------------------------------------
// Initial state
// --------------------------------------------------------------------------

/** Fisher–Yates shuffle in place using `mulberry32(seed)`. */
function shuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

export function initialState(seed: number, settings: CarcassonneFullSettings): CarcassonneFullState {
  const deck = buildDeck();
  // Pull out the starter tile (it's not drawn).
  const starter = deck.find((t) => t.start === true);
  const rest = deck.filter((t) => t.start !== true);
  const shuffled = shuffle(rest, seed >>> 0);

  const board: number[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(-1));
  const placed: PlacedTile[] = [];
  const ufParent: Record<SegmentId, SegmentId> = {};
  const segKind: Record<SegmentId, EdgeKind | "cloister"> = {};

  if (!starter) {
    // Shouldn't happen — buildDeck always emits the starter.
    throw new Error("carcassonne-full: starter tile missing from deck");
  }

  const starterPlaced: PlacedTile = {
    proto: starter,
    rot: 0,
    x: ORIGIN,
    y: ORIGIN,
    idx: 0,
  };
  placed.push(starterPlaced);
  board[ORIGIN]![ORIGIN] = 0;
  const state0: CarcassonneFullState = {
    settings,
    bag: shuffled,
    current: null,
    placed,
    board,
    turn: 0,
    phase: "place",
    meeples: [],
    supply: Array(NUM_PLAYERS).fill(MEEPLES_PER_PLAYER),
    scores: Array(NUM_PLAYERS).fill(0),
    ufParent,
    segKind,
    rngSeed: seed >>> 0,
    log: "Starter tile placed at the centre.",
  };
  addTileToFeatureGraph(state0, starterPlaced);

  // Draw the first tile for human seat 0.
  return drawTile(state0);
}

/** Draw the next tile; advance to phase=place. If bag exhausted, finalise. */
function drawTile(state: CarcassonneFullState): CarcassonneFullState {
  if (state.bag.length === 0) {
    // End game.
    const ns: CarcassonneFullState = { ...state, current: null, phase: "done" };
    const log = finalScoring(ns);
    ns.log = log.join(" • ");
    return ns;
  }
  const next = state.bag[state.bag.length - 1]!;
  const newBag = state.bag.slice(0, -1);
  // Verify legality — if no placement exists, discard and draw again.
  const probe: CarcassonneFullState = { ...state, current: next, bag: newBag };
  if (allLegalPlacements(probe, next).length === 0) {
    // Discard and try again. (Standard rule: tile is removed from the bag.)
    return drawTile({ ...probe, log: `Discarded unplaceable ${next.id}` });
  }
  return { ...probe, phase: "place" };
}

/** Advance turn after the current player has placed (and optionally meepled). */
function endTurn(state: CarcassonneFullState): CarcassonneFullState {
  const nextSeat = (state.turn + 1) % NUM_PLAYERS;
  return drawTile({ ...state, turn: nextSeat });
}

// --------------------------------------------------------------------------
// Reducer
// --------------------------------------------------------------------------

export function reducer(state: CarcassonneFullState, action: CarcassonneFullAction): CarcassonneFullState {
  if (state.phase === "done") return state;

  if (action.type === "place") {
    if (state.phase !== "place") return state;
    if (!state.current) return state;
    if (!canPlace(state, state.current, action.x, action.y, action.rot)) return state;

    // Clone enough to mutate safely.
    const board = state.board.map((r) => r.slice());
    const placed = state.placed.slice();
    const ufParent: Record<SegmentId, SegmentId> = { ...state.ufParent };
    const segKind = { ...state.segKind };
    const tIdx = placed.length;
    const pt: PlacedTile = {
      proto: state.current,
      rot: action.rot,
      x: action.x,
      y: action.y,
      idx: tIdx,
    };
    placed.push(pt);
    board[action.y]![action.x] = tIdx;
    const ns: CarcassonneFullState = {
      ...state,
      board,
      placed,
      ufParent,
      segKind,
      phase: "meeple",
    };
    delete (ns as { candidates?: unknown }).candidates;
    addTileToFeatureGraph(ns, pt);
    ns.log = `Seat ${state.turn} placed ${state.current.id} at (${action.x},${action.y}).`;
    return ns;
  }

  if (action.type === "meeple") {
    if (state.phase !== "meeple") return state;
    const tIdx = state.placed.length - 1;
    const pt = state.placed[tIdx];
    if (!pt) return state;

    let nextState: CarcassonneFullState = { ...state, phase: "place" };
    if (action.side !== null) {
      const supply = state.supply[state.turn] ?? 0;
      if (supply <= 0) {
        // No meeples in supply: skip silently.
      } else {
        // Validate the segment isn't already occupied by anyone.
        let sid: SegmentId;
        if (action.side === "cloister") {
          if (!pt.proto.cloister) return state;
          sid = cloisterSeg(tIdx);
        } else {
          const leader = sideToSegLeader(pt.proto, pt.rot);
          sid = edgeSeg(tIdx, leader[action.side] as Side);
        }
        const root = ufFind(state.ufParent, sid);
        const occupied = state.meeples.some(
          (m) => state.ufParent[m.seg] !== undefined && ufFind(state.ufParent, m.seg) === root,
        );
        if (occupied) {
          // Reject — but don't crash; just skip the meeple placement.
        } else {
          const meeples = state.meeples.concat([{ owner: state.turn, seg: sid }]);
          const newSupply = state.supply.slice();
          newSupply[state.turn] = supply - 1;
          nextState = { ...nextState, meeples, supply: newSupply };
        }
      }
    }

    // Score completed features triggered by the placement.
    const scoringLogs = scoreAfterPlacement(nextState, pt);

    // Advance turn.
    const advanced = endTurn(nextState);
    advanced.log = scoringLogs.length > 0
      ? `Seat ${state.turn} placed meeple. ${scoringLogs.join(" • ")}`
      : `Seat ${state.turn} placed meeple. Next: seat ${advanced.turn}.`;
    return advanced;
  }

  if (action.type === "cpuStep") {
    // Used by the UI to drive the CPU during seat 1/2 turns.
    if (state.turn === 0) return state;
    if (state.phase === "place" && state.current) {
      const plan = cpuPickPlan(state, state.current, state.turn);
      if (!plan) {
        // No legal placements — shouldn't happen because drawTile filters.
        return endTurn(state);
      }
      const afterPlace = reducer(state, { type: "place", x: plan.x, y: plan.y, rot: plan.rot });
      const afterMeeple = reducer(afterPlace, { type: "meeple", side: plan.meepleSide });
      return afterMeeple;
    }
    return state;
  }

  return state;
}

// --------------------------------------------------------------------------
// Terminal state
// --------------------------------------------------------------------------

export function isTerminal(state: CarcassonneFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score for the leaderboard: human's points if human won, else 0.
  const human = state.scores[0] ?? 0;
  const cpu1 = state.scores[1] ?? 0;
  const cpu2 = state.scores[2] ?? 0;
  if (human > cpu1 && human > cpu2) return { score: human };
  if (human === Math.max(cpu1, cpu2) && human > Math.min(cpu1, cpu2)) {
    // Tie at the top with one CPU: half points.
    return { score: Math.floor(human / 2) };
  }
  return { score: 0 };
}
