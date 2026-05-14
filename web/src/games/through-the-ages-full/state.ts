import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Through the Ages (Full) — Vlaada Chvátil's civilization game, 4-player
 * scaffold: 1 human + 3 CPUs.
 *
 * Four Ages: A (Antiquity / setup), I (early game), II (mid game),
 * III (late game). On each player's turn they spend a pool of CIVIL actions
 * (white tokens) and MILITARY actions (red tokens):
 *
 *   Civil actions can:
 *     - take a card from the visible card row (paying its civil-action cost)
 *     - build/upgrade a building from cards in your tableau (pay stone)
 *     - levy 1 population from yellow bank → into available worker pool
 *     - increase food / stone production (build/upgrade)
 *     - play a leader or a wonder card from hand
 *
 *   Military actions can:
 *     - take a bonus or aggression card from the military row
 *     - levy 1 unit (assign a worker to military strength)
 *
 * The card row drains in age-order: age-A cards first, then I, II, III. When
 * the row empties between ages we restock from the next age's deck. The game
 * ends when the Age III deck is empty and the row drains.
 *
 * Resource model (simplified):
 *   - FOOD: produced each turn = food-production × 1; consumed = (population
 *     used as workers) × 1.
 *   - STONE: produced each turn = stone-production × 1; spent to build cards
 *     or wonders/leaders.
 *   - POPULATION: 0..8 free workers + 0..8 yellow bank reserve; "levy" moves
 *     reserve → free. "Assign" moves free → into a building card slot
 *     (raising production or military).
 *   - CULTURE (VP): scored continuously from blue+green cards' VP fields, +
 *     leaders, + wonders. Final scoring adds happiness gate (penalty if
 *     happiness < workers used).
 *
 * SIMPLIFICATIONS (XL-tier, see TODO at bottom):
 *   - Wonders are single-card flat-cost builds (no multi-step construction).
 *   - Leaders are simple +N VP / +N production cards.
 *   - No event deck / aggression cards beyond a stub "Aggression" red card
 *     that subtracts strength from a weaker neighbour.
 *   - Resource flow is per-yellow-token (1 unit per worker per turn) without
 *     blue-bank corruption or yellow-bank consumption ramps.
 *   - Civil & Military action token counts are FIXED per age (4/2 then 5/3,
 *     etc) rather than upgraded via Government cards.
 *   - Tactics, colonies, wars, pacts, defence, all omitted.
 *   - CPU strategy: greedy — buy the cheapest mil card if their strength is
 *     low, else cheapest civ card. Build any free buildings. Always end-turn.
 */

// ============================================================================
// Constants
// ============================================================================

export const NUM_PLAYERS = 4;
export const NUM_AGES = 4; // A=0, I=1, II=2, III=3
export const CARD_ROW_SIZE = 8;
export const STARTING_FOOD = 2;
export const STARTING_STONE = 2;
export const STARTING_POP = 3;
export const POP_BANK = 8;
export const STARTING_HAPPINESS = 0;
export const STARTING_CULTURE = 0;
export const STARTING_STRENGTH = 1;

/** Civil + military action tokens per age. */
export const CIVIL_TOKENS_BY_AGE: readonly number[] = [4, 4, 5, 5];
export const MILITARY_TOKENS_BY_AGE: readonly number[] = [2, 2, 3, 3];

/** End-of-age VP awarded based on military rank (highest..lowest). */
export const MIL_AGE_VP: readonly number[] = [3, 1, 0, -1];

// ============================================================================
// Card types
// ============================================================================

export type AgeIdx = 0 | 1 | 2 | 3;
export type CardKind =
  | "civ-building"   // tableau building: produces food/stone/science/strength
  | "civ-leader"     // one-shot: flat VP + production bonus
  | "civ-wonder"     // expensive flat-cost build for big VP/effects
  | "mil-bonus"      // raises strength or grants culture
  | "mil-aggression"; // damages a weaker neighbour

export type Resource = "food" | "stone" | "science" | "strength";

