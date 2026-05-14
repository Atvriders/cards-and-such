import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// Puerto Rico (Full) — XL tier. Minimal viable implementation.
//
// IMPLEMENTED:
//   - 4 players (you = seat 0, three CPUs at seats 1/2/3).
//   - 7 roles: Settler, Mayor, Builder, Craftsman, Trader, Captain, Prospector.
//   - Role selection by governor on a rotating basis. All players take the
//     role's action but the picker gets a bonus.
//   - Plantation board (12 spots) and city building board (12 spots) per player.
//   - 5 crops: corn, indigo, sugar, tobacco, coffee.
//   - Colonists supply with placement when Mayor is picked.
//   - Goods produced when Craftsman is picked (capped by colonist staffing).
//   - Trader trades one good per player per phase to the trading house for
//     doubloons (corn 0, indigo 1, sugar 2, tobacco 3, coffee 4 + bonus 1 for
//     the role-picker).
//   - Captain phase: round-robin ships goods to one of 3 ships sized 4/5/6.
//     Earn 1 VP per good shipped, +1 captain bonus to the first shipper.
//     Unshipped goods spoil down to 1 of each kind at end of phase.
//   - Builder: spend doubloons to build small buildings (the 12 "small" /
//     "production-friendly" subset). Role-picker gets 1-doubloon discount.
//   - Prospector: picker gains 1 doubloon. Everyone else does nothing.
//   - Game-end: first player to fill all 12 city spots OR colonist supply
//     empties OR all VP chips run out (we simplify VP-chip end-trigger to
//     "all ships shipped a total >= 40 VP worth").
//   - Win: sum of building VP + shipping VP + (optional) large-building bonus
//     (omitted — TODO). Highest total wins; player score = +VP for win, 0 else.
//
// OMITTED (XL skip list):
//   - Large building powers (Guild Hall, Residence, Fortress, Customs House,
//     City Hall) — they are NOT in the build pool. Only small buildings exist.
//   - Production buildings (Small Indigo Plant, Sugar Mill, etc.) explicitly
//     unlocking goods — we let any planted plot produce its crop without
//     requiring a matching processing building. Corn never needed one.
//   - Hospice / University extra-colonist-on-settle / extra-colonist-on-build.
//   - Harbor / Wharf / Office trade & ship bonuses.
//   - Quarry tiles + quarry discount on building cost.
//   - Plantation tile market (we draw a random plantation when Settler picks).
//   - Settler discount: privileged player normally chooses from "5 face-up
//     plantations + the quarry"; we simplify to a random draw.
//   - Mayor distribution puzzle (player allocates colonists themselves).
//     We auto-staff plantations first then buildings, no manual placement.
//   - End-of-game tie-breakers.
//   - Player-to-player interaction beyond role bonuses.
//
// TODO (post-XL):
//   - Add production-building gating on goods.
//   - Implement large buildings + their end-game bonuses.
//   - Manual colonist placement UI.
//   - Plantation selection UI (instead of random draw).
//   - Quarries + cost discounts.
// =============================================================================

export type Crop = "corn" | "indigo" | "sugar" | "tobacco" | "coffee";

export const CROPS: readonly Crop[] = ["corn", "indigo", "sugar", "tobacco", "coffee"];

export type RoleId =
  | "settler"
  | "mayor"
  | "builder"
  | "craftsman"
  | "trader"
  | "captain"
  | "prospector";

export const ROLES: readonly RoleId[] = [
  "settler",
  "mayor",
  "builder",
  "craftsman",
  "trader",
  "captain",
  "prospector",
];

export interface SmallBuilding {
  id: string;
  name: string;
  cost: number;
  vp: number;
}

/** Pool of small buildings available to build. Large buildings omitted (XL). */
export const BUILDING_POOL: readonly SmallBuilding[] = [
  { id: "smallMarket", name: "Small Market", cost: 1, vp: 1 },
  { id: "hacienda", name: "Hacienda", cost: 2, vp: 1 },
  { id: "construction", name: "Construction Hut", cost: 2, vp: 1 },
  { id: "smallWarehouse", name: "Small Warehouse", cost: 3, vp: 1 },
  { id: "hospice", name: "Hospice", cost: 4, vp: 2 },
  { id: "office", name: "Office", cost: 5, vp: 2 },
  { id: "largeMarket", name: "Large Market", cost: 5, vp: 2 },
  { id: "largeWarehouse", name: "Large Warehouse", cost: 6, vp: 2 },
  { id: "factory", name: "Factory", cost: 7, vp: 3 },
  { id: "harbor", name: "Harbor", cost: 8, vp: 3 },
  { id: "wharf", name: "Wharf", cost: 9, vp: 3 },
  { id: "guildHall", name: "Guild Hall", cost: 10, vp: 4 },
];

