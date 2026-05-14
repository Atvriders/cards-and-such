import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// Power Grid (Full) — XL tier. Minimal viable build with 1 human + 3 CPUs.
//
// IMPLEMENTED:
//   - 4 players (P0 human, P1/P2/P3 CPU).
//   - USA map with 42 cities across 6 regions (7 cities each). Game uses
//     4 active regions chosen by seed at startup.
//   - Each turn cycles 5 phases:
//       1. Order: players sorted by network size (cities), tie-broken by
//          highest-numbered owned plant. Phase-1 also covers step 1 turn
//          order (in the real game first turn is random).
//       2. Auction: each player in reverse order may start an auction on
//          one plant from the current-market row (the cheapest 4). CPUs
//          use a simple "buy mid-tier if affordable" heuristic. Players
//          may also pass. Auctions are 1-bid simplified — the starter wins
//          at their offered price (TODO: implement proper round-robin
//          bidding with raise/pass between all eligible players).
//       3. Resources: in reverse order, each player buys raw resources
//          from the supply at sliding-scale prices (cheap-first slots).
//       4. Build: in reverse order, each player connects new cities.
//          Cost = city-slot-price + cheapest connection cost from owned
//          network (or any city if no network).
//       5. Bureaucracy: each player chooses how many cities to power
//          (consuming resources). Income paid per cities powered table.
//          Plant market refilled from the future row + a new future-row
//          deal.
//   - Game-end trigger: any player builds to >= step-3 city target (15
//     for 4 players in the real game; we use 15).
//   - Final scoring: each player powers as many cities as fuel allows;
//     winner is the player who powers the most cities (cash tiebreaker).
//   - CPU strategy:
//       * Greedy: buy a mid-tier plant (rank 3 or 4 of the current row)
//         when affordable; otherwise the cheapest available plant.
//       * Buy resources sufficient for one full power cycle of owned plants.
//       * Expand by cheapest connection cost.
//
// OMITTED (XL skip list — leave TODO comments inline):
//   - Real multi-player ascending auction with raises and dropouts.
//   - Step-2 / step-3 progression (city-count thresholds 7 / 15).
//   - Plant discard rules (lowest plant retired when step 3 triggers; a
//     plant is discarded each round at the start of phase 2 if it is
//     <= step-1 threshold).
//   - "Future plant 13" trigger to flip to step 3.
//   - Per-region connection-cost map (we use a uniform cheap/medium/
//     expensive cost table chosen at build time).
//   - Re-shuffling the plant deck at step-2 / step-3 transitions.
//   - Permits / capacity / city slot rules per phase (we cap at 3
//     players per city overall — first-come-first-served).
//   - Variable income table per cities powered (we use a smooth $10 +
//     $7 × cities formula approximation).
//   - Hybrid plant resource swap (we still allow either coal or oil for
//     hybrid plants when paying).
// =============================================================================

// -----------------------------------------------------------------------------
// Constants & data
// -----------------------------------------------------------------------------

export const NUM_PLAYERS = 4;
export const STARTING_ELEKTRO = 50;
export const PLANT_MARKET_SIZE = 8;          // 4 current + 4 future
export const CURRENT_ROW = 4;
export const GAME_END_CITIES = 15;           // 4-player target
export const STARTING_REGIONS_USED = 4;

export type ResourceKind = "coal" | "oil" | "garbage" | "uranium";
export const RESOURCE_KINDS: readonly ResourceKind[] = ["coal", "oil", "garbage", "uranium"];

export type PlantFuel = ResourceKind | "hybrid" | "wind" | "fusion";

export interface PowerPlant {
  /** Card number (= minimum bid). */
  id: number;
  /** Fuel type. "wind"/"fusion" need no fuel; "hybrid" takes coal OR oil. */
  fuel: PlantFuel;
  /** Resources consumed per power cycle (0 for wind/fusion). */
  cost: number;
  /** Cities powered. */
  cities: number;
}

/** A simplified power-plant deck (~25 plants spanning the value curve). */
export const PLANT_DECK: readonly PowerPlant[] = [
  { id: 3,  fuel: "oil",     cost: 2, cities: 1 },
  { id: 4,  fuel: "coal",    cost: 2, cities: 1 },
  { id: 5,  fuel: "hybrid",  cost: 2, cities: 1 },
  { id: 6,  fuel: "garbage", cost: 1, cities: 1 },
  { id: 7,  fuel: "oil",     cost: 3, cities: 2 },
  { id: 8,  fuel: "coal",    cost: 3, cities: 2 },
  { id: 9,  fuel: "oil",     cost: 1, cities: 1 },
  { id: 10, fuel: "coal",    cost: 2, cities: 2 },
  { id: 11, fuel: "uranium", cost: 1, cities: 2 },
  { id: 12, fuel: "hybrid",  cost: 2, cities: 2 },
  { id: 13, fuel: "wind",    cost: 0, cities: 1 },
  { id: 14, fuel: "coal",    cost: 2, cities: 3 },
  { id: 15, fuel: "coal",    cost: 2, cities: 3 },
  { id: 16, fuel: "oil",     cost: 2, cities: 3 },
  { id: 17, fuel: "wind",    cost: 0, cities: 2 },
  { id: 18, fuel: "garbage", cost: 2, cities: 3 },
  { id: 19, fuel: "uranium", cost: 1, cities: 3 },
  { id: 20, fuel: "coal",    cost: 3, cities: 5 },
  { id: 21, fuel: "hybrid",  cost: 2, cities: 4 },
  { id: 22, fuel: "wind",    cost: 0, cities: 2 },
  { id: 23, fuel: "garbage", cost: 1, cities: 4 },
  { id: 24, fuel: "uranium", cost: 1, cities: 4 },
  { id: 25, fuel: "coal",    cost: 2, cities: 5 },
  { id: 26, fuel: "oil",     cost: 2, cities: 5 },
  { id: 27, fuel: "wind",    cost: 0, cities: 4 },
  { id: 30, fuel: "uranium", cost: 1, cities: 5 },
  { id: 35, fuel: "oil",     cost: 1, cities: 5 },
  { id: 40, fuel: "fusion",  cost: 0, cities: 6 },
];

