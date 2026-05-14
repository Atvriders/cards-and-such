import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * 7 Wonders (Full) — 4-player edition: 1 human + 3 CPUs.
 *
 * Three Ages. Each Age every player is dealt 7 cards, and on each round they
 * pick exactly one card from their current hand and pass the rest to the
 * neighbour (left in Ages I and III, right in Age II). Picked cards are
 * either built into the player's tableau, sacrificed to construct the next
 * stage of their Wonder, or discarded for 3 coins.
 *
 * After all 7 cards of an Age are picked, military combat resolves: each
 * player compares their shield total (red cards) with each of their two
 * neighbours. Winner gains victory tokens (1 in Age I, 3 in Age II, 5 in
 * Age III); loser receives a -1 defeat token. Then the next Age starts.
 *
 * After Age III, final scoring is summed:
 *   Military (sum of tokens) + Treasury/3 + Civilian VP (blue) +
 *   Commerce (yellow, simplified) + Wonder stage VP + Science sets +
 *   Guilds (purple, simplified — non-neighbour rules omitted).
 *
 * SIMPLIFICATIONS (per L-tier brief — "advanced rules omitted"):
 *  - Resource costs are abstracted: each card lists a numeric build cost in
 *    "production points". Brown/grey cards in your tableau contribute
 *    production. You can ALWAYS afford a card if your production >= cost
 *    OR if you have at least (cost - production) coins to "trade" with
 *    neighbours at 2 coins per missing unit (auto-resolved). No actual
 *    neighbour-trading negotiation.
 *  - Chain construction (build X for free if you have Y) is omitted.
 *  - Guild scoring counts only the player's own tableau, not neighbours.
 *  - Wonder stages cost a flat amount of production points and grant a
 *    fixed VP/coin/military/science effect per wonder.
 *  - There are 49 unique cards generated procedurally per Age (one per
 *    player slot × 7 rounds) drawn from a categorised pool.
 */

export const NUM_PLAYERS = 4;
export const HAND_SIZE = 7;
export const NUM_AGES = 3;
export const DISCARD_COINS = 3;
export const TRADE_COST_PER_UNIT = 2;
export const STARTING_COINS = 3;

/** Defeat tokens are worth -1 each. Win tokens per age: I=1, II=3, III=5. */
export const MILITARY_WIN_VP: readonly number[] = [1, 3, 5];
export const MILITARY_LOSS_VP = -1;

export type CardColor =
  | "brown"   // raw resource
  | "grey"    // manufactured good
  | "yellow"  // commerce
  | "red"     // military
  | "blue"    // civilian VP
  | "green"   // science
  | "purple"; // guild (Age III)

export type ScienceSymbol = "tablet" | "compass" | "gear";

export interface Card {
  /** Unique stable id within an age (e.g. "I-3" or "III-12"). */
  id: string;
  name: string;
  color: CardColor;
  age: 1 | 2 | 3;
  /** Production points required to build (simplified resource cost). */
  cost: number;
  /** Brown/grey cards produce this many production points. */
  produces: number;
  /** Coins gained immediately when played (yellow). */
  coins: number;
  /** Victory points awarded at end of game from this card directly. */
  vp: number;
  /** Shields (military strength, red). */
  shields: number;
  /** Science symbol granted (green). */
  science: ScienceSymbol | null;
  /** If true (purple guilds), the card scores a flat 5 VP at end of game. */
  guild: boolean;
}

/** Wonder definitions — one fixed effect per stage. */
export interface WonderStage {
  cost: number;
  vp: number;
  coins: number;
  shields: number;
  scienceWild: boolean; // if true, grants +1 of best science symbol at end
}

export interface Wonder {
  id: string;
  name: string;
  stages: WonderStage[];
}