export interface Card {
  /** Unique stable id like "I-3" or "A-0". */
  id: string;
  name: string;
  age: AgeIdx;
  kind: CardKind;
  /** Civil-action cost (number of civil tokens) to take from row. 0 for free pickups. */
  civilCost: number;
  /** Stone cost to actually build/play after picking up. */
  stoneCost: number;
  /** Direct effect on take: which resource production it boosts (per pop). */
  produces: Resource | null;
  /** Production amount (resources per turn per worker). */
  productionAmount: number;
  /** Flat strength bonus (independent of pop). */
  strengthBonus: number;
  /** Flat culture (VP) awarded on play (for wonders/leaders). */
  cultureOnPlay: number;
  /** Recurring culture per turn from this card. */
  recurringCulture: number;
  /** Happiness modifier (for cards that grant +happy). */
  happiness: number;
}

// ============================================================================
// Card pool — small but coloured per age
// ============================================================================

interface Blueprint {
  name: string;
  kind: CardKind;
  civilCost: number;
  stoneCost?: number;
  produces?: Resource | null;
  productionAmount?: number;
  strengthBonus?: number;
  cultureOnPlay?: number;
  recurringCulture?: number;
  happiness?: number;
}

const AGE_A: Blueprint[] = [
  { name: "Agriculture", kind: "civ-building", civilCost: 1, produces: "food", productionAmount: 1 },
  { name: "Bronze", kind: "civ-building", civilCost: 1, produces: "stone", productionAmount: 1 },
  { name: "Philosophy", kind: "civ-building", civilCost: 1, produces: "science", productionAmount: 1 },
  { name: "Warriors", kind: "civ-building", civilCost: 1, produces: "strength", productionAmount: 1 },
  { name: "Hammurabi", kind: "civ-leader", civilCost: 1, cultureOnPlay: 2, recurringCulture: 1 },
  { name: "Pyramids", kind: "civ-wonder", civilCost: 2, stoneCost: 3, cultureOnPlay: 4 },
  { name: "Bonus Strength", kind: "mil-bonus", civilCost: 1, strengthBonus: 1, cultureOnPlay: 1 },
];

const AGE_I: Blueprint[] = [
  { name: "Irrigation", kind: "civ-building", civilCost: 1, produces: "food", productionAmount: 2 },
  { name: "Masonry", kind: "civ-building", civilCost: 1, produces: "stone", productionAmount: 2 },
  { name: "Printing Press", kind: "civ-building", civilCost: 1, produces: "science", productionAmount: 2 },
  { name: "Swordsmen", kind: "civ-building", civilCost: 1, produces: "strength", productionAmount: 2 },
  { name: "Aristotle", kind: "civ-leader", civilCost: 2, cultureOnPlay: 3, recurringCulture: 1 },
  { name: "Hanging Gardens", kind: "civ-wonder", civilCost: 2, stoneCost: 4, cultureOnPlay: 6, happiness: 2 },
  { name: "Heroic Charge", kind: "mil-bonus", civilCost: 1, strengthBonus: 2, cultureOnPlay: 1 },
  { name: "Raid", kind: "mil-aggression", civilCost: 1, strengthBonus: 0, cultureOnPlay: 3 },
];

const AGE_II: Blueprint[] = [
  { name: "Selective Breeding", kind: "civ-building", civilCost: 2, produces: "food", productionAmount: 3 },
  { name: "Cast Iron", kind: "civ-building", civilCost: 2, produces: "stone", productionAmount: 3 },
  { name: "Scientific Method", kind: "civ-building", civilCost: 2, produces: "science", productionAmount: 3 },
  { name: "Cannon", kind: "civ-building", civilCost: 2, produces: "strength", productionAmount: 3 },
  { name: "Michelangelo", kind: "civ-leader", civilCost: 2, cultureOnPlay: 5, recurringCulture: 2 },
  { name: "Cathedral", kind: "civ-wonder", civilCost: 3, stoneCost: 6, cultureOnPlay: 8 },
  { name: "Tactical Maneuver", kind: "mil-bonus", civilCost: 1, strengthBonus: 3, cultureOnPlay: 1 },
  { name: "Border Skirmish", kind: "mil-aggression", civilCost: 1, strengthBonus: 0, cultureOnPlay: 5 },
];