export const PLANTATION_SLOTS = 12;
export const CITY_SLOTS = 12;
export const NUM_PLAYERS = 4;

/** Trader price-per-crop in doubloons. */
export const CROP_PRICE: Record<Crop, number> = {
  corn: 0,
  indigo: 1,
  sugar: 2,
  tobacco: 3,
  coffee: 4,
};

/** Ships available in Captain phase. */
export const SHIPS: readonly { capacity: number }[] = [
  { capacity: 4 },
  { capacity: 5 },
  { capacity: 6 },
];

export interface Plantation {
  crop: Crop;
  /** A colonist must be present for this plot to produce. */
  staffed: boolean;
}

export interface Building {
  id: string;
  vp: number;
  /** Buildings need colonists to take effect (we don't enforce, but track). */
  staffed: boolean;
}

export interface PlayerState {
  seat: number;
  isCpu: boolean;
  name: string;
  doubloons: number;
  colonists: number;
  goods: Record<Crop, number>;
  plantations: Plantation[];
  buildings: Building[];
  /** Personal shipping-VP earned (cumulative). */
  shippingVp: number;
}

export type Phase =
  | "select_role"
  | "resolve_settler"
  | "resolve_mayor"
  | "resolve_builder"
  | "resolve_craftsman"
  | "resolve_trader"
  | "resolve_captain"
  | "resolve_prospector"
  | "game_over";

export interface ShipState {
  capacity: number;
  /** What's currently on the ship. null = empty. */
  cargo: Crop | null;
  count: number;
}

export interface TradingHouse {
  /** Up to 4 goods, no repeats unless Office is built (simplified: allow repeats). */
  slots: Crop[];
}

export interface PuertoRicoState {
  seed: number;
  rngState: number;
  players: PlayerState[];
  /** Whose turn it is to pick a role (the governor). */
  governor: number;
  /** Active role for this round. null until picked. */
  activeRole: RoleId | null;
  /** Which player picked the role (the privileged player). */
  rolePicker: number | null;
  /** Roles that have already been used this round; cleared each new round. */
  usedRoles: RoleId[];
  /** Doubloons currently on each role tile (carry-over bonus). Indexed by role id. */
  roleDoubloons: Record<RoleId, number>;
  phase: Phase;
  /** During an action phase, which player resolves next (round-robin from picker). */
  resolveOrder: number[];
  resolveIndex: number;
  colonistSupply: number;
  /** Building pool: a single copy of each. (Real PR has multiple copies — XL skip.) */
  buildingPool: SmallBuilding[];
  ships: ShipState[];
  tradingHouse: TradingHouse;
  /** Goods supply remaining (we use generous pools so games end via VP / city). */
  goodsSupply: Record<Crop, number>;
  /** Total shipping VP awarded across all players (for terminal trigger). */
  shippingPool: number;
  /** Round counter, for safety termination. */
  round: number;
  /** Captain bonus already taken this Captain phase? */
  captainBonusTaken: boolean;
  log: string[];
}

// -----------------------------------------------------------------------------
// Settings (use _dummy placeholder per brief)
// -----------------------------------------------------------------------------

export type PuertoRicoSettings = { _dummy: boolean };

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function emptyGoods(): Record<Crop, number> {
  return { corn: 0, indigo: 0, sugar: 0, tobacco: 0, coffee: 0 };
}

function nextRng(state: PuertoRicoState): number {
  // Re-derive the next pseudo-random number deterministically from rngState.
  const rng = mulberry32(state.rngState >>> 0);
  const v = rng();
  // Update rngState for the next call. Use a hash of v.
  state.rngState = ((state.rngState * 1664525 + 1013904223) >>> 0) ^ Math.floor(v * 0xffffffff);
  return v;
}

