import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Brass Birmingham (Full) — XL tier MVP, 4-player edition: 1 human + 3 CPUs.
 *
 * Birmingham region: 19 cities + farms abstracted as a network of locations
 * connected by "links" (canals in Era I, rails in Era II). Each turn a player
 * takes exactly 2 actions from this menu:
 *   - build: place an industry tile (coal, iron, cotton, manufactured, brewery)
 *            in a city you have a presence in (or any city in Era I).
 *            Cost = tile cost. May consume coal/iron from market.
 *   - link:  add a network link between two adjacent cities ($3 canal in
 *            Era I, $5+coal rail in Era II)
 *   - develop: pay $0 to remove your cheapest level-1 tile from supply
 *   - sell:  flip one of your placed cotton/manufactured tiles, scoring its VP
 *   - loan:  take $30 cash, lose 3 income
 *   - scout: refresh the available industries from the market
 *
 * End-of-Era I scoring: VPs from links + flipped tiles. Level-1 tiles are
 * removed (we approximate this by reducing each player's unflipped Lvl-1
 * tiles to 0 — they go back to supply but don't score). End-game scoring
 * does the same after Era II.
 *
 * Highest VP wins.
 *
 * TODOs / OMITTED RULES (XL minimal):
 *   - No beer market, no breweries consume-by-flipping pathway (breweries
 *     are placeable but auto-flip when built — simplified)
 *   - No traders / merchant tiles on the edge of the map
 *   - No full card hand mechanics: every player can build in any of their
 *     "presence" cities + Era-I bootstrap. Card-based location restriction
 *     is approximated by a simple per-turn random "allowed city" set.
 *   - Industry tile sets per player are simplified to a fixed roster of 8
 *     tiles per type at increasing levels
 *   - Coal/iron market dynamics are abstracted to a single pool with
 *     simple pricing (always available at $2 each from market if you can't
 *     pull from network)
 *   - No double-build action card combo; we just give each turn 2 actions
 *   - VP totals are approximate (industry tile VP from a fixed table)
 */

export const NUM_PLAYERS = 4;
export const HUMAN_SEAT = 0;
export const ACTIONS_PER_TURN = 2;
export const TURNS_PER_ERA = 8; // 8 turns × 4 players = 32 actions per era (MVP)
export const STARTING_CASH = 17;
export const LOAN_AMOUNT = 30;
export const LOAN_INCOME_HIT = 3;
export const LINK_COST_CANAL = 3;
export const LINK_COST_RAIL = 5;
export const LINK_VP_CANAL = 1;
export const LINK_VP_RAIL = 2;
export const MARKET_COAL_PRICE = 2;
export const MARKET_IRON_PRICE = 2;
export const DEVELOP_COST = 0;

export type Era = "canal" | "rail";
export type IndustryKind = "coal" | "iron" | "cotton" | "manufactured" | "brewery";

export interface IndustryTile {
  /** Stable id "p{seat}-{kind}-{idx}" */
  id: string;
  owner: number;
  kind: IndustryKind;
  level: 1 | 2 | 3;
  cost: number;
  vp: number;
  /** Where the tile is placed; null if still in supply. */
  city: number | null;
  /** True after the tile is sold / used (scores VP). */
  flipped: boolean;
}

export interface Link {
  /** "{a}-{b}" where a < b (a,b are city indexes). */
  id: string;
  owner: number;
  a: number;
  b: number;
  era: Era;
}

export interface Player {
  seat: number;
  name: string;
  isCpu: boolean;
  cash: number;
  income: number;
  vp: number;
  tiles: IndustryTile[];
  links: Link[];
  /** Cities this player has a presence in (placed any tile/link). */
  presence: number[];
}

export type Phase = "playing" | "era-scoring" | "done";

export interface BrassBirminghamFullState {
  rngSeed: number;
  era: Era;
  turn: number;          // 1..TURNS_PER_ERA (per era)
  currentSeat: number;   // 0..3
  actionsLeft: number;   // 0..ACTIONS_PER_TURN
  players: Player[];
  /** Coal in shared market pool. */
  coalMarket: number;
  /** Iron in shared market pool. */
  ironMarket: number;
  /** Cities allowed to build in this turn (card hand approximation). */
  allowedCities: number[];
  phase: Phase;
  log: string[];
}

export type BrassBirminghamFullAction =
  | { type: "build"; kind: IndustryKind; city: number }
  | { type: "link"; a: number; b: number }
  | { type: "develop" }
  | { type: "sell"; tileId: string }
  | { type: "loan" }
  | { type: "scout" }
  | { type: "pass" }
  | { type: "score-era" }
  | { type: "advance-era" }
  | { type: "cpu-step" };

export interface BrassBirminghamFullSettings { _dummy: boolean }

/* ---------- Birmingham region: 19 cities + farms (simplified). ---------- */

export const CITIES: { name: string; isFarm?: boolean }[] = [
  { name: "Birmingham" },
  { name: "Coventry" },
  { name: "Dudley" },
  { name: "Walsall" },
  { name: "Wolverhampton" },
  { name: "Cannock" },
  { name: "Tamworth" },
  { name: "Nuneaton" },
  { name: "Coalbrookdale" },
  { name: "Kidderminster" },
  { name: "Worcester" },
  { name: "Redditch" },
  { name: "Stone" },
  { name: "Stoke-on-Trent" },
  { name: "Leek" },
  { name: "Uttoxeter" },
  { name: "Belper" },
  { name: "Derby" },
  { name: "Burton-upon-Trent" },
  { name: "Farm A", isFarm: true },
  { name: "Farm B", isFarm: true },
];

/** Adjacency as pairs of indexes. Birmingham (0) is central. */
export const ADJACENCY: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [0, 2], [0, 3], [0, 6], [0, 11], [0, 18],
  [2, 4], [2, 9], [3, 4], [3, 5], [4, 5], [4, 8],
  [5, 6], [6, 18], [6, 7], [7, 1], [8, 9], [9, 10],
  [10, 11], [11, 0], [12, 13], [13, 14], [13, 15], [13, 4],
  [15, 18], [16, 17], [17, 18], [17, 15], [12, 18], [18, 19],
  [0, 19], [10, 20], [11, 20], [9, 19], [8, 20],
];

