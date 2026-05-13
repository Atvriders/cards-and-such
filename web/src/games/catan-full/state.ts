import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// TODO: Catan (Full) — XL tier. Implemented vs omitted.
//
// IMPLEMENTED:
//   - 19-hex resource board with number tokens (standard distribution).
//   - Initial placement phase: each player places 2 settlements + 2 roads in
//     standard snake order (P1, P2, P2, P1) with second-settlement resource bonus.
//   - Production phase: roll 2d6, all settlements/cities adjacent to a matching
//     number hex earn resources (settlement = 1, city = 2). Desert produces
//     nothing. Robber-blocked hex produces nothing.
//   - Trade phase: 4:1 bank trade (uniform port-less ratio).
//   - Build phase: settlements (1w/1b/1g/1s), cities (2g+3o), roads (1w/1b),
//     development cards (1g/1o/1s).
//   - Distance rule for settlements (no settlement within 1 edge of another).
//   - Road network connectivity: a road must extend an existing road or settle.
//   - Robber on 7: roll a 7 → triggers steal from a 7-resource holder pool
//     (steals 1 random resource from a player with >7 cards), then move robber
//     to a random non-current hex.
//   - Victory points: settlements (1), cities (2), longest road (≥5, +2),
//     largest army (≥3 knights, +2), hidden VP cards (1 each).
//   - Dev cards: only KNIGHT and VICTORY_POINT (others noted below).
//   - Simple CPU heuristics: prefers high-pip vertices for placement,
//     builds cities > settlements > roads > dev cards by affordability,
//     plays a knight when held to move robber off own hexes,
//     declines bad trades (CPU never accepts player-initiated trades — TODO).
//
// OMITTED (XL skip list — would extend in M/L tier):
//   - Ports / harbor trades (2:1 specific, 3:1 generic). All trades are 4:1.
//   - Player-to-player trading UI. CPU never accepts a proposed trade.
//   - Dev card variety: Road Building, Year of Plenty, Monopoly — TODO.
//   - Robber discard-half-on-7 rule for players holding >7 cards.
//   - Choosing robber target/victim manually — auto-resolved (CPU random).
//   - "Cannot play dev card same turn it's bought" enforcement
//     (we let dev cards be playable any turn — minor cheat).
//   - Setup uses a fixed (deterministic from seed) tile + token shuffle, not
//     a Beginner Layout option.
//   - Multi-human multiplayer (3-4 players) — we ship 1 vs 1 CPU only.
//   - "Largest Army" / "Longest Road" stealing back-and-forth tie rules.
//     We award the title to whoever crosses the threshold first.
// =============================================================================

// -----------------------------------------------------------------------------
// Hex / Resource primitives
// -----------------------------------------------------------------------------

export type Resource = "wood" | "brick" | "sheep" | "wheat" | "ore";
export type TileType = Resource | "desert";

export interface Hex {
  q: number;
  r: number;
  type: TileType;
  /** Number token (2-12, never 7). null on desert. */
  token: number | null;
}

export interface ResourceBundle {
  wood: number;
  brick: number;
  sheep: number;
  wheat: number;
  ore: number;
}

export const EMPTY_BUNDLE: ResourceBundle = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };

export const RESOURCE_LIST: readonly Resource[] = ["wood", "brick", "sheep", "wheat", "ore"];

/** Hex layout: standard Catan = 19 tiles, radius-2 axial. */
export const HEX_RADIUS = 2;

/** Standard tile distribution: 4 wood, 3 brick, 4 sheep, 4 wheat, 3 ore, 1 desert. */
const TILE_BAG: TileType[] = [
  "wood", "wood", "wood", "wood",
  "brick", "brick", "brick",
  "sheep", "sheep", "sheep", "sheep",
  "wheat", "wheat", "wheat", "wheat",
  "ore", "ore", "ore",
  "desert",
];

/** Standard number token distribution (18 tokens, applied to non-desert tiles). */
const TOKEN_BAG: number[] = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

/** Pip count (probability) of a number token — high pips = high probability. */
export function pipsFor(token: number | null): number {
  if (token === null) return 0;
  const pips: Record<number, number> = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
  return pips[token] ?? 0;
}

/** Pixel position for a hex center at radius R. */
export function hexCenter(q: number, r: number, R: number): { x: number; y: number } {
  // Pointy-top axial → pixel
  const x = R * Math.sqrt(3) * (q + r / 2);
  const y = R * (3 / 2) * r;
  return { x, y };
}

/** All 19 hex coordinates of a standard board (radius 2 axial). */
export function allHexCoords(): Array<{ q: number; r: number }> {
  const out: Array<{ q: number; r: number }> = [];
  for (let q = -HEX_RADIUS; q <= HEX_RADIUS; q++) {
    for (let r = -HEX_RADIUS; r <= HEX_RADIUS; r++) {
      if (Math.abs(q + r) <= HEX_RADIUS) out.push({ q, r });
    }
  }
  return out;
}

// -----------------------------------------------------------------------------
// Vertex / Edge topology
// -----------------------------------------------------------------------------