const AGE_III: Blueprint[] = [
  { name: "Mechanized Agri.", kind: "civ-building", civilCost: 2, produces: "food", productionAmount: 4 },
  { name: "Steel Mill", kind: "civ-building", civilCost: 2, produces: "stone", productionAmount: 4 },
  { name: "Computers", kind: "civ-building", civilCost: 2, produces: "science", productionAmount: 4 },
  { name: "Modern Army", kind: "civ-building", civilCost: 2, produces: "strength", productionAmount: 4 },
  { name: "Einstein", kind: "civ-leader", civilCost: 3, cultureOnPlay: 7, recurringCulture: 2 },
  { name: "Eiffel Tower", kind: "civ-wonder", civilCost: 3, stoneCost: 7, cultureOnPlay: 12 },
  { name: "Strategic Bombing", kind: "mil-bonus", civilCost: 1, strengthBonus: 4, cultureOnPlay: 2 },
  { name: "Total War", kind: "mil-aggression", civilCost: 2, strengthBonus: 0, cultureOnPlay: 7 },
];

function poolForAge(age: AgeIdx): Blueprint[] {
  if (age === 0) return AGE_A;
  if (age === 1) return AGE_I;
  if (age === 2) return AGE_II;
  return AGE_III;
}

function makeCard(bp: Blueprint, age: AgeIdx, idx: number): Card {
  return {
    id: `${ageLabel(age)}-${idx}`,
    name: bp.name,
    age,
    kind: bp.kind,
    civilCost: bp.civilCost,
    stoneCost: bp.stoneCost ?? 0,
    produces: bp.produces ?? null,
    productionAmount: bp.productionAmount ?? 0,
    strengthBonus: bp.strengthBonus ?? 0,
    cultureOnPlay: bp.cultureOnPlay ?? 0,
    recurringCulture: bp.recurringCulture ?? 0,
    happiness: bp.happiness ?? 0,
  };
}

export function ageLabel(age: AgeIdx): string {
  return age === 0 ? "A" : age === 1 ? "I" : age === 2 ? "II" : "III";
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

/** Build a deck for one age: ~12 cards generated from the age pool. */
export function buildAgeDeck(age: AgeIdx, rng: () => number): Card[] {
  const pool = poolForAge(age);
  const count = 12;
  const shuffled = shuffle(pool, rng);
  const out: Card[] = [];
  for (let i = 0; i < count; i++) {
    const bp = shuffled[i % shuffled.length] as Blueprint;
    out.push(makeCard(bp, age, i));
  }
  return shuffle(out, rng);
}

// ============================================================================
// Player state
// ============================================================================

export interface PlayerState {
  seat: number;
  name: string;
  isCpu: boolean;
  /** Civil action tokens remaining this turn. */
  civilTokens: number;
  /** Military action tokens remaining this turn. */
  militaryTokens: number;
  /** Free workers (yellow tokens). */
  workers: number;
  /** Population reserve (yellow bank). */
  popReserve: number;
  /** Resources. */
  food: number;
  stone: number;
  science: number;
  /** Military strength (built up via mil-bonus cards + strength buildings). */
  strength: number;
  /** Culture (VP). */
  culture: number;
  /** Happiness rating (offsets workers used). */
  happiness: number;
  /** Cards in tableau (buildings, leaders, wonders, mil-bonus). */
  tableau: Card[];
  /** Per-age VP from end-of-age military scoring. */
  militaryAgeVp: number[];
}

// ============================================================================
// Game state
// ============================================================================

export type Phase =
  | "turn"       // a single player is taking their turn
  | "end-of-age" // resolving age VP between ages
  | "scoring"    // final scoring computed
  | "done";

export interface ThroughTheAgesFullState {
  rngSeed: number;
  age: AgeIdx;
  /** Whose turn it is (0..3). */
  turn: number;
  /** Cumulative round (0-indexed). One round = each player having taken a turn. */
  round: number;
  phase: Phase;
  players: PlayerState[];
  /** Visible card row. Cards drain age-by-age. */
  cardRow: Card[];
  /** Remaining decks per age (deck for age A may be empty if used up). */
  decks: Card[][];
  /** Final score for the human player. */
  humanFinalScore: number;
  finalScore: number[];
  log: string[];
}

export interface ThroughTheAgesFullSettings {
  _dummy?: boolean;
}

// ============================================================================
// Initial state
// ============================================================================

function buildAllDecks(rng: () => number): Card[][] {
  return [
    buildAgeDeck(0, rng),
    buildAgeDeck(1, rng),
    buildAgeDeck(2, rng),
    buildAgeDeck(3, rng),
  ];
}

function freshPlayer(seat: number): PlayerState {
  return {
    seat,
    name: seat === 0 ? "You" : `CPU ${seat}`,
    isCpu: seat !== 0,
    civilTokens: CIVIL_TOKENS_BY_AGE[0] ?? 4,
    militaryTokens: MILITARY_TOKENS_BY_AGE[0] ?? 2,
    workers: STARTING_POP,
    popReserve: POP_BANK - STARTING_POP,
    food: STARTING_FOOD,
    stone: STARTING_STONE,
    science: 0,
    strength: STARTING_STRENGTH,
    culture: STARTING_CULTURE,
    happiness: STARTING_HAPPINESS,
    tableau: [],
    militaryAgeVp: [],
  };
}

export function initialState(seed: number, _s: ThroughTheAgesFullSettings): ThroughTheAgesFullState {
  void _s;
  const rng = mulberry32(seed >>> 0);
  const decks = buildAllDecks(rng);
  // Restock card row from age-0 deck first.
  const cardRow: Card[] = [];
  const ageADeck = decks[0] as Card[];
  while (cardRow.length < CARD_ROW_SIZE && ageADeck.length > 0) {
    const c = ageADeck.shift();
    if (c) cardRow.push(c);
  }
  const players: PlayerState[] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) players.push(freshPlayer(i));

  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    age: 0,
    turn: 0,
    round: 0,
    phase: "turn",
    players,
    cardRow,
    decks,
    humanFinalScore: 0,
    finalScore: [0, 0, 0, 0],
    log: [`Age ${ageLabel(0)} begins. ${players[0]?.name ?? "You"}'s turn.`],
  };
}