/** USA Map: 6 regions × 7 cities. Regions are color-coded thematically. */
export const REGIONS: readonly string[] = [
  "Northwest",   // 0
  "Southwest",   // 1
  "Midwest",     // 2
  "South",       // 3
  "Northeast",   // 4
  "Southeast",   // 5
];

export const REGION_COLORS: Record<string, string> = {
  Northwest: "#3a8d99",
  Southwest: "#d97b3a",
  Midwest:   "#c4a23d",
  South:     "#a14a4a",
  Northeast: "#5a6dc4",
  Southeast: "#3f9266",
};

/** All 42 cities with their region and (x,y) on a 800×500 conceptual map. */
export interface City {
  name: string;
  region: string;
  x: number;
  y: number;
}

export const CITIES: readonly City[] = [
  // Northwest (7)
  { name: "Seattle",    region: "Northwest", x: 95,  y: 75 },
  { name: "Portland",   region: "Northwest", x: 85,  y: 130 },
  { name: "Boise",      region: "Northwest", x: 165, y: 165 },
  { name: "Spokane",    region: "Northwest", x: 150, y: 90 },
  { name: "Helena",     region: "Northwest", x: 215, y: 115 },
  { name: "Bismarck",   region: "Northwest", x: 305, y: 110 },
  { name: "Eugene",     region: "Northwest", x: 80,  y: 175 },
  // Southwest (7)
  { name: "San Francisco", region: "Southwest", x: 70,  y: 240 },
  { name: "Los Angeles",   region: "Southwest", x: 105, y: 305 },
  { name: "San Diego",     region: "Southwest", x: 125, y: 340 },
  { name: "Las Vegas",     region: "Southwest", x: 155, y: 285 },
  { name: "Phoenix",       region: "Southwest", x: 195, y: 335 },
  { name: "Salt Lake City",region: "Southwest", x: 195, y: 220 },
  { name: "Denver",        region: "Southwest", x: 265, y: 245 },
  // Midwest (7)
  { name: "Minneapolis",  region: "Midwest", x: 385, y: 130 },
  { name: "Omaha",        region: "Midwest", x: 360, y: 195 },
  { name: "Kansas City",  region: "Midwest", x: 395, y: 245 },
  { name: "St. Louis",    region: "Midwest", x: 445, y: 250 },
  { name: "Chicago",      region: "Midwest", x: 475, y: 195 },
  { name: "Milwaukee",    region: "Midwest", x: 465, y: 165 },
  { name: "Des Moines",   region: "Midwest", x: 415, y: 200 },
  // South (7)
  { name: "Houston",      region: "South",   x: 395, y: 405 },
  { name: "Dallas",       region: "South",   x: 380, y: 345 },
  { name: "Austin",       region: "South",   x: 370, y: 395 },
  { name: "San Antonio",  region: "South",   x: 350, y: 415 },
  { name: "New Orleans",  region: "South",   x: 465, y: 405 },
  { name: "Memphis",      region: "South",   x: 470, y: 310 },
  { name: "Oklahoma City",region: "South",   x: 360, y: 305 },
  // Northeast (7)
  { name: "New York",     region: "Northeast", x: 685, y: 195 },
  { name: "Boston",       region: "Northeast", x: 720, y: 165 },
  { name: "Philadelphia", region: "Northeast", x: 670, y: 215 },
  { name: "Pittsburgh",   region: "Northeast", x: 605, y: 215 },
  { name: "Buffalo",      region: "Northeast", x: 615, y: 175 },
  { name: "Detroit",      region: "Northeast", x: 555, y: 185 },
  { name: "Cleveland",    region: "Northeast", x: 590, y: 200 },
  // Southeast (7)
  { name: "Atlanta",      region: "Southeast", x: 555, y: 335 },
  { name: "Miami",        region: "Southeast", x: 625, y: 435 },
  { name: "Tampa",        region: "Southeast", x: 595, y: 415 },
  { name: "Orlando",      region: "Southeast", x: 610, y: 410 },
  { name: "Charlotte",    region: "Southeast", x: 595, y: 290 },
  { name: "Nashville",    region: "Southeast", x: 520, y: 290 },
  { name: "Jacksonville", region: "Southeast", x: 605, y: 380 },
];

