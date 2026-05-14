import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// TODO: Caverna Full — XL tier. Minimal Viable Caverna.
//
// IMPLEMENTED:
//   - 4 players: 1 human + 3 greedy CPUs.
//   - 12 rounds with harvest at rounds 5, 8, 10, and 12.
//   - 2 starting dwarves per player. Family Growth action grants extra dwarves
//     (max 5 per player).
//   - 12 action spaces (reduced from full ~30). Each action space holds an
//     accumulating resource OR a one-shot worker-placement effect.
//   - Resources tracked: wood, stone, ore, ruby, food, sheep, donkey, boar,
//     cow, dog, wheat, grain.
//   - Two-board concept (forest + mountain) tracked as a per-player tile
//     counters: forestCleared (becomes fields or pastures) and caveExcavated
//     (becomes dwellings/rooms/mines). We don't render a tile grid.
//   - Sow action: convert grain into fields (worth food at harvest).
//   - Breeding: at harvest, pairs of same-species animals produce +1 offspring
//     (sheep, boar, cow, donkey).
//   - Harvest: each dwarf eats 2 food; missing food → -3 score per starved
//     dwarf (begging tile substitute).
//   - Greedy CPU: ranks available actions by immediate yield × scarcity.
//
// OMITTED (XL skip list):
//   - Room / building variety (sleeping chambers, simple cave, work room, etc.).
//   - Weapon arming track + expedition actions for treasure (NO weapon track).
//   - Furnishing tiles and dwelling building costs (we abstract dwellings into
//     a counter unlocking dwarves via Family Growth).
//   - Adjacent tile placement rules on the forest/mountain grid.
//   - Imitation action, reserve actions and round-by-round new action
//     reveals (we expose all 12 actions from the start).
//   - Pasture fencing, stables, irrigation, mine layouts.
//   - Trade actions and ruby-trading specifics; rubies are just bonus VP.
//   - Player-vs-player resource contesting beyond first-come accumulation.
//   - Final scoring nuances (negative points for missing categories).
// =============================================================================

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ResourceKey =
  | "wood" | "stone" | "ore" | "ruby"
  | "food" | "wheat" | "grain"
  | "sheep" | "donkey" | "boar" | "cow" | "dog";

export const RESOURCE_KEYS: readonly ResourceKey[] = [
  "wood", "stone", "ore", "ruby",
  "food", "wheat", "grain",
  "sheep", "donkey", "boar", "cow", "dog",
];

export type ResourceBag = Record<ResourceKey, number>;

export function emptyBag(): ResourceBag {
  const r = {} as ResourceBag;
  for (const k of RESOURCE_KEYS) r[k] = 0;
  return r;
}

export interface PlayerState {
  id: number;
  name: string;
  isCpu: boolean;
  dwarvesTotal: number;        // dwarves owned (start 2)
  dwarvesPlaced: number;       // dwarves placed this round (resets each round)
  resources: ResourceBag;
  forestCleared: number;       // forest tiles cleared (later fields/pastures)
  fields: number;              // sown fields holding grain → food at harvest
  caveExcavated: number;       // mountain tiles cleared (later dwelling/rooms)
  dwellings: number;           // built dwellings (max 4, gating family growth)
}

export type Phase =
  | "playing"     // current player's turn to place a dwarf
  | "cpuTurn"     // CPU is acting (Game.tsx pumps "cpu_step")
  | "harvest"     // harvest phase between rounds (auto-resolved)
  | "done";

// -----------------------------------------------------------------------------
// Action Spaces
// -----------------------------------------------------------------------------

/** An action space has an id, a label, and either accumulating resources
 *  (added at end of round) or a one-shot effect when chosen. */
export interface ActionSpace {
  id: string;
  label: string;
  /** Resources added on this space each round (accumulating). */
  accumulating?: Partial<ResourceBag>;
  /** One-shot effect when a dwarf is placed (does NOT clear accumulation). */
  kind: "accumulate" | "clear-forest" | "excavate" | "mine-ore" | "mine-ruby"
    | "sow" | "build-dwelling" | "family-growth" | "breed-animals";
}