/** Hex corner offsets for pointy-top (relative to hex center). */
const CORNER_OFFSETS_UNIT: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: -1 },                               // N
  { x: Math.sqrt(3) / 2, y: -0.5 },              // NE
  { x: Math.sqrt(3) / 2, y: 0.5 },               // SE
  { x: 0, y: 1 },                                // S
  { x: -Math.sqrt(3) / 2, y: 0.5 },              // SW
  { x: -Math.sqrt(3) / 2, y: -0.5 },             // NW
];

/** Round a coordinate into a stable key (avoids float-precision dupes). */
function vKey(x: number, y: number): string {
  return `${Math.round(x * 1000)}:${Math.round(y * 1000)}`;
}

export interface VertexInfo { x: number; y: number; adjHexes: number[]; adjVerts: number[] }
export interface EdgeInfo { a: number; b: number; x1: number; y1: number; x2: number; y2: number }

export interface BoardTopology {
  hexes: Hex[];
  vertices: VertexInfo[];
  edges: EdgeInfo[];
  /** edgeIndex[a][b] = edge index (or undefined). Symmetric. */
  edgeIndex: Map<string, number>;
}

function ekey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function buildTopology(hexes: Hex[]): BoardTopology {
  // 1. Generate unique vertices by deduping corner positions across hexes.
  const vertexMap = new Map<string, { x: number; y: number; idx: number; adjHexes: Set<number> }>();
  const hexCornerVerts: number[][] = hexes.map(() => Array(6).fill(-1));

  hexes.forEach((h, hi) => {
    const c = hexCenter(h.q, h.r, 1); // unit radius for keying
    CORNER_OFFSETS_UNIT.forEach((off, ci) => {
      const x = c.x + off.x;
      const y = c.y + off.y;
      const k = vKey(x, y);
      let v = vertexMap.get(k);
      if (!v) {
        v = { x, y, idx: vertexMap.size, adjHexes: new Set() };
        vertexMap.set(k, v);
      }
      v.adjHexes.add(hi);
      hexCornerVerts[hi]![ci] = v.idx;
    });
  });

  // Order vertices by index.
  const vertices: VertexInfo[] = Array.from(vertexMap.values())
    .sort((a, b) => a.idx - b.idx)
    .map(v => ({ x: v.x, y: v.y, adjHexes: Array.from(v.adjHexes), adjVerts: [] }));

  // 2. Generate edges from each hex's 6 corner pairs (consecutive). Dedup.
  const edgeMap = new Map<string, EdgeInfo>();
  for (const corners of hexCornerVerts) {
    for (let i = 0; i < 6; i++) {
      const a = corners[i]!;
      const b = corners[(i + 1) % 6]!;
      const k = ekey(a, b);
      if (!edgeMap.has(k)) {
        const va = vertices[a]!;
        const vb = vertices[b]!;
        edgeMap.set(k, { a, b, x1: va.x, y1: va.y, x2: vb.x, y2: vb.y });
      }
    }
  }
  const edges: EdgeInfo[] = Array.from(edgeMap.values());

  // 3. Build vertex adjacency (which vertices are connected by an edge).
  const edgeIndex = new Map<string, number>();
  edges.forEach((e, ei) => {
    edgeIndex.set(ekey(e.a, e.b), ei);
    if (!vertices[e.a]!.adjVerts.includes(e.b)) vertices[e.a]!.adjVerts.push(e.b);
    if (!vertices[e.b]!.adjVerts.includes(e.a)) vertices[e.b]!.adjVerts.push(e.a);
  });

  return { hexes, vertices, edges, edgeIndex };
}

// -----------------------------------------------------------------------------
// Game state
// -----------------------------------------------------------------------------

export type PlayerId = 0 | 1; // 0 = human, 1 = CPU (XL: only 2 players)
export type DevCardKind = "knight" | "vp";

export interface PlayerState {
  id: PlayerId;
  resources: ResourceBundle;
  settlements: number[];       // vertex indices
  cities: number[];            // vertex indices (upgraded settlements)
  roads: number[];             // edge indices
  knightsPlayed: number;
  devCards: DevCardKind[];     // held (unplayed)
  vpHidden: number;            // hidden VP cards count (== devCards.filter==vp)
}

export type Phase =
  | "setup"            // initial placement (alternating)
  | "roll"             // current player must roll
  | "play"             // current player can trade/build/end
  | "cpu"              // CPU is taking its turn
  | "done";

export type SetupSubPhase = "place_settlement" | "place_road";

export interface CatanSettings {
  /** Victory points required to win. Standard = 10. */
  vpTarget: number;
}