// ============================================================================
// Helpers
// ============================================================================

function logAppend(log: string[], msg: string): string[] {
  const next = log.slice();
  next.push(msg);
  if (next.length > 14) next.splice(0, next.length - 14);
  return next;
}

/** Production totals per resource for a player (sum of building cards). */
export function productionTotals(p: PlayerState): { food: number; stone: number; science: number; strength: number } {
  const out = { food: 0, stone: 0, science: 0, strength: 0 };
  for (const c of p.tableau) {
    if (c.kind === "civ-building" && c.produces) {
      out[c.produces] += c.productionAmount;
    }
  }
  return out;
}

/** Refill the card row from the current age's deck; promote to next age when empty. */
function restockRow(state: ThroughTheAgesFullState): ThroughTheAgesFullState {
  let { cardRow, decks, age, log } = state;
  cardRow = cardRow.slice();
  decks = decks.map((d) => d.slice());

  while (cardRow.length < CARD_ROW_SIZE) {
    const currentDeck = decks[age];
    if (currentDeck && currentDeck.length > 0) {
      const c = currentDeck.shift();
      if (c) cardRow.push(c);
    } else if (age < (NUM_AGES - 1)) {
      // Promote to next age — also marks the end of current age (scoring).
      const newAge = (age + 1) as AgeIdx;
      log = logAppend(log, `Card row drained — advancing to age ${ageLabel(newAge)}.`);
      age = newAge;
    } else {
      // Final deck (age III) exhausted — game effectively ending soon.
      break;
    }
  }
  return { ...state, cardRow, decks, age, log };
}

/** Apply the "income" tick at start of a player's turn:
 *  +food = food production, +stone = stone production, +science, +strength refresh.
 *  Then consume food = workers used. */
function startOfTurnTick(p: PlayerState): PlayerState {
  const prod = productionTotals(p);
  let food = p.food + prod.food;
  const stone = p.stone + prod.stone;
  const science = p.science + prod.science;
  // Recurring culture
  let culture = p.culture;
  for (const c of p.tableau) culture += c.recurringCulture;
  // Consume food (per worker assigned in buildings)
  const workersAssigned = p.tableau.filter((c) => c.kind === "civ-building").length;
  food = Math.max(0, food - Math.max(0, workersAssigned - prod.food));
  // Happiness — sum of card happiness (no consumption penalty here; XL omission)
  let happy = p.happiness;
  for (const c of p.tableau) happy += c.happiness;
  return {
    ...p,
    food,
    stone,
    science,
    culture,
    happiness: happy,
    // strength is rebuilt from base + bonus cards each tick (idempotent)
    strength: STARTING_STRENGTH + p.tableau
      .filter((c) => c.kind === "mil-bonus" || (c.kind === "civ-building" && c.produces === "strength"))
      .reduce((s, c) => s + c.strengthBonus + (c.produces === "strength" ? c.productionAmount : 0), 0),
  };
}

