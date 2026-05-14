// Agricola (Full) — minimal viable implementation of the worker-placement
// farming game for 4 players (you + 3 CPU). 14 rounds with harvests at
// rounds 4, 7, 9, 11, 13, 14.
//
// TODO (omitted from this XL minimal implementation):
//   - Occupation / Minor Improvement / Major Improvement cards
//   - Card-draft phase ("Take 1 occupation" / "Take 1 minor improvement" spaces)
//   - Player-specific starting hands of cards
//   - Wood/clay/stone "accumulation" spaces (each action space yields a fixed
//     amount per turn instead of accumulating between turns)
//   - Bread baking / cooking conversions (food yields from action spaces only)
//   - Stables, fenced pastures hold animals (we track unfenced animals as a
//     simple pasture-capacity number)
//   - Plowing fields separately from sowing (combined into a single "field" action)
//   - Field crop growth across multiple harvests (we resolve harvest in one step)
//   - 1-3 player solo variants, 5-player variant
//   - Begging cards beyond the -3 VP penalty (we don't track named cards)
//   - 2-vs-2 family game variant
//   - Action-space unlock order across the round-card deck (we unlock the
//     correct number per round but use a fixed deck order)
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const NUM_PLAYERS = 4 as const;
export const TOTAL_ROUNDS = 14 as const;
export const HARVEST_ROUNDS: readonly number[] = [4, 7, 9, 11, 13, 14] as const;
export const STARTING_WORKERS = 2 as const;
export const STARTING_FOOD = 2 as const;
export const STARTING_ROOMS = 2 as const;
export const FOOD_PER_WORKER_AT_HARVEST = 2 as const;
export const BEG_PENALTY = 3 as const;

export type Seat = 0 | 1 | 2 | 3;
export type HutMaterial = "wood" | "clay" | "stone";
export type Phase = "placement" | "feeding" | "between" | "done";

// ------------------ Action spaces ------------------

export type ActionId =
  | "wood"
  | "clay"
  | "stone"
  | "reed"
  | "grain"
  | "vegetable"
  | "sheep"
  | "boar"
  | "cattle"
  | "fence"
  | "sow"
  | "family"
  | "renovate"
  | "day-laborer"
  | "fishing"
  | "starting-player";

export interface ActionSpace {
  id: ActionId;
  label: string;
  /** Round in which this space becomes available. Spaces with round 0 are
   *  always available from round 1. The first 4 actions in the list are
   *  the "always available" set; remaining unlock progressively. */
  unlockRound: number;
  /** Human-readable description used on tooltips. */
  description: string;
}

/** Always-available action spaces (unlock = 0) plus round-revealed spaces. */
export const ACTION_SPACES: readonly ActionSpace[] = [
  // Always-available core
  { id: "wood", label: "Take 3 Wood", unlockRound: 0, description: "Take 3 wood." },
  { id: "clay", label: "Take 1 Clay", unlockRound: 0, description: "Take 1 clay." },
  { id: "reed", label: "Take 1 Reed", unlockRound: 0, description: "Take 1 reed." },
  { id: "day-laborer", label: "Day Laborer (+2 Food)", unlockRound: 0, description: "Earn 2 food." },
  { id: "fishing", label: "Fishing (+1 Food)", unlockRound: 0, description: "Earn 1 food." },
  { id: "grain", label: "Take 1 Grain", unlockRound: 0, description: "Take 1 grain." },
  { id: "starting-player", label: "Starting Player (+1 Food)", unlockRound: 0, description: "Become starting player next round; earn 1 food." },
  // Round-revealed (one new space each round, in order)
  { id: "sheep", label: "Take 1 Sheep", unlockRound: 1, description: "Take 1 sheep." },
  { id: "sow", label: "Sow Field (+3 Grain)", unlockRound: 2, description: "Plant a field: place 3 grain on a new field tile." },
  { id: "fence", label: "Fence Pasture (+2 capacity)", unlockRound: 3, description: "Add 2 to pasture capacity (spends 2 wood)." },
  { id: "stone", label: "Take 1 Stone", unlockRound: 4, description: "Take 1 stone." },
  { id: "vegetable", label: "Take 1 Vegetable", unlockRound: 5, description: "Take 1 vegetable." },
  { id: "boar", label: "Take 1 Boar", unlockRound: 6, description: "Take 1 boar." },
  { id: "cattle", label: "Take 1 Cattle", unlockRound: 7, description: "Take 1 cattle." },
  { id: "family", label: "Family Growth (+1 worker)", unlockRound: 8, description: "Add 1 worker if you have an empty hut room." },
  { id: "renovate", label: "Renovate Hut", unlockRound: 10, description: "Upgrade hut: wood→clay (2 clay + 1 reed) or clay→stone (2 stone + 1 reed)." },
] as const;

