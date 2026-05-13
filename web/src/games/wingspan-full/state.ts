import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// Wingspan (Full) — L tier.
//
// IMPLEMENTED:
//   - 2 players: human (seat 0) vs 2 CPU rivals (seats 1, 2). Despite the
//     "1-vs-2-CPUs" pitch, this is configurable through settings (default = 2
//     CPUs). The active player is rotated each turn.
//   - 4 rounds with 8 / 7 / 6 / 5 actions per player per round.
//   - Three habitats per player: Forest (food), Grassland (eggs),
//     Wetlands (cards). Each row has 5 slots.
//   - Bird deck of 36 species. Each card has:
//       * cost (number of worm + grain + fruit food = "any" type after L-tier
//         simplification — we use a single generic "food" resource pool but
//         spend it as if each card has a uniform cost).
//       * habitat (forest | grassland | wetland)
//       * eggCapacity (max eggs that can be laid on this bird)
//       * vp (printed victory points)
//       * power: one of ~6 generic powers, triggered when a habitat row is
//         activated and this bird is on that row.
//   - 5 food types in the birdfeeder pool (worm/grain/fruit/fish/rodent), but
//     in L tier we treat all costs as generic "food" so the player can spend
//     any food from any tray to pay any bird. The pool tracks supply
//     (the 5 trays still display individually for flavor).
//   - 4 end-of-round bonus tiles, one per round, awarded to the player who
//     leads in the criterion (most birds in Forest / most eggs / most cards
//     in hand / most points-of-birds-in-Wetlands). Ties: split (round down).
//   - Turn actions: PLAY_BIRD (pay food cost, drop into matching habitat row)
//     or USE_HABITAT (Forest gain food; Grassland lay eggs; Wetlands draw
//     cards). Each habitat awards (#birds on that row + 1) of its resource,
//     so denser rows = stronger activations.
//   - On USE_HABITAT we trigger every bird on the row "from right to left",
//     gaining its power's bonus (food/egg/card/etc).
//   - CPU strategy: greedy — if it can play a bird, choose the highest-VP
//     playable bird; otherwise activate the habitat with the most birds (ties
//     broken in favor of Forest > Wetland > Grassland for food/cards over eggs).
//   - End-of-game score: VP printed on birds + eggs (1 each) + food cached on
//     cards (powers can cache food) + tucked birds (1 each) + end-of-round
//     bonus points awarded.
//
// OMITTED (L tier — listed in howToPlay too):
//   - Per-food-type cost variety beyond a single generic food pool. Cards
//     show a numeric cost only.
//   - Action cubes: tracked implicitly via `actionsLeft` rather than a cube
//     supply with row-activation chaining bonuses (we use a flat row-power
//     trigger, no "trigger only birds left of cube" enforcement).
//   - Bird draft tray (face-up bird cards). Players draw from the top of
//     the deck only.
//   - Bonus card selection during setup (3 personal bonus cards). Each
//     player gets one random fixed bonus card at game start.
//   - Round end bird-power chain (the "brown power" / pink "once between
//     turns" powers). Only the generic powers listed below are implemented.
//   - Nectar (Asia/Oceania expansion food type) — not in base game anyway.
// =============================================================================

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const ROUNDS = 4;
export const ACTIONS_PER_ROUND: readonly number[] = [8, 7, 6, 5];
export const HABITAT_SLOTS = 5;
export const STARTING_HAND_SIZE = 5;
export const STARTING_FOOD = 5;
export const FOOD_TYPES: readonly FoodType[] = ["worm", "grain", "fruit", "fish", "rodent"];

export type FoodType = "worm" | "grain" | "fruit" | "fish" | "rodent";
export type Habitat = "forest" | "grassland" | "wetland";
export type BirdPower =
  | "gain_food"
  | "draw_card"
  | "lay_egg"
  | "tuck_bird"
  | "cache_food"
  | "extra_vp";

export interface BirdCard {
  id: number;          // index into BIRD_DEFS
  name: string;
  habitat: Habitat;
  cost: number;        // generic food cost (L-tier simplification)
  eggCapacity: number;
  vp: number;
  power: BirdPower;
}

// -----------------------------------------------------------------------------
// Bird definitions (36 species)
// -----------------------------------------------------------------------------