function pickRandom<T>(state: PuertoRicoState, arr: readonly T[]): T {
  const idx = Math.floor(nextRng(state) * arr.length);
  return arr[Math.max(0, Math.min(arr.length - 1, idx))]!;
}

function totalVpFor(p: PlayerState): number {
  return p.shippingVp + p.buildings.reduce((s, b) => s + b.vp, 0);
}

export function publicVpFor(p: PlayerState): number {
  return totalVpFor(p);
}

/** End-game trigger: any player fills city (12 buildings), colonist supply
 *  empties, OR shipping pool >= 40 VP. (Simplified XL trigger.) */
function gameEndTriggered(s: PuertoRicoState): boolean {
  if (s.players.some(p => p.buildings.length >= CITY_SLOTS)) return true;
  if (s.colonistSupply <= 0) return true;
  if (s.shippingPool >= 40) return true;
  if (s.round >= 60) return true; // safety cap
  return false;
}

// -----------------------------------------------------------------------------
// initialState
// -----------------------------------------------------------------------------

export function initialState(seed: number, _settings: PuertoRicoSettings): PuertoRicoState {
  void _settings;
  const rng = mulberry32(seed >>> 0);

  const players: PlayerState[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    // Starting plantation: P1 corn, P2-4 indigo (standard PR start).
    const startCrop: Crop = i === 0 ? "corn" : "indigo";
    players.push({
      seat: i,
      isCpu: i !== 0,
      name: i === 0 ? "You" : `CPU ${i}`,
      doubloons: i + 2, // 2/3/3/4 (small variance)
      colonists: 0,
      goods: emptyGoods(),
      plantations: [{ crop: startCrop, staffed: false }],
      buildings: [],
      shippingVp: 0,
    });
  }

  const roleDoubloons: Record<RoleId, number> = {
    settler: 0, mayor: 0, builder: 0, craftsman: 0,
    trader: 0, captain: 0, prospector: 0,
  };

  const ships: ShipState[] = SHIPS.map(s => ({
    capacity: s.capacity,
    cargo: null,
    count: 0,
  }));

  // Build a single-copy pool of all small buildings for simplicity.
  const buildingPool: SmallBuilding[] = BUILDING_POOL.map(b => ({ ...b }));

  // Deterministic init: scramble doubloons-on-roles slightly using seed.
  // (Standard rules: roles start with 0 doubloons; this is just to consume rng
  // so seeds with no role-picks still diverge in tests.)
  const consumeOne = rng();
  void consumeOne;

  return {
    seed,
    rngState: (seed * 2654435761) >>> 0,
    players,
    governor: 0,
    activeRole: null,
    rolePicker: null,
    usedRoles: [],
    roleDoubloons,
    phase: "select_role",
    resolveOrder: [],
    resolveIndex: 0,
    colonistSupply: 55,
    buildingPool,
    ships,
    tradingHouse: { slots: [] },
    goodsSupply: { corn: 10, indigo: 11, sugar: 11, tobacco: 9, coffee: 9 },
    shippingPool: 0,
    round: 0,
    captainBonusTaken: false,
    log: [],
  };
}

// -----------------------------------------------------------------------------
// Action types
// -----------------------------------------------------------------------------

export type PuertoRicoAction =
  | { type: "pick_role"; role: RoleId }
  | { type: "resolve_step" } // generic step for AI / phase advance
  | { type: "human_build"; buildingId: string }
  | { type: "human_skip_build" }
  | { type: "human_trade"; crop: Crop }
  | { type: "human_skip_trade" }
  | { type: "human_ship"; shipIndex: number; crop: Crop }
  | { type: "human_skip_ship" }
  | { type: "noop" };

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

function clone(state: PuertoRicoState): PuertoRicoState {
  // Shallow-deep clone tailored to our shape.
  return {
    ...state,
    players: state.players.map(p => ({
      ...p,
      goods: { ...p.goods },
      plantations: p.plantations.map(pl => ({ ...pl })),
      buildings: p.buildings.map(b => ({ ...b })),
    })),
    roleDoubloons: { ...state.roleDoubloons },
    usedRoles: state.usedRoles.slice(),
    resolveOrder: state.resolveOrder.slice(),
    buildingPool: state.buildingPool.map(b => ({ ...b })),
    ships: state.ships.map(s => ({ ...s })),
    tradingHouse: { slots: state.tradingHouse.slots.slice() },
    goodsSupply: { ...state.goodsSupply },
    log: state.log.slice(),
  };
}