// ------------------ Player state ------------------

export interface PlayerState {
  seat: Seat;
  isHuman: boolean;
  // Resources
  wood: number;
  clay: number;
  stone: number;
  reed: number;
  grain: number;
  vegetable: number;
  food: number;
  // Farm
  rooms: number;
  hut: HutMaterial;
  fields: number;       // number of sown fields with grain remaining
  grainOnFields: number; // grain counters across all fields (harvested 1/field/harvest)
  sheep: number;
  boar: number;
  cattle: number;
  pastureCapacity: number; // total animals that survive harvest (excess return to supply)
  // Workers
  totalWorkers: number;   // family size
  workersAvailable: number; // workers not yet placed this round
  // Penalties
  begCards: number;
}

export interface AgricolaState {
  rngSeed: number;
  round: number;             // 1..TOTAL_ROUNDS
  phase: Phase;
  startingPlayer: Seat;
  currentSeat: Seat;
  players: PlayerState[];
  /** Map of actionId -> seat that occupied it this round (-1 if empty). */
  occupied: Partial<Record<ActionId, Seat>>;
  /** Action ids unlocked so far (a subset of ACTION_SPACES). */
  unlocked: ActionId[];
  /** Last in-game log entries (UI). */
  log: string[];
  /** Who will be starting player next round (claimed via starting-player space). */
  nextStartingPlayer: Seat | null;
  winner: Seat | null;
  finalScores: number[];
}

// ------------------ Settings ------------------

export interface AgricolaSettings { _dummy?: boolean }

// ------------------ Actions ------------------

export type AgricolaAction =
  | { type: "place"; actionId: ActionId }
  | { type: "endPlacement" }   // forces feeding when no workers left
  | { type: "cpuStep" }        // run one CPU placement
  | { type: "ackHarvest" };    // ack the feeding result and advance round

// ------------------ Helpers ------------------

function mkPlayer(seat: Seat, isHuman: boolean): PlayerState {
  return {
    seat,
    isHuman,
    wood: 0, clay: 0, stone: 0, reed: 0,
    grain: 0, vegetable: 0,
    food: STARTING_FOOD,
    rooms: STARTING_ROOMS,
    hut: "wood",
    fields: 0, grainOnFields: 0,
    sheep: 0, boar: 0, cattle: 0,
    pastureCapacity: 0,
    totalWorkers: STARTING_WORKERS,
    workersAvailable: STARTING_WORKERS,
    begCards: 0,
  };
}

function clone(state: AgricolaState): AgricolaState {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p })),
    occupied: { ...state.occupied },
    unlocked: [...state.unlocked],
    log: [...state.log],
    finalScores: [...state.finalScores],
  };
}

function unlockForRound(round: number): ActionId[] {
  const out: ActionId[] = [];
  for (const sp of ACTION_SPACES) {
    if (sp.unlockRound <= round) out.push(sp.id);
  }
  return out;
}

/** Apply the effect of an action space onto the player. Returns the
 *  next player snapshot. Pure — does not mutate input. */