// We define a static array. Each card has habitat, cost, eggCap, vp, power.
// Mix is roughly 12 per habitat with a balance of low/mid/high VP and powers.
const BIRD_DEFS: BirdCard[] = [
  // ---- Forest (gain food themed) ----
  { id: 0,  name: "American Robin",      habitat: "forest",    cost: 1, eggCapacity: 4, vp: 2, power: "gain_food" },
  { id: 1,  name: "Barred Owl",          habitat: "forest",    cost: 4, eggCapacity: 2, vp: 6, power: "cache_food" },
  { id: 2,  name: "Black-Capped Chickadee", habitat: "forest", cost: 1, eggCapacity: 3, vp: 2, power: "gain_food" },
  { id: 3,  name: "Pileated Woodpecker", habitat: "forest",    cost: 3, eggCapacity: 2, vp: 5, power: "draw_card" },
  { id: 4,  name: "Red-Headed Woodpecker", habitat: "forest",  cost: 2, eggCapacity: 3, vp: 4, power: "gain_food" },
  { id: 5,  name: "Cooper's Hawk",       habitat: "forest",    cost: 4, eggCapacity: 2, vp: 6, power: "cache_food" },
  { id: 6,  name: "Ruby-Throated Hummingbird", habitat: "forest", cost: 1, eggCapacity: 2, vp: 3, power: "gain_food" },
  { id: 7,  name: "Blue Jay",            habitat: "forest",    cost: 2, eggCapacity: 3, vp: 4, power: "tuck_bird" },
  { id: 8,  name: "Eastern Bluebird",    habitat: "forest",    cost: 2, eggCapacity: 3, vp: 3, power: "lay_egg" },
  { id: 9,  name: "Great Horned Owl",    habitat: "forest",    cost: 5, eggCapacity: 2, vp: 7, power: "extra_vp" },
  { id: 10, name: "Northern Flicker",    habitat: "forest",    cost: 2, eggCapacity: 3, vp: 4, power: "draw_card" },
  { id: 11, name: "Scarlet Tanager",     habitat: "forest",    cost: 2, eggCapacity: 2, vp: 4, power: "gain_food" },

  // ---- Grassland (lay eggs themed) ----
  { id: 12, name: "Eastern Meadowlark",  habitat: "grassland", cost: 2, eggCapacity: 5, vp: 4, power: "lay_egg" },
  { id: 13, name: "Bobolink",            habitat: "grassland", cost: 1, eggCapacity: 4, vp: 2, power: "lay_egg" },
  { id: 14, name: "Killdeer",            habitat: "grassland", cost: 1, eggCapacity: 4, vp: 2, power: "lay_egg" },
  { id: 15, name: "Western Meadowlark",  habitat: "grassland", cost: 2, eggCapacity: 5, vp: 4, power: "lay_egg" },
  { id: 16, name: "Greater Roadrunner",  habitat: "grassland", cost: 3, eggCapacity: 3, vp: 5, power: "tuck_bird" },
  { id: 17, name: "Burrowing Owl",       habitat: "grassland", cost: 3, eggCapacity: 3, vp: 5, power: "cache_food" },
  { id: 18, name: "Northern Bobwhite",   habitat: "grassland", cost: 1, eggCapacity: 4, vp: 2, power: "lay_egg" },
  { id: 19, name: "Ring-Necked Pheasant",habitat: "grassland", cost: 3, eggCapacity: 5, vp: 5, power: "lay_egg" },
  { id: 20, name: "Wild Turkey",         habitat: "grassland", cost: 4, eggCapacity: 3, vp: 6, power: "extra_vp" },
  { id: 21, name: "Sandhill Crane",      habitat: "grassland", cost: 4, eggCapacity: 2, vp: 6, power: "draw_card" },
  { id: 22, name: "Mourning Dove",       habitat: "grassland", cost: 1, eggCapacity: 3, vp: 2, power: "gain_food" },
  { id: 23, name: "American Kestrel",    habitat: "grassland", cost: 2, eggCapacity: 3, vp: 4, power: "gain_food" },

  // ---- Wetland (draw card themed) ----
  { id: 24, name: "Wood Duck",           habitat: "wetland",   cost: 2, eggCapacity: 4, vp: 4, power: "draw_card" },
  { id: 25, name: "Mallard",             habitat: "wetland",   cost: 1, eggCapacity: 4, vp: 2, power: "draw_card" },
  { id: 26, name: "Belted Kingfisher",   habitat: "wetland",   cost: 3, eggCapacity: 3, vp: 5, power: "draw_card" },
  { id: 27, name: "Great Blue Heron",    habitat: "wetland",   cost: 4, eggCapacity: 2, vp: 6, power: "extra_vp" },
  { id: 28, name: "Common Loon",         habitat: "wetland",   cost: 3, eggCapacity: 3, vp: 5, power: "draw_card" },
  { id: 29, name: "American Coot",       habitat: "wetland",   cost: 1, eggCapacity: 3, vp: 2, power: "draw_card" },
  { id: 30, name: "Canada Goose",        habitat: "wetland",   cost: 2, eggCapacity: 5, vp: 4, power: "lay_egg" },
  { id: 31, name: "Snowy Egret",         habitat: "wetland",   cost: 2, eggCapacity: 3, vp: 4, power: "draw_card" },
  { id: 32, name: "Hooded Merganser",    habitat: "wetland",   cost: 2, eggCapacity: 3, vp: 3, power: "gain_food" },
  { id: 33, name: "Bald Eagle",          habitat: "wetland",   cost: 5, eggCapacity: 2, vp: 8, power: "tuck_bird" },
  { id: 34, name: "Pied-Billed Grebe",   habitat: "wetland",   cost: 1, eggCapacity: 3, vp: 2, power: "draw_card" },
  { id: 35, name: "Tundra Swan",         habitat: "wetland",   cost: 4, eggCapacity: 4, vp: 6, power: "cache_food" },
];