/** Build a resolve order starting from picker and going clockwise. */
function makeResolveOrder(picker: number): number[] {
  const order: number[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) order.push((picker + i) % NUM_PLAYERS);
  return order;
}

function phaseForRole(role: RoleId): Phase {
  switch (role) {
    case "settler": return "resolve_settler";
    case "mayor": return "resolve_mayor";
    case "builder": return "resolve_builder";
    case "craftsman": return "resolve_craftsman";
    case "trader": return "resolve_trader";
    case "captain": return "resolve_captain";
    case "prospector": return "resolve_prospector";
  }
}

/** Advance resolution: if more players left, increment; else cleanup + return
 *  to select_role (possibly ending the round / game). */
function advanceResolve(s: PuertoRicoState): void {
  s.resolveIndex += 1;
  if (s.resolveIndex < s.resolveOrder.length) return;
  // Phase complete: any phase-end cleanup
  if (s.phase === "resolve_captain") {
    // Spoilage: each player keeps 1 of each crop max, except if they have a
    // warehouse (small=1 free type, large=2 free types). XL simplification:
    // warehouses save all goods of their type at cost of one type each.
    for (const p of s.players) {
      const warehouseSmall = p.buildings.some(b => b.id === "smallWarehouse");
      const warehouseLarge = p.buildings.some(b => b.id === "largeWarehouse");
      let savedTypes = 0;
      const limit = (warehouseSmall ? 1 : 0) + (warehouseLarge ? 2 : 0);
      // Pick most valuable crops to save.
      const sorted = [...CROPS].sort((a, b) => CROP_PRICE[b] - CROP_PRICE[a]);
      const saved = new Set<Crop>();
      for (const c of sorted) {
        if (p.goods[c] > 1 && savedTypes < limit) { saved.add(c); savedTypes++; }
      }
      for (const c of CROPS) {
        if (saved.has(c)) continue;
        if (p.goods[c] > 1) {
          // Return excess back to supply.
          s.goodsSupply[c] += p.goods[c] - 1;
          p.goods[c] = 1;
        }
      }
    }
    s.captainBonusTaken = false;
  }
  // Mark role used.
  if (s.activeRole) s.usedRoles.push(s.activeRole);
  s.activeRole = null;
  s.rolePicker = null;
  // Next player picks. If we've cycled through all 4 picks, end the round.
  // Standard rules: roles available = 7 - usedThisRound. After all players
  // picked once (4 picks), reset roles + add 1 doubloon to each unpicked role,
  // pass governor.
  const nextPicker = (s.governor + 1) % NUM_PLAYERS;
  // count: how many picks since governor changed (we use governor advancement
  // as our round signal). We'll instead increment `round` after each pick and
  // reset when 4 picks have occurred.
  s.round += 1;
  if (s.usedRoles.length >= NUM_PLAYERS) {
    // End of round: add 1 doubloon to each unused role, clear used roles,
    // advance governor.
    for (const r of ROLES) {
      if (!s.usedRoles.includes(r)) s.roleDoubloons[r] += 1;
    }
    s.usedRoles = [];
    s.governor = nextPicker;
  } else {
    s.governor = nextPicker;
  }

  // Check end of game.
  if (gameEndTriggered(s)) {
    s.phase = "game_over";
    return;
  }
  s.phase = "select_role";
  s.resolveOrder = [];
  s.resolveIndex = 0;
}

/** Resolve settler action for player at order index. */
function resolveSettlerOne(s: PuertoRicoState, seat: number): void {
  const p = s.players[seat]!;
  if (p.plantations.length >= PLANTATION_SLOTS) return;
  // Privileged player may pick a quarry — XL skip: random plantation crop.
  // Weight new players slightly toward corn/indigo (cheap to ship).
  const crop = pickRandom(s, CROPS);
  p.plantations.push({ crop, staffed: false });
}