export function areAdjacent(a: number, b: number): boolean {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return ADJACENCY.some(([x, y]) => Math.min(x, y) === lo && Math.max(x, y) === hi);
}

/* ---------- Industry tile roster ---------- */

interface RosterEntry { kind: IndustryKind; level: 1 | 2 | 3; cost: number; vp: number }

const TILE_ROSTER: RosterEntry[] = [
  { kind: "coal", level: 1, cost: 5, vp: 1 },
  { kind: "coal", level: 2, cost: 7, vp: 2 },
  { kind: "iron", level: 1, cost: 5, vp: 3 },
  { kind: "iron", level: 2, cost: 7, vp: 5 },
  { kind: "cotton", level: 1, cost: 12, vp: 5 },
  { kind: "cotton", level: 2, cost: 14, vp: 8 },
  { kind: "cotton", level: 3, cost: 16, vp: 11 },
  { kind: "manufactured", level: 1, cost: 8, vp: 3 },
  { kind: "manufactured", level: 2, cost: 10, vp: 5 },
  { kind: "manufactured", level: 3, cost: 12, vp: 9 },
  { kind: "brewery", level: 1, cost: 5, vp: 4 },
  { kind: "brewery", level: 2, cost: 7, vp: 7 },
];

function tilesForSeat(seat: number): IndustryTile[] {
  const out: IndustryTile[] = [];
  for (let i = 0; i < TILE_ROSTER.length; i++) {
    const r = TILE_ROSTER[i]!;
    out.push({
      id: `p${seat}-${r.kind}-${r.level}-${i}`,
      owner: seat,
      kind: r.kind,
      level: r.level,
      cost: r.cost,
      vp: r.vp,
      city: null,
      flipped: false,
    });
  }
  return out;
}

/* ---------- Initial state ---------- */

const CPU_NAMES = ["Boulton & Watt", "Wedgwood", "Cadbury"];

export function initialState(seed: number, _s: BrassBirminghamFullSettings): BrassBirminghamFullState {
  const rng = mulberry32(seed);
  const players: Player[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    players.push({
      seat: i,
      name: i === 0 ? "You" : CPU_NAMES[i - 1] ?? `CPU ${i}`,
      isCpu: i !== 0,
      cash: STARTING_CASH,
      income: 0,
      vp: 0,
      tiles: tilesForSeat(i),
      links: [],
      presence: [],
    });
  }
  // Pick first allowed cities (card-hand approximation)
  const allowed = pickAllowedCities(rng, []);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    era: "canal",
    turn: 1,
    currentSeat: 0,
    actionsLeft: ACTIONS_PER_TURN,
    players,
    coalMarket: 10,
    ironMarket: 10,
    allowedCities: allowed,
    phase: "playing",
    log: ["Era I (Canals) begins. You go first."],
  };
}