/** Refresh action tokens for the start of a player's turn at the given age. */
function refreshTokens(p: PlayerState, age: AgeIdx): PlayerState {
  return {
    ...p,
    civilTokens: CIVIL_TOKENS_BY_AGE[age] ?? 4,
    militaryTokens: MILITARY_TOKENS_BY_AGE[age] ?? 2,
  };
}

/** Compute end-of-age VP based on military strength ranking. */
function resolveAgeMilitary(players: PlayerState[], age: AgeIdx): { players: PlayerState[]; lines: string[] } {
  const indexed = players.map((p, i) => ({ idx: i, strength: p.strength }));
  indexed.sort((a, b) => b.strength - a.strength);
  const updated = players.map((p) => ({ ...p, militaryAgeVp: p.militaryAgeVp.slice() }));
  const lines: string[] = [`-- Age ${ageLabel(age)} military scoring --`];
  for (let rank = 0; rank < indexed.length; rank++) {
    const entry = indexed[rank];
    if (!entry) continue;
    const vp = MIL_AGE_VP[rank] ?? 0;
    const player = updated[entry.idx];
    if (!player) continue;
    player.militaryAgeVp.push(vp);
    player.culture = Math.max(0, player.culture + vp);
    lines.push(`${player.name} (str ${entry.strength}) → ${vp >= 0 ? "+" : ""}${vp} VP`);
  }
  return { players: updated, lines };
}

// ============================================================================
// CPU strategy: greedy — pick cheapest mil card if strength low else cheapest civ.
// ============================================================================

export function cpuPickCard(p: PlayerState, cardRow: Card[]): number {
  if (cardRow.length === 0) return -1;
  // Threshold: if strength <= 2, prefer mil cards.
  const needMil = p.strength <= 2 && p.militaryTokens > 0;
  const isMil = (c: Card) => c.kind === "mil-bonus" || c.kind === "mil-aggression";
  let bestIdx = -1;
  let bestCost = Infinity;
  for (let i = 0; i < cardRow.length; i++) {
    const c = cardRow[i] as Card;
    if (c.civilCost > p.civilTokens && !isMil(c)) continue;
    if (isMil(c) && c.civilCost > p.militaryTokens) continue;
    const desiredMil = needMil ? isMil(c) : !isMil(c);
    if (!desiredMil) continue;
    if (c.civilCost < bestCost) {
      bestCost = c.civilCost;
      bestIdx = i;
    }
  }
  if (bestIdx < 0) {
    // Fallback: any affordable card.
    for (let i = 0; i < cardRow.length; i++) {
      const c = cardRow[i] as Card;
      const tokens = isMil(c) ? p.militaryTokens : p.civilTokens;
      if (c.civilCost <= tokens && c.civilCost < bestCost) {
        bestCost = c.civilCost;
        bestIdx = i;
      }
    }
  }
  return bestIdx;
}

/** Run a CPU player's turn: greedy picks until tokens exhausted or no affordable card. */
function runCpuTurn(state: ThroughTheAgesFullState): ThroughTheAgesFullState {
  let p = state.players[state.turn];
  if (!p) return state;
  let cardRow = state.cardRow.slice();
  let log = state.log;
  for (let step = 0; step < 8; step++) {
    const idx = cpuPickCard(p, cardRow);
    if (idx < 0) break;
    const card = cardRow[idx] as Card;
    const isMil = card.kind === "mil-bonus" || card.kind === "mil-aggression";
    if (isMil) {
      p = { ...p, militaryTokens: p.militaryTokens - card.civilCost };
    } else {
      p = { ...p, civilTokens: p.civilTokens - card.civilCost };
    }
    // Auto-build: deduct stone if any (clamp at 0; XL simplification)
    p = { ...p, stone: Math.max(0, p.stone - card.stoneCost) };
    p = { ...p, tableau: [...p.tableau, card], culture: p.culture + card.cultureOnPlay };
    cardRow = cardRow.filter((_, i) => i !== idx);
    log = logAppend(log, `${p.name} took ${card.name}.`);
    if (p.civilTokens <= 0 && p.militaryTokens <= 0) break;
  }
  // CPU passes / ends turn.
  const players = state.players.slice();
  players[state.turn] = p;
  return { ...state, players, cardRow, log };
}

// ============================================================================
// Actions
// ============================================================================