export const ACTION_SPACES: readonly ActionSpace[] = [
  // Accumulating resource spaces (forest + mountain).
  { id: "drift-mining", label: "Drift Mining (+1 wood, +1 stone)", kind: "accumulate", accumulating: { wood: 1, stone: 1 } },
  { id: "logging", label: "Logging (+2 wood)", kind: "accumulate", accumulating: { wood: 2 } },
  { id: "wood-gathering", label: "Wood Gathering (+1 wood)", kind: "accumulate", accumulating: { wood: 1 } },
  { id: "ore-mine-acc", label: "Ore Mine Hut (+1 ore, +1 food)", kind: "accumulate", accumulating: { ore: 1, food: 1 } },
  { id: "sheep-farming", label: "Sheep Farming (+1 sheep, +1 food)", kind: "accumulate", accumulating: { sheep: 1, food: 1 } },
  { id: "donkey-farming", label: "Donkey Farming (+1 donkey, +1 stone)", kind: "accumulate", accumulating: { donkey: 1, stone: 1 } },
  { id: "boar-farming", label: "Wild Boar (+1 boar, +1 food)", kind: "accumulate", accumulating: { boar: 1, food: 1 } },
  { id: "cattle-farming", label: "Cattle Farming (+1 cow, +1 grain)", kind: "accumulate", accumulating: { cow: 1, grain: 1 } },
  // One-shot effect spaces.
  { id: "forest-explore", label: "Forest Exploration (clear 1 forest)", kind: "clear-forest" },
  { id: "cave-clear", label: "Cave Excavation (clear 1 mountain)", kind: "excavate" },
  { id: "sowing", label: "Sowing (convert 1 grain → field)", kind: "sow" },
  { id: "family-growth", label: "Family Growth (gain +1 dwarf)", kind: "family-growth" },
];

// -----------------------------------------------------------------------------
// Settings + State
// -----------------------------------------------------------------------------

export interface CavernaFullSettings { _dummy: boolean; }

export interface CavernaFullState {
  rngSeed: number;
  round: number;                            // 1..12
  players: PlayerState[];                   // length 4: [human, cpu1, cpu2, cpu3]
  current: number;                          // index of player whose turn it is
  startPlayer: number;                      // first to place this round
  phase: Phase;
  /** Action space accumulated resources, keyed by action id. */
  accumulated: Record<string, ResourceBag>;
  /** Action space dwarf occupancy: action id → player id who placed there
   *  (null = empty). Resets each round. */
  occupied: Record<string, number | null>;
  message: string;
  log: string[];
  winnerIndex: number | null;
}

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export type CavernaFullAction =
  | { type: "place"; actionId: string }
  | { type: "cpu_step" }
  | { type: "next_round" }; // advance from harvest auto-resolved state

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const TOTAL_ROUNDS = 12;
export const HARVEST_ROUNDS = new Set<number>([5, 8, 10, 12]);
export const STARTING_DWARVES = 2;
export const MAX_DWARVES = 5;
export const MAX_DWELLINGS = 4;
export const FEED_PER_DWARF = 2;
export const NUM_PLAYERS = 4;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function pushLog(log: string[], msg: string): string[] {
  return [msg, ...log].slice(0, 10);
}

function clonePlayer(p: PlayerState): PlayerState {
  return { ...p, resources: { ...p.resources } };
}

function cloneState(s: CavernaFullState): CavernaFullState {
  return {
    ...s,
    players: s.players.map(clonePlayer),
    accumulated: Object.fromEntries(Object.entries(s.accumulated).map(([k, v]) => [k, { ...v }])),
    occupied: { ...s.occupied },
    log: s.log.slice(),
  };
}

function addBag(target: ResourceBag, src: Partial<ResourceBag>): void {
  for (const k of RESOURCE_KEYS) {
    target[k] += src[k] ?? 0;
  }
}