function pickAllowedCities(rng: () => number, _prev: number[]): number[] {
  // Pick 4 random non-farm cities as the player's "card hand" allowed builds.
  const out = new Set<number>();
  while (out.size < 4) {
    out.add(Math.floor(rng() * 19)); // 0..18 city slots
  }
  return Array.from(out).sort((a, b) => a - b);
}

/* ---------- Helpers ---------- */

function clone<T>(x: T): T { return JSON.parse(JSON.stringify(x)) as T; }

function nextSupplyTile(p: Player, kind: IndustryKind): IndustryTile | null {
  // Return the lowest-level un-placed tile of `kind`.
  return p.tiles.filter((t) => !t.city && t.kind === kind).sort((a, b) => a.level - b.level)[0] ?? null;
}

function canBuildHere(state: BrassBirminghamFullState, seat: number, city: number): boolean {
  // Cities allowed via random "hand", OR cities where the seat already has presence.
  const p = state.players[seat];
  if (!p) return false;
  if (p.presence.includes(city)) return true;
  return state.allowedCities.includes(city);
}

function consumeCoalIron(state: BrassBirminghamFullState, seat: number, needCoal: number, needIron: number): { ok: boolean; coalCost: number; ironCost: number } {
  // Simplified — pull from market at $2 each.
  const p = state.players[seat];
  if (!p) return { ok: false, coalCost: 0, ironCost: 0 };
  const coalCost = needCoal * MARKET_COAL_PRICE;
  const ironCost = needIron * MARKET_IRON_PRICE;
  if (p.cash < coalCost + ironCost) return { ok: false, coalCost, ironCost };
  if (state.coalMarket < needCoal || state.ironMarket < needIron) return { ok: false, coalCost, ironCost };
  return { ok: true, coalCost, ironCost };
}

function industryConsumesCoal(kind: IndustryKind): number {
  if (kind === "iron" || kind === "manufactured") return 1;
  return 0;
}
function industryConsumesIron(kind: IndustryKind): number {
  if (kind === "manufactured") return 1;
  return 0;
}

function addPresence(p: Player, city: number): void {
  if (!p.presence.includes(city)) p.presence.push(city);
}

/* ---------- Reducer ---------- */