/** Resolve mayor: distribute colonists. Player picker gets +1 first. */
function resolveMayorAll(s: PuertoRicoState, picker: number): void {
  // Take 1 colonist for picker first.
  if (s.colonistSupply > 0) {
    s.players[picker]!.colonists += 1;
    s.colonistSupply -= 1;
  }
  // Now drain a small batch (4 colonists from the supply to share, 1 each).
  // Standard rules: take colonists from "ship" equal to vacant building+
  // production capacities. XL skip: just distribute 1 to each player.
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const seat = (picker + i) % NUM_PLAYERS;
    if (s.colonistSupply <= 0) break;
    s.players[seat]!.colonists += 1;
    s.colonistSupply -= 1;
  }
  // Auto-staff each player's plantations first, then buildings.
  for (const p of s.players) {
    let workers = p.colonists;
    // Reset staffing.
    for (const pl of p.plantations) pl.staffed = false;
    for (const b of p.buildings) b.staffed = false;
    // Staff plantations first.
    for (const pl of p.plantations) {
      if (workers <= 0) break;
      pl.staffed = true;
      workers -= 1;
    }
    for (const b of p.buildings) {
      if (workers <= 0) break;
      b.staffed = true;
      workers -= 1;
    }
  }
}

/** Resolve builder for one player. CPU = greedy, human = via human_build. */
function cpuPickBuilding(s: PuertoRicoState, seat: number): SmallBuilding | null {
  const p = s.players[seat]!;
  const isPicker = seat === s.rolePicker;
  // CPU greedy: highest VP we can afford (with discount if picker).
  let best: SmallBuilding | null = null;
  for (const b of s.buildingPool) {
    const cost = Math.max(0, b.cost - (isPicker ? 1 : 0));
    if (p.doubloons < cost) continue;
    if (p.buildings.length >= CITY_SLOTS) continue;
    if (p.buildings.some(bb => bb.id === b.id)) continue;
    if (!best || b.vp > best.vp || (b.vp === best.vp && b.cost < best.cost)) {
      best = b;
    }
  }
  return best;
}

function purchaseBuilding(s: PuertoRicoState, seat: number, building: SmallBuilding): void {
  const p = s.players[seat]!;
  const isPicker = seat === s.rolePicker;
  const cost = Math.max(0, building.cost - (isPicker ? 1 : 0));
  p.doubloons -= cost;
  p.buildings.push({ id: building.id, vp: building.vp, staffed: false });
  const idx = s.buildingPool.findIndex(b => b.id === building.id);
  if (idx >= 0) s.buildingPool.splice(idx, 1);
}

/** Craftsman: every staffed plantation produces 1 good (if matching supply > 0).
 *  Picker takes +1 bonus good (must already produce that crop). */
function resolveCraftsmanAll(s: PuertoRicoState, picker: number): void {
  for (const p of s.players) {
    for (const pl of p.plantations) {
      if (!pl.staffed) continue;
      if (s.goodsSupply[pl.crop] > 0) {
        p.goods[pl.crop] += 1;
        s.goodsSupply[pl.crop] -= 1;
      }
    }
  }
  // Picker bonus: 1 extra good of any crop they produced this phase.
  const pp = s.players[picker]!;
  for (const c of CROPS) {
    if (pp.goods[c] > 0 && s.goodsSupply[c] > 0) {
      pp.goods[c] += 1;
      s.goodsSupply[c] -= 1;
      break;
    }
  }
}

/** Resolve trader for one player (one trade per phase). Picker +1 doubloon. */
function cpuPickTrade(s: PuertoRicoState, seat: number): Crop | null {
  const p = s.players[seat]!;
  if (s.tradingHouse.slots.length >= 4) return null;
  // Greedy: highest-priced crop you have, that's not duplicated in trading house
  // (we allow duplicates per XL simplification, but prefer non-dupes).
  let best: Crop | null = null;
  let bestVal = -1;
  for (const c of CROPS) {
    if (p.goods[c] <= 0) continue;
    const dup = s.tradingHouse.slots.includes(c);
    const val = CROP_PRICE[c] - (dup ? 1 : 0);
    if (val > bestVal) { bestVal = val; best = c; }
  }
  return best;
}