export function applyAction(p: PlayerState, id: ActionId): { player: PlayerState; ok: boolean; message: string } {
  const np: PlayerState = { ...p };
  switch (id) {
    case "wood":  np.wood += 3; return { player: np, ok: true, message: "took 3 wood" };
    case "clay":  np.clay += 1; return { player: np, ok: true, message: "took 1 clay" };
    case "stone": np.stone += 1; return { player: np, ok: true, message: "took 1 stone" };
    case "reed":  np.reed += 1; return { player: np, ok: true, message: "took 1 reed" };
    case "grain": np.grain += 1; return { player: np, ok: true, message: "took 1 grain" };
    case "vegetable": np.vegetable += 1; return { player: np, ok: true, message: "took 1 vegetable" };
    case "sheep": np.sheep += 1; return { player: np, ok: true, message: "took 1 sheep" };
    case "boar":  np.boar += 1; return { player: np, ok: true, message: "took 1 boar" };
    case "cattle": np.cattle += 1; return { player: np, ok: true, message: "took 1 cattle" };
    case "day-laborer": np.food += 2; return { player: np, ok: true, message: "day labor: +2 food" };
    case "fishing": np.food += 1; return { player: np, ok: true, message: "fishing: +1 food" };
    case "starting-player": np.food += 1; return { player: np, ok: true, message: "claimed starting player +1 food" };
    case "fence": {
      if (np.wood < 2) return { player: p, ok: false, message: "needs 2 wood to fence" };
      np.wood -= 2; np.pastureCapacity += 2;
      return { player: np, ok: true, message: "fenced pasture (+2 capacity)" };
    }
    case "sow": {
      // Place 1 field with 3 grain. (Combined plow+sow.)
      np.fields += 1; np.grainOnFields += 3;
      return { player: np, ok: true, message: "sowed a field (+3 grain on field)" };
    }
    case "family": {
      if (np.totalWorkers >= np.rooms) {
        return { player: p, ok: false, message: "needs an empty hut room for family growth" };
      }
      np.totalWorkers += 1; // new family member returns next round
      return { player: np, ok: true, message: "family grew (+1 worker next round)" };
    }
    case "renovate": {
      if (np.hut === "wood") {
        if (np.clay < 2 || np.reed < 1) {
          return { player: p, ok: false, message: "needs 2 clay + 1 reed to renovate to clay" };
        }
        np.clay -= 2; np.reed -= 1; np.hut = "clay";
        return { player: np, ok: true, message: "renovated wood -> clay" };
      } else if (np.hut === "clay") {
        if (np.stone < 2 || np.reed < 1) {
          return { player: p, ok: false, message: "needs 2 stone + 1 reed to renovate to stone" };
        }
        np.stone -= 2; np.reed -= 1; np.hut = "stone";
        return { player: np, ok: true, message: "renovated clay -> stone" };
      }
      return { player: p, ok: false, message: "hut already stone (max)" };
    }
  }
}

// ------------------ Scoring ------------------

/** Agricola-style scoring (simplified for the minimal version).
 *  - Fields: 0/1=1, 2=1, 3=2, 4=3, 5+=4
 *  - Sheep:  0=−1, 1–3=1, 4–5=2, 6–7=3, 8+=4
 *  - Boar:   0=−1, 1–2=1, 3–4=2, 5–6=3, 7+=4
 *  - Cattle: 0=−1, 1=1, 2–3=2, 4–5=3, 6+=4
 *  - Grain (held + on fields): 0=−1, 1–3=1, 4–5=2, 6–7=3, 8+=4
 *  - Vegetables: 1 VP each (capped at 4 for parity)
 *  - Hut rooms: clay = +1/room, stone = +2/room (wood = 0)
 *  - Family: 3 per worker
 *  - Begging cards: −3 each
 *  - Unused space (rooms beyond family + empty pasture capacity) is ignored.
 */
function scoreCategory(value: number, table: readonly [number, number][]): number {
  // table: ascending thresholds, score for each. e.g. [[0,-1],[1,1],[4,2]]
  let result = 0;
  for (const [threshold, pts] of table) {
    if (value >= threshold) result = pts;
  }
  return result;
}