export const WONDERS: Wonder[] = [
  {
    id: "giza",
    name: "Giza",
    stages: [
      { cost: 2, vp: 3, coins: 0, shields: 0, scienceWild: false },
      { cost: 3, vp: 5, coins: 0, shields: 0, scienceWild: false },
      { cost: 4, vp: 7, coins: 0, shields: 0, scienceWild: false },
    ],
  },
  {
    id: "rhodes",
    name: "Rhodes",
    stages: [
      { cost: 2, vp: 3, coins: 0, shields: 0, scienceWild: false },
      { cost: 3, vp: 0, coins: 3, shields: 2, scienceWild: false },
      { cost: 4, vp: 7, coins: 0, shields: 0, scienceWild: false },
    ],
  },
  {
    id: "alexandria",
    name: "Alexandria",
    stages: [
      { cost: 2, vp: 3, coins: 0, shields: 0, scienceWild: false },
      { cost: 3, vp: 0, coins: 3, shields: 0, scienceWild: false },
      { cost: 4, vp: 0, coins: 0, shields: 0, scienceWild: true },
    ],
  },
  {
    id: "babylon",
    name: "Babylon",
    stages: [
      { cost: 2, vp: 3, coins: 0, shields: 0, scienceWild: false },
      { cost: 3, vp: 0, coins: 0, shields: 0, scienceWild: true },
      { cost: 4, vp: 7, coins: 0, shields: 0, scienceWild: false },
    ],
  },
  {
    id: "olympia",
    name: "Olympia",
    stages: [
      { cost: 2, vp: 3, coins: 0, shields: 0, scienceWild: false },
      { cost: 3, vp: 5, coins: 0, shields: 0, scienceWild: false },
      { cost: 4, vp: 7, coins: 0, shields: 0, scienceWild: false },
    ],
  },
  {
    id: "halicarnassus",
    name: "Halicarnassus",
    stages: [
      { cost: 2, vp: 2, coins: 3, shields: 0, scienceWild: false },
      { cost: 3, vp: 1, coins: 0, shields: 0, scienceWild: false },
      { cost: 4, vp: 7, coins: 0, shields: 0, scienceWild: false },
    ],
  },
  {
    id: "ephesus",
    name: "Ephesus",
    stages: [
      { cost: 2, vp: 3, coins: 0, shields: 0, scienceWild: false },
      { cost: 3, vp: 0, coins: 9, shields: 0, scienceWild: false },
      { cost: 4, vp: 7, coins: 0, shields: 0, scienceWild: false },
    ],
  },
];

export interface PlayerState {
  seat: number;
  name: string;
  wonderIdx: number;
  stagesBuilt: number; // 0..3
  hand: Card[];
  tableau: Card[];
  coins: number;
  shields: number;
  militaryTokens: number[]; // raw tokens collected (one per resolution)
  /** -1 if not yet decided for the round; otherwise the index into hand. */
  pendingCardIdx: number;
  /** Pending action chosen with the card. */
  pendingAction: "play" | "wonder" | "discard" | null;
  isCpu: boolean;
}

export type Phase =
  | "playing"      // picking + revealing cards for the current age round
  | "military"     // resolving military between ages (transient phase)
  | "scoring"     // final scoring computed
  | "done";

export interface SevenWondersFullState {
  rngSeed: number;
  age: 1 | 2 | 3;
  round: number; // 1..7 within an age (1-indexed)
  phase: Phase;
  players: PlayerState[];
  /** Each player's score, summed at game end. */
  finalScore: number[];
  /** Final score for the human player (seat 0); also used for isTerminal. */
  humanFinalScore: number;
  /** Log of recent events (rotated; up to ~10 entries). */
  log: string[];
}

export interface SevenWondersFullSettings {
  _dummy?: boolean;
}

// --- Card pool definitions (simplified per age) ---------------------------

interface CardBlueprint {
  name: string;
  color: CardColor;
  cost: number;
  produces?: number;
  coins?: number;
  vp?: number;
  shields?: number;
  science?: ScienceSymbol;
  guild?: boolean;
}

const AGE1_POOL: CardBlueprint[] = [
  { name: "Lumber Yard", color: "brown", cost: 0, produces: 1 },
  { name: "Stone Pit", color: "brown", cost: 0, produces: 1 },
  { name: "Clay Pool", color: "brown", cost: 0, produces: 1 },
  { name: "Ore Vein", color: "brown", cost: 0, produces: 1 },
  { name: "Timber Yard", color: "brown", cost: 1, produces: 2 },
  { name: "Excavation", color: "brown", cost: 1, produces: 2 },
  { name: "Loom", color: "grey", cost: 1, produces: 1 },
  { name: "Glassworks", color: "grey", cost: 1, produces: 1 },
  { name: "Press", color: "grey", cost: 1, produces: 1 },
  { name: "Tavern", color: "yellow", cost: 0, coins: 5 },
  { name: "East Trading Post", color: "yellow", cost: 0, coins: 2 },
  { name: "West Trading Post", color: "yellow", cost: 0, coins: 2 },
  { name: "Marketplace", color: "yellow", cost: 0, coins: 3 },
  { name: "Stockade", color: "red", cost: 1, shields: 1 },
  { name: "Barracks", color: "red", cost: 2, shields: 1 },
  { name: "Guard Tower", color: "red", cost: 1, shields: 1 },
  { name: "Altar", color: "blue", cost: 0, vp: 2 },
  { name: "Baths", color: "blue", cost: 1, vp: 3 },
  { name: "Theater", color: "blue", cost: 0, vp: 2 },
  { name: "Apothecary", color: "green", cost: 1, science: "compass" },
  { name: "Workshop", color: "green", cost: 1, science: "gear" },
  { name: "Scriptorium", color: "green", cost: 0, science: "tablet" },
];