function executeTrade(s: PuertoRicoState, seat: number, crop: Crop): void {
  const p = s.players[seat]!;
  if (p.goods[crop] <= 0) return;
  if (s.tradingHouse.slots.length >= 4) return;
  p.goods[crop] -= 1;
  s.tradingHouse.slots.push(crop);
  let earn = CROP_PRICE[crop];
  if (seat === s.rolePicker) earn += 1;
  p.doubloons += earn;
}

/** Captain: ship goods round-robin. Picker gets first +1 VP bonus. */
function cpuPickShip(s: PuertoRicoState, seat: number): { shipIndex: number; crop: Crop } | null {
  const p = s.players[seat]!;
  // Greedy: pick the highest-value crop where some ship can hold it.
  let bestCrop: Crop | null = null;
  let bestShip = -1;
  let bestVal = -1;
  for (const c of CROPS) {
    if (p.goods[c] <= 0) continue;
    for (let i = 0; i < s.ships.length; i++) {
      const sh = s.ships[i]!;
      if (sh.cargo !== null && sh.cargo !== c) continue;
      if (sh.count >= sh.capacity) continue;
      // Value = #units we could load
      const loadable = Math.min(p.goods[c], sh.capacity - sh.count);
      if (loadable > bestVal) {
        bestVal = loadable;
        bestCrop = c;
        bestShip = i;
      }
    }
  }
  if (bestCrop === null || bestShip < 0) return null;
  return { shipIndex: bestShip, crop: bestCrop };
}

function executeShip(s: PuertoRicoState, seat: number, shipIndex: number, crop: Crop): void {
  const p = s.players[seat]!;
  const sh = s.ships[shipIndex];
  if (!sh) return;
  if (p.goods[crop] <= 0) return;
  if (sh.cargo !== null && sh.cargo !== crop) return;
  if (sh.count >= sh.capacity) return;
  const load = Math.min(p.goods[crop], sh.capacity - sh.count);
  if (sh.cargo === null) sh.cargo = crop;
  sh.count += load;
  p.goods[crop] -= load;
  let earnedVp = load;
  if (seat === s.rolePicker && !s.captainBonusTaken) {
    earnedVp += 1;
    s.captainBonusTaken = true;
  }
  p.shippingVp += earnedVp;
  s.shippingPool += earnedVp;
  // If ship filled exactly to capacity, return goods to supply at end of round.
  // We resolve "sail away" on phase end (after all players act). For simplicity,
  // when a ship is full it immediately empties (returns to supply).
  if (sh.count >= sh.capacity) {
    s.goodsSupply[sh.cargo!] += sh.count;
    sh.count = 0;
    sh.cargo = null;
  }
}