export function scorePlayer(p: PlayerState): { total: number; lines: string[] } {
  const lines: string[] = [];
  const fieldsScore = scoreCategory(p.fields, [[0, -1], [1, 1], [2, 1], [3, 2], [4, 3], [5, 4]]);
  lines.push(`Fields(${p.fields})=${fieldsScore}`);
  const sheepScore = scoreCategory(p.sheep, [[0, -1], [1, 1], [4, 2], [6, 3], [8, 4]]);
  lines.push(`Sheep(${p.sheep})=${sheepScore}`);
  const boarScore = scoreCategory(p.boar, [[0, -1], [1, 1], [3, 2], [5, 3], [7, 4]]);
  lines.push(`Boar(${p.boar})=${boarScore}`);
  const cattleScore = scoreCategory(p.cattle, [[0, -1], [1, 1], [2, 2], [4, 3], [6, 4]]);
  lines.push(`Cattle(${p.cattle})=${cattleScore}`);
  const totalGrain = p.grain + p.grainOnFields;
  const grainScore = scoreCategory(totalGrain, [[0, -1], [1, 1], [4, 2], [6, 3], [8, 4]]);
  lines.push(`Grain(${totalGrain})=${grainScore}`);
  const vegScore = Math.min(4, p.vegetable);
  lines.push(`Vegetables(${p.vegetable})=${vegScore}`);
  const hutScore = (p.hut === "clay" ? 1 : p.hut === "stone" ? 2 : 0) * p.rooms;
  lines.push(`Hut(${p.hut}x${p.rooms})=${hutScore}`);
  const familyScore = p.totalWorkers * 3;
  lines.push(`Family(${p.totalWorkers})=${familyScore}`);
  const begPenalty = -p.begCards * BEG_PENALTY;
  if (p.begCards > 0) lines.push(`Begging(${p.begCards})=${begPenalty}`);
  const total = fieldsScore + sheepScore + boarScore + cattleScore +
                grainScore + vegScore + hutScore + familyScore + begPenalty;
  return { total, lines };
}

// ------------------ initialState ------------------

export function initialState(seed: number, _s: AgricolaSettings): AgricolaState {
  void _s;
  const players: PlayerState[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    players.push(mkPlayer(i as Seat, i === 0));
  }
  // The seed determines a stable starting player. Seed-only randomness so
  // initialState is deterministic.
  const rng = mulberry32(seed >>> 0);
  const sp = Math.floor(rng() * NUM_PLAYERS) as Seat;
  return {
    rngSeed: seed >>> 0,
    round: 1,
    phase: "placement",
    startingPlayer: sp,
    currentSeat: sp,
    players,
    occupied: {},
    unlocked: unlockForRound(1),
    log: [`Round 1 begins. ${seatLabel(sp)} is starting player.`],
    nextStartingPlayer: null,
    winner: null,
    finalScores: [],
  };
}

export function seatLabel(s: Seat): string {
  return s === 0 ? "You" : `CPU ${s}`;
}

// ------------------ Round / phase machinery ------------------

function nextSeatWithWorkers(state: AgricolaState, from: Seat): Seat | null {
  // Walk seats in starting-player order; return the next with workers > 0.
  for (let i = 1; i <= NUM_PLAYERS; i++) {
    const candidate = ((from + i) % NUM_PLAYERS) as Seat;
    if (state.players[candidate]!.workersAvailable > 0) return candidate;
  }
  if (state.players[from]!.workersAvailable > 0) return from;
  return null;
}

function anyWorkersLeft(state: AgricolaState): boolean {
  return state.players.some((p) => p.workersAvailable > 0);
}

/** Resolve the harvest: 1 grain per field returned to player (up to grainOnFields),
 *  feed family, breed animals, penalize for missing food. */
