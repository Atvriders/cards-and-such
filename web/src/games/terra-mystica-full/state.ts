import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Terra Mystica (Full) — minimal-viable XL implementation.
 *
 * 4 players (1 human + 3 CPU). Hex map of 7 terrain types. Each player picks
 * one of 14 factions (we ship 4 fully-playable starter factions: Witches,
 * Halflings, Engineers, Dwarves). Each faction has a "home terrain" and can
 * only build on it; other terrains must be terraformed (paying spades) to
 * the faction's home color first.
 *
 * 6 rounds, each with a round-specific scoring tile (we use a small fixed
 * pool of 6). On a player's action turn they pick ONE of:
 *   - terraform + build dwelling (on a target hex of any terrain, paying
 *     spades for the colour-distance + 1 wood + 2 coin)
 *   - upgrade a dwelling -> trading-house (3 coin + 2 wood)
 *   - upgrade a trading-house -> temple (5 coin + 2 wood)
 *   - upgrade a temple -> sanctuary (6 coin + 4 wood) — exactly 1 per player
 *   - upgrade a trading-house -> stronghold (4 coin + 4 wood) — exactly 1
 *   - advance shipping (4 coin + 1 priest, max level 3)
 *   - advance spade-efficiency (5 coin + 1 priest, max level 2)
 *   - send a priest to a cult track (fire/water/earth/air), gains cult-track
 *     position; also yields VP at end-of-game
 *   - pass: draw a "bonus" tile (no real income / favor mechanics here),
 *     mark player as passed; once everyone has passed the round ends
 *
 * Win: highest VP after 6 rounds + cult-track final scoring + simple "area
 * majority" bonus (most built hexes scores +18, second +12, third +6).
 *
 * ─── TODO (rules intentionally omitted for the minimal viable build) ─────
 *  - Power / power-cycle mechanic (3-bowl system, leech offers from
 *    neighbours, power-actions on the action board).
 *  - Real income generation each round (we only do a flat per-round income).
 *  - Cult-track power bonuses + the "send priest = full priest commitment"
 *    rule (we just give cult position, never a free priest slot).
 *  - The other 10 of 14 factions (Cultists, Alchemists, Mermaids, Swarmlings,
 *    Nomads, Fakirs, Auren, Chaos Magicians, Giants, Darklings).
 *  - Town foundation (4 buildings + power ≥ 7 → town tile → favor tile).
 *  - Bonus / favor / town tiles with their VP & income perks.
 *  - Faction-specific stronghold ability triggers.
 *  - Adjacency-based discount on dwelling cost; we always charge flat.
 *  - End-of-game "biggest connected area" scoring (we use total-built-count).
 *  - Hex adjacency over rivers — we treat the grid as a flat hex grid and
 *    require shipping to "reach far" instead of explicit river path-finding.
 *  - Real terraform-spade cost discount (we use the faction's spade level
 *    as a flat multiplier, not the canonical 3→2→1 worker schedule).
 *  - 5-player rule changes & "starting dwelling-placement" pre-round.
 *  - The actual round-specific cult-track + shipping bonus tiles; we ship
 *    six simplified scoring tiles with just one VP trigger each.
 */

export const NUM_PLAYERS = 4;
export const NUM_ROUNDS = 6;
export const MAP_ROWS = 5;
export const MAP_COLS = 7;
export const NUM_HEXES = MAP_ROWS * MAP_COLS;

/** 7 terrain types. */
export type Terrain =
  | "plains"
  | "swamp"
  | "lakes"
  | "forest"
  | "mountains"
  | "wasteland"
  | "desert";

export const TERRAIN_LIST: readonly Terrain[] = [
  "plains",
  "swamp",
  "lakes",
  "forest",
  "mountains",
  "wasteland",
  "desert",
];

/** Terraform "colour wheel": distance from A to B is the min cyclic gap.
 *  Canonical TM order. We use this for spade cost. */
export const TERRAIN_WHEEL: readonly Terrain[] = [
  "plains",
  "swamp",
  "lakes",
  "forest",
  "mountains",
  "wasteland",
  "desert",
];