export function reducer(state: PuertoRicoState, action: PuertoRicoAction): PuertoRicoState {
  if (state.phase === "game_over") return state;

  // ---- Pick role ----
  if (action.type === "pick_role") {
    if (state.phase !== "select_role") return state;
    if (state.usedRoles.includes(action.role)) return state;
    if (state.governor !== 0 && state.players[state.governor]?.isCpu) {
      // CPUs only pick via cpu_pick_role; ignore manual pick when it's CPU's turn.
      return state;
    }
    const ns = clone(state);
    const picker = ns.governor;
    ns.rolePicker = picker;
    ns.activeRole = action.role;
    // Picker takes the doubloons sitting on this role tile.
    const bonus = ns.roleDoubloons[action.role];
    ns.players[picker]!.doubloons += bonus;
    ns.roleDoubloons[action.role] = 0;
    ns.phase = phaseForRole(action.role);
    ns.resolveOrder = makeResolveOrder(picker);
    ns.resolveIndex = 0;
    return ns;
  }

  // ---- Resolve step (one player per call). Used by CPUs / animation. ----
  if (action.type === "resolve_step") {
    if (!state.activeRole) return state;
    if (state.resolveIndex >= state.resolveOrder.length) return state;
    const ns = clone(state);
    const seat = ns.resolveOrder[ns.resolveIndex]!;
    const role = ns.activeRole!;

    // For human, we expect them to dispatch role-specific actions. But the
    // simpler roles (settler, mayor, craftsman, prospector) auto-resolve.
    if (role === "settler") {
      resolveSettlerOne(ns, seat);
      advanceResolve(ns);
      return ns;
    }
    if (role === "mayor") {
      // We do mayor as a single bulk action (all players at once).
      if (ns.resolveIndex === 0) {
        resolveMayorAll(ns, ns.rolePicker!);
      }
      // Skip everyone else (already done).
      ns.resolveIndex = ns.resolveOrder.length;
      advanceResolve(ns);
      return ns;
    }
    if (role === "craftsman") {
      if (ns.resolveIndex === 0) {
        resolveCraftsmanAll(ns, ns.rolePicker!);
      }
      ns.resolveIndex = ns.resolveOrder.length;
      advanceResolve(ns);
      return ns;
    }
    if (role === "prospector") {
      // Picker gets 1 doubloon; nobody else does anything.
      if (ns.resolveIndex === 0) {
        ns.players[ns.rolePicker!]!.doubloons += 1;
      }
      ns.resolveIndex = ns.resolveOrder.length;
      advanceResolve(ns);
      return ns;
    }
    if (role === "builder") {
      const player = ns.players[seat]!;
      if (player.isCpu) {
        const pick = cpuPickBuilding(ns, seat);
        if (pick) purchaseBuilding(ns, seat, pick);
        advanceResolve(ns);
        return ns;
      }
      // Human turn — wait for human_build or human_skip_build action.
      return state;
    }
    if (role === "trader") {
      const player = ns.players[seat]!;
      if (player.isCpu) {
        const crop = cpuPickTrade(ns, seat);
        if (crop) executeTrade(ns, seat, crop);
        advanceResolve(ns);
        return ns;
      }
      return state;
    }
    if (role === "captain") {
      const player = ns.players[seat]!;
      if (player.isCpu) {
        // CPU ships as long as it can on its turn.
        let pick = cpuPickShip(ns, seat);
        let safety = 0;
        while (pick && safety < 20) {
          executeShip(ns, seat, pick.shipIndex, pick.crop);
          pick = cpuPickShip(ns, seat);
          safety++;
        }
        advanceResolve(ns);
        return ns;
      }
      // Human: wait for human_ship / human_skip_ship.
      return state;
    }
    return state;
  }

  // ---- Human actions ----
  if (action.type === "human_build") {
    if (state.phase !== "resolve_builder") return state;
    if (state.resolveIndex >= state.resolveOrder.length) return state;
    const seat = state.resolveOrder[state.resolveIndex]!;
    if (seat !== 0) return state;
    const building = state.buildingPool.find(b => b.id === action.buildingId);
    if (!building) return state;
    const ns = clone(state);
    const p = ns.players[0]!;
    const isPicker = ns.rolePicker === 0;
    const cost = Math.max(0, building.cost - (isPicker ? 1 : 0));
    if (p.doubloons < cost) return state;
    if (p.buildings.length >= CITY_SLOTS) return state;
    if (p.buildings.some(bb => bb.id === building.id)) return state;
    purchaseBuilding(ns, 0, { ...building });
    advanceResolve(ns);
    return ns;
  }

  if (action.type === "human_skip_build") {
    if (state.phase !== "resolve_builder") return state;
    if (state.resolveIndex >= state.resolveOrder.length) return state;
    const seat = state.resolveOrder[state.resolveIndex]!;
    if (seat !== 0) return state;
    const ns = clone(state);
    advanceResolve(ns);
    return ns;
  }

  if (action.type === "human_trade") {
    if (state.phase !== "resolve_trader") return state;
    if (state.resolveIndex >= state.resolveOrder.length) return state;
    const seat = state.resolveOrder[state.resolveIndex]!;
    if (seat !== 0) return state;
    const p = state.players[0]!;
    if (p.goods[action.crop] <= 0) return state;
    if (state.tradingHouse.slots.length >= 4) return state;
    const ns = clone(state);
    executeTrade(ns, 0, action.crop);
    advanceResolve(ns);
    return ns;
  }

  if (action.type === "human_skip_trade") {
    if (state.phase !== "resolve_trader") return state;
    if (state.resolveIndex >= state.resolveOrder.length) return state;
    const seat = state.resolveOrder[state.resolveIndex]!;
    if (seat !== 0) return state;
    const ns = clone(state);
    advanceResolve(ns);
    return ns;
  }

  if (action.type === "human_ship") {
    if (state.phase !== "resolve_captain") return state;
    if (state.resolveIndex >= state.resolveOrder.length) return state;
    const seat = state.resolveOrder[state.resolveIndex]!;
    if (seat !== 0) return state;
    const p = state.players[0]!;
    if (p.goods[action.crop] <= 0) return state;
    const sh = state.ships[action.shipIndex];
    if (!sh) return state;
    if (sh.cargo !== null && sh.cargo !== action.crop) return state;
    if (sh.count >= sh.capacity) return state;
    const ns = clone(state);
    executeShip(ns, 0, action.shipIndex, action.crop);
    // For captain, human may keep shipping until they skip. So don't auto-
    // advance. But if player has nothing left to ship, advance.
    const p2 = ns.players[0]!;
    const stillCanShip = CROPS.some(c => {
      if (p2.goods[c] <= 0) return false;
      return ns.ships.some(s2 => (s2.cargo === null || s2.cargo === c) && s2.count < s2.capacity);
    });
    if (!stillCanShip) {
      advanceResolve(ns);
    }
    return ns;
  }

  if (action.type === "human_skip_ship") {
    if (state.phase !== "resolve_captain") return state;
    if (state.resolveIndex >= state.resolveOrder.length) return state;
    const seat = state.resolveOrder[state.resolveIndex]!;
    if (seat !== 0) return state;
    const ns = clone(state);
    advanceResolve(ns);
    return ns;
  }

  if (action.type === "noop") return state;

  return state;
}