// -----------------------------------------------------------------------------
// Resource supply & city-slot pricing (sliding scale)
// -----------------------------------------------------------------------------

/** Total supply tokens of each resource available (simplified). */
export const RESOURCE_SUPPLY: Record<ResourceKind, number> = {
  coal: 24, oil: 24, garbage: 24, uranium: 12,
};

/**
 * Sliding-scale price for a resource based on how many are stocked in the
 * market. We approximate the real game's per-band pricing with a smooth curve.
 */
export function priceForResource(kind: ResourceKind, stock: number): number {
  if (stock <= 0) return 999;
  if (kind === "uranium") {
    // 12 in stock = $1; expensive when scarce.
    const table = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16];
    return table[Math.max(0, Math.min(table.length - 1, 12 - stock))] ?? 16;
  }
  // For coal/oil/garbage: 24 stock cheap → 1; scarcity boosts price.
  // Pricing slabs: stock 24-22→1, 21-19→2, 18-16→3, 15-13→4, 12-10→5,
  // 9-7→6, 6-4→7, 3→8, 2→9, 1→10
  if (stock >= 22) return 1;
  if (stock >= 19) return 2;
  if (stock >= 16) return 3;
  if (stock >= 13) return 4;
  if (stock >= 10) return 5;
  if (stock >= 7)  return 6;
  if (stock >= 4)  return 7;
  if (stock === 3) return 8;
  if (stock === 2) return 9;
  return 10;
}

/** City slot price by occupancy slot (1st / 2nd / 3rd connector). */
export function citySlotPrice(slot: number): number {
  if (slot <= 0) return 10;
  if (slot === 1) return 15;
  return 20;
}

/** Connection cost between two cities. Same-region adjacent ≈ $5,
 *  different-region neighbors ≈ $12. We use a precomputed straight-line
 *  distance heuristic. */
export function connectionCost(a: City, b: City): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  // Round to nearest 1, clamp to [3, 20].
  return Math.max(3, Math.min(20, Math.round(d / 12)));
}

/** Income table — paid per cities powered in bureaucracy phase. */
export function incomeForCities(n: number): number {
  if (n <= 0) return 10;
  // approximation of the Power Grid pay table.
  const table = [10, 22, 33, 44, 54, 64, 73, 82, 90, 98, 105, 112, 118, 124, 129, 134];
  return table[Math.min(n, table.length - 1)] ?? 134;
}

// -----------------------------------------------------------------------------
// State types
// -----------------------------------------------------------------------------

export type Phase =
  | "order"          // determine turn order
  | "auction"        // each player may buy a plant
  | "resources"      // each player buys raw fuel
  | "build"          // each player connects cities
  | "bureaucracy"    // power cities, earn income, refill market
  | "done";

export type PlayerId = 0 | 1 | 2 | 3;
export const PLAYER_IDS: readonly PlayerId[] = [0, 1, 2, 3];

export interface ResourceBag {
  coal: number;
  oil: number;
  garbage: number;
  uranium: number;
}

export const EMPTY_BAG: ResourceBag = { coal: 0, oil: 0, garbage: 0, uranium: 0 };

export interface PlayerState {
  id: PlayerId;
  isCPU: boolean;
  elektro: number;
  /** City names this player has connected. */
  cities: string[];
  /** Plants this player owns. */
  plants: PowerPlant[];
  /** Resources on each plant — we pool by player (simplification). */
  resources: ResourceBag;
  /** Has this player taken their action in the current phase yet? */
  acted: boolean;
}

export interface PowerGridFullSettings {
  /** XL dummy — kept for plugin contract. */
  _dummy: boolean;
}

export interface PowerGridFullState {
  rngSeed: number;
  /** Index into REGIONS — which 4 are active. */
  activeRegions: string[];
  /** Power plant market: current row [0..3] then future row [4..7]. */
  market: PowerPlant[];
  /** Plants remaining in the deck (drawn from the top). */
  plantDeck: PowerPlant[];
  /** Resource supply remaining in the market. */
  supply: ResourceBag;
  players: PlayerState[];
  /** Current play order — index 0 acts first in `order`-direction phases,
   *  last in `auction`/`resources`/`build` (which reverse the order). */
  order: PlayerId[];
  phase: Phase;
  /** Active player index within `order` (for forward order) or reversed. */
  active: number;
  /** Turn number. */
  turn: number;
  /** Status message. */
  message: string;
  /** Log entries (newest first). */
  log: string[];
  /** UI helper — selected market plant idx for auction (or null). */
  selectedMarketIdx: number | null;
  /** Final game-over winner (player id). */
  winner: PlayerId | null;
}

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export type PowerGridFullAction =
  | { type: "auction_buy"; marketIdx: number }       // player buys a current-row plant at face value
  | { type: "auction_pass" }
  | { type: "buy_resource"; kind: ResourceKind; qty: number }
  | { type: "resource_done" }
  | { type: "build_city"; cityName: string }
  | { type: "build_done" }
  | { type: "power"; plantIds: number[] }            // which plants to fire
  | { type: "cpu_step" };

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function pushLog(log: string[], msg: string): string[] {
  return [msg, ...log].slice(0, 10);
}