export interface CatanState {
  rngSeed: number;
  topology: BoardTopology;
  players: [PlayerState, PlayerState];
  current: PlayerId;
  phase: Phase;
  setupSubPhase: SetupSubPhase | null;
  /** Setup order: P0 places S+R, P1 places S+R, P1 places S+R, P0 places S+R. */
  setupStep: number; // 0..3
  /** During setup, the most-recently-placed settlement (vertex) for the active player. */
  setupPendingSettlement: number | null;
  /** Last roll. */
  lastRoll: { d1: number; d2: number; sum: number } | null;
  /** Dev card draw pile remaining. */
  devDeck: DevCardKind[];
  /** Largest army holder, if any (player id). */
  largestArmy: PlayerId | null;
  /** Longest road holder, if any (player id). */
  longestRoad: PlayerId | null;
  /** Current robber hex index. */
  robberHex: number;
  /** Status banner. */
  message: string;
  /** Recent log entries (newest first). */
  log: string[];
  /** UI selection during play (e.g. clicked vertex for upgrade). */
  selectedVertex: number | null;
  /** Has current player rolled this turn? */
  rolledThisTurn: boolean;
  /** Game over winner. */
  winner: PlayerId | null;
}

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export type CatanAction =
  | { type: "setup_place_settlement"; vertex: number }
  | { type: "setup_place_road"; edge: number }
  | { type: "roll" }
  | { type: "build_settlement"; vertex: number }
  | { type: "build_city"; vertex: number }
  | { type: "build_road"; edge: number }
  | { type: "buy_dev" }
  | { type: "play_knight" }
  | { type: "trade_bank"; give: Resource; receive: Resource }
  | { type: "end_turn" }
  | { type: "cpu_step" };

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function pushLog(log: string[], msg: string): string[] {
  return [msg, ...log].slice(0, 8);
}