export function reducer(state: BrassBirminghamFullState, action: BrassBirminghamFullAction): BrassBirminghamFullState {
  if (state.phase === "done") return state;

  if (state.phase === "era-scoring") {
    if (action.type === "advance-era") {
      if (state.era === "canal") {
        // Era II begins
        const ns = clone(state);
        ns.era = "rail";
        ns.turn = 1;
        ns.currentSeat = 0;
        ns.actionsLeft = ACTIONS_PER_TURN;
        ns.phase = "playing";
        const rng = mulberry32(ns.rngSeed);
        ns.allowedCities = pickAllowedCities(rng, ns.allowedCities);
        ns.rngSeed = Math.floor(rng() * 2 ** 31);
        ns.log.push("Era II (Rails) begins.");
        return ns;
      }
      // Final
      const ns = clone(state);
      ns.phase = "done";
      ns.log.push("Game over.");
      return ns;
    }
    return state;
  }

  // playing phase
  if (state.phase !== "playing") return state;

  if (action.type === "cpu-step") {
    if (!state.players[state.currentSeat]?.isCpu) return state;
    const a = cpuChooseAction(state);
    if (!a) return endTurn(state);
    const next = reducer(state, a);
    // If the chosen action was illegal (no-op), force end of turn to avoid loops.
    if (next === state) return endTurn(state);
    return next;
  }

  if (action.type === "pass") {
    return endTurn(state);
  }

  // All other actions must come from currentSeat with actionsLeft > 0
  if (state.actionsLeft <= 0) return state;
  const seat = state.currentSeat;
  const p = state.players[seat];
  if (!p) return state;

  if (action.type === "build") {
    const tile = nextSupplyTile(p, action.kind);
    if (!tile) return state;
    if (!canBuildHere(state, seat, action.city)) return state;
    const needCoal = industryConsumesCoal(action.kind);
    const needIron = industryConsumesIron(action.kind);
    if (p.cash < tile.cost) return state;
    const ci = consumeCoalIron(state, seat, needCoal, needIron);
    if (!ci.ok) return state;
    const ns = clone(state);
    const np = ns.players[seat]!;
    const nt = np.tiles.find((t) => t.id === tile.id)!;
    np.cash -= tile.cost + ci.coalCost + ci.ironCost;
    ns.coalMarket -= needCoal;
    ns.ironMarket -= needIron;
    nt.city = action.city;
    // Coal/iron/brewery auto-flip on build (simplification — they're "for the network").
    if (action.kind === "coal") { nt.flipped = true; np.vp += nt.vp; ns.coalMarket = Math.min(ns.coalMarket + 2, 20); np.income += 2; }
    else if (action.kind === "iron") { nt.flipped = true; np.vp += nt.vp; ns.ironMarket = Math.min(ns.ironMarket + 2, 20); np.income += 2; }
    else if (action.kind === "brewery") { nt.flipped = true; np.vp += nt.vp; np.income += 1; }
    addPresence(np, action.city);
    ns.log.push(`${np.name} built ${action.kind} L${nt.level} at ${CITIES[action.city]?.name ?? action.city}.`);
    return afterAction(ns);
  }

  if (action.type === "link") {
    if (!areAdjacent(action.a, action.b)) return state;
    const key = `${Math.min(action.a, action.b)}-${Math.max(action.a, action.b)}`;
    // No duplicate links anywhere on the board.
    for (const pl of state.players) if (pl.links.some((l) => l.id === key)) return state;
    const cost = state.era === "canal" ? LINK_COST_CANAL : LINK_COST_RAIL;
    if (p.cash < cost) return state;
    // Era II rail needs 1 coal.
    if (state.era === "rail") {
      if (state.coalMarket < 1 || p.cash < cost + MARKET_COAL_PRICE) return state;
    }
    const ns = clone(state);
    const np = ns.players[seat]!;
    np.cash -= cost;
    if (state.era === "rail") {
      np.cash -= MARKET_COAL_PRICE;
      ns.coalMarket -= 1;
    }
    np.links.push({ id: key, owner: seat, a: action.a, b: action.b, era: state.era });
    addPresence(np, action.a);
    addPresence(np, action.b);
    ns.log.push(`${np.name} built ${state.era === "canal" ? "canal" : "rail"} between ${CITIES[action.a]?.name} and ${CITIES[action.b]?.name}.`);
    return afterAction(ns);
  }

  if (action.type === "develop") {
    // Remove the lowest-level un-placed tile from supply.
    const target = p.tiles.filter((t) => !t.city).sort((a, b) => a.level - b.level)[0];
    if (!target) return state;
    if (p.cash < DEVELOP_COST) return state;
    const ns = clone(state);
    const np = ns.players[seat]!;
    np.cash -= DEVELOP_COST;
    np.tiles = np.tiles.filter((t) => t.id !== target.id);
    ns.log.push(`${np.name} developed (removed ${target.kind} L${target.level} from supply).`);
    return afterAction(ns);
  }

  if (action.type === "sell") {
    const t = p.tiles.find((tt) => tt.id === action.tileId);
    if (!t || t.city === null || t.flipped) return state;
    if (t.kind !== "cotton" && t.kind !== "manufactured") return state;
    const ns = clone(state);
    const np = ns.players[seat]!;
    const nt = np.tiles.find((tt) => tt.id === action.tileId)!;
    nt.flipped = true;
    np.vp += nt.vp;
    np.income += Math.max(1, Math.floor(nt.vp / 2));
    ns.log.push(`${np.name} sold ${nt.kind} L${nt.level} for ${nt.vp} VP.`);
    return afterAction(ns);
  }

  if (action.type === "loan") {
    const ns = clone(state);
    const np = ns.players[seat]!;
    np.cash += LOAN_AMOUNT;
    np.income = Math.max(0, np.income - LOAN_INCOME_HIT);
    ns.log.push(`${np.name} took a loan (+$${LOAN_AMOUNT}, -${LOAN_INCOME_HIT} income).`);
    return afterAction(ns);
  }

  if (action.type === "scout") {
    const ns = clone(state);
    const rng = mulberry32(ns.rngSeed);
    ns.allowedCities = pickAllowedCities(rng, ns.allowedCities);
    ns.rngSeed = Math.floor(rng() * 2 ** 31);
    ns.log.push(`${ns.players[seat]!.name} scouted (refresh allowed builds).`);
    return afterAction(ns);
  }

  return state;
}

function afterAction(state: BrassBirminghamFullState): BrassBirminghamFullState {
  const ns = clone(state);
  ns.actionsLeft -= 1;
  if (ns.actionsLeft <= 0) return endTurn(ns);
  return ns;
}

function endTurn(state: BrassBirminghamFullState): BrassBirminghamFullState {
  // Pay income at end of each player's turn.
  const ns = clone(state);
  const p = ns.players[ns.currentSeat];
  if (p) p.cash += p.income;
  // advance seat
  let nextSeat = (ns.currentSeat + 1) % NUM_PLAYERS;
  let nextTurn = ns.turn;
  if (nextSeat === 0) nextTurn += 1;
  // End of era?
  if (nextTurn > TURNS_PER_ERA) {
    return enterEraScoring(ns);
  }
  ns.currentSeat = nextSeat;
  ns.turn = nextTurn;
  ns.actionsLeft = ACTIONS_PER_TURN;
  // Refresh allowed cities.
  const rng = mulberry32(ns.rngSeed);
  ns.allowedCities = pickAllowedCities(rng, ns.allowedCities);
  ns.rngSeed = Math.floor(rng() * 2 ** 31);
  return ns;
}