function runHarvest(stateIn: AgricolaState): AgricolaState {
  const s = clone(stateIn);
  // 1. Field harvest: each field yields 1 grain (consuming on-field grain)
  for (const p of s.players) {
    if (p.fields > 0 && p.grainOnFields > 0) {
      const yieldAmt = Math.min(p.fields, p.grainOnFields);
      p.grain += yieldAmt;
      p.grainOnFields -= yieldAmt;
      s.log.push(`${seatLabel(p.seat)} harvested ${yieldAmt} grain.`);
    }
  }
  // 2. Feed family: 2 food per worker; convert 1 grain -> 1 food, 1 veg -> 1 food.
  for (const p of s.players) {
    const need = p.totalWorkers * FOOD_PER_WORKER_AT_HARVEST;
    let food = p.food;
    if (food < need && p.grain > 0) {
      const convert = Math.min(p.grain, need - food);
      p.grain -= convert; food += convert;
    }
    if (food < need && p.vegetable > 0) {
      const convert = Math.min(p.vegetable, need - food);
      p.vegetable -= convert; food += convert;
    }
    if (food >= need) {
      p.food = food - need;
      s.log.push(`${seatLabel(p.seat)} fed ${p.totalWorkers} workers (${need} food).`);
    } else {
      const shortfall = need - food;
      p.food = 0;
      p.begCards += shortfall;
      s.log.push(`${seatLabel(p.seat)} could not feed family! +${shortfall} begging card(s).`);
    }
  }
  // 3. Breed animals: if you have >= 2 of a species, +1 (subject to pasture cap).
  for (const p of s.players) {
    const breed = (count: number): number => (count >= 2 ? count + 1 : count);
    p.sheep = breed(p.sheep);
    p.boar = breed(p.boar);
    p.cattle = breed(p.cattle);
    // 4. Pasture cap: total animals beyond pastureCapacity return to supply.
    // Simplified: keep min(total, pastureCapacity + 1 [for the home stable equivalent]).
    const cap = p.pastureCapacity + 1; // 1 free hut slot per Agricola
    const total = p.sheep + p.boar + p.cattle;
    if (total > cap) {
      // Trim proportionally, prioritising keeping most-valuable cattle, then boar, then sheep
      let over = total - cap;
      const trim = (val: number): number => {
        if (over <= 0) return val;
        const take = Math.min(over, val);
        over -= take;
        return val - take;
      };
      p.sheep = trim(p.sheep);
      p.boar = trim(p.boar);
      p.cattle = trim(p.cattle);
      s.log.push(`${seatLabel(p.seat)} lost animals (pasture overflow).`);
    }
  }
  return s;
}

function startNextRound(stateIn: AgricolaState): AgricolaState {
  const s = clone(stateIn);
  s.round += 1;
  if (s.round > TOTAL_ROUNDS) {
    // Finalize
    s.phase = "done";
    const scores = s.players.map((p) => scorePlayer(p).total);
    s.finalScores = scores;
    let bestIdx = 0;
    for (let i = 1; i < scores.length; i++) if (scores[i]! > scores[bestIdx]!) bestIdx = i;
    s.winner = bestIdx as Seat;
    s.log.push(`Game over! ${seatLabel(bestIdx as Seat)} wins with ${scores[bestIdx]} VP.`);
    return s;
  }
  // Move next-starting-player if claimed
  if (s.nextStartingPlayer !== null) {
    s.startingPlayer = s.nextStartingPlayer;
    s.nextStartingPlayer = null;
  }
  s.currentSeat = s.startingPlayer;
  s.occupied = {};
  s.unlocked = unlockForRound(s.round);
  s.phase = "placement";
  // Refresh workers (returning family from prior growth)
  for (const p of s.players) p.workersAvailable = p.totalWorkers;
  s.log.push(`Round ${s.round} begins. ${seatLabel(s.startingPlayer)} is starting player.`);
  return s;
}

// ------------------ CPU AI ------------------

/** Greedy CPU: feed first, then grow family ASAP, then collect cheap resources.
 *  Returns the actionId the CPU wishes to place into. */