export function terraformDistance(from: Terrain, to: Terrain): number {
  if (from === to) return 0;
  const a = TERRAIN_WHEEL.indexOf(from);
  const b = TERRAIN_WHEEL.indexOf(to);
  if (a < 0 || b < 0) return TERRAIN_WHEEL.length;
  const d = Math.abs(a - b);
  return Math.min(d, TERRAIN_WHEEL.length - d);
}

/** Buildings — strictly minimal. */
export type Building =
  | "dwelling"
  | "trading"   // trading house
  | "temple"
  | "sanctuary"
  | "stronghold";

export const BUILDING_VP: Record<Building, number> = {
  dwelling: 1,
  trading: 2,
  temple: 3,
  sanctuary: 5,
  stronghold: 4,
};

export interface BuildingCost {
  wood: number;
  coin: number;
}

export const BUILDING_COST: Record<Building, BuildingCost> = {
  dwelling: { wood: 1, coin: 2 },
  trading: { wood: 2, coin: 3 },
  temple: { wood: 2, coin: 5 },
  sanctuary: { wood: 4, coin: 6 },
  stronghold: { wood: 4, coin: 4 },
};

/** Faction id. We *type* all 14 but only *implement* 4 home terrains for
 *  the starter set; the others are commented and not selectable. */
export type FactionId =
  | "witches"
  | "halflings"
  | "engineers"
  | "dwarves";
// TODO: add: cultists, alchemists, mermaids, swarmlings, nomads, fakirs,
//             auren, chaos-magicians, giants, darklings (10 more).

export interface Faction {
  id: FactionId;
  name: string;
  home: Terrain;
  description: string;
}

export const FACTIONS: readonly Faction[] = [
  {
    id: "witches",
    name: "Witches",
    home: "forest",
    description: "Forest dwellers. Strong magic, average economy.",
  },
  {
    id: "halflings",
    name: "Halflings",
    home: "plains",
    description: "Plains farmers. Great spade discounts, slow start.",
  },
  {
    id: "engineers",
    name: "Engineers",
    home: "mountains",
    description: "Mountain crafters. Cheap dwellings, no shipping.",
  },
  {
    id: "dwarves",
    name: "Dwarves",
    home: "mountains",
    description: "Mountain miners. Tunnelling instead of shipping.",
  },
];