export const TOTAL_BIRDS = BIRD_DEFS.length;

export function getBird(id: number): BirdCard | undefined {
  return BIRD_DEFS[id];
}

// -----------------------------------------------------------------------------
// End-of-round bonus tiles
// -----------------------------------------------------------------------------

export type BonusTileKind =
  | "most_forest"      // Most birds played in Forest
  | "most_eggs"        // Most eggs on board
  | "most_hand"        // Most cards in hand
  | "most_wetland_vp"; // Highest sum of VP on Wetland row

export const BONUS_TILES: readonly { kind: BonusTileKind; label: string; first: number; second: number }[] = [
  { kind: "most_forest",     label: "Most Birds in Forest",   first: 5, second: 2 },
  { kind: "most_eggs",       label: "Most Eggs on Board",     first: 5, second: 2 },
  { kind: "most_hand",       label: "Most Cards in Hand",     first: 5, second: 2 },
  { kind: "most_wetland_vp", label: "Most Wetland VP",        first: 5, second: 2 },
];

// -----------------------------------------------------------------------------
// State shape
// -----------------------------------------------------------------------------

/** A bird in play on a player's board. */
export interface PlayedBird {
  cardId: number;     // index into BIRD_DEFS
  eggs: number;       // current eggs on this bird
  cached: number;     // food cached on this bird (counts as VP at end)
  tucked: number;     // birds tucked under this one (1 VP each)
}

export interface PlayerState {
  /** Habitat rows. Each row is a list of birds (left → right). */
  forest: PlayedBird[];
  grassland: PlayedBird[];
  wetland: PlayedBird[];
  /** Cards in hand: bird-card ids. */
  hand: number[];
  /** Total food (generic). L-tier simplification — single pool. */
  food: number;
  /** Per-type display (we still track 5 types for flavor; powers gain generic). */
  foodByType: Record<FoodType, number>;
  /** Bonus tile points accumulated across round ends. */
  bonusPoints: number;
  /** Personal bonus card (single static slot). */
  bonusCard: BonusTileKind;
  /** Whether this seat is controlled by AI. */
  isCPU: boolean;
}

export type Phase = "playing" | "round_end" | "game_over";