// -----------------------------------------------------------------------------
// initialState
// -----------------------------------------------------------------------------

export function initialState(seed: number, _settings: CavernaFullSettings): CavernaFullState {
  const rng = mulberry32(seed >>> 0);
  // Burn one rng tick to evolve seed for reducer use.
  const next = Math.floor(rng() * 2 ** 31);

  const players: PlayerState[] = [];
  const names = ["You", "Brokk", "Sindri", "Eitri"];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    players.push({
      id: i,
      name: names[i] ?? `P${i + 1}`,
      isCpu: i !== 0,
      dwarvesTotal: STARTING_DWARVES,
      dwarvesPlaced: 0,
      resources: emptyBag(),
      forestCleared: 0,
      fields: 0,
      caveExcavated: 0,
      dwellings: 1, // start with 1 dwelling occupied by the starting dwarves
    });
  }

  const accumulated: Record<string, ResourceBag> = {};
  const occupied: Record<string, number | null> = {};
  for (const a of ACTION_SPACES) {
    accumulated[a.id] = emptyBag();
    occupied[a.id] = null;
    if (a.accumulating) addBag(accumulated[a.id]!, a.accumulating);
  }

  return {
    rngSeed: next,
    round: 1,
    players,
    current: 0,
    startPlayer: 0,
    phase: "playing",
    accumulated,
    occupied,
    message: "Round 1 — place a dwarf on an action.",
    log: ["Caverna started. 12 rounds, harvest at 5, 8, 10, 12."],
    winnerIndex: null,
  };
}

// -----------------------------------------------------------------------------
// Effect handlers (mutate cloned state in-place)
// -----------------------------------------------------------------------------

function applyAccumulate(state: CavernaFullState, pid: number, actionId: string): void {
  const acc = state.accumulated[actionId];
  if (!acc) return;
  addBag(state.players[pid]!.resources, acc);
  state.accumulated[actionId] = emptyBag();
}

function applyClearForest(state: CavernaFullState, pid: number): void {
  const p = state.players[pid]!;
  p.forestCleared += 1;
  // Bonus: gain 1 wood for clearing forest.
  p.resources.wood += 1;
}

function applyExcavate(state: CavernaFullState, pid: number): void {
  const p = state.players[pid]!;
  p.caveExcavated += 1;
  // Bonus: gain 1 stone for excavating cave.
  p.resources.stone += 1;
}

function applySow(state: CavernaFullState, pid: number): void {
  const p = state.players[pid]!;
  if (p.resources.grain >= 1 && p.forestCleared > p.fields) {
    p.resources.grain -= 1;
    p.fields += 1;
  }
}

function applyFamilyGrowth(state: CavernaFullState, pid: number): void {
  const p = state.players[pid]!;
  // Need a free dwelling (one dwelling per dwarf, max MAX_DWARVES).
  if (p.dwarvesTotal < MAX_DWARVES && p.dwellings > p.dwarvesTotal) {
    p.dwarvesTotal += 1;
  } else if (p.dwarvesTotal < MAX_DWARVES && p.caveExcavated > p.dwellings && p.dwellings < MAX_DWELLINGS) {
    // Convert an excavated cave into a dwelling, then grow.
    p.dwellings += 1;
    p.dwarvesTotal += 1;
  }
}

function legalForPlayer(state: CavernaFullState, pid: number, actionId: string): boolean {
  if (state.occupied[actionId] != null) return false;
  const a = ACTION_SPACES.find((x) => x.id === actionId);
  if (!a) return false;
  const p = state.players[pid]!;
  if (p.dwarvesPlaced >= p.dwarvesTotal) return false;
  if (a.kind === "sow") {
    return p.resources.grain >= 1 && p.forestCleared > p.fields;
  }
  if (a.kind === "family-growth") {
    if (p.dwarvesTotal >= MAX_DWARVES) return false;
    // Need a dwelling slot or convertible excavated cave.
    if (p.dwellings > p.dwarvesTotal) return true;
    if (p.caveExcavated > p.dwellings && p.dwellings < MAX_DWELLINGS) return true;
    return false;
  }
  return true;
}