function emptyBundle(): ResourceBundle {
  return { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
}

function totalResources(rb: ResourceBundle): number {
  return rb.wood + rb.brick + rb.sheep + rb.wheat + rb.ore;
}

function clonePlayer(p: PlayerState): PlayerState {
  return {
    id: p.id,
    resources: { ...p.resources },
    settlements: p.settlements.slice(),
    cities: p.cities.slice(),
    roads: p.roads.slice(),
    knightsPlayed: p.knightsPlayed,
    devCards: p.devCards.slice(),
    vpHidden: p.vpHidden,
  };
}

function hasResources(rb: ResourceBundle, cost: Partial<ResourceBundle>): boolean {
  for (const k of RESOURCE_LIST) {
    if ((cost[k] ?? 0) > rb[k]) return false;
  }
  return true;
}

function payResources(rb: ResourceBundle, cost: Partial<ResourceBundle>): ResourceBundle {
  const out: ResourceBundle = { ...rb };
  for (const k of RESOURCE_LIST) {
    out[k] -= cost[k] ?? 0;
  }
  return out;
}

export const COST_SETTLEMENT: Partial<ResourceBundle> = { wood: 1, brick: 1, sheep: 1, wheat: 1 };
export const COST_CITY: Partial<ResourceBundle> = { wheat: 2, ore: 3 };
export const COST_ROAD: Partial<ResourceBundle> = { wood: 1, brick: 1 };
export const COST_DEV: Partial<ResourceBundle> = { sheep: 1, wheat: 1, ore: 1 };

/** Does the given vertex obey the distance rule (no occupied vertex 1 edge away)? */
export function distanceRuleOk(state: CatanState, vertex: number): boolean {
  const v = state.topology.vertices[vertex];
  if (!v) return false;
  // The vertex itself must be unoccupied.
  if (isVertexOccupied(state, vertex)) return false;
  for (const nb of v.adjVerts) {
    if (isVertexOccupied(state, nb)) return false;
  }
  return true;
}

export function isVertexOccupied(state: CatanState, vertex: number): boolean {
  for (const p of state.players) {
    if (p.settlements.includes(vertex)) return true;
    if (p.cities.includes(vertex)) return true;
  }
  return false;
}

export function isEdgeOccupied(state: CatanState, edge: number): boolean {
  for (const p of state.players) {
    if (p.roads.includes(edge)) return true;
  }
  return false;
}

/** True if road `edge` extends an existing road or settlement of player `pid`. */
export function roadConnects(state: CatanState, pid: PlayerId, edge: number): boolean {
  const e = state.topology.edges[edge];
  if (!e) return false;
  const p = state.players[pid];
  if (p.settlements.includes(e.a) || p.settlements.includes(e.b)) return true;
  if (p.cities.includes(e.a) || p.cities.includes(e.b)) return true;
  // Does another of pid's roads share an endpoint?
  for (const ei of p.roads) {
    const oe = state.topology.edges[ei]!;
    if (oe.a === e.a || oe.a === e.b || oe.b === e.a || oe.b === e.b) return true;
  }
  return false;
}

/** Compute longest road length for a player (simple DFS, treats only their roads). */
export function longestRoadLengthFor(state: CatanState, pid: PlayerId): number {
  const p = state.players[pid];
  if (p.roads.length === 0) return 0;
  // Build vertex→edge adjacency restricted to player's roads.
  const vertexToEdges = new Map<number, number[]>();
  for (const ei of p.roads) {
    const e = state.topology.edges[ei]!;
    for (const v of [e.a, e.b]) {
      const arr = vertexToEdges.get(v) ?? [];
      arr.push(ei);
      vertexToEdges.set(v, arr);
    }
  }
  let best = 0;
  // DFS from every edge as starting edge.
  const visited = new Set<number>();
  function dfs(fromVert: number, edgesUsed: number): void {
    if (edgesUsed > best) best = edgesUsed;
    const opts = vertexToEdges.get(fromVert) ?? [];
    for (const ei of opts) {
      if (visited.has(ei)) continue;
      const e = state.topology.edges[ei]!;
      const next = e.a === fromVert ? e.b : e.a;
      // Block at an opposing settlement (rare; we'll skip enforcement — XL).
      visited.add(ei);
      dfs(next, edgesUsed + 1);
      visited.delete(ei);
    }
  }
  for (const ei of p.roads) {
    const e = state.topology.edges[ei]!;
    for (const v of [e.a, e.b]) {
      visited.clear();
      visited.add(ei);
      dfs(v, 1);
    }
  }
  return best;
}

export function vpFor(state: CatanState, pid: PlayerId): number {
  const p = state.players[pid];
  let vp = p.settlements.length + 2 * p.cities.length + p.vpHidden;
  if (state.largestArmy === pid) vp += 2;
  if (state.longestRoad === pid) vp += 2;
  return vp;
}

/** Public VP (no hidden cards). */
export function publicVpFor(state: CatanState, pid: PlayerId): number {
  const p = state.players[pid];
  let vp = p.settlements.length + 2 * p.cities.length;
  if (state.largestArmy === pid) vp += 2;
  if (state.longestRoad === pid) vp += 2;
  return vp;
}

// -----------------------------------------------------------------------------
// Deterministic shuffles
// -----------------------------------------------------------------------------

function shuffleInPlace<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function buildHexes(rng: () => number): Hex[] {
  const coords = allHexCoords();
  const tiles = shuffleInPlace(TILE_BAG.slice(), rng);
  const tokens = shuffleInPlace(TOKEN_BAG.slice(), rng);
  const out: Hex[] = [];
  let ti = 0;
  for (let i = 0; i < coords.length; i++) {
    const c = coords[i]!;
    const t = tiles[i]!;
    if (t === "desert") {
      out.push({ q: c.q, r: c.r, type: t, token: null });
    } else {
      out.push({ q: c.q, r: c.r, type: t, token: tokens[ti++]! });
    }
  }
  return out;
}

function buildDevDeck(rng: () => number): DevCardKind[] {
  // Standard: 14 knights, 5 VP. (We omit the other 6 dev cards.)
  const deck: DevCardKind[] = [];
  for (let i = 0; i < 14; i++) deck.push("knight");
  for (let i = 0; i < 5; i++) deck.push("vp");
  return shuffleInPlace(deck, rng);
}

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

export function initialState(seed: number, settings: CatanSettings): CatanState {
  const rng = mulberry32(seed >>> 0);
  const hexes = buildHexes(rng);
  const topology = buildTopology(hexes);
  const devDeck = buildDevDeck(rng);
  // Robber starts on the desert hex.
  const robberHex = hexes.findIndex(h => h.type === "desert");

  const p0: PlayerState = {
    id: 0, resources: emptyBundle(), settlements: [], cities: [], roads: [],
    knightsPlayed: 0, devCards: [], vpHidden: 0,
  };
  const p1: PlayerState = {
    id: 1, resources: emptyBundle(), settlements: [], cities: [], roads: [],
    knightsPlayed: 0, devCards: [], vpHidden: 0,
  };

  // Burn one rng tick to evolve seed.
  const nextSeed = Math.floor(rng() * 2 ** 31);

  return {
    rngSeed: nextSeed,
    topology,
    players: [p0, p1],
    current: 0,
    phase: "setup",
    setupSubPhase: "place_settlement",
    setupStep: 0,
    setupPendingSettlement: null,
    lastRoll: null,
    devDeck,
    largestArmy: null,
    longestRoad: null,
    robberHex: Math.max(0, robberHex),
    message: "Setup: place your first settlement (click a corner).",
    log: ["Game started. Place 2 settlements + 2 roads to begin."],
    selectedVertex: null,
    rolledThisTurn: false,
    winner: null,
  };
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

/** Map (setupStep, action sequence) → next player & subphase. */
function advanceSetup(state: CatanState): CatanState {
  // After placing road, advance step. Snake order: P0, P1, P1, P0.
  const order: PlayerId[] = [0, 1, 1, 0];
  const nextStep = state.setupStep + 1;
  if (nextStep >= order.length) {
    // Setup complete → P0 rolls.
    return {
      ...state,
      phase: "roll",
      setupSubPhase: null,
      setupStep: nextStep,
      setupPendingSettlement: null,
      current: 0,
      rolledThisTurn: false,
      message: "Your turn. Roll the dice!",
      log: pushLog(state.log, "Setup complete — game begins."),
    };
  }
  const nextPlayer = order[nextStep]!;
  return {
    ...state,
    current: nextPlayer,
    setupSubPhase: "place_settlement",
    setupStep: nextStep,
    setupPendingSettlement: null,
    phase: nextPlayer === 0 ? "setup" : "cpu",
    message: nextPlayer === 0
      ? `Setup: place your ${nextStep < 2 ? "first" : "second"} settlement.`
      : `CPU is placing its ${nextStep < 2 ? "first" : "second"} settlement...`,
  };
}

/** Grant resources for a vertex (used for second settlement). */
function grantSecondSettlementResources(state: CatanState, pid: PlayerId, vertex: number): CatanState {
  const v = state.topology.vertices[vertex];
  if (!v) return state;
  const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
  for (const hi of v.adjHexes) {
    const hex = state.topology.hexes[hi]!;
    if (hex.type === "desert") continue;
    players[pid].resources[hex.type] += 1;
  }
  return { ...state, players };
}

/** Produce resources from a roll (sum). */
function produceFromRoll(state: CatanState, sum: number): CatanState {
  const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
  for (let hi = 0; hi < state.topology.hexes.length; hi++) {
    if (hi === state.robberHex) continue;
    const hex = state.topology.hexes[hi]!;
    if (hex.token !== sum) continue;
    if (hex.type === "desert") continue;
    // Find players with settlements/cities on this hex's vertices.
    for (let vi = 0; vi < state.topology.vertices.length; vi++) {
      const v = state.topology.vertices[vi]!;
      if (!v.adjHexes.includes(hi)) continue;
      for (const p of players) {
        if (p.settlements.includes(vi)) p.resources[hex.type] += 1;
        if (p.cities.includes(vi)) p.resources[hex.type] += 2;
      }
    }
  }
  return { ...state, players };
}

/** Handle a 7: move robber to a random non-current hex, steal from a 7+ card holder. */
function handleRobber(state: CatanState, rng: () => number): CatanState {
  // Move robber to a random hex (not the current one, prefer one with opponent settlement).
  const candidates: number[] = [];
  for (let hi = 0; hi < state.topology.hexes.length; hi++) {
    if (hi === state.robberHex) continue;
    candidates.push(hi);
  }
  if (candidates.length === 0) return state;
  // Heuristic: pick a hex adjacent to opponent (the non-current player).
  const opponent = state.current === 0 ? 1 : 0;
  const opSettlements = new Set([
    ...state.players[opponent].settlements,
    ...state.players[opponent].cities,
  ]);
  const opHexes = candidates.filter(hi => {
    for (let vi = 0; vi < state.topology.vertices.length; vi++) {
      if (!state.topology.vertices[vi]!.adjHexes.includes(hi)) continue;
      if (opSettlements.has(vi)) return true;
    }
    return false;
  });
  const pool = opHexes.length > 0 ? opHexes : candidates;
  const newRobber = pool[Math.floor(rng() * pool.length)]!;

  // Steal: anyone with >7 resources loses 1 random card to the current player.
  const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
  let stolenMsg = "";
  for (const pid of [0, 1] as PlayerId[]) {
    if (pid === state.current) continue;
    const total = totalResources(players[pid].resources);
    if (total > 7) {
      // Discard half (rounded down) — XL simplification: discard 1.
      // Steal 1.
      const bag: Resource[] = [];
      for (const k of RESOURCE_LIST) {
        for (let i = 0; i < players[pid].resources[k]; i++) bag.push(k);
      }
      if (bag.length > 0) {
        const stolen = bag[Math.floor(rng() * bag.length)]!;
        players[pid].resources[stolen] -= 1;
        players[state.current].resources[stolen] += 1;
        stolenMsg = `Robber stole 1 ${stolen} from P${pid + 1}.`;
      }
    }
  }
  return {
    ...state,
    players,
    robberHex: newRobber,
    log: pushLog(state.log, stolenMsg || `Robber moved (no steal).`),
  };
}

function recomputeBonusTitles(state: CatanState): CatanState {
  let longestRoad = state.longestRoad;
  let largestArmy = state.largestArmy;

  // Longest Road: first to ≥5 holds it.
  const lr0 = longestRoadLengthFor(state, 0);
  const lr1 = longestRoadLengthFor(state, 1);
  if (longestRoad === null) {
    if (lr0 >= 5 && lr0 >= lr1) longestRoad = 0;
    else if (lr1 >= 5) longestRoad = 1;
  } else {
    // Allow flip if other strictly exceeds current holder's length.
    const otherPid: PlayerId = longestRoad === 0 ? 1 : 0;
    const myLen = longestRoad === 0 ? lr0 : lr1;
    const otherLen = otherPid === 0 ? lr0 : lr1;
    if (otherLen > myLen && otherLen >= 5) longestRoad = otherPid;
  }

  // Largest Army: first to ≥3 knights holds it.
  const k0 = state.players[0].knightsPlayed;
  const k1 = state.players[1].knightsPlayed;
  if (largestArmy === null) {
    if (k0 >= 3 && k0 >= k1) largestArmy = 0;
    else if (k1 >= 3) largestArmy = 1;
  } else {
    const otherPid: PlayerId = largestArmy === 0 ? 1 : 0;
    const myK = largestArmy === 0 ? k0 : k1;
    const otherK = otherPid === 0 ? k0 : k1;
    if (otherK > myK && otherK >= 3) largestArmy = otherPid;
  }

  return { ...state, longestRoad, largestArmy };
}

function checkWin(state: CatanState, vpTarget: number): CatanState {
  const v0 = vpFor(state, 0);
  const v1 = vpFor(state, 1);
  if (v0 >= vpTarget) {
    return {
      ...state,
      phase: "done",
      winner: 0,
      message: `Victory! You reached ${v0} VP.`,
      log: pushLog(state.log, `WIN at ${v0} VP.`),
    };
  }
  if (v1 >= vpTarget) {
    return {
      ...state,
      phase: "done",
      winner: 1,
      message: `Defeat. CPU reached ${v1} VP.`,
      log: pushLog(state.log, `CPU wins at ${v1} VP.`),
    };
  }
  return state;
}

// -----------------------------------------------------------------------------
// CPU AI
// -----------------------------------------------------------------------------

/** Score a vertex for setup placement: total pips of adjacent hexes. */
function scoreVertexForSetup(state: CatanState, vertex: number): number {
  const v = state.topology.vertices[vertex];
  if (!v) return -1;
  let score = 0;
  const types = new Set<TileType>();
  for (const hi of v.adjHexes) {
    const h = state.topology.hexes[hi]!;
    score += pipsFor(h.token);
    types.add(h.type);
  }
  // Diversity bonus (different resources).
  score += types.size;
  return score;
}

/** Best legal vertex for setup placement. */
function pickSetupSettlement(state: CatanState): number {
  let best = -1;
  let bestScore = -Infinity;
  for (let vi = 0; vi < state.topology.vertices.length; vi++) {
    if (!distanceRuleOk(state, vi)) continue;
    const s = scoreVertexForSetup(state, vi);
    if (s > bestScore) { bestScore = s; best = vi; }
  }
  return best;
}

/** Best legal road for CPU during setup: pick an edge adjacent to the just-placed settlement. */
function pickSetupRoad(state: CatanState, settlementVertex: number): number {
  // Prefer roads that lead to high-pip vertices.
  let best = -1;
  let bestScore = -Infinity;
  for (let ei = 0; ei < state.topology.edges.length; ei++) {
    const e = state.topology.edges[ei]!;
    if (e.a !== settlementVertex && e.b !== settlementVertex) continue;
    if (isEdgeOccupied(state, ei)) continue;
    const other = e.a === settlementVertex ? e.b : e.a;
    const s = scoreVertexForSetup(state, other);
    if (s > bestScore) { bestScore = s; best = ei; }
  }
  return best;
}

/** CPU evaluation during play. Returns one action or null (end turn). */
function pickCpuPlayAction(state: CatanState): CatanAction | null {
  const cpu = state.players[1];
  // 1. Build city if possible (best ROI).
  if (hasResources(cpu.resources, COST_CITY) && cpu.settlements.length > 0) {
    // Pick the settlement with highest pip-sum to upgrade.
    let best = -1, bestScore = -Infinity;
    for (const vi of cpu.settlements) {
      const sc = scoreVertexForSetup(state, vi);
      if (sc > bestScore) { bestScore = sc; best = vi; }
    }
    if (best >= 0) return { type: "build_city", vertex: best };
  }
  // 2. Build settlement if can — at any legal vertex connected to CPU's road network.
  if (hasResources(cpu.resources, COST_SETTLEMENT)) {
    const reachable = new Set<number>();
    for (const ei of cpu.roads) {
      const e = state.topology.edges[ei]!;
      reachable.add(e.a); reachable.add(e.b);
    }
    let best = -1, bestScore = -Infinity;
    for (const vi of reachable) {
      if (!distanceRuleOk(state, vi)) continue;
      const sc = scoreVertexForSetup(state, vi);
      if (sc > bestScore) { bestScore = sc; best = vi; }
    }
    if (best >= 0) return { type: "build_settlement", vertex: best };
  }
  // 3. Build road if can.
  if (hasResources(cpu.resources, COST_ROAD)) {
    for (let ei = 0; ei < state.topology.edges.length; ei++) {
      if (isEdgeOccupied(state, ei)) continue;
      if (!roadConnects(state, 1, ei)) continue;
      return { type: "build_road", edge: ei };
    }
  }
  // 4. Buy dev card.
  if (hasResources(cpu.resources, COST_DEV) && state.devDeck.length > 0) {
    return { type: "buy_dev" };
  }
  // 5. Play a knight if held and we have 0 knights played but want largest army or robber is on our hex.
  if (cpu.devCards.includes("knight")) {
    const robberHex = state.robberHex;
    let robberAffectsCpu = false;
    for (let vi = 0; vi < state.topology.vertices.length; vi++) {
      const v = state.topology.vertices[vi]!;
      if (!v.adjHexes.includes(robberHex)) continue;
      if (cpu.settlements.includes(vi) || cpu.cities.includes(vi)) { robberAffectsCpu = true; break; }
    }
    if (robberAffectsCpu || cpu.knightsPlayed >= 2) return { type: "play_knight" };
  }
  // 6. Bank-trade if heavy in one resource (>= 4 of one, missing another).
  for (const give of RESOURCE_LIST) {
    if (cpu.resources[give] >= 4) {
      for (const recv of RESOURCE_LIST) {
        if (give === recv) continue;
        if (cpu.resources[recv] === 0) {
          return { type: "trade_bank", give, receive: recv };
        }
      }
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Reducer body
// -----------------------------------------------------------------------------

export function reducer(state: CatanState, action: CatanAction): CatanState {
  if (state.phase === "done") return state;

  // ─── SETUP ───
  if (state.phase === "setup") {
    if (state.current !== 0) return state; // CPU runs via cpu_step
    if (state.setupSubPhase === "place_settlement" && action.type === "setup_place_settlement") {
      if (!distanceRuleOk(state, action.vertex)) return state;
      const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
      players[0].settlements.push(action.vertex);
      let next: CatanState = {
        ...state,
        players,
        setupSubPhase: "place_road",
        setupPendingSettlement: action.vertex,
        message: "Setup: place a road adjacent to your settlement.",
        log: pushLog(state.log, `You placed settlement #${players[0].settlements.length}.`),
      };
      // Second settlement → grant resources from adjacent hexes.
      if (state.setupStep >= 2) {
        next = grantSecondSettlementResources(next, 0, action.vertex);
      }
      return next;
    }
    if (state.setupSubPhase === "place_road" && action.type === "setup_place_road") {
      if (state.setupPendingSettlement === null) return state;
      const e = state.topology.edges[action.edge];
      if (!e) return state;
      if (e.a !== state.setupPendingSettlement && e.b !== state.setupPendingSettlement) return state;
      if (isEdgeOccupied(state, action.edge)) return state;
      const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
      players[0].roads.push(action.edge);
      const next: CatanState = {
        ...state,
        players,
        log: pushLog(state.log, `You placed road #${players[0].roads.length}.`),
      };
      return advanceSetup(next);
    }
    return state;
  }

  // ─── CPU SETUP / PLAY ───
  if (state.phase === "cpu" && action.type === "cpu_step") {
    const rng = mulberry32(state.rngSeed);
    let st = state;
    // CPU setup branch.
    if (st.setupSubPhase === "place_settlement") {
      const v = pickSetupSettlement(st);
      if (v < 0) return st;
      const players = st.players.map(clonePlayer) as [PlayerState, PlayerState];
      players[1].settlements.push(v);
      st = {
        ...st, players,
        setupSubPhase: "place_road",
        setupPendingSettlement: v,
        log: pushLog(st.log, `CPU placed settlement #${players[1].settlements.length}.`),
      };
      if (st.setupStep >= 2) {
        st = grantSecondSettlementResources(st, 1, v);
      }
      return st;
    }
    if (st.setupSubPhase === "place_road" && st.setupPendingSettlement !== null) {
      const ei = pickSetupRoad(st, st.setupPendingSettlement);
      if (ei < 0) return st;
      const players = st.players.map(clonePlayer) as [PlayerState, PlayerState];
      players[1].roads.push(ei);
      st = { ...st, players, log: pushLog(st.log, `CPU placed road #${players[1].roads.length}.`) };
      return advanceSetup(st);
    }

    // CPU regular turn: roll first, then take actions, then end.
    if (!st.rolledThisTurn) {
      const d1 = 1 + Math.floor(rng() * 6);
      const d2 = 1 + Math.floor(rng() * 6);
      const sum = d1 + d2;
      st = { ...st, lastRoll: { d1, d2, sum }, rolledThisTurn: true, log: pushLog(st.log, `CPU rolled ${sum} (${d1}+${d2})`) };
      if (sum === 7) {
        st = handleRobber(st, rng);
      } else {
        st = produceFromRoll(st, sum);
      }
      st = { ...st, rngSeed: Math.floor(rng() * 2 ** 31) };
      return st;
    }

    // CPU action loop step.
    const act = pickCpuPlayAction(st);
    if (act === null) {
      // End turn.
      st = recomputeBonusTitles(st);
      const settings: CatanSettings = { vpTarget: 10 }; // see note in caller wrappers
      const won = checkWin(st, settings.vpTarget);
      if (won.phase === "done") return won;
      return {
        ...st,
        current: 0,
        phase: "roll",
        rolledThisTurn: false,
        message: "Your turn. Roll the dice!",
        log: pushLog(st.log, "CPU ended turn."),
      };
    }
    // Apply CPU action via recursive reducer call (treat CPU as current=1 builder).
    return applyPlayerAction(st, 1, act, rng);
  }

  // ─── HUMAN: ROLL ───
  if (state.phase === "roll" && state.current === 0 && action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const d1 = 1 + Math.floor(rng() * 6);
    const d2 = 1 + Math.floor(rng() * 6);
    const sum = d1 + d2;
    let st: CatanState = {
      ...state,
      lastRoll: { d1, d2, sum },
      rolledThisTurn: true,
      phase: "play",
      log: pushLog(state.log, `You rolled ${sum} (${d1}+${d2})`),
      message: sum === 7 ? "Rolled 7 — robber moves!" : `Rolled ${sum}. Resources distributed.`,
    };
    if (sum === 7) {
      st = handleRobber(st, rng);
    } else {
      st = produceFromRoll(st, sum);
    }
    return { ...st, rngSeed: Math.floor(rng() * 2 ** 31) };
  }

  // ─── HUMAN: PLAY ───
  if (state.phase === "play" && state.current === 0) {
    if (action.type === "end_turn") {
      let st = recomputeBonusTitles(state);
      st = checkWin(st, 10);
      if (st.phase === "done") return st;
      return {
        ...st,
        current: 1,
        phase: "cpu",
        rolledThisTurn: false,
        lastRoll: null,
        message: "CPU is taking its turn...",
        log: pushLog(st.log, "You ended turn."),
      };
    }
    const rng = mulberry32(state.rngSeed);
    return applyPlayerAction(state, 0, action, rng);
  }

  return state;
}

/** Apply a build / trade / dev action for a player. Reused for both human (in play phase) and CPU. */
function applyPlayerAction(state: CatanState, pid: PlayerId, action: CatanAction, rng: () => number): CatanState {
  const p = state.players[pid];

  if (action.type === "build_road") {
    if (!hasResources(p.resources, COST_ROAD)) return state;
    if (isEdgeOccupied(state, action.edge)) return state;
    if (!roadConnects(state, pid, action.edge)) return state;
    const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
    players[pid].resources = payResources(players[pid].resources, COST_ROAD);
    players[pid].roads.push(action.edge);
    const next: CatanState = {
      ...state, players,
      log: pushLog(state.log, `${pid === 0 ? "You" : "CPU"} built road.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
    return recomputeBonusTitles(next);
  }

  if (action.type === "build_settlement") {
    if (!hasResources(p.resources, COST_SETTLEMENT)) return state;
    if (!distanceRuleOk(state, action.vertex)) return state;
    // Must be connected to player's road network.
    let connected = false;
    for (const ei of p.roads) {
      const e = state.topology.edges[ei]!;
      if (e.a === action.vertex || e.b === action.vertex) { connected = true; break; }
    }
    if (!connected) return state;
    const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
    players[pid].resources = payResources(players[pid].resources, COST_SETTLEMENT);
    players[pid].settlements.push(action.vertex);
    const next: CatanState = {
      ...state, players,
      log: pushLog(state.log, `${pid === 0 ? "You" : "CPU"} built settlement.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
    return recomputeBonusTitles(checkWin(next, 10));
  }

  if (action.type === "build_city") {
    if (!hasResources(p.resources, COST_CITY)) return state;
    if (!p.settlements.includes(action.vertex)) return state;
    const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
    players[pid].resources = payResources(players[pid].resources, COST_CITY);
    players[pid].settlements = players[pid].settlements.filter(v => v !== action.vertex);
    players[pid].cities.push(action.vertex);
    const next: CatanState = {
      ...state, players,
      log: pushLog(state.log, `${pid === 0 ? "You" : "CPU"} upgraded to city.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
    return recomputeBonusTitles(checkWin(next, 10));
  }

  if (action.type === "buy_dev") {
    if (!hasResources(p.resources, COST_DEV)) return state;
    if (state.devDeck.length === 0) return state;
    const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
    players[pid].resources = payResources(players[pid].resources, COST_DEV);
    const deck = state.devDeck.slice();
    const drew = deck.shift()!;
    if (drew === "vp") {
      players[pid].vpHidden += 1;
    } else {
      players[pid].devCards.push(drew);
    }
    const next: CatanState = {
      ...state, players, devDeck: deck,
      log: pushLog(state.log, `${pid === 0 ? "You" : "CPU"} bought a dev card.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
    return checkWin(next, 10);
  }

  if (action.type === "play_knight") {
    if (!p.devCards.includes("knight")) return state;
    const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
    // Remove one knight card.
    const idx = players[pid].devCards.indexOf("knight");
    players[pid].devCards.splice(idx, 1);
    players[pid].knightsPlayed += 1;
    let next: CatanState = {
      ...state, players,
      log: pushLog(state.log, `${pid === 0 ? "You" : "CPU"} played a Knight.`),
    };
    // Move robber & steal.
    // Temporarily set current = pid so handleRobber steals to the knight player.
    const prevCurrent = next.current;
    next = handleRobber({ ...next, current: pid }, rng);
    next = { ...next, current: prevCurrent };
    next = { ...next, rngSeed: Math.floor(rng() * 2 ** 31) };
    return recomputeBonusTitles(checkWin(next, 10));
  }

  if (action.type === "trade_bank") {
    if (p.resources[action.give] < 4) return state;
    if (action.give === action.receive) return state;
    const players = state.players.map(clonePlayer) as [PlayerState, PlayerState];
    players[pid].resources[action.give] -= 4;
    players[pid].resources[action.receive] += 1;
    return {
      ...state, players,
      log: pushLog(state.log, `${pid === 0 ? "You" : "CPU"} traded 4 ${action.give} for 1 ${action.receive}.`),
    };
  }

  return state;
}

// -----------------------------------------------------------------------------
// Terminal & scoring
// -----------------------------------------------------------------------------

export function score(state: CatanState): number {
  if (state.winner === 0) {
    // Win score scales with VP margin + remaining resources.
    const vp = vpFor(state, 0);
    return 1000 + vp * 25;
  }
  // Loss / draw: zero so leaderboard skips it.
  return 0;
}

export function isTerminal(state: CatanState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: score(state) };
}
