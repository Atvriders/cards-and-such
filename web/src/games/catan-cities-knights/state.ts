import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// Catan: Cities & Knights — XL tier — minimal viable expansion.
//
// IMPLEMENTED:
//   - Standard 19-hex Catan map (radius-2 axial) with deterministic shuffle.
//   - 4 players (P0 human + P1/P2/P3 CPU). 13 VP to win.
//   - Initial placement: each player places 2 settlements + 2 roads in
//     snake order (0,1,2,3,3,2,1,0). Second settlement grants resources.
//   - Production: 2d6 roll → adjacent settlements get 1 resource, cities
//     get 1 resource AND 1 commodity if the tile is a "commodity tile"
//     (forest→paper, pasture→cloth, mountain→coin). Cities on other tile
//     types still get 2 resources of that kind. Desert produces nothing.
//   - 3 commodity types: paper (from wood/forest cities), cloth (from
//     sheep/pasture cities), coin (from ore/mountain cities).
//   - Build settlements / cities / roads (same costs as base Catan).
//   - Knights (3 levels: basic / strong / mighty; active or inactive):
//       - Recruit basic knight: 1 sheep + 1 ore.
//       - Promote (1 → 2 → 3): 1 sheep + 1 ore per level.
//       - Activate: 1 wheat. Inactive knights don't fight barbarians.
//   - City walls: 2 brick — protects city from one barbarian downgrade.
//   - Barbarian ship: advances 1 space each round (after all 4 players
//     have ended their turn). Arrives at 7 spaces. If barbarian strength
//     (= count of barbarian arrivals scaled) > total ACTIVE knight strength
//     across all players, the weakest player (lowest active knight total)
//     loses a city → downgraded back to settlement (walls absorb 1 hit).
//     If knights ≥ barbarians, the player with the most active knight
//     strength gains 1 VP (Defender of Catan). Ties → no winner reward.
//   - Progress cards: simplified 3-deck (Science / Politics / Trade) of
//     generic cards that grant immediate small bonuses (e.g. +1 commodity,
//     +1 resource of choice, +1 VP). Buying = 1 wheat + 1 coin/cloth/paper
//     of the chosen color → draw from that color's deck.
//   - VP source: settlements (1), cities (2), walls (0), defender (1),
//     special-VP cards (1 each), no longest-road / largest-army.
//   - Win at 13 VP.
//
// OMITTED (XL TODOs — see backlog if expanding to L/M):
//   - TODO: Full progress card effects (Alchemist, Crane, Engineer, Inventor,
//     Irrigation, Master Merchant, Medicine, Merchant, Mining, Resource
//     Monopoly, Road Building, Saboteur, Smith, Spy, Trade Monopoly, etc.).
//     Currently each card grants a generic bonus.
//   - TODO: Knight chase actions (displacement, robber-chasing, intrigue)
//     — only basic recruit/promote/activate is implemented.
//   - TODO: City improvements / metropoli (one per commodity track, +2 VP).
//   - TODO: Aqueduct, fishery, harbors/ports, dev cards (replaced by
//     progress cards), Merchant token, defender-of-catan refinements.
//   - TODO: Longest road / largest army bonuses (omitted in C&K rebalance).
//   - TODO: 7 on the dice = barbarians-advance is folded into per-round
//     advance; robber-movement on 7 reuses base mechanic for simplicity.
//   - TODO: Player trading, ports/harbors (2:1 / 3:1) — bank trades are 4:1.
//   - TODO: Multi-human multiplayer over network.
//   - TODO: Activate-on-build cost ordering (we charge it as a separate step).
// =============================================================================

// -----------------------------------------------------------------------------
// Hex / Resource / Commodity primitives
// -----------------------------------------------------------------------------

export type Resource = "wood" | "brick" | "sheep" | "wheat" | "ore";
export type Commodity = "paper" | "cloth" | "coin";
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

export interface CommodityBundle {
  paper: number;
  cloth: number;
  coin: number;
}

export const RESOURCE_LIST: readonly Resource[] = ["wood", "brick", "sheep", "wheat", "ore"];
export const COMMODITY_LIST: readonly Commodity[] = ["paper", "cloth", "coin"];

/** Map: which resource tile produces which commodity for cities. */
export const TILE_TO_COMMODITY: Readonly<Partial<Record<TileType, Commodity>>> = {
  wood: "paper",
  sheep: "cloth",
  ore: "coin",
};

export const HEX_RADIUS = 2;

const TILE_BAG: TileType[] = [
  "wood", "wood", "wood", "wood",
  "brick", "brick", "brick",
  "sheep", "sheep", "sheep", "sheep",
  "wheat", "wheat", "wheat", "wheat",
  "ore", "ore", "ore",
  "desert",
];

const TOKEN_BAG: number[] = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

export function pipsFor(token: number | null): number {
  if (token === null) return 0;
  const pips: Record<number, number> = { 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1 };
  return pips[token] ?? 0;
}

export function hexCenter(q: number, r: number, R: number): { x: number; y: number } {
  const x = R * Math.sqrt(3) * (q + r / 2);
  const y = R * (3 / 2) * r;
  return { x, y };
}

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