export type ThroughTheAgesFullAction =
  | { type: "takeCard"; cardIdx: number }
  | { type: "levyCivil" }         // spend civil token to grow workers
  | { type: "levyMilitary" }      // spend mil token to grow strength
  | { type: "endTurn" }
  | { type: "resolveAge" };       // resolve end-of-age scoring + advance

// ============================================================================
// Reducer
// ============================================================================

export function reducer(state: ThroughTheAgesFullState, action: ThroughTheAgesFullAction): ThroughTheAgesFullState {
  if (state.phase === "done" || state.phase === "scoring") return state;

  if (action.type === "takeCard") {
    if (state.phase !== "turn") return state;
    if (action.cardIdx < 0 || action.cardIdx >= state.cardRow.length) return state;
    const human = state.players[state.turn];
    if (!human || human.isCpu) return state;
    const card = state.cardRow[action.cardIdx];
    if (!card) return state;
    const isMil = card.kind === "mil-bonus" || card.kind === "mil-aggression";
    const tokens = isMil ? human.militaryTokens : human.civilTokens;
    if (card.civilCost > tokens) return state;
    if (card.stoneCost > human.stone) return state;
    // Apply
    let updated: PlayerState = { ...human };
    if (isMil) updated.militaryTokens -= card.civilCost;
    else updated.civilTokens -= card.civilCost;
    updated.stone = Math.max(0, updated.stone - card.stoneCost);
    updated.tableau = [...updated.tableau, card];
    updated.culture = updated.culture + card.cultureOnPlay;
    // Refresh strength from new tableau composition.
    updated = recomputeStrength(updated);
    const players = state.players.slice();
    players[state.turn] = updated;
    const cardRow = state.cardRow.filter((_, i) => i !== action.cardIdx);
    const log = logAppend(state.log, `${updated.name} took ${card.name}.`);
    return { ...state, players, cardRow, log };
  }

  if (action.type === "levyCivil") {
    if (state.phase !== "turn") return state;
    const human = state.players[state.turn];
    if (!human || human.isCpu) return state;
    if (human.civilTokens < 1) return state;
    if (human.popReserve < 1) return state;
    if (human.food < 1) return state;
    const updated: PlayerState = {
      ...human,
      civilTokens: human.civilTokens - 1,
      popReserve: human.popReserve - 1,
      workers: human.workers + 1,
      food: human.food - 1,
    };
    const players = state.players.slice();
    players[state.turn] = updated;
    return { ...state, players, log: logAppend(state.log, `${updated.name} levied 1 worker.`) };
  }

  if (action.type === "levyMilitary") {
    if (state.phase !== "turn") return state;
    const human = state.players[state.turn];
    if (!human || human.isCpu) return state;
    if (human.militaryTokens < 1) return state;
    if (human.workers < 1) return state;
    let updated: PlayerState = {
      ...human,
      militaryTokens: human.militaryTokens - 1,
      workers: human.workers - 1,
      strength: human.strength + 1,
    };
    updated = recomputeStrength(updated);
    // Bump strength by +1 directly (since recompute resets to base+cards)
    updated.strength = updated.strength + 1;
    const players = state.players.slice();
    players[state.turn] = updated;
    return { ...state, players, log: logAppend(state.log, `${updated.name} levied a unit (+1 strength).`) };
  }

  if (action.type === "endTurn") {
    if (state.phase !== "turn") return state;
    // Advance turn pointer; run CPUs until we hit human or all played.
    let next = { ...state };
    next = advanceTurn(next);
    return next;
  }

  if (action.type === "resolveAge") {
    if (state.phase !== "end-of-age") return state;
    // Apply end-of-age VP.
    const { players, lines } = resolveAgeMilitary(state.players, state.age);
    let log = state.log;
    for (const l of lines) log = logAppend(log, l);
    // If at age III and decks empty → terminate.
    const ageIIIdeck = state.decks[NUM_AGES - 1] ?? [];
    const isFinalAge = state.age === (NUM_AGES - 1) && ageIIIdeck.length === 0 && state.cardRow.length === 0;
    if (isFinalAge) {
      const finalScore = players.map(computeFinalScore);
      return {
        ...state,
        players,
        phase: "scoring",
        finalScore,
        humanFinalScore: finalScore[0] ?? 0,
        log: logAppend(log, `Final scoring complete. You: ${finalScore[0] ?? 0} VP.`),
      };
    }
    // Otherwise, refresh action tokens for the new age and restock.
    const refreshed = players.map((p) => refreshTokens(p, state.age));
    let cont: ThroughTheAgesFullState = {
      ...state,
      players: refreshed,
      phase: "turn",
      turn: 0,
      round: state.round + 1,
      log,
    };
    cont = restockRow(cont);
    return cont;
  }

  return state;
}