function clonePlayer(p: PlayerState): PlayerState {
  return {
    id: p.id,
    isCPU: p.isCPU,
    elektro: p.elektro,
    cities: p.cities.slice(),
    plants: p.plants.map(pl => ({ ...pl })),
    resources: { ...p.resources },
    acted: p.acted,
  };
}

function cloneState(s: PowerGridFullState): PowerGridFullState {
  return {
    ...s,
    market: s.market.map(p => ({ ...p })),
    plantDeck: s.plantDeck.map(p => ({ ...p })),
    supply: { ...s.supply },
    players: s.players.map(clonePlayer),
    order: s.order.slice(),
    log: s.log.slice(),
    activeRegions: s.activeRegions.slice(),
  };
}

function shuffleInPlace<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Sort the market ascending by id. Real game keeps current and future rows
 *  sorted; we just sort the whole thing. */
function sortMarket(market: PowerPlant[]): PowerPlant[] {
  return market.slice().sort((a, b) => a.id - b.id);
}

/** Compute play order: most cities first; ties broken by highest plant. */
export function computeOrder(players: PlayerState[]): PlayerId[] {
  const ids = players.map(p => p.id);
  return ids.sort((aid, bid) => {
    const a = players[aid]!;
    const b = players[bid]!;
    if (b.cities.length !== a.cities.length) return b.cities.length - a.cities.length;
    const aHi = a.plants.length > 0 ? Math.max(...a.plants.map(pl => pl.id)) : 0;
    const bHi = b.plants.length > 0 ? Math.max(...b.plants.map(pl => pl.id)) : 0;
    return bHi - aHi;
  });
}

/** Cities available for the player to build in. */
export function buildableCities(state: PowerGridFullState, pid: PlayerId): City[] {
  const me = state.players[pid]!;
  return CITIES.filter(c => {
    if (!state.activeRegions.includes(c.region)) return false;
    if (me.cities.includes(c.name)) return false;
    // Cap at 3 occupants per city overall (simplified).
    let occupants = 0;
    for (const p of state.players) if (p.cities.includes(c.name)) occupants++;
    return occupants < 3;
  });
}

/** Cheapest cost for `pid` to build `city`: slot price + connection cost from
 *  the nearest owned city (or 0 if first city). */
export function buildCostFor(state: PowerGridFullState, pid: PlayerId, city: City): number {
  let occupants = 0;
  for (const p of state.players) if (p.cities.includes(city.name)) occupants++;
  const slot = citySlotPrice(occupants);
  const me = state.players[pid]!;
  if (me.cities.length === 0) return slot;
  let cheapest = Infinity;
  for (const ownedName of me.cities) {
    const owned = CITIES.find(c => c.name === ownedName);
    if (!owned) continue;
    const cc = connectionCost(owned, city);
    if (cc < cheapest) cheapest = cc;
  }
  if (!isFinite(cheapest)) cheapest = 20;
  return slot + cheapest;
}

/** Resource cost (count) consumed when firing this plant. */
export function fuelCostFor(plant: PowerPlant): { kinds: ResourceKind[]; count: number } {
  if (plant.fuel === "wind" || plant.fuel === "fusion") return { kinds: [], count: 0 };
  if (plant.fuel === "hybrid") return { kinds: ["coal", "oil"], count: plant.cost };
  return { kinds: [plant.fuel], count: plant.cost };
}

/** Total cities the player can actually power using available resources +
 *  free (wind/fusion) plants. We greedily assign fuel to the highest-output
 *  plants first. */
export function citiesCanPower(player: PlayerState): number {
  const stash: ResourceBag = { ...player.resources };
  // Sort plants by cities desc, free plants last (they're always free).
  const plants = player.plants.slice().sort((a, b) => b.cities - a.cities);
  let total = 0;
  for (const pl of plants) {
    const f = fuelCostFor(pl);
    if (f.count === 0) {
      total += pl.cities;
      continue;
    }
    // Try to pay from cheapest combination of allowed kinds.
    if (f.kinds.length === 1) {
      const k = f.kinds[0]!;
      if (stash[k] >= f.count) {
        stash[k] -= f.count;
        total += pl.cities;
      }
    } else {
      // Hybrid — use any combo of coal+oil.
      const need = f.count;
      const have = stash.coal + stash.oil;
      if (have >= need) {
        // Burn coal first.
        const useCoal = Math.min(stash.coal, need);
        stash.coal -= useCoal;
        stash.oil  -= need - useCoal;
        total += pl.cities;
      }
    }
  }
  // Capped by number of cities you've connected.
  return Math.min(total, player.cities.length);
}

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