export interface WingspanFullState {
  rngSeed: number;
  /** 0 = human, 1+ = CPU. */
  players: PlayerState[];
  /** Active player seat. */
  current: number;
  /** Round index, 0-based (0..ROUNDS-1). */
  round: number;
  /** Action-cubes remaining for the active player this round. */
  actionsLeft: number[];
  /** Deck of remaining bird-card ids. */
  deck: number[];
  /** Birdfeeder pool: per-type count. */
  feeder: Record<FoodType, number>;
  /** End-of-round bonus tiles (one per round, ordered). */
  bonusTiles: BonusTileKind[];
  /** Phase tag. */
  phase: Phase;
  /** Log of last action for UI feedback. */
  lastLog: string;
}

// -----------------------------------------------------------------------------
// Settings
// -----------------------------------------------------------------------------

export interface WingspanFullSettings {
  cpuCount: number; // 1..2
}

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export type WingspanFullAction =
  | { type: "play_bird"; cardId: number; habitat: Habitat }
  | { type: "use_habitat"; habitat: Habitat }
  | { type: "cpu_step" }
  | { type: "advance_round" };

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function newPlayer(rng: () => number, isCPU: boolean, deck: number[]): { p: PlayerState; deck: number[] } {
  // Draw STARTING_HAND_SIZE cards
  const hand: number[] = [];
  const next = deck.slice();
  for (let i = 0; i < STARTING_HAND_SIZE && next.length > 0; i++) {
    hand.push(next.pop() as number);
  }
  // Pick random bonus card
  const tiles = BONUS_TILES.map((t) => t.kind);
  const bonus = tiles[Math.floor(rng() * tiles.length)] ?? "most_eggs";
  return {
    p: {
      forest: [],
      grassland: [],
      wetland: [],
      hand,
      food: STARTING_FOOD,
      foodByType: { worm: 1, grain: 1, fruit: 1, fish: 1, rodent: 1 },
      bonusPoints: 0,
      bonusCard: bonus,
      isCPU,
    },
    deck: next,
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

function rowOf(p: PlayerState, h: Habitat): PlayedBird[] {
  if (h === "forest") return p.forest;
  if (h === "grassland") return p.grassland;
  return p.wetland;
}

function withRow(p: PlayerState, h: Habitat, next: PlayedBird[]): PlayerState {
  if (h === "forest") return { ...p, forest: next };
  if (h === "grassland") return { ...p, grassland: next };
  return { ...p, wetland: next };
}

/** Activate a habitat: emit base reward + each bird's power on that row.
 *  Returns the updated player + a log line. */
function activateHabitat(p: PlayerState, h: Habitat, deck: number[], rng: () => number): { p: PlayerState; deck: number[]; log: string } {
  const row = rowOf(p, h);
  const baseAmount = row.length + 1; // base reward
  let np: PlayerState = { ...p };
  let log = "";
  if (h === "forest") {
    np = { ...np, food: np.food + baseAmount };
    log = `+${baseAmount} food`;
  } else if (h === "grassland") {
    // Lay eggs across this row's birds (left to right) up to baseAmount
    let toLay = baseAmount;
    const next = row.map((b) => {
      if (toLay > 0 && b.eggs < (getBird(b.cardId)?.eggCapacity ?? 0)) {
        toLay -= 1;
        return { ...b, eggs: b.eggs + 1 };
      }
      return b;
    });
    np = withRow(np, "grassland", next);
    log = `laid ${baseAmount - toLay} egg(s)`;
  } else {
    // Draw cards
    let drew = 0;
    let nd = deck.slice();
    const newHand = np.hand.slice();
    for (let i = 0; i < baseAmount && nd.length > 0; i++) {
      newHand.push(nd.pop() as number);
      drew += 1;
    }
    np = { ...np, hand: newHand };
    deck = nd;
    log = `drew ${drew} card(s)`;
  }
  // Trigger bird powers on this row (right → left as per Wingspan).
  const triggeredRow = rowOf(np, h);
  let powerLog = "";
  for (let i = triggeredRow.length - 1; i >= 0; i--) {
    const b = triggeredRow[i] as PlayedBird;
    const card = getBird(b.cardId);
    if (!card) continue;
    if (card.power === "gain_food") {
      np = { ...np, food: np.food + 1 };
      powerLog += " · gain";
    } else if (card.power === "draw_card") {
      if (deck.length > 0) {
        const nd = deck.slice();
        const hand = np.hand.slice();
        hand.push(nd.pop() as number);
        np = { ...np, hand };
        deck = nd;
        powerLog += " · draw";
      }
    } else if (card.power === "lay_egg") {
      const r = rowOf(np, card.habitat);
      const idx = r.findIndex((bb) => bb.cardId === b.cardId && bb.eggs < (getBird(bb.cardId)?.eggCapacity ?? 0));
      if (idx >= 0) {
        const updated = r.slice();
        const target = updated[idx] as PlayedBird;
        updated[idx] = { ...target, eggs: target.eggs + 1 };
        np = withRow(np, card.habitat, updated);
        powerLog += " · egg";
      }
    } else if (card.power === "tuck_bird") {
      if (np.hand.length > 0) {
        // Tuck one card from hand under this bird (cheapest)
        const handCopy = np.hand.slice();
        handCopy.sort((a, c) => (getBird(a)?.cost ?? 0) - (getBird(c)?.cost ?? 0));
        handCopy.shift();
        // Find this bird in its row and bump tucked
        const r = rowOf(np, card.habitat);
        const idx = r.findIndex((bb) => bb.cardId === b.cardId);
        if (idx >= 0) {
          const updated = r.slice();
          const target = updated[idx] as PlayedBird;
          updated[idx] = { ...target, tucked: target.tucked + 1 };
          np = withRow({ ...np, hand: handCopy }, card.habitat, updated);
          powerLog += " · tuck";
        }
      }
    } else if (card.power === "cache_food") {
      if (np.food > 0) {
        const r = rowOf(np, card.habitat);
        const idx = r.findIndex((bb) => bb.cardId === b.cardId);
        if (idx >= 0) {
          const updated = r.slice();
          const target = updated[idx] as PlayedBird;
          updated[idx] = { ...target, cached: target.cached + 1 };
          np = withRow({ ...np, food: np.food - 1 }, card.habitat, updated);
          powerLog += " · cache";
        }
      }
    }
    // extra_vp: passive, no trigger.
  }
  // Use rng to occasionally tickle the per-type food display.
  if (h === "forest" && Math.floor(rng() * 5) === 0) {
    const idx = Math.floor(rng() * FOOD_TYPES.length);
    const ft = FOOD_TYPES[idx] as FoodType;
    np = { ...np, foodByType: { ...np.foodByType, [ft]: np.foodByType[ft] + 1 } };
  }
  return { p: np, deck, log: log + powerLog };
}

/** Score helper: VP from birds + eggs + cached + tucked + bonusPoints. */
export function scorePlayer(p: PlayerState): number {
  const rows: PlayedBird[] = [...p.forest, ...p.grassland, ...p.wetland];
  let vp = 0;
  let eggs = 0;
  let cached = 0;
  let tucked = 0;
  for (const b of rows) {
    const card = getBird(b.cardId);
    vp += card?.vp ?? 0;
    eggs += b.eggs;
    cached += b.cached;
    tucked += b.tucked;
  }
  return vp + eggs + cached + tucked + p.bonusPoints;
}

/** Compute per-player bonus from a single tile kind. */
function tileMetric(p: PlayerState, kind: BonusTileKind): number {
  if (kind === "most_forest") return p.forest.length;
  if (kind === "most_eggs") {
    let e = 0;
    for (const b of [...p.forest, ...p.grassland, ...p.wetland]) e += b.eggs;
    return e;
  }
  if (kind === "most_hand") return p.hand.length;
  // most_wetland_vp
  let v = 0;
  for (const b of p.wetland) v += getBird(b.cardId)?.vp ?? 0;
  return v;
}

/** Award the round's bonus tile (top scores 5, runner-up 2). */
function awardRoundBonus(players: PlayerState[], kind: BonusTileKind): PlayerState[] {
  const tile = BONUS_TILES.find((t) => t.kind === kind);
  if (!tile) return players;
  const scores = players.map((p, i) => ({ i, score: tileMetric(p, kind) }));
  scores.sort((a, b) => b.score - a.score);
  const out = players.map((p) => ({ ...p }));
  if (scores.length >= 1 && (scores[0] as { score: number }).score > 0) {
    const first = scores[0] as { i: number; score: number };
    // Ties for first split the first-place reward by count.
    const tiedFirst = scores.filter((s) => s.score === first.score);
    const award = Math.floor(tile.first / tiedFirst.length);
    for (const s of tiedFirst) {
      const target = out[s.i] as PlayerState;
      target.bonusPoints += award;
    }
    if (tiedFirst.length === 1 && scores.length >= 2) {
      const second = scores[1] as { i: number; score: number };
      if (second.score > 0) {
        const tiedSecond = scores.filter((s) => s.score === second.score);
        const award2 = Math.floor(tile.second / tiedSecond.length);
        for (const s of tiedSecond) {
          const target = out[s.i] as PlayerState;
          target.bonusPoints += award2;
        }
      }
    }
  }
  return out;
}

// -----------------------------------------------------------------------------
// initialState
// -----------------------------------------------------------------------------

export function initialState(seed: number, settings: WingspanFullSettings): WingspanFullState {
  const rng = mulberry32(seed >>> 0);
  // Build & shuffle deck of all bird-card ids.
  let deck = shuffle(BIRD_DEFS.map((b) => b.id), rng);
  const cpuCount = Math.max(1, Math.min(2, settings.cpuCount | 0 || 2));
  const players: PlayerState[] = [];
  // Human at seat 0, then CPUs.
  for (let i = 0; i <= cpuCount; i++) {
    const { p, deck: nextDeck } = newPlayer(rng, i > 0, deck);
    players.push(p);
    deck = nextDeck;
  }
  // Determine bonus tiles (one per round, drawn from BONUS_TILES, can repeat).
  const tiles: BonusTileKind[] = [];
  for (let r = 0; r < ROUNDS; r++) {
    const t = BONUS_TILES[Math.floor(rng() * BONUS_TILES.length)] as { kind: BonusTileKind };
    tiles.push(t.kind);
  }
  // Initialize action cubes for round 0.
  const actionsLeft = players.map(() => ACTIONS_PER_ROUND[0] as number);
  return {
    rngSeed: Math.floor(rng() * 2 ** 31),
    players,
    current: 0,
    round: 0,
    actionsLeft,
    deck,
    feeder: { worm: 2, grain: 2, fruit: 2, fish: 2, rodent: 2 },
    bonusTiles: tiles,
    phase: "playing",
    lastLog: "",
  };
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

function advanceTurn(state: WingspanFullState): WingspanFullState {
  // Advance to next player who still has actions. If nobody has actions, end the round.
  const N = state.players.length;
  let next = (state.current + 1) % N;
  for (let tries = 0; tries < N; tries++) {
    if ((state.actionsLeft[next] ?? 0) > 0) {
      return { ...state, current: next };
    }
    next = (next + 1) % N;
  }
  // No player has actions remaining → round end.
  return endRound(state);
}

function endRound(state: WingspanFullState): WingspanFullState {
  // Award current-round bonus tile.
  const tile = state.bonusTiles[state.round];
  let players = state.players;
  if (tile !== undefined) {
    players = awardRoundBonus(players, tile);
  }
  // Last round? End the game.
  if (state.round + 1 >= ROUNDS) {
    return { ...state, players, phase: "game_over", lastLog: "Final round complete." };
  }
  // Otherwise show round-end phase.
  return { ...state, players, phase: "round_end", lastLog: `Round ${state.round + 1} complete.` };
}

function startNextRound(state: WingspanFullState): WingspanFullState {
  const r = state.round + 1;
  const cubes = ACTIONS_PER_ROUND[r] ?? 0;
  return {
    ...state,
    round: r,
    actionsLeft: state.players.map(() => cubes),
    current: 0,
    phase: "playing",
    lastLog: `Round ${r + 1} begins.`,
  };
}

export function cpuChooseAction(state: WingspanFullState, seat: number): WingspanFullAction {
  const p = state.players[seat];
  if (!p) return { type: "use_habitat", habitat: "forest" };
  // Greedy: find the highest-VP bird in hand we can afford.
  let bestId = -1;
  let bestVp = -1;
  for (const id of p.hand) {
    const card = getBird(id);
    if (!card) continue;
    const row = rowOf(p, card.habitat);
    if (row.length >= HABITAT_SLOTS) continue;
    if (card.cost > p.food) continue;
    if (card.vp > bestVp) {
      bestVp = card.vp;
      bestId = id;
    }
  }
  if (bestId >= 0) {
    const card = getBird(bestId) as BirdCard;
    return { type: "play_bird", cardId: bestId, habitat: card.habitat };
  }
  // Else activate the habitat with the most birds. Tie-break: Forest > Wetland > Grassland.
  const counts: Array<{ h: Habitat; n: number; tie: number }> = [
    { h: "forest", n: p.forest.length, tie: 3 },
    { h: "wetland", n: p.wetland.length, tie: 2 },
    { h: "grassland", n: p.grassland.length, tie: 1 },
  ];
  counts.sort((a, b) => (b.n - a.n) || (b.tie - a.tie));
  const top = counts[0] as { h: Habitat };
  return { type: "use_habitat", habitat: top.h };
}

export function reducer(state: WingspanFullState, action: WingspanFullAction): WingspanFullState {
  if (state.phase === "game_over") return state;

  if (action.type === "advance_round") {
    if (state.phase !== "round_end") return state;
    return startNextRound(state);
  }

  if (state.phase === "round_end") return state;

  if (action.type === "cpu_step") {
    const p = state.players[state.current];
    if (!p || !p.isCPU) return state;
    if ((state.actionsLeft[state.current] ?? 0) <= 0) return advanceTurn(state);
    const chosen = cpuChooseAction(state, state.current);
    return reducer(state, chosen);
  }

  // Active player must have actions.
  const seat = state.current;
  if ((state.actionsLeft[seat] ?? 0) <= 0) {
    return advanceTurn(state);
  }
  const player = state.players[seat];
  if (!player) return state;

  if (action.type === "play_bird") {
    const card = getBird(action.cardId);
    if (!card) return state;
    if (card.habitat !== action.habitat) return state;
    if (!player.hand.includes(action.cardId)) return state;
    if (card.cost > player.food) return state;
    const row = rowOf(player, action.habitat);
    if (row.length >= HABITAT_SLOTS) return state;
    // Pay cost, remove from hand, place on row.
    const newHand = player.hand.slice();
    const handIdx = newHand.indexOf(action.cardId);
    newHand.splice(handIdx, 1);
    const newRow = row.concat([{ cardId: action.cardId, eggs: 0, cached: 0, tucked: 0 }]);
    const np: PlayerState = withRow({ ...player, hand: newHand, food: player.food - card.cost }, action.habitat, newRow);
    const newPlayers = state.players.slice();
    newPlayers[seat] = np;
    const actionsLeft = state.actionsLeft.slice();
    actionsLeft[seat] = (actionsLeft[seat] ?? 0) - 1;
    const after: WingspanFullState = {
      ...state,
      players: newPlayers,
      actionsLeft,
      lastLog: `${seat === 0 ? "You" : `CPU ${seat}`} played ${card.name}.`,
    };
    return advanceTurn(after);
  }

  if (action.type === "use_habitat") {
    const rng = mulberry32(state.rngSeed);
    const { p: np, deck: newDeck, log } = activateHabitat(player, action.habitat, state.deck, rng);
    const newPlayers = state.players.slice();
    newPlayers[seat] = np;
    const actionsLeft = state.actionsLeft.slice();
    actionsLeft[seat] = (actionsLeft[seat] ?? 0) - 1;
    const after: WingspanFullState = {
      ...state,
      players: newPlayers,
      deck: newDeck,
      actionsLeft,
      rngSeed: Math.floor(rng() * 2 ** 31),
      lastLog: `${seat === 0 ? "You" : `CPU ${seat}`} used ${action.habitat}: ${log}.`,
    };
    return advanceTurn(after);
  }

  return state;
}

// -----------------------------------------------------------------------------
// isTerminal
// -----------------------------------------------------------------------------

export function isTerminal(state: WingspanFullState): { score: number } | null {
  if (state.phase !== "game_over") return null;
  const human = state.players[0];
  if (!human) return { score: 0 };
  const humanScore = scorePlayer(human);
  // Win condition: human beats all CPUs. Report humanScore as the score, but
  // zero out if not a victory.
  let bestRival = 0;
  for (let i = 1; i < state.players.length; i++) {
    const cpu = state.players[i] as PlayerState;
    bestRival = Math.max(bestRival, scorePlayer(cpu));
  }
  if (humanScore <= bestRival) return { score: 0 };
  return { score: humanScore };
}