export function chooseCpuAction(state: AgricolaState, seat: Seat): ActionId | null {
  const p = state.players[seat]!;
  const isAvail = (id: ActionId): boolean =>
    state.unlocked.includes(id) && state.occupied[id] === undefined;
  const need = p.totalWorkers * FOOD_PER_WORKER_AT_HARVEST;

  // 1. Family growth if we can use it
  if (p.totalWorkers < p.rooms && isAvail("family")) return "family";

  // 2. Need more food urgently if next harvest soon and food < need
  const nextHarvest = HARVEST_ROUNDS.find((r) => r >= state.round) ?? Infinity;
  const roundsToHarvest = nextHarvest - state.round;
  if (roundsToHarvest <= 2 && p.food + p.grain + p.vegetable < need) {
    if (isAvail("day-laborer")) return "day-laborer";
    if (isAvail("grain")) return "grain";
    if (isAvail("fishing")) return "fishing";
  }

  // 3. Building rooms? We don't implement build-room space here, but renovate
  // upgrades the hut for VP. Try renovate if we have materials.
  if (isAvail("renovate")) {
    if (p.hut === "wood" && p.clay >= 2 && p.reed >= 1) return "renovate";
    if (p.hut === "clay" && p.stone >= 2 && p.reed >= 1) return "renovate";
  }

  // 4. Greedy collect: cattle > boar > sheep > stone > clay > grain > wood
  const greedyOrder: ActionId[] = [
    "cattle", "boar", "sheep", "stone", "clay", "reed",
    "vegetable", "grain", "wood", "day-laborer", "fishing", "sow", "fence",
    "starting-player",
  ];
  for (const id of greedyOrder) {
    if (!isAvail(id)) continue;
    // Skip fence if we don't have wood
    if (id === "fence" && p.wood < 2) continue;
    // Skip sow if we have lots of fields already
    if (id === "sow" && p.fields >= 3) continue;
    return id;
  }
  // Fallback: any unlocked + unoccupied space
  for (const sp of ACTION_SPACES) {
    if (isAvail(sp.id)) return sp.id;
  }
  return null;
}

// ------------------ Reducer ------------------

export function reducer(state: AgricolaState, action: AgricolaAction): AgricolaState {
  if (state.phase === "done") return state;

  if (action.type === "place" && state.phase === "placement") {
    const seat = state.currentSeat;
    const p = state.players[seat]!;
    if (p.workersAvailable <= 0) return state;
    const id = action.actionId;
    if (!state.unlocked.includes(id)) return state;
    if (state.occupied[id] !== undefined) return state;
    const result = applyAction(p, id);
    if (!result.ok) return state;

    const s = clone(state);
    s.players[seat] = { ...result.player, workersAvailable: result.player.workersAvailable - 1 };
    s.occupied[id] = seat;
    s.log = [...s.log, `${seatLabel(seat)} placed: ${result.message}.`];
    if (id === "starting-player") {
      s.nextStartingPlayer = seat;
    }
    // Advance to next seat with workers
    if (!anyWorkersLeft(s)) {
      // End placement -> feeding/harvest if this is a harvest round, else go to next round
      if (HARVEST_ROUNDS.includes(s.round)) {
        const harvested = runHarvest(s);
        harvested.phase = "feeding";
        return harvested;
      }
      // Non-harvest round: directly start next round
      return startNextRound(s);
    }
    const next = nextSeatWithWorkers(s, seat);
    if (next !== null) s.currentSeat = next;
    return s;
  }

  if (action.type === "cpuStep" && state.phase === "placement") {
    const seat = state.currentSeat;
    const p = state.players[seat]!;
    if (p.isHuman) return state;
    if (p.workersAvailable <= 0) return state;
    const id = chooseCpuAction(state, seat);
    if (!id) return state;
    return reducer(state, { type: "place", actionId: id });
  }

  if (action.type === "endPlacement" && state.phase === "placement") {
    // Only allowed when no player has workers (defensive — used by UI corner case)
    if (anyWorkersLeft(state)) return state;
    if (HARVEST_ROUNDS.includes(state.round)) {
      const s = runHarvest(state);
      s.phase = "feeding";
      return s;
    }
    return startNextRound(state);
  }

  if (action.type === "ackHarvest" && state.phase === "feeding") {
    return startNextRound(state);
  }

  return state;
}

// ------------------ isTerminal ------------------

export function isTerminal(state: AgricolaState): { score: number } | null {
  if (state.phase !== "done") return null;
  const youScore = state.finalScores[0] ?? 0;
  const beatHumans = state.winner === 0;
  // Score for the leaderboard: only non-zero when the human player wins.
  if (!beatHumans) return { score: 0 };
  // Win bonus: base 100 + (youScore - bestOpponent) * 5
  const opponents = state.finalScores.slice(1);
  const bestOpp = opponents.length > 0 ? Math.max(...opponents) : 0;
  const margin = Math.max(0, youScore - bestOpp);
  return { score: 100 + youScore * 2 + margin * 3 };
}