export function initialState(seed: number, _settings: PowerGridFullSettings): PowerGridFullState {
  const rng = mulberry32(seed >>> 0);
  // Pick 4 of 6 regions deterministically. Always include Northeast and Midwest
  // so the map looks balanced.
  const must = ["Northeast", "Midwest"];
  const rest = REGIONS.filter(r => !must.includes(r));
  shuffleInPlace(rest, rng);
  const active = [...must, ...rest.slice(0, STARTING_REGIONS_USED - must.length)];

  // Build plant deck — first 8 plants form the market (sorted by id).
  const deck = PLANT_DECK.slice();
  // The initial market is the 8 lowest-id plants. The rest are shuffled draw pile.
  const market = sortMarket(deck.slice(0, PLANT_MARKET_SIZE));
  const rest2 = deck.slice(PLANT_MARKET_SIZE).slice();
  shuffleInPlace(rest2, rng);

  const players: PlayerState[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    players.push({
      id: i as PlayerId,
      isCPU: i !== 0,
      elektro: STARTING_ELEKTRO,
      cities: [],
      plants: [],
      resources: { ...EMPTY_BAG },
      acted: false,
    });
  }

  // Initial play order is seed-randomized (real game). For determinism we
  // shuffle player ids via the same rng.
  const ids = PLAYER_IDS.slice() as PlayerId[];
  shuffleInPlace(ids, rng);

  const nextSeed = Math.floor(rng() * 2 ** 31);

  return {
    rngSeed: nextSeed,
    activeRegions: active,
    market,
    plantDeck: rest2,
    supply: {
      coal: RESOURCE_SUPPLY.coal,
      oil: RESOURCE_SUPPLY.oil,
      garbage: RESOURCE_SUPPLY.garbage,
      uranium: RESOURCE_SUPPLY.uranium,
    },
    players,
    order: ids,
    phase: "order",
    active: 0,
    turn: 1,
    message: "Determining turn order.",
    log: ["Game started. " + NUM_PLAYERS + " players on " + active.length + " regions."],
    selectedMarketIdx: null,
    winner: null,
  };
}

// -----------------------------------------------------------------------------
// Phase transitions
// -----------------------------------------------------------------------------

/** After the order phase resolves, move to auction with players acting in
 *  reverse turn order (last → first). */
function enterAuctionPhase(s: PowerGridFullState): PowerGridFullState {
  const players = s.players.map(clonePlayer);
  for (const p of players) p.acted = false;
  return {
    ...s,
    players,
    phase: "auction",
    active: 0,
    message: "Auction phase: each player may bid on a plant.",
    log: pushLog(s.log, "Auction phase begins."),
  };
}

function enterResourcesPhase(s: PowerGridFullState): PowerGridFullState {
  const players = s.players.map(clonePlayer);
  for (const p of players) p.acted = false;
  return {
    ...s,
    players,
    phase: "resources",
    active: 0,
    message: "Resources phase: buy fuel from the market.",
    log: pushLog(s.log, "Resources phase begins."),
  };
}

function enterBuildPhase(s: PowerGridFullState): PowerGridFullState {
  const players = s.players.map(clonePlayer);
  for (const p of players) p.acted = false;
  return {
    ...s,
    players,
    phase: "build",
    active: 0,
    message: "Build phase: connect new cities.",
    log: pushLog(s.log, "Build phase begins."),
  };
}

function enterBureaucracyPhase(s: PowerGridFullState): PowerGridFullState {
  const players = s.players.map(clonePlayer);
  for (const p of players) p.acted = false;
  return {
    ...s,
    players,
    phase: "bureaucracy",
    active: 0,
    message: "Bureaucracy: power cities and earn income.",
    log: pushLog(s.log, "Bureaucracy phase begins."),
  };
}

function refillResourceSupply(s: PowerGridFullState): PowerGridFullState {
  // Replenish per turn — simplified: +3 coal, +2 oil, +1 garbage, +1 uranium,
  // capped at the original supply totals.
  const supply: ResourceBag = { ...s.supply };
  supply.coal    = Math.min(RESOURCE_SUPPLY.coal,    supply.coal    + 3);
  supply.oil     = Math.min(RESOURCE_SUPPLY.oil,     supply.oil     + 2);
  supply.garbage = Math.min(RESOURCE_SUPPLY.garbage, supply.garbage + 1);
  supply.uranium = Math.min(RESOURCE_SUPPLY.uranium, supply.uranium + 1);
  return { ...s, supply };
}

function refillPlantMarket(s: PowerGridFullState): PowerGridFullState {
  const market = s.market.slice();
  const deck = s.plantDeck.slice();
  // Draw new plants until the market has 8 (or deck is empty).
  while (market.length < PLANT_MARKET_SIZE && deck.length > 0) {
    market.push(deck.shift()!);
  }
  return { ...s, market: sortMarket(market), plantDeck: deck };
}