function enterEraScoring(state: BrassBirminghamFullState): BrassBirminghamFullState {
  const ns = clone(state);
  ns.phase = "era-scoring";
  // Score links (VP per link in this era).
  for (const p of ns.players) {
    const linkVp = state.era === "canal" ? LINK_VP_CANAL : LINK_VP_RAIL;
    const earned = p.links.filter((l) => l.era === state.era).length * linkVp;
    p.vp += earned;
    if (earned > 0) ns.log.push(`${p.name} scored ${earned} VP from ${state.era} links.`);
  }
  // Remove unflipped Level-1 tiles (per rulebook end-of-canal-era cleanup).
  // We approximate by removing un-flipped placed Lvl-1 tiles from the board.
  if (state.era === "canal") {
    for (const p of ns.players) {
      p.tiles = p.tiles.filter((t) => !(t.city !== null && !t.flipped && t.level === 1) || t.kind === "coal" || t.kind === "iron" || t.kind === "brewery");
    }
    ns.log.push("Era I scoring complete. Level-1 tiles removed.");
  } else {
    ns.log.push("Era II scoring complete. Game over imminent.");
  }
  return ns;
}

export function isTerminal(s: BrassBirminghamFullState): { score: number } | null {
  if (s.phase !== "done") return null;
  // Score = human VP if winner, else 0
  const human = s.players[HUMAN_SEAT];
  if (!human) return { score: 0 };
  const maxVp = Math.max(...s.players.map((p) => p.vp));
  const won = human.vp >= maxVp && s.players.filter((p) => p.vp === maxVp).length === 1;
  return { score: won ? Math.max(1, human.vp) : 0 };
}

/* ---------- Helpers for UI ---------- */

export function totalVp(p: Player): number { return p.vp; }

export function isHumanTurn(s: BrassBirminghamFullState): boolean {
  return s.phase === "playing" && s.currentSeat === HUMAN_SEAT;
}

export function affordableBuilds(state: BrassBirminghamFullState, seat: number): IndustryKind[] {
  const p = state.players[seat];
  if (!p) return [];
  const kinds: IndustryKind[] = ["coal", "iron", "cotton", "manufactured", "brewery"];
  return kinds.filter((k) => {
    const t = nextSupplyTile(p, k);
    if (!t) return false;
    if (p.cash < t.cost) return false;
    const c = consumeCoalIron(state, seat, industryConsumesCoal(k), industryConsumesIron(k));
    return c.ok;
  });
}

/* ---------- CPU AI ---------- */

function cpuChooseAction(state: BrassBirminghamFullState): BrassBirminghamFullAction | null {
  const seat = state.currentSeat;
  const p = state.players[seat];
  if (!p) return null;

  // Greedy: prefer cotton -> manufactured -> coal/iron -> brewery, in an allowed city.
  const priority: IndustryKind[] = ["cotton", "manufactured", "coal", "iron", "brewery"];
  for (const kind of priority) {
    const tile = nextSupplyTile(p, kind);
    if (!tile) continue;
    if (p.cash < tile.cost) continue;
    const c = consumeCoalIron(state, seat, industryConsumesCoal(kind), industryConsumesIron(kind));
    if (!c.ok) continue;
    // Pick a city — first allowed/presence city.
    const candidates = [...new Set([...p.presence, ...state.allowedCities])];
    if (candidates.length === 0) continue;
    return { type: "build", kind, city: candidates[0]! };
  }

  // Try sell an existing unflipped cotton/manufactured.
  const sellable = p.tiles.find((t) => t.city !== null && !t.flipped && (t.kind === "cotton" || t.kind === "manufactured"));
  if (sellable) return { type: "sell", tileId: sellable.id };

  // Try a cheap link.
  const cost = state.era === "canal" ? LINK_COST_CANAL : LINK_COST_RAIL + MARKET_COAL_PRICE;
  if (p.cash >= cost) {
    for (const [a, b] of ADJACENCY) {
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (state.players.some((pl) => pl.links.some((l) => l.id === key))) continue;
      return { type: "link", a, b };
    }
  }

  // Loan when broke.
  if (p.cash < 5) return { type: "loan" };

  // Pass when nothing useful.
  return { type: "pass" };
}