/** Recompute strength from baseline + tableau (idempotent helper). */
function recomputeStrength(p: PlayerState): PlayerState {
  let str = STARTING_STRENGTH;
  for (const c of p.tableau) {
    str += c.strengthBonus;
    if (c.kind === "civ-building" && c.produces === "strength") str += c.productionAmount;
  }
  return { ...p, strength: str };
}

/** Advance turn pointer; if it cycles back, check for age-end transition. */
function advanceTurn(state: ThroughTheAgesFullState): ThroughTheAgesFullState {
  let next = { ...state };
  let turn = state.turn + 1;
  while (turn < NUM_PLAYERS) {
    // Apply start-of-turn tick + token refresh to the next player.
    const players = next.players.slice();
    const p = players[turn];
    if (!p) {
      turn++;
      continue;
    }
    const ticked = refreshTokens(startOfTurnTick(p), next.age);
    players[turn] = ticked;
    next = { ...next, players, turn };
    if (ticked.isCpu) {
      next = runCpuTurn(next);
      next = { ...next, log: logAppend(next.log, `${ticked.name} ends their turn.`) };
      turn++;
      continue;
    }
    // Human reached: stop and let them play.
    next = { ...next, log: logAppend(next.log, `${ticked.name}'s turn.`) };
    return next;
  }
  // End of round. Restock row; check for age transition.
  let after = restockRow(next);
  const ageIIIdeck = after.decks[NUM_AGES - 1] ?? [];
  const isFinalRowDrain = after.age === (NUM_AGES - 1) && ageIIIdeck.length === 0 && after.cardRow.length === 0;
  // Trigger end-of-age scoring when card row promoted past a boundary OR final state.
  if (after.age > next.age || isFinalRowDrain) {
    return { ...after, phase: "end-of-age" };
  }
  // Otherwise begin next round with player 0.
  const players = after.players.slice();
  const p0 = players[0];
  if (p0) {
    const ticked = refreshTokens(startOfTurnTick(p0), after.age);
    players[0] = ticked;
  }
  return { ...after, players, turn: 0, round: after.round + 1, log: logAppend(after.log, `New round — ${players[0]?.name ?? "You"}'s turn.`) };
}

// ============================================================================
// Scoring
// ============================================================================

export function computeFinalScore(p: PlayerState): number {
  let total = p.culture;
  // Per-age military VP already added to culture.
  // Add science as a small bonus (1 VP per 3 science accumulated).
  total += Math.floor(p.science / 3);
  // Happiness gate (XL omission of full rule): if workers > 8 and happiness is 0, penalty
  // Skip for simplicity. (TODO note in header.)
  return Math.max(0, total);
}

export function isTerminal(state: ThroughTheAgesFullState): { score: number } | null {
  if (state.phase !== "scoring" && state.phase !== "done") return null;
  return { score: Math.max(0, state.humanFinalScore) };
}

// ============================================================================
// TODO — XL omissions
// ============================================================================
//
// TODO(through-the-ages-full): The following rules from Vlaada Chvátil's
// full design are intentionally not implemented:
//   - Wonder construction across multiple turns (we play wonders flat-cost).
//   - Government cards (Despotism → Democracy etc) and their action token
//     upgrade arcs; we hard-code per-age token counts.
//   - Leaders' unique abilities (e.g. Caesar's mil bonus). All leaders are
//     reduced to flat-VP + +1 recurring culture.
//   - Event deck — no upcoming/current event interaction.
//   - Aggression / War / Pact cards (we have a stub "Aggression" mil card
//     that grants flat culture but never targets a neighbour).
//   - Tactics cards and unit upgrades.
//   - Colonies and barbarian uprisings.
//   - Yellow-bank consumption ramps + corruption (blue bank).
//   - Happiness uprisings (we soft-cap happiness penalties).
//   - Variable map / starting-position asymmetry.
//   - Tournament rules / final-age timing rules.