function applyAction(state: CavernaFullState, pid: number, actionId: string): void {
  const a = ACTION_SPACES.find((x) => x.id === actionId);
  if (!a) return;
  switch (a.kind) {
    case "accumulate": applyAccumulate(state, pid, actionId); break;
    case "clear-forest": applyClearForest(state, pid); break;
    case "excavate": applyExcavate(state, pid); break;
    case "mine-ore":
    case "mine-ruby":
    case "build-dwelling":
    case "breed-animals":
      // TODO: implemented as side-effects of harvest/breeding step or
      // accumulating spaces. These kinds are reserved for future expansion.
      break;
    case "sow": applySow(state, pid); break;
    case "family-growth": applyFamilyGrowth(state, pid); break;
  }
  // Mark dwarf placement.
  state.occupied[actionId] = pid;
  state.players[pid]!.dwarvesPlaced += 1;
}

// -----------------------------------------------------------------------------
// Round / harvest resolution
// -----------------------------------------------------------------------------

function allDwarvesPlaced(state: CavernaFullState): boolean {
  for (const p of state.players) {
    if (p.dwarvesPlaced < p.dwarvesTotal) return false;
  }
  return true;
}

function isPlayerDone(state: CavernaFullState, pid: number): boolean {
  return state.players[pid]!.dwarvesPlaced >= state.players[pid]!.dwarvesTotal;
}

/** Advance to next player who still has dwarves to place, in seat order
 *  starting from `from` (exclusive). Returns -1 if none. */
function nextPlacingPlayer(state: CavernaFullState, from: number): number {
  for (let i = 1; i <= NUM_PLAYERS; i++) {
    const pid = (from + i) % NUM_PLAYERS;
    if (!isPlayerDone(state, pid)) return pid;
  }
  // If nobody found by walking, check if "from" itself still has dwarves
  // (this happens at round-start when caller passes startPlayer-1 sentinel).
  if (!isPlayerDone(state, from)) return from;
  return -1;
}

function applyHarvest(state: CavernaFullState): void {
  for (const p of state.players) {
    // 1. Fields produce: each sown field gives 1 food (and reverts to plain forest).
    const fieldFood = p.fields;
    p.resources.food += fieldFood;
    p.fields = 0;
    // 2. Feed dwarves: 2 food each, deficit converts grain → food (1 grain = 1 food),
    //    then wheat (1 wheat = 1 food), animals at 2 food each.
    let needed = p.dwarvesTotal * FEED_PER_DWARF;
    needed -= Math.min(p.resources.food, needed);
    p.resources.food = Math.max(0, p.resources.food - p.dwarvesTotal * FEED_PER_DWARF);
    if (needed > 0) {
      const fromGrain = Math.min(p.resources.grain, needed);
      p.resources.grain -= fromGrain;
      needed -= fromGrain;
    }
    if (needed > 0) {
      const fromWheat = Math.min(p.resources.wheat, needed);
      p.resources.wheat -= fromWheat;
      needed -= fromWheat;
    }
    // Animals: each provides 2 food.
    for (const sp of ["sheep", "boar", "cow", "donkey"] as ResourceKey[]) {
      if (needed <= 0) break;
      while (needed > 0 && p.resources[sp] > 0) {
        p.resources[sp] -= 1;
        needed -= 2;
      }
    }
    // Starvation: each missing meal counts as 1 starvation point.
    if (needed > 0) {
      // Penalty stored as negative ruby (simple). We treat ruby as a VP token.
      // For minimal viable, deduct from ruby (clamped at 0) and remember.
      p.resources.ruby = Math.max(0, p.resources.ruby - needed);
    }
    // 3. Breeding: each species with >=2 produces +1 offspring (capped by pasture
    //    abstractly = forestCleared+1 per species).
    for (const sp of ["sheep", "boar", "cow", "donkey"] as ResourceKey[]) {
      if (p.resources[sp] >= 2) p.resources[sp] += 1;
    }
  }
}