const AGE2_POOL: CardBlueprint[] = [
  { name: "Sawmill", color: "brown", cost: 1, produces: 2 },
  { name: "Quarry", color: "brown", cost: 1, produces: 2 },
  { name: "Brickyard", color: "brown", cost: 1, produces: 2 },
  { name: "Foundry", color: "brown", cost: 1, produces: 2 },
  { name: "Loom (II)", color: "grey", cost: 1, produces: 2 },
  { name: "Glassworks (II)", color: "grey", cost: 1, produces: 2 },
  { name: "Press (II)", color: "grey", cost: 1, produces: 2 },
  { name: "Forum", color: "yellow", cost: 2, coins: 3 },
  { name: "Caravansery", color: "yellow", cost: 2, coins: 3 },
  { name: "Vineyard", color: "yellow", cost: 0, coins: 4 },
  { name: "Bazar", color: "yellow", cost: 0, coins: 4 },
  { name: "Walls", color: "red", cost: 3, shields: 2 },
  { name: "Training Ground", color: "red", cost: 3, shields: 2 },
  { name: "Stables", color: "red", cost: 2, shields: 2 },
  { name: "Archery Range", color: "red", cost: 3, shields: 2 },
  { name: "Aqueduct", color: "blue", cost: 3, vp: 5 },
  { name: "Temple", color: "blue", cost: 2, vp: 3 },
  { name: "Statue", color: "blue", cost: 2, vp: 4 },
  { name: "Courthouse", color: "blue", cost: 3, vp: 4 },
  { name: "Dispensary", color: "green", cost: 2, science: "compass" },
  { name: "Laboratory", color: "green", cost: 2, science: "gear" },
  { name: "Library", color: "green", cost: 2, science: "tablet" },
  { name: "School", color: "green", cost: 1, science: "tablet" },
];

const AGE3_POOL: CardBlueprint[] = [
  { name: "Pantheon", color: "blue", cost: 4, vp: 7 },
  { name: "Gardens", color: "blue", cost: 3, vp: 5 },
  { name: "Town Hall", color: "blue", cost: 4, vp: 6 },
  { name: "Palace", color: "blue", cost: 5, vp: 8 },
  { name: "Senate", color: "blue", cost: 3, vp: 6 },
  { name: "Haven", color: "yellow", cost: 2, coins: 4 },
  { name: "Lighthouse", color: "yellow", cost: 2, coins: 4 },
  { name: "Chamber of Commerce", color: "yellow", cost: 2, coins: 5 },
  { name: "Arena", color: "yellow", cost: 3, coins: 5 },
  { name: "Fortifications", color: "red", cost: 4, shields: 3 },
  { name: "Circus", color: "red", cost: 3, shields: 3 },
  { name: "Arsenal", color: "red", cost: 4, shields: 3 },
  { name: "Siege Workshop", color: "red", cost: 4, shields: 3 },
  { name: "Lodge", color: "green", cost: 3, science: "compass" },
  { name: "Observatory", color: "green", cost: 3, science: "gear" },
  { name: "University", color: "green", cost: 3, science: "tablet" },
  { name: "Academy", color: "green", cost: 3, science: "compass" },
  { name: "Study", color: "green", cost: 2, science: "gear" },
  { name: "Workers Guild", color: "purple", cost: 4, guild: true, vp: 5 },
  { name: "Craftsmens Guild", color: "purple", cost: 4, guild: true, vp: 5 },
  { name: "Magistrates Guild", color: "purple", cost: 4, guild: true, vp: 5 },
  { name: "Builders Guild", color: "purple", cost: 4, guild: true, vp: 5 },
  { name: "Philosophers Guild", color: "purple", cost: 4, guild: true, vp: 5 },
];