export interface CultTrack {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

export type CultName = keyof CultTrack;
export const CULT_NAMES: readonly CultName[] = ["fire", "water", "earth", "air"];

export interface PlayerState {
  faction: FactionId;
  home: Terrain;
  coin: number;
  wood: number;
  priests: number;
  spades: number;       // banked, immediately-spendable spades
  spadeLevel: number;   // 0..2 spade-efficiency upgrades
  shippingLevel: number; // 0..3
  vp: number;
  cult: CultTrack;
  hasStronghold: boolean;
  hasSanctuary: boolean;
  passed: boolean;
  isCpu: boolean;
}

export interface HexState {
  terrain: Terrain;
  owner: number; // -1 if no building
  building: Building | "none";
}

export interface ScoringTile {
  id: number;
  description: string;
  // VP bonus per dwelling built during this round, granted when built.
  vpPerDwelling: number;
  // VP bonus per cult-track step granted that round.
  vpPerCultStep: number;
}

export const SCORING_TILES: readonly ScoringTile[] = [
  { id: 1, description: "Round 1: +2 VP per dwelling built.", vpPerDwelling: 2, vpPerCultStep: 0 },
  { id: 2, description: "Round 2: +1 VP per cult step.",     vpPerDwelling: 0, vpPerCultStep: 1 },
  { id: 3, description: "Round 3: +3 VP per dwelling built.", vpPerDwelling: 3, vpPerCultStep: 0 },
  { id: 4, description: "Round 4: +2 VP per cult step.",     vpPerDwelling: 0, vpPerCultStep: 2 },
  { id: 5, description: "Round 5: +2 VP per dwelling built and +1 VP per cult step.", vpPerDwelling: 2, vpPerCultStep: 1 },
  { id: 6, description: "Round 6: +4 VP per dwelling built.", vpPerDwelling: 4, vpPerCultStep: 0 },
];

export type Phase = "factionSelect" | "playing" | "scoring" | "done";

export interface TerraMysticaFullSettings {
  _dummy: boolean;
}

export interface TerraMysticaFullState {
  settings: TerraMysticaFullSettings;
  seed: number;
  rngTick: number;
  hexes: HexState[]; // length NUM_HEXES, row-major
  players: PlayerState[]; // 4
  active: number;
  round: number;
  phase: Phase;
  passOrder: number[]; // order in which players have passed this round
  scoringTiles: ScoringTile[]; // length NUM_ROUNDS
  lastEvent: string;
  // Tracks faction picks (in factionSelect phase)
  factionsChosen: (FactionId | null)[];
}

export type TerraMysticaFullAction =
  | { type: "selectFaction"; player: number; faction: FactionId }
  | { type: "build"; player: number; hex: number }
  | { type: "upgrade"; player: number; hex: number; to: Building }
  | { type: "shipping"; player: number }
  | { type: "spadeUp"; player: number }
  | { type: "cult"; player: number; track: CultName }
  | { type: "pass"; player: number }
  | { type: "cpuStep" }
  | { type: "advanceRound" };

/* ─── Map generation ─────────────────────────────────────────────────────── */

function generateMap(seed: number): HexState[] {
  const rng = mulberry32(seed >>> 0);
  const hexes: HexState[] = [];
  for (let i = 0; i < NUM_HEXES; i++) {
    const t = TERRAIN_LIST[Math.floor(rng() * TERRAIN_LIST.length)] ?? "plains";
    hexes.push({ terrain: t, owner: -1, building: "none" });
  }
  return hexes;
}

function pickScoringTiles(seed: number): ScoringTile[] {
  // Deterministic shuffle of SCORING_TILES then take 6 (in our pool there are
  // exactly 6, so this is just a deterministic permutation).
  const rng = mulberry32((seed ^ 0x5af3) >>> 0);
  const arr = SCORING_TILES.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = arr[i];
    const b = arr[j];
    if (a && b) {
      arr[i] = b;
      arr[j] = a;
    }
  }
  return arr.slice(0, NUM_ROUNDS);
}

function emptyCult(): CultTrack {
  return { fire: 0, water: 0, earth: 0, air: 0 };
}

function makePlayer(faction: FactionId, isCpu: boolean): PlayerState {
  const f = FACTIONS.find((x) => x.id === faction);
  const home: Terrain = f?.home ?? "plains";
  return {
    faction,
    home,
    coin: 15,
    wood: 8,
    priests: 7,
    spades: 0,
    spadeLevel: 0,
    shippingLevel: 0,
    vp: 20,
    cult: emptyCult(),
    hasStronghold: false,
    hasSanctuary: false,
    passed: false,
    isCpu,
  };
}

/* ─── initialState ───────────────────────────────────────────────────────── */