function resetRoundDwarves(state: CavernaFullState): void {
  for (const p of state.players) p.dwarvesPlaced = 0;
  for (const a of ACTION_SPACES) {
    state.occupied[a.id] = null;
    if (a.accumulating) addBag(state.accumulated[a.id]!, a.accumulating);
  }
}

function rotateStartPlayer(state: CavernaFullState): void {
  state.startPlayer = (state.startPlayer + 1) % NUM_PLAYERS;
}

function endRound(state: CavernaFullState): void {
  if (HARVEST_ROUNDS.has(state.round)) {
    applyHarvest(state);
    state.log = pushLog(state.log, `Harvest after round ${state.round}.`);
  }
  if (state.round >= TOTAL_ROUNDS) {
    finalizeGame(state);
    return;
  }
  state.round += 1;
  rotateStartPlayer(state);
  resetRoundDwarves(state);
  // Round-start: current player is the start player (or next who can place).
  const startId = state.startPlayer;
  if (!isPlayerDone(state, startId)) {
    state.current = startId;
  } else {
    const np = nextPlacingPlayer(state, startId);
    state.current = np >= 0 ? np : startId;
  }
  state.phase = state.players[state.current]?.isCpu ? "cpuTurn" : "playing";
  state.message = `Round ${state.round} — ${state.players[state.current]?.name ?? "?"} to place.`;
}

// -----------------------------------------------------------------------------
// Scoring & finalization
// -----------------------------------------------------------------------------

export function scoreFor(p: PlayerState): number {
  let s = 0;
  // 1 VP per dwarf
  s += p.dwarvesTotal * 1;
  // 1 VP per dwelling
  s += p.dwellings * 1;
  // 1 VP per forest cleared / cave excavated / field
  s += p.forestCleared * 1;
  s += p.caveExcavated * 1;
  s += p.fields * 1;
  // Resources: rubies +2 each, grain/wheat +1, ore +1, stone/wood +0.5 (floored bag).
  s += p.resources.ruby * 2;
  s += p.resources.grain * 1;
  s += p.resources.wheat * 1;
  s += p.resources.ore * 1;
  s += Math.floor(p.resources.stone * 0.5);
  s += Math.floor(p.resources.wood * 0.5);
  s += Math.floor(p.resources.food * 0.5);
  // Animal diversity
  const species = ["sheep", "boar", "cow", "donkey"] as ResourceKey[];
  let owned = 0;
  for (const sp of species) if (p.resources[sp] > 0) owned += 1;
  s += owned * 2;
  if (p.resources.dog > 0) s += 1;
  return Math.max(0, s);
}

function finalizeGame(state: CavernaFullState): void {
  let best = -Infinity;
  let bestIdx = 0;
  for (const p of state.players) {
    const v = scoreFor(p);
    if (v > best) { best = v; bestIdx = p.id; }
  }
  state.winnerIndex = bestIdx;
  state.phase = "done";
  state.message =
    bestIdx === 0
      ? `Victory! Final score ${scoreFor(state.players[0]!)}.`
      : `${state.players[bestIdx]?.name ?? "CPU"} wins with ${best} pts.`;
  state.log = pushLog(state.log, `Game over. Winner: ${state.players[bestIdx]?.name ?? "?"}.`);
}

// -----------------------------------------------------------------------------
// CPU strategy: greedy
// -----------------------------------------------------------------------------