/** Game-end check. */
function checkGameEnd(s: PowerGridFullState): PowerGridFullState {
  // Trigger: any player has built >= GAME_END_CITIES cities.
  let trigger = false;
  for (const p of s.players) {
    if (p.cities.length >= GAME_END_CITIES) { trigger = true; break; }
  }
  if (!trigger) return s;
  // Final scoring: power as many cities as fuel allows. Most cities powered wins.
  // Ties broken by elektro.
  const players = s.players.map(clonePlayer);
  const powered = players.map(p => citiesCanPower(p));
  let best = 0;
  for (let i = 1; i < players.length; i++) {
    if (powered[i]! > powered[best]!) best = i;
    else if (powered[i] === powered[best] && players[i]!.elektro > players[best]!.elektro) best = i;
  }
  return {
    ...s,
    players,
    phase: "done",
    winner: players[best]!.id,
    message: `Game over! Player ${best + 1} wins by powering ${powered[best]} cities.`,
    log: pushLog(s.log, `WIN: P${best + 1} powered ${powered[best]} cities.`),
  };
}

// -----------------------------------------------------------------------------
// CPU strategy
// -----------------------------------------------------------------------------

/** CPU choose a plant from the current row, or pass. */
function cpuPickPlant(state: PowerGridFullState, pid: PlayerId): number | null {
  const me = state.players[pid]!;
  // Don't buy if we already own 3+ plants.
  if (me.plants.length >= 3) return null;
  // Prefer mid-tier (index 2 or 3 of current row) when affordable; else cheapest.
  const candidates: { idx: number; plant: PowerPlant }[] = [];
  for (let i = 0; i < Math.min(CURRENT_ROW, state.market.length); i++) {
    const pl = state.market[i]!;
    if (pl.id <= me.elektro) candidates.push({ idx: i, plant: pl });
  }
  if (candidates.length === 0) return null;
  // Pick index 2 or 3 if available, else first affordable.
  const mid = candidates.find(c => c.idx === 2) ?? candidates.find(c => c.idx === 3);
  if (mid) return mid.idx;
  return candidates[0]!.idx;
}

/** CPU resource purchase: try to stock one full power cycle for each plant. */
function cpuBuyResources(state: PowerGridFullState, pid: PlayerId): PowerGridFullState {
  let s = state;
  const me = s.players[pid]!;
  // Determine total resources needed per kind.
  const needed: Record<ResourceKind, number> = { coal: 0, oil: 0, garbage: 0, uranium: 0 };
  for (const pl of me.plants) {
    if (pl.fuel === "coal" || pl.fuel === "oil" || pl.fuel === "garbage" || pl.fuel === "uranium") {
      needed[pl.fuel] += pl.cost;
    } else if (pl.fuel === "hybrid") {
      needed.coal += pl.cost;
    }
  }
  for (const k of RESOURCE_KINDS) {
    let want = Math.max(0, needed[k] - me.resources[k]);
    while (want > 0 && s.supply[k] > 0) {
      const price = priceForResource(k, s.supply[k]);
      if (s.players[pid]!.elektro < price) break;
      // Buy 1.
      const players = s.players.map(clonePlayer);
      players[pid]!.elektro -= price;
      players[pid]!.resources[k] += 1;
      const supply = { ...s.supply };
      supply[k] -= 1;
      s = { ...s, players, supply };
      want--;
    }
  }
  return s;
}