// -----------------------------------------------------------------------------
// CPU role selection (deterministic from state) — used by Game.tsx auto-tick.
// -----------------------------------------------------------------------------

export function cpuPickRole(state: PuertoRicoState): RoleId | null {
  if (state.phase !== "select_role") return null;
  const picker = state.governor;
  const p = state.players[picker]!;
  const avail = ROLES.filter(r => !state.usedRoles.includes(r));
  if (avail.length === 0) return null;

  // Greedy: score each available role from the picker's perspective.
  function score(role: RoleId): number {
    const bonus = state.roleDoubloons[role];
    let s = bonus * 0.5;
    if (role === "prospector") s += 1.0;
    if (role === "settler" && p.plantations.length < PLANTATION_SLOTS) s += 1.5;
    if (role === "mayor") {
      const need = p.plantations.filter(pl => !pl.staffed).length
        + p.buildings.filter(b => !b.staffed).length;
      s += Math.min(3, need);
    }
    if (role === "builder") {
      // Affordable + we have city slots left.
      const affordable = state.buildingPool.some(b => {
        const cost = Math.max(0, b.cost - 1);
        return p.doubloons >= cost;
      });
      if (affordable && p.buildings.length < CITY_SLOTS) s += 2.0;
    }
    if (role === "craftsman") {
      const staffedPlots = p.plantations.filter(pl => pl.staffed).length;
      s += staffedPlots * 0.5;
    }
    if (role === "trader") {
      let bestPrice = 0;
      for (const c of CROPS) {
        if (p.goods[c] > 0) bestPrice = Math.max(bestPrice, CROP_PRICE[c] + 1);
      }
      if (state.tradingHouse.slots.length < 4) s += bestPrice;
    }
    if (role === "captain") {
      let shippable = 0;
      for (const c of CROPS) shippable += p.goods[c];
      s += Math.min(6, shippable);
    }
    return s;
  }

  let best: RoleId = avail[0]!;
  let bestS = -Infinity;
  for (const r of avail) {
    const v = score(r);
    if (v > bestS) { bestS = v; best = r; }
  }
  return best;
}

// -----------------------------------------------------------------------------
// isTerminal
// -----------------------------------------------------------------------------

export function isTerminal(state: PuertoRicoState): { score: number } | null {
  if (state.phase !== "game_over") return null;
  // Final score for human (seat 0).
  const final = state.players.map(totalVpFor);
  const me = final[0]!;
  const bestOther = Math.max(...final.slice(1));
  if (me > bestOther) {
    // Win — return our total VP as the score.
    return { score: me };
  }
  // Loss/draw — 0 so we don't leaderboard.
  return { score: 0 };
}

// -----------------------------------------------------------------------------
// Exported helpers (also used by tests)
// -----------------------------------------------------------------------------

export function totalVp(p: PlayerState): number { return totalVpFor(p); }