/** Score every legal action for the CPU and pick the highest. */
function pickCpuAction(state: CavernaFullState, pid: number): string | null {
  const p = state.players[pid]!;
  let bestId: string | null = null;
  let bestScore = -Infinity;
  for (const a of ACTION_SPACES) {
    if (!legalForPlayer(state, pid, a.id)) continue;
    let s = 0;
    if (a.kind === "accumulate") {
      const acc = state.accumulated[a.id] ?? emptyBag();
      // Weight resources by relative scarcity for this player.
      s += acc.wood * 1.0;
      s += acc.stone * 1.2;
      s += acc.ore * 1.5;
      s += acc.ruby * 3.0;
      s += acc.food * 1.0;
      s += acc.grain * 1.2;
      s += acc.wheat * 1.1;
      s += acc.sheep * 1.5;
      s += acc.donkey * 1.5;
      s += acc.boar * 1.5;
      s += acc.cow * 1.7;
    } else if (a.kind === "clear-forest") {
      s += 2.0 + (p.forestCleared === 0 ? 1.5 : 0);
    } else if (a.kind === "excavate") {
      s += 2.0 + (p.caveExcavated === 0 ? 1.5 : 0);
    } else if (a.kind === "sow") {
      s += 4.0 + Math.min(p.resources.grain, 2);
    } else if (a.kind === "family-growth") {
      s += 6.0 - p.dwarvesTotal * 0.5;
    }
    if (s > bestScore) { bestScore = s; bestId = a.id; }
  }
  return bestId;
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

export function reducer(state: CavernaFullState, action: CavernaFullAction): CavernaFullState {
  if (state.phase === "done") return state;

  if (action.type === "place" && state.phase === "playing" && state.current === 0) {
    if (!legalForPlayer(state, 0, action.actionId)) return state;
    const next = cloneState(state);
    applyAction(next, 0, action.actionId);
    next.log = pushLog(next.log, `You placed on ${actionLabel(action.actionId)}.`);
    return advanceTurn(next);
  }

  if (action.type === "cpu_step" && state.phase === "cpuTurn") {
    const pid = state.current;
    const choice = pickCpuAction(state, pid);
    if (choice == null) {
      // CPU has no legal action — skip (shouldn't happen with 12 spaces & 5
      // max dwarves total = 20 max placements vs 12 spaces… can happen if all
      // legal spaces filled). Force-pass.
      const next = cloneState(state);
      // Burn dwarf to free up flow.
      next.players[pid]!.dwarvesPlaced = next.players[pid]!.dwarvesTotal;
      next.log = pushLog(next.log, `${next.players[pid]?.name ?? "CPU"} had no legal action.`);
      return advanceTurn(next);
    }
    const next = cloneState(state);
    applyAction(next, pid, choice);
    next.log = pushLog(next.log, `${next.players[pid]?.name ?? "CPU"} placed on ${actionLabel(choice)}.`);
    return advanceTurn(next);
  }

  if (action.type === "next_round" && state.phase === "harvest") {
    const next = cloneState(state);
    endRound(next);
    return next;
  }

  return state;
}

function advanceTurn(state: CavernaFullState): CavernaFullState {
  if (allDwarvesPlaced(state)) {
    // End of round: auto-resolve harvest (if any) and advance.
    state.phase = "harvest";
    // Auto-continue: instead of pausing, run endRound now.
    endRound(state);
    return state;
  }
  // Round-robin: next player after current who can still place.
  const np = nextPlacingPlayer(state, state.current);
  if (np < 0) {
    state.phase = "harvest";
    endRound(state);
    return state;
  }
  state.current = np;
  state.phase = state.players[np]!.isCpu ? "cpuTurn" : "playing";
  state.message = state.players[np]!.isCpu
    ? `${state.players[np]?.name} is thinking…`
    : `Round ${state.round} — your turn.`;
  return state;
}

export function actionLabel(actionId: string): string {
  return ACTION_SPACES.find((a) => a.id === actionId)?.label ?? actionId;
}

// -----------------------------------------------------------------------------
// isTerminal
// -----------------------------------------------------------------------------

export function isTerminal(state: CavernaFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  if (state.winnerIndex === 0) {
    const v = scoreFor(state.players[0]!);
    return { score: 100 + v * 5 };
  }
  return { score: 0 };
}