/** CPU build: greedy cheapest. Spend down to a small reserve. */
function cpuBuild(state: PowerGridFullState, pid: PlayerId): PowerGridFullState {
  let s = state;
  let me = s.players[pid]!;
  const reserve = 5;
  let safety = 6; // never build more than 6 in one phase
  while (safety-- > 0) {
    const options = buildableCities(s, pid);
    if (options.length === 0) break;
    let best: { city: City; cost: number } | null = null;
    for (const c of options) {
      const cost = buildCostFor(s, pid, c);
      if (cost > me.elektro - reserve) continue;
      if (!best || cost < best.cost) best = { city: c, cost };
    }
    if (!best) break;
    // Buy.
    const players = s.players.map(clonePlayer);
    players[pid]!.elektro -= best.cost;
    players[pid]!.cities.push(best.city.name);
    s = {
      ...s, players,
      log: pushLog(s.log, `CPU${pid} built ${best.city.name} (-$${best.cost}).`),
    };
    me = s.players[pid]!;
  }
  return s;
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

export function reducer(state: PowerGridFullState, action: PowerGridFullAction): PowerGridFullState {
  if (state.phase === "done") return state;

  // ─── ORDER PHASE ───
  // The order phase is purely computational — invoking any action (typically
  // cpu_step) re-computes the order and advances to auction.
  if (state.phase === "order") {
    if (action.type !== "cpu_step") return state;
    const newOrder = computeOrder(state.players);
    const next = enterAuctionPhase({ ...state, order: newOrder });
    return next;
  }

  // ─── AUCTION PHASE ───
  if (state.phase === "auction") {
    // Reverse order: act last-of-order first.
    const reversed = state.order.slice().reverse();
    const pid = reversed[state.active]!;
    const me = state.players[pid]!;

    if (action.type === "cpu_step") {
      if (!me.isCPU) return state;
      const choice = cpuPickPlant(state, pid);
      if (choice === null) return applyAuctionPass(state);
      return applyAuctionBuy(state, choice);
    }
    if (action.type === "auction_pass") {
      if (me.isCPU) return state;
      return applyAuctionPass(state);
    }
    if (action.type === "auction_buy") {
      if (me.isCPU) return state;
      // Only allow current-row plants and only if affordable.
      if (action.marketIdx < 0 || action.marketIdx >= Math.min(CURRENT_ROW, state.market.length)) return state;
      const pl = state.market[action.marketIdx]!;
      if (me.elektro < pl.id) return state;
      return applyAuctionBuy(state, action.marketIdx);
    }
    return state;
  }

  // ─── RESOURCES PHASE ───
  if (state.phase === "resources") {
    const reversed = state.order.slice().reverse();
    const pid = reversed[state.active]!;
    const me = state.players[pid]!;

    if (action.type === "cpu_step") {
      if (!me.isCPU) return state;
      let s = cpuBuyResources(state, pid);
      return advanceResourcePlayer(s, pid);
    }
    if (action.type === "buy_resource") {
      if (me.isCPU) return state;
      if (action.qty <= 0) return state;
      if (state.supply[action.kind] < action.qty) return state;
      let totalCost = 0;
      let remainingSupply = state.supply[action.kind];
      for (let i = 0; i < action.qty; i++) {
        totalCost += priceForResource(action.kind, remainingSupply);
        remainingSupply--;
      }
      if (me.elektro < totalCost) return state;
      const players = state.players.map(clonePlayer);
      players[pid]!.elektro -= totalCost;
      players[pid]!.resources[action.kind] += action.qty;
      const supply = { ...state.supply };
      supply[action.kind] -= action.qty;
      return {
        ...state, players, supply,
        log: pushLog(state.log, `P${pid + 1} bought ${action.qty} ${action.kind} for $${totalCost}.`),
      };
    }
    if (action.type === "resource_done") {
      if (me.isCPU) return state;
      return advanceResourcePlayer(state, pid);
    }
    return state;
  }

  // ─── BUILD PHASE ───
  if (state.phase === "build") {
    const reversed = state.order.slice().reverse();
    const pid = reversed[state.active]!;
    const me = state.players[pid]!;

    if (action.type === "cpu_step") {
      if (!me.isCPU) return state;
      let s = cpuBuild(state, pid);
      return advanceBuildPlayer(s, pid);
    }
    if (action.type === "build_city") {
      if (me.isCPU) return state;
      const city = CITIES.find(c => c.name === action.cityName);
      if (!city) return state;
      const opts = buildableCities(state, pid);
      if (!opts.some(c => c.name === city.name)) return state;
      const cost = buildCostFor(state, pid, city);
      if (me.elektro < cost) return state;
      const players = state.players.map(clonePlayer);
      players[pid]!.elektro -= cost;
      players[pid]!.cities.push(city.name);
      return {
        ...state, players,
        log: pushLog(state.log, `P${pid + 1} built ${city.name} (-$${cost}).`),
      };
    }
    if (action.type === "build_done") {
      if (me.isCPU) return state;
      return advanceBuildPlayer(state, pid);
    }
    return state;
  }

  // ─── BUREAUCRACY PHASE ───
  if (state.phase === "bureaucracy") {
    // Bureaucracy uses standard turn order (not reversed).
    const pid = state.order[state.active]!;
    const me = state.players[pid]!;

    if (action.type === "cpu_step") {
      if (!me.isCPU) return state;
      // CPU powers maximum cities.
      const max = citiesCanPower(me);
      return resolvePowering(state, pid, max);
    }
    if (action.type === "power") {
      if (me.isCPU) return state;
      const max = citiesCanPower(me);
      const n = Math.min(max, action.plantIds.length > 0 ? max : max);
      return resolvePowering(state, pid, n);
    }
    return state;
  }

  return state;
}

// -----------------------------------------------------------------------------
// Action helpers
// -----------------------------------------------------------------------------

function applyAuctionBuy(state: PowerGridFullState, marketIdx: number): PowerGridFullState {
  const reversed = state.order.slice().reverse();
  const pid = reversed[state.active]!;
  const me = state.players[pid]!;
  if (marketIdx < 0 || marketIdx >= state.market.length) return state;
  const plant = state.market[marketIdx]!;
  // TODO: real game uses ascending bid; we use face-value purchase.
  const players = state.players.map(clonePlayer);
  players[pid]!.elektro -= plant.id;
  players[pid]!.plants.push({ ...plant });
  // If player already owns 3 plants, would normally discard one; we keep all.
  players[pid]!.acted = true;
  const market = state.market.filter((_, i) => i !== marketIdx);
  // Draw a replacement from the deck.
  const deck = state.plantDeck.slice();
  if (deck.length > 0) {
    market.push(deck.shift()!);
  }
  const sortedMarket = sortMarket(market);
  let s: PowerGridFullState = {
    ...state,
    players,
    market: sortedMarket,
    plantDeck: deck,
    log: pushLog(state.log, `P${pid + 1} bought plant ${plant.id} (-$${plant.id}).`),
    selectedMarketIdx: null,
  };
  return advanceAuctionPlayer(s);
}

function applyAuctionPass(state: PowerGridFullState): PowerGridFullState {
  const reversed = state.order.slice().reverse();
  const pid = reversed[state.active]!;
  const players = state.players.map(clonePlayer);
  players[pid]!.acted = true;
  const s: PowerGridFullState = {
    ...state,
    players,
    log: pushLog(state.log, `P${pid + 1} passed on auction.`),
  };
  return advanceAuctionPlayer(s);
}

function advanceAuctionPlayer(state: PowerGridFullState): PowerGridFullState {
  const next = state.active + 1;
  if (next >= state.order.length) {
    return enterResourcesPhase(state);
  }
  const reversed = state.order.slice().reverse();
  const pid = reversed[next]!;
  return {
    ...state,
    active: next,
    message: state.players[pid]!.isCPU ? `CPU P${pid + 1} is auctioning…` : "Your auction turn.",
  };
}

function advanceResourcePlayer(state: PowerGridFullState, _pid: PlayerId): PowerGridFullState {
  const players = state.players.map(clonePlayer);
  // mark the active player as acted.
  const reversed = state.order.slice().reverse();
  const active = reversed[state.active]!;
  players[active]!.acted = true;
  const s = { ...state, players };
  const next = state.active + 1;
  if (next >= state.order.length) {
    return enterBuildPhase(s);
  }
  const nxtPid = reversed[next]!;
  return {
    ...s,
    active: next,
    message: state.players[nxtPid]!.isCPU ? `CPU P${nxtPid + 1} is buying resources…` : "Your resource turn.",
  };
}

function advanceBuildPlayer(state: PowerGridFullState, _pid: PlayerId): PowerGridFullState {
  const players = state.players.map(clonePlayer);
  const reversed = state.order.slice().reverse();
  const active = reversed[state.active]!;
  players[active]!.acted = true;
  const s = { ...state, players };
  // Check game-end trigger.
  const ended = checkGameEnd(s);
  if (ended.phase === "done") return ended;
  const next = state.active + 1;
  if (next >= state.order.length) {
    return enterBureaucracyPhase(s);
  }
  const nxtPid = reversed[next]!;
  return {
    ...s,
    active: next,
    message: state.players[nxtPid]!.isCPU ? `CPU P${nxtPid + 1} is building…` : "Your build turn.",
  };
}

function resolvePowering(state: PowerGridFullState, pid: PlayerId, n: number): PowerGridFullState {
  // Consume resources greedily from highest-output plants first.
  let players = state.players.map(clonePlayer);
  const me = players[pid]!;
  const sorted = me.plants.slice().sort((a, b) => b.cities - a.cities);
  let powered = 0;
  for (const pl of sorted) {
    if (powered >= n) break;
    const f = fuelCostFor(pl);
    if (f.count === 0) {
      // Free plant — always fires.
      powered += pl.cities;
      continue;
    }
    if (f.kinds.length === 1) {
      const k = f.kinds[0]!;
      if (me.resources[k] >= f.count) {
        me.resources[k] -= f.count;
        powered += pl.cities;
      }
    } else {
      // Hybrid.
      const need = f.count;
      const have = me.resources.coal + me.resources.oil;
      if (have >= need) {
        const useCoal = Math.min(me.resources.coal, need);
        me.resources.coal -= useCoal;
        me.resources.oil  -= need - useCoal;
        powered += pl.cities;
      }
    }
  }
  powered = Math.min(powered, me.cities.length);
  const income = incomeForCities(powered);
  me.elektro += income;
  me.acted = true;
  let s: PowerGridFullState = {
    ...state,
    players,
    log: pushLog(state.log, `P${pid + 1} powered ${powered} cities (+$${income}).`),
  };
  // Game-end check (also runs here in case bureaucracy is the trigger turn).
  const ended = checkGameEnd(s);
  if (ended.phase === "done") return ended;
  const next = state.active + 1;
  if (next < state.order.length) {
    const nxtPid = state.order[next]!;
    return {
      ...s,
      active: next,
      message: state.players[nxtPid]!.isCPU ? `CPU P${nxtPid + 1} is powering…` : "Your bureaucracy turn.",
    };
  }
  // End of round: refill resources & market, increment turn, return to order.
  s = refillResourceSupply(s);
  s = refillPlantMarket(s);
  s = {
    ...s,
    turn: s.turn + 1,
    phase: "order",
    active: 0,
    message: `Turn ${s.turn + 1} — recomputing order.`,
    log: pushLog(s.log, `End of turn ${s.turn}. Markets refilled.`),
  };
  return s;
}

// -----------------------------------------------------------------------------
// Scoring & terminal
// -----------------------------------------------------------------------------

export function score(state: PowerGridFullState): number {
  // Human is player 0. Score = cities powered if winner, else 0.
  if (state.winner === 0) {
    const human = state.players[0]!;
    const powered = citiesCanPower(human);
    return 1000 + powered * 50 + human.elektro;
  }
  return 0;
}

export function isTerminal(state: PowerGridFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: score(state) };
}