const CORNER_OFFSETS_UNIT: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: -1 },
  { x: Math.sqrt(3) / 2, y: -0.5 },
  { x: Math.sqrt(3) / 2, y: 0.5 },
  { x: 0, y: 1 },
  { x: -Math.sqrt(3) / 2, y: 0.5 },
  { x: -Math.sqrt(3) / 2, y: -0.5 },
];

function vKey(x: number, y: number): string {
  return `${Math.round(x * 1000)}:${Math.round(y * 1000)}`;
}

export interface VertexInfo { x: number; y: number; adjHexes: number[]; adjVerts: number[] }
export interface EdgeInfo { a: number; b: number; x1: number; y1: number; x2: number; y2: number }

export interface BoardTopology {
  hexes: Hex[];
  vertices: VertexInfo[];
  edges: EdgeInfo[];
  edgeIndex: Map<string, number>;
}

function ekey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function buildTopology(hexes: Hex[]): BoardTopology {
  const vertexMap = new Map<string, { x: number; y: number; idx: number; adjHexes: Set<number> }>();
  const hexCornerVerts: number[][] = hexes.map(() => Array(6).fill(-1));

  hexes.forEach((h, hi) => {
    const c = hexCenter(h.q, h.r, 1);
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

  const vertices: VertexInfo[] = Array.from(vertexMap.values())
    .sort((a, b) => a.idx - b.idx)
    .map(v => ({ x: v.x, y: v.y, adjHexes: Array.from(v.adjHexes), adjVerts: [] }));

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

export type PlayerId = 0 | 1 | 2 | 3;
export const ALL_PLAYERS: readonly PlayerId[] = [0, 1, 2, 3];

export type KnightLevel = 1 | 2 | 3; // 1=basic, 2=strong, 3=mighty

export interface Knight {
  vertex: number;
  level: KnightLevel;
  active: boolean;
}

export type ProgressCardColor = "science" | "politics" | "trade";

export interface ProgressCard {
  color: ProgressCardColor;
  /** Simplified effect tag. */
  kind: "bonus_resource" | "bonus_commodity" | "bonus_vp" | "bonus_knight_promote";
  /** Display name. */
  name: string;
}

export interface PlayerState {
  id: PlayerId;
  resources: ResourceBundle;
  commodities: CommodityBundle;
  settlements: number[];       // vertex indices
  cities: number[];            // vertex indices
  cityWalls: number[];         // vertex indices (city has wall)
  roads: number[];             // edge indices
  knights: Knight[];
  progressCards: ProgressCard[];
  bonusVp: number;             // from progress cards / defender awards
}

export type Phase =
  | "setup"
  | "roll"
  | "play"
  | "cpu"
  | "done";

export type SetupSubPhase = "place_settlement" | "place_road";

export interface CKSettings {
  /** Victory points to win (default 13). */
  vpTarget: number;
}

export interface CKState {
  rngSeed: number;
  topology: BoardTopology;
  players: [PlayerState, PlayerState, PlayerState, PlayerState];
  current: PlayerId;
  phase: Phase;
  setupSubPhase: SetupSubPhase | null;
  /** Setup snake order: P0, P1, P2, P3, P3, P2, P1, P0. */
  setupStep: number; // 0..7
  setupPendingSettlement: number | null;
  lastRoll: { d1: number; d2: number; sum: number } | null;
  /** Barbarian ship position 0..7. Arrives at 7. */
  barbarianTrack: number;
  /** How many times the barbarians have arrived (history). */
  barbarianArrivals: number;
  /** Last barbarian outcome description (for log/HUD). */
  lastBarbarianOutcome: string | null;
  /** Robber hex (base game leftover). */
  robberHex: number;
  /** Progress card decks (remaining). */
  scienceDeck: ProgressCard[];
  politicsDeck: ProgressCard[];
  tradeDeck: ProgressCard[];
  message: string;
  log: string[];
  selectedVertex: number | null;
  rolledThisTurn: boolean;
  winner: PlayerId | null;
}

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export type CKAction =
  | { type: "setup_place_settlement"; vertex: number }
  | { type: "setup_place_road"; edge: number }
  | { type: "roll" }
  | { type: "build_settlement"; vertex: number }
  | { type: "build_city"; vertex: number }
  | { type: "build_road"; edge: number }
  | { type: "build_wall"; vertex: number }
  | { type: "recruit_knight"; vertex: number }
  | { type: "promote_knight"; index: number }
  | { type: "activate_knight"; index: number }
  | { type: "buy_progress_card"; color: ProgressCardColor }
  | { type: "play_progress_card"; index: number }
  | { type: "trade_bank"; give: Resource; receive: Resource }
  | { type: "end_turn" }
  | { type: "cpu_step" };

// -----------------------------------------------------------------------------
// Costs / helpers
// -----------------------------------------------------------------------------

export const COST_SETTLEMENT: Partial<ResourceBundle> = { wood: 1, brick: 1, sheep: 1, wheat: 1 };
export const COST_CITY: Partial<ResourceBundle> = { wheat: 2, ore: 3 };
export const COST_ROAD: Partial<ResourceBundle> = { wood: 1, brick: 1 };
export const COST_WALL: Partial<ResourceBundle> = { brick: 2 };
export const COST_KNIGHT: Partial<ResourceBundle> = { sheep: 1, ore: 1 };
export const COST_PROMOTE: Partial<ResourceBundle> = { sheep: 1, ore: 1 };
export const COST_ACTIVATE: Partial<ResourceBundle> = { wheat: 1 };
/** Progress card buy: 1 wheat + 1 commodity of the chosen color. */
export const COST_PROGRESS_RES: Partial<ResourceBundle> = { wheat: 1 };

export const BARBARIAN_TRACK_LEN = 7;

function emptyResources(): ResourceBundle {
  return { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
}
function emptyCommodities(): CommodityBundle {
  return { paper: 0, cloth: 0, coin: 0 };
}

function pushLog(log: string[], msg: string): string[] {
  return [msg, ...log].slice(0, 10);
}

function clonePlayer(p: PlayerState): PlayerState {
  return {
    id: p.id,
    resources: { ...p.resources },
    commodities: { ...p.commodities },
    settlements: p.settlements.slice(),
    cities: p.cities.slice(),
    cityWalls: p.cityWalls.slice(),
    roads: p.roads.slice(),
    knights: p.knights.map(k => ({ ...k })),
    progressCards: p.progressCards.map(c => ({ ...c })),
    bonusVp: p.bonusVp,
  };
}

function clonePlayers(ps: readonly PlayerState[]): [PlayerState, PlayerState, PlayerState, PlayerState] {
  return [clonePlayer(ps[0]!), clonePlayer(ps[1]!), clonePlayer(ps[2]!), clonePlayer(ps[3]!)];
}

function hasResources(rb: ResourceBundle, cost: Partial<ResourceBundle>): boolean {
  for (const k of RESOURCE_LIST) {
    if ((cost[k] ?? 0) > rb[k]) return false;
  }
  return true;
}

function payResources(rb: ResourceBundle, cost: Partial<ResourceBundle>): ResourceBundle {
  const out: ResourceBundle = { ...rb };
  for (const k of RESOURCE_LIST) out[k] -= cost[k] ?? 0;
  return out;
}

export function commodityFor(color: ProgressCardColor): Commodity {
  if (color === "science") return "paper";
  if (color === "politics") return "coin";
  return "cloth";
}

export function isVertexOccupied(state: CKState, vertex: number): boolean {
  for (const p of state.players) {
    if (p.settlements.includes(vertex)) return true;
    if (p.cities.includes(vertex)) return true;
    if (p.knights.some(k => k.vertex === vertex)) return true;
  }
  return false;
}

export function isEdgeOccupied(state: CKState, edge: number): boolean {
  for (const p of state.players) {
    if (p.roads.includes(edge)) return true;
  }
  return false;
}

export function distanceRuleOk(state: CKState, vertex: number): boolean {
  const v = state.topology.vertices[vertex];
  if (!v) return false;
  if (isVertexOccupied(state, vertex)) return false;
  for (const nb of v.adjVerts) {
    if (isVertexOccupied(state, nb)) return false;
  }
  return true;
}

export function roadConnects(state: CKState, pid: PlayerId, edge: number): boolean {
  const e = state.topology.edges[edge];
  if (!e) return false;
  const p = state.players[pid];
  if (p.settlements.includes(e.a) || p.settlements.includes(e.b)) return true;
  if (p.cities.includes(e.a) || p.cities.includes(e.b)) return true;
  for (const ei of p.roads) {
    const oe = state.topology.edges[ei]!;
    if (oe.a === e.a || oe.a === e.b || oe.b === e.a || oe.b === e.b) return true;
  }
  return false;
}

export function activeKnightStrength(p: PlayerState): number {
  let total = 0;
  for (const k of p.knights) if (k.active) total += k.level;
  return total;
}

export function totalKnightStrength(p: PlayerState): number {
  let total = 0;
  for (const k of p.knights) total += k.level;
  return total;
}

export function vpFor(state: CKState, pid: PlayerId): number {
  const p = state.players[pid];
  return p.settlements.length + 2 * p.cities.length + p.bonusVp;
}

export function publicVpFor(state: CKState, pid: PlayerId): number {
  return vpFor(state, pid);
}

// -----------------------------------------------------------------------------
// Deterministic builders
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

function buildProgressDeck(color: ProgressCardColor, rng: () => number): ProgressCard[] {
  // Generic 6-card deck for each color. TODO: replace with full named cards.
  const kinds: ProgressCard["kind"][] = [
    "bonus_resource",
    "bonus_commodity",
    "bonus_vp",
    "bonus_resource",
    "bonus_knight_promote",
    "bonus_commodity",
  ];
  const names: Record<ProgressCardColor, string[]> = {
    science: ["Alchemist", "Crane", "Engineer", "Inventor", "Irrigation", "Medicine"],
    politics: ["Bishop", "Constitution", "Deserter", "Diplomat", "Intrigue", "Saboteur"],
    trade: ["Commercial Harbor", "Master Merchant", "Merchant", "Resource Monopoly", "Trade Monopoly", "Wedding"],
  };
  const deck: ProgressCard[] = [];
  for (let i = 0; i < kinds.length; i++) {
    deck.push({ color, kind: kinds[i]!, name: names[color][i]! });
  }
  return shuffleInPlace(deck, rng);
}

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

export function initialState(seed: number, settings: CKSettings): CKState {
  const rng = mulberry32(seed >>> 0);
  const hexes = buildHexes(rng);
  const topology = buildTopology(hexes);
  const scienceDeck = buildProgressDeck("science", rng);
  const politicsDeck = buildProgressDeck("politics", rng);
  const tradeDeck = buildProgressDeck("trade", rng);
  const robberHex = Math.max(0, hexes.findIndex(h => h.type === "desert"));

  const makePlayer = (id: PlayerId): PlayerState => ({
    id,
    resources: emptyResources(),
    commodities: emptyCommodities(),
    settlements: [],
    cities: [],
    cityWalls: [],
    roads: [],
    knights: [],
    progressCards: [],
    bonusVp: 0,
  });

  const players: [PlayerState, PlayerState, PlayerState, PlayerState] = [
    makePlayer(0), makePlayer(1), makePlayer(2), makePlayer(3),
  ];

  const nextSeed = Math.floor(rng() * 2 ** 31);

  // settings consumed by reducer/win-check; capture vpTarget defaults in caller
  void settings;

  return {
    rngSeed: nextSeed,
    topology,
    players,
    current: 0,
    phase: "setup",
    setupSubPhase: "place_settlement",
    setupStep: 0,
    setupPendingSettlement: null,
    lastRoll: null,
    barbarianTrack: 0,
    barbarianArrivals: 0,
    lastBarbarianOutcome: null,
    robberHex,
    scienceDeck,
    politicsDeck,
    tradeDeck,
    message: "Setup: place your first settlement.",
    log: ["Cities & Knights: 4 players to 13 VP. Barbarians threaten the realm."],
    selectedVertex: null,
    rolledThisTurn: false,
    winner: null,
  };
}

// -----------------------------------------------------------------------------
// Setup advance
// -----------------------------------------------------------------------------

const SETUP_ORDER: readonly PlayerId[] = [0, 1, 2, 3, 3, 2, 1, 0];

function advanceSetup(state: CKState): CKState {
  const nextStep = state.setupStep + 1;
  if (nextStep >= SETUP_ORDER.length) {
    return {
      ...state,
      phase: "roll",
      setupSubPhase: null,
      setupStep: nextStep,
      setupPendingSettlement: null,
      current: 0,
      rolledThisTurn: false,
      message: "Your turn. Roll the dice!",
      log: pushLog(state.log, "Setup complete — to arms!"),
    };
  }
  const nextPlayer = SETUP_ORDER[nextStep]!;
  return {
    ...state,
    current: nextPlayer,
    setupSubPhase: "place_settlement",
    setupStep: nextStep,
    setupPendingSettlement: null,
    phase: nextPlayer === 0 ? "setup" : "cpu",
    message: nextPlayer === 0
      ? `Setup: place your ${nextStep < 4 ? "first" : "second"} settlement.`
      : `CPU P${nextPlayer + 1} is placing a settlement...`,
  };
}

function grantSecondSettlementResources(state: CKState, pid: PlayerId, vertex: number): CKState {
  const v = state.topology.vertices[vertex];
  if (!v) return state;
  const players = clonePlayers(state.players);
  for (const hi of v.adjHexes) {
    const hex = state.topology.hexes[hi]!;
    if (hex.type === "desert") continue;
    players[pid].resources[hex.type] += 1;
  }
  return { ...state, players };
}

// -----------------------------------------------------------------------------
// Production & barbarian
// -----------------------------------------------------------------------------

function produceFromRoll(state: CKState, sum: number): CKState {
  const players = clonePlayers(state.players);
  for (let hi = 0; hi < state.topology.hexes.length; hi++) {
    if (hi === state.robberHex) continue;
    const hex = state.topology.hexes[hi]!;
    if (hex.token !== sum) continue;
    if (hex.type === "desert") continue;
    const commodity = TILE_TO_COMMODITY[hex.type];
    for (let vi = 0; vi < state.topology.vertices.length; vi++) {
      const v = state.topology.vertices[vi]!;
      if (!v.adjHexes.includes(hi)) continue;
      for (const p of players) {
        if (p.settlements.includes(vi)) {
          p.resources[hex.type] += 1;
        }
        if (p.cities.includes(vi)) {
          if (commodity) {
            // City on commodity-tile: 1 resource + 1 commodity.
            p.resources[hex.type] += 1;
            p.commodities[commodity] += 1;
          } else {
            // City on non-commodity tile (brick, wheat): 2 resources.
            p.resources[hex.type] += 2;
          }
        }
      }
    }
  }
  return { ...state, players };
}

/** Advance barbarian by 1; on arrival, resolve and reset. */
function advanceBarbarian(state: CKState): CKState {
  const newPos = state.barbarianTrack + 1;
  if (newPos < BARBARIAN_TRACK_LEN) {
    return {
      ...state,
      barbarianTrack: newPos,
      lastBarbarianOutcome: null,
      log: pushLog(state.log, `Barbarian ship advances (${newPos}/${BARBARIAN_TRACK_LEN}).`),
    };
  }
  // Barbarians arrive.
  return resolveBarbarian(state);
}

function resolveBarbarian(state: CKState): CKState {
  const arrivals = state.barbarianArrivals + 1;
  // Barbarian strength = number of cities held in total (one per city, classic rule).
  let barbarianStrength = 0;
  for (const p of state.players) barbarianStrength += p.cities.length;
  // If there are no cities at all, barbarians still "scout" with strength 1.
  if (barbarianStrength === 0) barbarianStrength = 1;

  // Total active knight strength across all players.
  let totalKnights = 0;
  for (const p of state.players) totalKnights += activeKnightStrength(p);

  const players = clonePlayers(state.players);
  let outcome = "";

  if (totalKnights >= barbarianStrength) {
    // Defenders win. Player with max active knight strength gains +1 VP (ties → no winner).
    let maxStrength = -1;
    let winners: PlayerId[] = [];
    for (const p of players) {
      const s = activeKnightStrength(p);
      if (s > maxStrength) { maxStrength = s; winners = [p.id]; }
      else if (s === maxStrength) winners.push(p.id);
    }
    if (winners.length === 1 && maxStrength > 0) {
      const w = winners[0]!;
      players[w].bonusVp += 1;
      outcome = `Barbarians repelled. P${w + 1} earns +1 VP (Defender of Catan).`;
    } else {
      outcome = "Barbarians repelled, but no single Defender claims the honour.";
    }
  } else {
    // Defenders lose: weakest player (lowest active knight strength) loses weakest city.
    let weakestPlayer: PlayerId | null = null;
    let minStrength = Infinity;
    for (const p of players) {
      if (p.cities.length === 0) continue; // can't lose a city you don't have
      const s = activeKnightStrength(p);
      if (s < minStrength) { minStrength = s; weakestPlayer = p.id; }
    }
    if (weakestPlayer === null) {
      outcome = "Barbarians arrive — but there are no cities to plunder.";
    } else {
      const wp = players[weakestPlayer];
      // Pick the weakest city: lowest pip-sum on adjacent hexes.
      let worst = -1;
      let worstScore = Infinity;
      for (const vi of wp.cities) {
        const v = state.topology.vertices[vi]!;
        let pips = 0;
        for (const hi of v.adjHexes) pips += pipsFor(state.topology.hexes[hi]!.token);
        if (pips < worstScore) { worstScore = pips; worst = vi; }
      }
      if (worst >= 0) {
        // Walls absorb the hit.
        const wallIdx = wp.cityWalls.indexOf(worst);
        if (wallIdx >= 0) {
          wp.cityWalls.splice(wallIdx, 1);
          outcome = `Barbarians attack P${weakestPlayer + 1}'s city, but its WALLS hold!`;
        } else {
          wp.cities = wp.cities.filter(v => v !== worst);
          wp.settlements.push(worst);
          outcome = `Barbarians sack P${weakestPlayer + 1}'s city, reducing it to a settlement.`;
        }
      }
    }
  }

  // All inactive any active knights deactivate after defense (classic rule).
  for (const p of players) {
    for (const k of p.knights) k.active = false;
  }

  return {
    ...state,
    players,
    barbarianTrack: 0,
    barbarianArrivals: arrivals,
    lastBarbarianOutcome: outcome,
    log: pushLog(state.log, `BARBARIANS! ${outcome}`),
  };
}

// -----------------------------------------------------------------------------
// CPU AI
// -----------------------------------------------------------------------------

function scoreVertexForSetup(state: CKState, vertex: number): number {
  const v = state.topology.vertices[vertex];
  if (!v) return -1;
  let score = 0;
  const types = new Set<TileType>();
  for (const hi of v.adjHexes) {
    const h = state.topology.hexes[hi]!;
    score += pipsFor(h.token);
    types.add(h.type);
  }
  score += types.size;
  return score;
}

function pickSetupSettlement(state: CKState): number {
  let best = -1;
  let bestScore = -Infinity;
  for (let vi = 0; vi < state.topology.vertices.length; vi++) {
    if (!distanceRuleOk(state, vi)) continue;
    const s = scoreVertexForSetup(state, vi);
    if (s > bestScore) { bestScore = s; best = vi; }
  }
  return best;
}

function pickSetupRoad(state: CKState, settlementVertex: number): number {
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

/** Greedy CPU strategy: build cities + knights aggressively. */
function pickCpuPlayAction(state: CKState, pid: PlayerId): CKAction | null {
  const cpu = state.players[pid];

  // 1. Build city if can (upgrades highest-pip settlement).
  if (hasResources(cpu.resources, COST_CITY) && cpu.settlements.length > 0) {
    let best = -1, bestScore = -Infinity;
    for (const vi of cpu.settlements) {
      const sc = scoreVertexForSetup(state, vi);
      if (sc > bestScore) { bestScore = sc; best = vi; }
    }
    if (best >= 0) return { type: "build_city", vertex: best };
  }

  // 2. Activate an inactive knight if can.
  if (hasResources(cpu.resources, COST_ACTIVATE)) {
    const inactiveIdx = cpu.knights.findIndex(k => !k.active);
    if (inactiveIdx >= 0) return { type: "activate_knight", index: inactiveIdx };
  }

  // 3. Promote a knight if can (level < 3).
  if (hasResources(cpu.resources, COST_PROMOTE)) {
    const promoIdx = cpu.knights.findIndex(k => k.level < 3);
    if (promoIdx >= 0) return { type: "promote_knight", index: promoIdx };
  }

  // 4. Recruit a knight: needs a vertex adjacent to a road of cpu and unoccupied.
  if (hasResources(cpu.resources, COST_KNIGHT)) {
    const candidate = findKnightVertex(state, pid);
    if (candidate >= 0) return { type: "recruit_knight", vertex: candidate };
  }

  // 5. Build settlement if can.
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

  // 6. Build wall on a city without one.
  if (hasResources(cpu.resources, COST_WALL) && cpu.cities.length > 0) {
    for (const vi of cpu.cities) {
      if (!cpu.cityWalls.includes(vi)) return { type: "build_wall", vertex: vi };
    }
  }

  // 7. Build road.
  if (hasResources(cpu.resources, COST_ROAD)) {
    for (let ei = 0; ei < state.topology.edges.length; ei++) {
      if (isEdgeOccupied(state, ei)) continue;
      if (!roadConnects(state, pid, ei)) continue;
      return { type: "build_road", edge: ei };
    }
  }

  // 8. Bank trade if heavy in one resource.
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

  // 9. Play held progress cards.
  if (cpu.progressCards.length > 0) {
    return { type: "play_progress_card", index: 0 };
  }

  return null;
}

/** Find a legal vertex for a new knight: adjacent to player's road, unoccupied. */
function findKnightVertex(state: CKState, pid: PlayerId): number {
  const p = state.players[pid];
  const reachable = new Set<number>();
  for (const ei of p.roads) {
    const e = state.topology.edges[ei]!;
    reachable.add(e.a); reachable.add(e.b);
  }
  for (const vi of reachable) {
    if (isVertexOccupied(state, vi)) continue;
    return vi;
  }
  return -1;
}

// -----------------------------------------------------------------------------
// Win-check
// -----------------------------------------------------------------------------

function checkWin(state: CKState, vpTarget: number): CKState {
  for (const pid of ALL_PLAYERS) {
    if (vpFor(state, pid) >= vpTarget) {
      return {
        ...state,
        phase: "done",
        winner: pid,
        message: pid === 0
          ? `Victory! You reached ${vpFor(state, pid)} VP.`
          : `Defeat. CPU P${pid + 1} reached ${vpFor(state, pid)} VP.`,
        log: pushLog(state.log, `P${pid + 1} wins at ${vpFor(state, pid)} VP.`),
      };
    }
  }
  return state;
}

// -----------------------------------------------------------------------------
// Apply a play action (shared by human + CPU)
// -----------------------------------------------------------------------------

function applyPlayAction(state: CKState, pid: PlayerId, action: CKAction, rng: () => number, vpTarget: number): CKState {
  const p = state.players[pid];

  if (action.type === "build_road") {
    if (!hasResources(p.resources, COST_ROAD)) return state;
    if (isEdgeOccupied(state, action.edge)) return state;
    if (!roadConnects(state, pid, action.edge)) return state;
    const players = clonePlayers(state.players);
    players[pid].resources = payResources(players[pid].resources, COST_ROAD);
    players[pid].roads.push(action.edge);
    return {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} built road.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
  }

  if (action.type === "build_settlement") {
    if (!hasResources(p.resources, COST_SETTLEMENT)) return state;
    if (!distanceRuleOk(state, action.vertex)) return state;
    let connected = false;
    for (const ei of p.roads) {
      const e = state.topology.edges[ei]!;
      if (e.a === action.vertex || e.b === action.vertex) { connected = true; break; }
    }
    if (!connected) return state;
    const players = clonePlayers(state.players);
    players[pid].resources = payResources(players[pid].resources, COST_SETTLEMENT);
    players[pid].settlements.push(action.vertex);
    const next: CKState = {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} built settlement.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
    return checkWin(next, vpTarget);
  }

  if (action.type === "build_city") {
    if (!hasResources(p.resources, COST_CITY)) return state;
    if (!p.settlements.includes(action.vertex)) return state;
    const players = clonePlayers(state.players);
    players[pid].resources = payResources(players[pid].resources, COST_CITY);
    players[pid].settlements = players[pid].settlements.filter(v => v !== action.vertex);
    players[pid].cities.push(action.vertex);
    const next: CKState = {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} upgraded to city.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
    return checkWin(next, vpTarget);
  }

  if (action.type === "build_wall") {
    if (!hasResources(p.resources, COST_WALL)) return state;
    if (!p.cities.includes(action.vertex)) return state;
    if (p.cityWalls.includes(action.vertex)) return state;
    const players = clonePlayers(state.players);
    players[pid].resources = payResources(players[pid].resources, COST_WALL);
    players[pid].cityWalls.push(action.vertex);
    return {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} built city wall.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
  }

  if (action.type === "recruit_knight") {
    if (!hasResources(p.resources, COST_KNIGHT)) return state;
    if (isVertexOccupied(state, action.vertex)) return state;
    // Must be adjacent to player's road.
    let connected = false;
    for (const ei of p.roads) {
      const e = state.topology.edges[ei]!;
      if (e.a === action.vertex || e.b === action.vertex) { connected = true; break; }
    }
    if (!connected) return state;
    const players = clonePlayers(state.players);
    players[pid].resources = payResources(players[pid].resources, COST_KNIGHT);
    players[pid].knights.push({ vertex: action.vertex, level: 1, active: false });
    return {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} recruited a basic knight.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
  }

  if (action.type === "promote_knight") {
    if (!hasResources(p.resources, COST_PROMOTE)) return state;
    const k = p.knights[action.index];
    if (!k) return state;
    if (k.level >= 3) return state;
    const players = clonePlayers(state.players);
    players[pid].resources = payResources(players[pid].resources, COST_PROMOTE);
    players[pid].knights[action.index]!.level = (k.level + 1) as KnightLevel;
    return {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} promoted a knight to level ${players[pid].knights[action.index]!.level}.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
  }

  if (action.type === "activate_knight") {
    if (!hasResources(p.resources, COST_ACTIVATE)) return state;
    const k = p.knights[action.index];
    if (!k) return state;
    if (k.active) return state;
    const players = clonePlayers(state.players);
    players[pid].resources = payResources(players[pid].resources, COST_ACTIVATE);
    players[pid].knights[action.index]!.active = true;
    return {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} activated a knight.`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
  }

  if (action.type === "buy_progress_card") {
    const commodity = commodityFor(action.color);
    if (!hasResources(p.resources, COST_PROGRESS_RES)) return state;
    if (p.commodities[commodity] < 1) return state;
    const deck = action.color === "science" ? state.scienceDeck
              : action.color === "politics" ? state.politicsDeck
              : state.tradeDeck;
    if (deck.length === 0) return state;
    const players = clonePlayers(state.players);
    players[pid].resources = payResources(players[pid].resources, COST_PROGRESS_RES);
    players[pid].commodities[commodity] -= 1;
    const newDeck = deck.slice();
    const drawn = newDeck.shift()!;
    players[pid].progressCards.push(drawn);
    const next: CKState = { ...state, players, rngSeed: Math.floor(rng() * 2 ** 31) };
    if (action.color === "science") return { ...next, scienceDeck: newDeck, log: pushLog(state.log, `P${pid + 1} bought a Science card.`) };
    if (action.color === "politics") return { ...next, politicsDeck: newDeck, log: pushLog(state.log, `P${pid + 1} bought a Politics card.`) };
    return { ...next, tradeDeck: newDeck, log: pushLog(state.log, `P${pid + 1} bought a Trade card.`) };
  }

  if (action.type === "play_progress_card") {
    const card = p.progressCards[action.index];
    if (!card) return state;
    const players = clonePlayers(state.players);
    // Apply simplified effect.
    // TODO: replace each kind with the full named-card effect.
    if (card.kind === "bonus_resource") {
      // Grant a resource matching the deck's typical bias.
      const pick: Resource = card.color === "science" ? "wheat" : card.color === "politics" ? "ore" : "sheep";
      players[pid].resources[pick] += 1;
    } else if (card.kind === "bonus_commodity") {
      players[pid].commodities[commodityFor(card.color)] += 1;
    } else if (card.kind === "bonus_vp") {
      players[pid].bonusVp += 1;
    } else if (card.kind === "bonus_knight_promote") {
      // Promote any knight if possible (free).
      const promo = players[pid].knights.findIndex(k => k.level < 3);
      if (promo >= 0) players[pid].knights[promo]!.level = (players[pid].knights[promo]!.level + 1) as KnightLevel;
    }
    players[pid].progressCards.splice(action.index, 1);
    const next: CKState = {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} played "${card.name}".`),
      rngSeed: Math.floor(rng() * 2 ** 31),
    };
    return checkWin(next, vpTarget);
  }

  if (action.type === "trade_bank") {
    if (action.give === action.receive) return state;
    if (p.resources[action.give] < 4) return state;
    const players = clonePlayers(state.players);
    players[pid].resources[action.give] -= 4;
    players[pid].resources[action.receive] += 1;
    return {
      ...state, players,
      log: pushLog(state.log, `P${pid + 1} traded 4 ${action.give} for 1 ${action.receive}.`),
    };
  }

  return state;
}

// -----------------------------------------------------------------------------
// End-turn helper: advance current player and tick barbarian after a full round
// -----------------------------------------------------------------------------

function endTurnFor(state: CKState, vpTarget: number): CKState {
  let st = checkWin(state, vpTarget);
  if (st.phase === "done") return st;
  // Advance to next player. After P3 → P0, also advance barbarian.
  const nextPid: PlayerId = ((st.current + 1) % 4) as PlayerId;
  if (nextPid === 0) {
    st = advanceBarbarian(st);
    st = checkWin(st, vpTarget);
    if (st.phase === "done") return st;
  }
  return {
    ...st,
    current: nextPid,
    phase: nextPid === 0 ? "roll" : "cpu",
    rolledThisTurn: false,
    lastRoll: null,
    message: nextPid === 0 ? "Your turn. Roll the dice!" : `CPU P${nextPid + 1} is thinking...`,
  };
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const DEFAULT_VP_TARGET = 13;

export function reducer(state: CKState, action: CKAction): CKState {
  if (state.phase === "done") return state;
  const vpTarget = DEFAULT_VP_TARGET;

  // ─── SETUP (human) ───
  if (state.phase === "setup") {
    if (state.current !== 0) return state;
    if (state.setupSubPhase === "place_settlement" && action.type === "setup_place_settlement") {
      if (!distanceRuleOk(state, action.vertex)) return state;
      const players = clonePlayers(state.players);
      players[0].settlements.push(action.vertex);
      let next: CKState = {
        ...state, players,
        setupSubPhase: "place_road",
        setupPendingSettlement: action.vertex,
        message: "Setup: place a road adjacent to your settlement.",
        log: pushLog(state.log, `You placed settlement #${players[0].settlements.length}.`),
      };
      if (state.setupStep >= 4) {
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
      const players = clonePlayers(state.players);
      players[0].roads.push(action.edge);
      const next: CKState = {
        ...state, players,
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
    const pid = st.current;

    if (st.setupSubPhase === "place_settlement") {
      const v = pickSetupSettlement(st);
      if (v < 0) return st;
      const players = clonePlayers(st.players);
      players[pid].settlements.push(v);
      st = {
        ...st, players,
        setupSubPhase: "place_road",
        setupPendingSettlement: v,
        log: pushLog(st.log, `CPU P${pid + 1} placed settlement #${players[pid].settlements.length}.`),
      };
      if (st.setupStep >= 4) {
        st = grantSecondSettlementResources(st, pid, v);
      }
      return st;
    }
    if (st.setupSubPhase === "place_road" && st.setupPendingSettlement !== null) {
      const ei = pickSetupRoad(st, st.setupPendingSettlement);
      if (ei < 0) return st;
      const players = clonePlayers(st.players);
      players[pid].roads.push(ei);
      st = { ...st, players, log: pushLog(st.log, `CPU P${pid + 1} placed road #${players[pid].roads.length}.`) };
      return advanceSetup(st);
    }

    // CPU normal turn: roll then act then end.
    if (!st.rolledThisTurn) {
      const d1 = 1 + Math.floor(rng() * 6);
      const d2 = 1 + Math.floor(rng() * 6);
      const sum = d1 + d2;
      st = { ...st, lastRoll: { d1, d2, sum }, rolledThisTurn: true, log: pushLog(st.log, `CPU P${pid + 1} rolled ${sum} (${d1}+${d2})`) };
      if (sum === 7) {
        // Simplified: 7 advances barbarian an extra step instead of robber drama.
        st = advanceBarbarian(st);
      } else {
        st = produceFromRoll(st, sum);
      }
      st = { ...st, rngSeed: Math.floor(rng() * 2 ** 31) };
      return st;
    }

    const act = pickCpuPlayAction(st, pid);
    if (act === null) {
      return endTurnFor({ ...st, log: pushLog(st.log, `CPU P${pid + 1} ended turn.`) }, vpTarget);
    }
    return applyPlayAction(st, pid, act, rng, vpTarget);
  }

  // ─── HUMAN: ROLL ───
  if (state.phase === "roll" && state.current === 0 && action.type === "roll") {
    const rng = mulberry32(state.rngSeed);
    const d1 = 1 + Math.floor(rng() * 6);
    const d2 = 1 + Math.floor(rng() * 6);
    const sum = d1 + d2;
    let st: CKState = {
      ...state,
      lastRoll: { d1, d2, sum },
      rolledThisTurn: true,
      phase: "play",
      log: pushLog(state.log, `You rolled ${sum} (${d1}+${d2})`),
      message: sum === 7 ? "Rolled 7 — the barbarians press onward!" : `Rolled ${sum}. Resources distributed.`,
    };
    if (sum === 7) {
      st = advanceBarbarian(st);
    } else {
      st = produceFromRoll(st, sum);
    }
    return { ...st, rngSeed: Math.floor(rng() * 2 ** 31) };
  }

  // ─── HUMAN: PLAY ───
  if (state.phase === "play" && state.current === 0) {
    if (action.type === "end_turn") {
      return endTurnFor({ ...state, log: pushLog(state.log, "You ended turn.") }, vpTarget);
    }
    const rng = mulberry32(state.rngSeed);
    return applyPlayAction(state, 0, action, rng, vpTarget);
  }

  return state;
}

// -----------------------------------------------------------------------------
// Terminal & scoring
// -----------------------------------------------------------------------------

export function score(state: CKState): number {
  if (state.winner === 0) {
    const vp = vpFor(state, 0);
    return 1200 + vp * 25;
  }
  return 0;
}

export function isTerminal(state: CKState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: score(state) };
}