export function initialState(
  seed: number,
  settings: TerraMysticaFullSettings,
): TerraMysticaFullState {
  const safeSeed = seed >>> 0;
  const hexes = generateMap(safeSeed);
  const scoringTiles = pickScoringTiles(safeSeed);
  // Pre-select default factions; user can change theirs in factionSelect phase.
  const playerFactions: FactionId[] = ["witches", "halflings", "engineers", "dwarves"];
  const players: PlayerState[] = playerFactions.map((f, i) =>
    makePlayer(f, i !== 0),
  );
  return {
    settings,
    seed: safeSeed,
    rngTick: 0,
    hexes,
    players,
    active: 0,
    round: 1,
    phase: "factionSelect",
    passOrder: [],
    scoringTiles,
    lastEvent: "Choose your faction (or accept the default Witches).",
    factionsChosen: [null, null, null, null],
  };
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function currentScoringTile(state: TerraMysticaFullState): ScoringTile {
  const tile = state.scoringTiles[state.round - 1];
  return tile ?? SCORING_TILES[0]!;
}

function nextPlayer(state: TerraMysticaFullState): number {
  let p = state.active;
  for (let i = 0; i < NUM_PLAYERS; i++) {
    p = (p + 1) % NUM_PLAYERS;
    const pl = state.players[p];
    if (pl && !pl.passed) return p;
  }
  return state.active; // all passed — caller should advance round.
}

function allPassed(state: TerraMysticaFullState): boolean {
  return state.players.every((p) => p.passed);
}

function spadeCostFor(player: PlayerState, terrain: Terrain): number {
  const d = terraformDistance(player.home, terrain);
  // Spade efficiency reduces total cost by up to 2 spades minimum 1 if d>0.
  if (d === 0) return 0;
  const eff = player.spadeLevel; // 0..2
  return Math.max(1, d - eff);
}

function canAfford(player: PlayerState, cost: BuildingCost): boolean {
  return player.wood >= cost.wood && player.coin >= cost.coin;
}

function spendCost(player: PlayerState, cost: BuildingCost): PlayerState {
  return { ...player, wood: player.wood - cost.wood, coin: player.coin - cost.coin };
}

/* ─── Reducer sub-actions ────────────────────────────────────────────────── */

function doSelectFaction(
  state: TerraMysticaFullState,
  player: number,
  faction: FactionId,
): TerraMysticaFullState {
  if (state.phase !== "factionSelect") return state;
  if (player !== 0) return state; // only human picks; CPUs use defaults.
  const f = FACTIONS.find((x) => x.id === faction);
  if (!f) return state;
  const p0 = state.players[0];
  if (!p0) return state;

  // The human chooses freely. If a CPU happened to default to the same
  // faction, reassign that CPU to whichever starter faction is still
  // unclaimed (in FACTIONS order).
  const newPlayers = state.players.slice();
  newPlayers[0] = { ...p0, faction, home: f.home };

  // Build the set of factions already claimed (after the human pick).
  const claimed = new Set<FactionId>([faction]);
  for (let i = 1; i < NUM_PLAYERS; i++) {
    const cpu = newPlayers[i];
    if (!cpu) continue;
    if (cpu.faction === faction) {
      // Need to reassign this CPU to an unclaimed faction.
      const fallback = FACTIONS.find((cand) => !claimed.has(cand.id));
      if (fallback) {
        newPlayers[i] = { ...cpu, faction: fallback.id, home: fallback.home };
        claimed.add(fallback.id);
      } else {
        // No factions left — keep collision (shouldn't happen with 4+ factions).
        claimed.add(cpu.faction);
      }
    } else {
      claimed.add(cpu.faction);
    }
  }

  return {
    ...state,
    players: newPlayers,
    factionsChosen: newPlayers.map((p) => p.faction) as (FactionId | null)[],
    phase: "playing",
    lastEvent: `You picked ${f.name} (home: ${f.home}).`,
  };
}

function doBuild(
  state: TerraMysticaFullState,
  playerIdx: number,
  hex: number,
): TerraMysticaFullState | null {
  if (state.phase !== "playing") return null;
  if (playerIdx !== state.active) return null;
  const player = state.players[playerIdx];
  const target = state.hexes[hex];
  if (!player || !target) return null;
  if (player.passed) return null;
  if (target.owner !== -1) return null;
  const cost = BUILDING_COST.dwelling;
  if (!canAfford(player, cost)) return null;
  const spadesNeeded = spadeCostFor(player, target.terrain);
  // Need to pay spades by either banked spades OR coin (3 coin = 1 spade as
  // a minimal-viable abstraction; canonical TM uses worker per spade with
  // efficiency-based discount which is captured in spadeCostFor()).
  // For simplicity, allow paying spades fully from coin at 3 coin / spade.
  const extraCoin = Math.max(0, spadesNeeded - player.spades) * 3;
  if (player.coin < cost.coin + extraCoin) return null;
  const usedBanked = Math.min(spadesNeeded, player.spades);
  const usedCoin = (spadesNeeded - usedBanked) * 3;
  const newPlayer: PlayerState = {
    ...player,
    coin: player.coin - cost.coin - usedCoin,
    wood: player.wood - cost.wood,
    spades: player.spades - usedBanked,
    vp: player.vp + BUILDING_VP.dwelling + currentScoringTile(state).vpPerDwelling,
  };
  const newHexes = state.hexes.slice();
  newHexes[hex] = { ...target, terrain: player.home, owner: playerIdx, building: "dwelling" };
  const newPlayers = state.players.slice();
  newPlayers[playerIdx] = newPlayer;
  const factionName = FACTIONS.find((f) => f.id === player.faction)?.name ?? player.faction;
  const next: TerraMysticaFullState = {
    ...state,
    hexes: newHexes,
    players: newPlayers,
    active: nextPlayer({ ...state, players: newPlayers, hexes: newHexes }),
    lastEvent: `${factionName} built a dwelling at hex ${hex}.`,
  };
  return next;
}

function doUpgrade(
  state: TerraMysticaFullState,
  playerIdx: number,
  hex: number,
  to: Building,
): TerraMysticaFullState | null {
  if (state.phase !== "playing") return null;
  if (playerIdx !== state.active) return null;
  const player = state.players[playerIdx];
  const target = state.hexes[hex];
  if (!player || !target) return null;
  if (player.passed) return null;
  if (target.owner !== playerIdx) return null;
  if (target.building === "none") return null;
  const allowed =
    (target.building === "dwelling" && to === "trading") ||
    (target.building === "trading" && (to === "temple" || to === "stronghold")) ||
    (target.building === "temple" && to === "sanctuary");
  if (!allowed) return null;
  if (to === "stronghold" && player.hasStronghold) return null;
  if (to === "sanctuary" && player.hasSanctuary) return null;
  const cost = BUILDING_COST[to];
  if (!canAfford(player, cost)) return null;
  const newPlayer: PlayerState = {
    ...spendCost(player, cost),
    vp: player.vp - cost.coin + BUILDING_VP[to] + cost.coin /* keep vp clean; we add below */,
    hasStronghold: player.hasStronghold || to === "stronghold",
    hasSanctuary: player.hasSanctuary || to === "sanctuary",
  };
  // Recompute VP cleanly (avoid the inline cancel-out trick if minified).
  const newPlayer2: PlayerState = { ...newPlayer, vp: player.vp + BUILDING_VP[to] };
  // Apply cost properly:
  const newPlayer3: PlayerState = {
    ...newPlayer2,
    coin: player.coin - cost.coin,
    wood: player.wood - cost.wood,
  };
  const newHexes = state.hexes.slice();
  newHexes[hex] = { ...target, building: to };
  const newPlayers = state.players.slice();
  newPlayers[playerIdx] = newPlayer3;
  const factionName = FACTIONS.find((f) => f.id === player.faction)?.name ?? player.faction;
  return {
    ...state,
    hexes: newHexes,
    players: newPlayers,
    active: nextPlayer({ ...state, players: newPlayers, hexes: newHexes }),
    lastEvent: `${factionName} upgraded to ${to} at hex ${hex}.`,
  };
}

function doShipping(
  state: TerraMysticaFullState,
  playerIdx: number,
): TerraMysticaFullState | null {
  if (state.phase !== "playing") return null;
  if (playerIdx !== state.active) return null;
  const player = state.players[playerIdx];
  if (!player) return null;
  if (player.passed) return null;
  if (player.shippingLevel >= 3) return null;
  if (player.coin < 4 || player.priests < 1) return null;
  const newPlayer: PlayerState = {
    ...player,
    coin: player.coin - 4,
    priests: player.priests - 1,
    shippingLevel: player.shippingLevel + 1,
    vp: player.vp + 2,
  };
  const newPlayers = state.players.slice();
  newPlayers[playerIdx] = newPlayer;
  return {
    ...state,
    players: newPlayers,
    active: nextPlayer({ ...state, players: newPlayers }),
    lastEvent: `${FACTIONS.find((f) => f.id === player.faction)?.name ?? player.faction} advanced shipping to ${newPlayer.shippingLevel}.`,
  };
}

function doSpadeUp(
  state: TerraMysticaFullState,
  playerIdx: number,
): TerraMysticaFullState | null {
  if (state.phase !== "playing") return null;
  if (playerIdx !== state.active) return null;
  const player = state.players[playerIdx];
  if (!player) return null;
  if (player.passed) return null;
  if (player.spadeLevel >= 2) return null;
  if (player.coin < 5 || player.priests < 1) return null;
  const newPlayer: PlayerState = {
    ...player,
    coin: player.coin - 5,
    priests: player.priests - 1,
    spadeLevel: player.spadeLevel + 1,
    vp: player.vp + 2,
  };
  const newPlayers = state.players.slice();
  newPlayers[playerIdx] = newPlayer;
  return {
    ...state,
    players: newPlayers,
    active: nextPlayer({ ...state, players: newPlayers }),
    lastEvent: `${FACTIONS.find((f) => f.id === player.faction)?.name ?? player.faction} advanced spade efficiency to ${newPlayer.spadeLevel}.`,
  };
}

function doCult(
  state: TerraMysticaFullState,
  playerIdx: number,
  track: CultName,
): TerraMysticaFullState | null {
  if (state.phase !== "playing") return null;
  if (playerIdx !== state.active) return null;
  const player = state.players[playerIdx];
  if (!player) return null;
  if (player.passed) return null;
  if (player.priests < 1) return null;
  const oldPos = player.cult[track] ?? 0;
  if (oldPos >= 10) return null;
  const newCult: CultTrack = { ...player.cult, [track]: Math.min(10, oldPos + 2) };
  const step = newCult[track] - oldPos;
  const newPlayer: PlayerState = {
    ...player,
    priests: player.priests - 1,
    cult: newCult,
    vp: player.vp + step * currentScoringTile(state).vpPerCultStep,
  };
  const newPlayers = state.players.slice();
  newPlayers[playerIdx] = newPlayer;
  return {
    ...state,
    players: newPlayers,
    active: nextPlayer({ ...state, players: newPlayers }),
    lastEvent: `${FACTIONS.find((f) => f.id === player.faction)?.name ?? player.faction} sent a priest to ${track}.`,
  };
}

function doPass(
  state: TerraMysticaFullState,
  playerIdx: number,
): TerraMysticaFullState | null {
  if (state.phase !== "playing") return null;
  if (playerIdx !== state.active) return null;
  const player = state.players[playerIdx];
  if (!player) return null;
  if (player.passed) return null;
  const newPlayer: PlayerState = { ...player, passed: true, vp: player.vp + 1 /* bonus tile placeholder */ };
  const newPlayers = state.players.slice();
  newPlayers[playerIdx] = newPlayer;
  const newPassOrder = state.passOrder.includes(playerIdx)
    ? state.passOrder
    : [...state.passOrder, playerIdx];
  // If everyone has passed, queue an automatic round advance.
  const everyone = newPlayers.every((p) => p.passed);
  const nextActive = everyone ? newPassOrder[0] ?? 0 : nextPlayer({ ...state, players: newPlayers });
  return {
    ...state,
    players: newPlayers,
    passOrder: newPassOrder,
    active: nextActive,
    phase: everyone ? "scoring" : state.phase,
    lastEvent: `${FACTIONS.find((f) => f.id === player.faction)?.name ?? player.faction} passed.`,
  };
}

/* ─── Round advance / scoring ────────────────────────────────────────────── */

function applyEndRoundIncome(player: PlayerState): PlayerState {
  // Minimal-viable flat income: +5 coin, +3 wood, +1 priest, +1 power-tick (skipped).
  return {
    ...player,
    coin: player.coin + 5,
    wood: player.wood + 3,
    priests: player.priests + 1,
    passed: false,
    spades: 0,
  };
}

function applyFinalScoring(state: TerraMysticaFullState): TerraMysticaFullState {
  // Cult tracks: highest in each track gets +8, second +4, third +2.
  const newPlayers = state.players.map((p) => ({ ...p }));
  for (const track of CULT_NAMES) {
    const ranked = newPlayers
      .map((p, i) => ({ pos: p.cult[track] ?? 0, i }))
      .filter((x) => x.pos > 0)
      .sort((a, b) => b.pos - a.pos);
    const bonuses = [8, 4, 2];
    for (let k = 0; k < ranked.length && k < bonuses.length; k++) {
      const e = ranked[k]!;
      const pl = newPlayers[e.i]!;
      newPlayers[e.i] = { ...pl, vp: pl.vp + (bonuses[k] ?? 0) };
    }
  }
  // Area majority: count built hexes per player.
  const counts: number[] = newPlayers.map(() => 0);
  for (const hex of state.hexes) {
    if (hex.owner >= 0 && hex.owner < counts.length) counts[hex.owner] = (counts[hex.owner] ?? 0) + 1;
  }
  const order = counts
    .map((n, i) => ({ n, i }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const areaBonuses = [18, 12, 6];
  for (let k = 0; k < order.length && k < areaBonuses.length; k++) {
    const e = order[k]!;
    const pl = newPlayers[e.i]!;
    newPlayers[e.i] = { ...pl, vp: pl.vp + (areaBonuses[k] ?? 0) };
  }
  return { ...state, players: newPlayers, phase: "done", lastEvent: "Final scoring applied." };
}

function doAdvanceRound(state: TerraMysticaFullState): TerraMysticaFullState {
  if (state.phase !== "scoring") return state;
  if (state.round >= NUM_ROUNDS) {
    return applyFinalScoring(state);
  }
  const newPlayers = state.players.map(applyEndRoundIncome);
  // The first player to have passed last round goes first this round.
  const firstThisRound = state.passOrder[0] ?? 0;
  return {
    ...state,
    players: newPlayers,
    round: state.round + 1,
    phase: "playing",
    active: firstThisRound,
    passOrder: [],
    lastEvent: `Round ${state.round + 1} begins. Tile: ${state.scoringTiles[state.round]?.description ?? ""}`,
  };
}

/* ─── CPU ────────────────────────────────────────────────────────────────── */

function cpuChoose(state: TerraMysticaFullState): TerraMysticaFullState {
  const idx = state.active;
  const player = state.players[idx];
  if (!player || !player.isCpu) return state;
  if (player.passed) {
    // Skip — should not normally happen because nextPlayer filters passed.
    return { ...state, active: nextPlayer(state) };
  }

  // Strategy: greedy.
  //   1. If we can upgrade a trading-house cheaply, do it (high VP).
  //   2. Otherwise prefer building a dwelling on our home terrain (no spades).
  //   3. Otherwise terraform-build on the cheapest adjacent terrain.
  //   4. Otherwise advance shipping or cult.
  //   5. Otherwise pass.

  // (1) Upgrade trading-house → temple if affordable.
  for (let h = 0; h < state.hexes.length; h++) {
    const hex = state.hexes[h]!;
    if (hex.owner !== idx) continue;
    if (hex.building === "trading" && canAfford(player, BUILDING_COST.temple)) {
      const r = doUpgrade(state, idx, h, "temple");
      if (r) return r;
    }
    if (hex.building === "dwelling" && canAfford(player, BUILDING_COST.trading)) {
      const r = doUpgrade(state, idx, h, "trading");
      if (r) return r;
    }
  }

  // (2) Build on home terrain.
  for (let h = 0; h < state.hexes.length; h++) {
    const hex = state.hexes[h]!;
    if (hex.owner !== -1) continue;
    if (hex.terrain !== player.home) continue;
    const r = doBuild(state, idx, h);
    if (r) return r;
  }

  // (3) Build on cheapest available terrain.
  let bestHex = -1;
  let bestCost = Number.POSITIVE_INFINITY;
  for (let h = 0; h < state.hexes.length; h++) {
    const hex = state.hexes[h]!;
    if (hex.owner !== -1) continue;
    const cost = spadeCostFor(player, hex.terrain) * 3 + BUILDING_COST.dwelling.coin;
    if (
      cost < bestCost &&
      player.coin >= cost &&
      player.wood >= BUILDING_COST.dwelling.wood
    ) {
      bestCost = cost;
      bestHex = h;
    }
  }
  if (bestHex >= 0) {
    const r = doBuild(state, idx, bestHex);
    if (r) return r;
  }

  // (4) Spend a priest if we have one — try shipping then cult.
  if (player.priests > 0) {
    const r = doShipping(state, idx);
    if (r) return r;
    const r2 = doCult(state, idx, "fire");
    if (r2) return r2;
  }

  // (5) Pass.
  const r3 = doPass(state, idx);
  return r3 ?? state;
}

/* ─── Reducer ────────────────────────────────────────────────────────────── */

export function reducer(
  state: TerraMysticaFullState,
  action: TerraMysticaFullAction,
): TerraMysticaFullState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "selectFaction":
      return doSelectFaction(state, action.player, action.faction);
    case "build":
      return doBuild(state, action.player, action.hex) ?? state;
    case "upgrade":
      return doUpgrade(state, action.player, action.hex, action.to) ?? state;
    case "shipping":
      return doShipping(state, action.player) ?? state;
    case "spadeUp":
      return doSpadeUp(state, action.player) ?? state;
    case "cult":
      return doCult(state, action.player, action.track) ?? state;
    case "pass":
      return doPass(state, action.player) ?? state;
    case "cpuStep": {
      if (state.phase === "scoring") return doAdvanceRound(state);
      if (state.phase !== "playing") return state;
      const player = state.players[state.active];
      if (!player) return state;
      if (!player.isCpu) return state;
      const after = cpuChoose(state);
      // Auto-advance if everyone has just passed.
      if (allPassed(after) && after.phase === "scoring") return after;
      return after;
    }
    case "advanceRound":
      return doAdvanceRound(state);
    default:
      return state;
  }
}

export function isTerminal(state: TerraMysticaFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  const me = state.players[0];
  if (!me) return { score: 0 };
  // Win if human has the highest VP; tie counts as a win too.
  const myVp = me.vp;
  const top = state.players.reduce((m, p) => Math.max(m, p.vp), 0);
  if (myVp >= top) return { score: Math.max(0, myVp) };
  return { score: 0 };
}

/* ─── Convenience exports for tests / UI ─────────────────────────────────── */

export function legalBuildHexes(state: TerraMysticaFullState, playerIdx: number): number[] {
  const out: number[] = [];
  const player = state.players[playerIdx];
  if (!player) return out;
  for (let h = 0; h < state.hexes.length; h++) {
    const hex = state.hexes[h]!;
    if (hex.owner !== -1) continue;
    const totalCoin = BUILDING_COST.dwelling.coin + spadeCostFor(player, hex.terrain) * 3;
    if (player.coin >= totalCoin && player.wood >= BUILDING_COST.dwelling.wood) {
      out.push(h);
    }
  }
  return out;
}

export function legalUpgrades(
  state: TerraMysticaFullState,
  playerIdx: number,
): Array<{ hex: number; to: Building }> {
  const out: Array<{ hex: number; to: Building }> = [];
  const player = state.players[playerIdx];
  if (!player) return out;
  for (let h = 0; h < state.hexes.length; h++) {
    const hex = state.hexes[h]!;
    if (hex.owner !== playerIdx) continue;
    const upgrades: Array<{ from: Building | "none"; to: Building }> = [
      { from: "dwelling", to: "trading" },
      { from: "trading", to: "temple" },
      { from: "trading", to: "stronghold" },
      { from: "temple", to: "sanctuary" },
    ];
    for (const u of upgrades) {
      if (hex.building !== u.from) continue;
      if (u.to === "stronghold" && player.hasStronghold) continue;
      if (u.to === "sanctuary" && player.hasSanctuary) continue;
      if (!canAfford(player, BUILDING_COST[u.to])) continue;
      out.push({ hex: h, to: u.to });
    }
  }
  return out;
}

export {
  doSelectFaction,
  doBuild,
  doUpgrade,
  doShipping,
  doSpadeUp,
  doCult,
  doPass,
  doAdvanceRound,
  cpuChoose,
  currentScoringTile,
  spadeCostFor,
  canAfford,
};