function blueprintsForAge(age: 1 | 2 | 3): CardBlueprint[] {
  if (age === 1) return AGE1_POOL;
  if (age === 2) return AGE2_POOL;
  return AGE3_POOL;
}

function makeCard(bp: CardBlueprint, age: 1 | 2 | 3, idx: number): Card {
  return {
    id: `${age}-${idx}`,
    name: bp.name,
    color: bp.color,
    age,
    cost: bp.cost,
    produces: bp.produces ?? 0,
    coins: bp.coins ?? 0,
    vp: bp.vp ?? 0,
    shields: bp.shields ?? 0,
    science: bp.science ?? null,
    guild: bp.guild ?? false,
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

/** Build a fresh deck for the given age: NUM_PLAYERS × HAND_SIZE cards. */
export function buildDeck(age: 1 | 2 | 3, rng: () => number): Card[] {
  const pool = blueprintsForAge(age);
  const needed = NUM_PLAYERS * HAND_SIZE; // 28
  const shuffledPool = shuffle(pool, rng);
  const cards: Card[] = [];
  for (let i = 0; i < needed; i++) {
    const bp = shuffledPool[i % shuffledPool.length] as CardBlueprint;
    cards.push(makeCard(bp, age, i));
  }
  return shuffle(cards, rng);
}

function dealHands(deck: Card[]): Card[][] {
  const hands: Card[][] = [];
  for (let p = 0; p < NUM_PLAYERS; p++) {
    hands.push(deck.slice(p * HAND_SIZE, (p + 1) * HAND_SIZE));
  }
  return hands;
}

export function initialState(seed: number, _s: SevenWondersFullSettings): SevenWondersFullState {
  void _s;
  const rng = mulberry32(seed >>> 0);
  // Deterministic wonder assignment: shuffle wonder ids by seed, give each
  // player a unique wonder.
  const wonderOrder = shuffle(WONDERS.map((_, i) => i), rng);
  const deck = buildDeck(1, rng);
  const hands = dealHands(deck);

  const players: PlayerState[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    players.push({
      seat: i,
      name: i === 0 ? "You" : `CPU ${i}`,
      wonderIdx: wonderOrder[i] ?? i,
      stagesBuilt: 0,
      hand: hands[i] ?? [],
      tableau: [],
      coins: STARTING_COINS,
      shields: 0,
      militaryTokens: [],
      pendingCardIdx: -1,
      pendingAction: null,
      isCpu: i !== 0,
    });
  }

  // Save next seed for further shuffles (military, future ages)
  const nextSeed = Math.floor(rng() * 2 ** 31);

  return {
    rngSeed: nextSeed,
    age: 1,
    round: 1,
    phase: "playing",
    players,
    finalScore: [0, 0, 0, 0],
    humanFinalScore: 0,
    log: [`Age I begins.`],
  };
}

// --- Action types ---------------------------------------------------------

export type SevenWondersFullAction =
  | { type: "selectCard"; cardIdx: number; action: "play" | "wonder" | "discard" }
  | { type: "resolveRound" }   // commit all selections, pass hands
  | { type: "resolveMilitary" } // run military combat between ages
  | { type: "score" };          // finalise scoring

// --- Helpers --------------------------------------------------------------

function logAppend(log: string[], msg: string): string[] {
  const next = log.slice();
  next.push(msg);
  if (next.length > 12) next.splice(0, next.length - 12);
  return next;
}

function totalProduction(p: PlayerState): number {
  let n = 0;
  for (const c of p.tableau) n += c.produces;
  return n;
}

/** Returns true if the player can afford `cost` production points, possibly
 *  by paying coins (2 per missing point) to neighbours. */
export function canAfford(p: PlayerState, cost: number): boolean {
  const prod = totalProduction(p);
  if (prod >= cost) return true;
  const missing = cost - prod;
  return p.coins >= missing * TRADE_COST_PER_UNIT;
}

/** Compute the trade-coin cost (paid to neighbours) when affording a card. */
export function tradeCost(p: PlayerState, cost: number): number {
  const prod = totalProduction(p);
  const missing = Math.max(0, cost - prod);
  return missing * TRADE_COST_PER_UNIT;
}

/** True if the named wonder stage can be built for the given player. */
export function canBuildWonderStage(p: PlayerState, wonder: Wonder): boolean {
  if (p.stagesBuilt >= wonder.stages.length) return false;
  const stage = wonder.stages[p.stagesBuilt];
  if (!stage) return false;
  return canAfford(p, stage.cost);
}

/** Apply a single player's chosen action immediately at end-of-round. */
function applyChosenAction(p: PlayerState, _allPlayers: PlayerState[]): PlayerState {
  void _allPlayers;
  if (p.pendingCardIdx < 0 || p.pendingAction === null) return p;
  const card = p.hand[p.pendingCardIdx];
  if (!card) return p;
  let next = { ...p };
  // Remove card from hand
  next.hand = p.hand.filter((_, i) => i !== p.pendingCardIdx);

  if (p.pendingAction === "discard") {
    next.coins = next.coins + DISCARD_COINS;
  } else if (p.pendingAction === "wonder") {
    const wonder = WONDERS[p.wonderIdx];
    if (wonder && p.stagesBuilt < wonder.stages.length) {
      const stage = wonder.stages[p.stagesBuilt];
      if (stage) {
        const tCost = tradeCost(p, stage.cost);
        next.coins = Math.max(0, next.coins - tCost);
        next.stagesBuilt = p.stagesBuilt + 1;
        next.coins = next.coins + stage.coins;
        next.shields = next.shields + stage.shields;
      }
    }
  } else if (p.pendingAction === "play") {
    const tCost = tradeCost(p, card.cost);
    next.coins = Math.max(0, next.coins - tCost);
    next.coins = next.coins + card.coins;
    next.shields = next.shields + card.shields;
    next.tableau = [...p.tableau, card];
  }

  next.pendingCardIdx = -1;
  next.pendingAction = null;
  return next;
}

/** Rotate hands among players. Age I/III pass left (seat+1), Age II right (seat-1). */
function rotateHands(players: PlayerState[], age: 1 | 2 | 3): PlayerState[] {
  const dir = age === 2 ? -1 : 1;
  const oldHands = players.map((p) => p.hand);
  return players.map((p, i) => {
    const fromIdx = (i - dir + NUM_PLAYERS) % NUM_PLAYERS;
    return { ...p, hand: oldHands[fromIdx] ?? [] };
  });
}

/** CPU heuristic: pick a card to play. Returns a valid pendingCardIdx + action. */
export function cpuChoose(p: PlayerState): { idx: number; action: "play" | "wonder" | "discard" } {
  if (p.hand.length === 0) return { idx: 0, action: "discard" };
  const wonder = WONDERS[p.wonderIdx];

  // Score every (card,action) pair.
  let bestIdx = 0;
  let bestAction: "play" | "wonder" | "discard" = "discard";
  let bestScore = -Infinity;

  // Priority weights tuned for green/blue/yellow/red chain.
  const colorWeight: Record<CardColor, number> = {
    green: 6,
    blue: 5,
    yellow: 3,
    red: 4,
    brown: 2,
    grey: 2,
    purple: 7,
  };

  for (let i = 0; i < p.hand.length; i++) {
    const card = p.hand[i];
    if (!card) continue;
    // Option: play card (if affordable).
    if (canAfford(p, card.cost)) {
      let s = colorWeight[card.color] + card.vp + card.shields + card.coins / 2;
      if (card.color === "green") {
        const symbolsOwned = p.tableau.filter((c) => c.science === card.science).length;
        s += symbolsOwned * 3;
      }
      s -= tradeCost(p, card.cost) * 0.5;
      if (s > bestScore) {
        bestScore = s;
        bestIdx = i;
        bestAction = "play";
      }
    }
    // Option: discard (worth ~3 coins → ~1 vp).
    const discardScore = 1;
    if (discardScore > bestScore) {
      bestScore = discardScore;
      bestIdx = i;
      bestAction = "discard";
    }
    // Option: wonder build (if affordable and stages left).
    if (wonder && canBuildWonderStage(p, wonder)) {
      const stage = wonder.stages[p.stagesBuilt];
      if (stage) {
        const s = 3 + stage.vp + stage.shields * 2 + stage.coins / 2 - tradeCost(p, stage.cost) * 0.5;
        if (s > bestScore) {
          bestScore = s;
          bestIdx = i;
          bestAction = "wonder";
        }
      }
    }
  }
  return { idx: bestIdx, action: bestAction };
}

/** Apply CPU decisions for any CPU players that haven't yet picked. */
function autoChooseCpus(players: PlayerState[]): PlayerState[] {
  return players.map((p) => {
    if (!p.isCpu) return p;
    if (p.pendingCardIdx >= 0 && p.pendingAction !== null) return p;
    const { idx, action } = cpuChoose(p);
    return { ...p, pendingCardIdx: idx, pendingAction: action };
  });
}

/** Resolve military combat at end of an age: each player vs both neighbours. */
function resolveMilitary(players: PlayerState[], age: 1 | 2 | 3): { players: PlayerState[]; lines: string[] } {
  const lines: string[] = [];
  const winVp = MILITARY_WIN_VP[age - 1] ?? 1;
  const updated = players.map((p) => ({ ...p, militaryTokens: p.militaryTokens.slice() }));
  for (let i = 0; i < NUM_PLAYERS; i++) {
    const left = (i + 1) % NUM_PLAYERS;
    const right = (i - 1 + NUM_PLAYERS) % NUM_PLAYERS;
    const me = updated[i];
    const lp = updated[left];
    const rp = updated[right];
    if (!me || !lp || !rp) continue;
    if (me.shields > lp.shields) me.militaryTokens.push(winVp);
    else if (me.shields < lp.shields) me.militaryTokens.push(MILITARY_LOSS_VP);
    if (me.shields > rp.shields) me.militaryTokens.push(winVp);
    else if (me.shields < rp.shields) me.militaryTokens.push(MILITARY_LOSS_VP);
  }
  for (const p of updated) {
    const total = p.militaryTokens.reduce((a, b) => a + b, 0);
    lines.push(`${p.name}: military ${total >= 0 ? "+" : ""}${total}`);
  }
  return { players: updated, lines };
}

/** Compute science VP using set bonuses (n² per symbol + sets-of-3). */
export function scienceScore(p: PlayerState): number {
  let tablet = 0, compass = 0, gear = 0;
  let wilds = 0;
  for (const c of p.tableau) {
    if (c.science === "tablet") tablet++;
    else if (c.science === "compass") compass++;
    else if (c.science === "gear") gear++;
  }
  const wonder = WONDERS[p.wonderIdx];
  if (wonder) {
    for (let s = 0; s < p.stagesBuilt; s++) {
      const stage = wonder.stages[s];
      if (stage && stage.scienceWild) wilds++;
    }
  }
  // Distribute wilds greedily to maximise score. With small bounds, brute-force.
  let best = 0;
  for (let a = 0; a <= wilds; a++) {
    for (let b = 0; b <= wilds - a; b++) {
      const c = wilds - a - b;
      const T = tablet + a;
      const C = compass + b;
      const G = gear + c;
      const sets = Math.min(T, C, G);
      const s = T * T + C * C + G * G + sets * 7;
      if (s > best) best = s;
    }
  }
  return best;
}

/** Compute the final score for a single player. */
export function computeFinalScore(p: PlayerState): number {
  let total = 0;
  // Military
  total += p.militaryTokens.reduce((a, b) => a + b, 0);
  // Treasury (1 VP per 3 coins)
  total += Math.floor(p.coins / 3);
  // Civilian (blue) + commerce/yellow VP via card.vp + guild flat
  for (const c of p.tableau) {
    if (c.color === "blue") total += c.vp;
    else if (c.color === "purple") total += c.vp; // simplified guild VP
    else if (c.color === "yellow") total += c.vp;
  }
  // Wonder stages
  const wonder = WONDERS[p.wonderIdx];
  if (wonder) {
    for (let s = 0; s < p.stagesBuilt; s++) {
      const stage = wonder.stages[s];
      if (stage) total += stage.vp;
    }
  }
  // Science
  total += scienceScore(p);
  return total;
}

// --- Reducer --------------------------------------------------------------

export function reducer(state: SevenWondersFullState, action: SevenWondersFullAction): SevenWondersFullState {
  if (state.phase === "done") return state;

  if (action.type === "selectCard") {
    if (state.phase !== "playing") return state;
    const human = state.players[0];
    if (!human) return state;
    if (action.cardIdx < 0 || action.cardIdx >= human.hand.length) return state;
    const card = human.hand[action.cardIdx];
    if (!card) return state;
    // Validate: play requires affordability; wonder requires stage availability + affordable cost
    const wonder = WONDERS[human.wonderIdx];
    if (action.action === "play" && !canAfford(human, card.cost)) return state;
    if (action.action === "wonder" && (!wonder || !canBuildWonderStage(human, wonder))) return state;

    const nextPlayers = state.players.slice();
    nextPlayers[0] = { ...human, pendingCardIdx: action.cardIdx, pendingAction: action.action };
    return { ...state, players: nextPlayers };
  }

  if (action.type === "resolveRound") {
    if (state.phase !== "playing") return state;
    // Force CPU picks for any not chosen.
    let players = autoChooseCpus(state.players);
    // If human still hasn't picked, refuse — must select first.
    const human = players[0];
    if (!human || human.pendingCardIdx < 0 || human.pendingAction === null) return state;
    // Apply each player's pending action.
    const applied = players.map((p) => applyChosenAction(p, players));
    // Log highlights
    let log = state.log;
    for (const p of applied) {
      const previous = players.find((q) => q.seat === p.seat);
      if (!previous) continue;
      const oldCard = previous.hand[previous.pendingCardIdx];
      if (oldCard && previous.pendingAction === "play") {
        log = logAppend(log, `${p.name} built ${oldCard.name}.`);
      } else if (previous.pendingAction === "wonder") {
        const w = WONDERS[p.wonderIdx];
        log = logAppend(log, `${p.name} built stage ${p.stagesBuilt} of ${w?.name ?? "Wonder"}.`);
      } else if (previous.pendingAction === "discard") {
        log = logAppend(log, `${p.name} discarded for coins.`);
      }
    }

    // Check whether age is over: hand size becomes <=1 (6 rounds happen on 7 cards).
    // The standard rule is 6 played, last is discarded automatically — for
    // simplicity we play all 7 (one per round), so age ends when round == HAND_SIZE.
    const isAgeOver = state.round >= HAND_SIZE;
    if (!isAgeOver) {
      const rotated = rotateHands(applied, state.age);
      return {
        ...state,
        players: rotated,
        round: state.round + 1,
        log,
      };
    }

    // Age over → resolve military as next state.
    return {
      ...state,
      players: applied,
      phase: "military",
      log: logAppend(log, `Age ${roman(state.age)} ends. Military combat...`),
    };
  }

  if (action.type === "resolveMilitary") {
    if (state.phase !== "military") return state;
    const { players, lines } = resolveMilitary(state.players, state.age);
    let log = state.log;
    for (const l of lines) log = logAppend(log, l);
    if (state.age === NUM_AGES) {
      // Game ends after Age III military.
      const finalScore = players.map(computeFinalScore);
      const human = finalScore[0] ?? 0;
      return {
        ...state,
        players,
        phase: "scoring",
        finalScore,
        humanFinalScore: human,
        log: logAppend(log, `Final scoring complete. You: ${human} VP.`),
      };
    }
    // Otherwise, start the next age: shuffle a new deck, deal new hands.
    const rng = mulberry32(state.rngSeed >>> 0);
    const nextAge = (state.age + 1) as 1 | 2 | 3;
    const deck = buildDeck(nextAge, rng);
    const hands = dealHands(deck);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const nextPlayers = players.map((p, i) => ({
      ...p,
      hand: hands[i] ?? [],
      pendingCardIdx: -1,
      pendingAction: null,
    }));
    return {
      ...state,
      players: nextPlayers,
      age: nextAge,
      round: 1,
      phase: "playing",
      rngSeed: nextSeed,
      log: logAppend(log, `Age ${roman(nextAge)} begins.`),
    };
  }

  if (action.type === "score") {
    if (state.phase !== "scoring") return state;
    return { ...state, phase: "done" };
  }

  return state;
}

function roman(n: number): string {
  return n === 1 ? "I" : n === 2 ? "II" : "III";
}

/** Game ends when the scoring/done phase has produced a humanFinalScore. */
export function isTerminal(state: SevenWondersFullState): { score: number } | null {
  if (state.phase !== "scoring" && state.phase !== "done") return null;
  // Score is the human's VP. Non-negative for win (per challenge: any score gets on leaderboard).
  return { score: Math.max(0, state.humanFinalScore) };
}

// --- Helpers for UI / tests ----------------------------------------------

export function getWonder(p: PlayerState): Wonder | undefined {
  return WONDERS[p.wonderIdx];
}
