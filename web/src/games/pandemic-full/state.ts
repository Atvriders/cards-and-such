import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─────────────────────────────────────────────────────────────────────────────
// Pandemic (Full Cooperative) — solo control of 2–3 roles
//
// Implemented:
//   • 48 cities across 4 colors with adjacency graph
//   • Standard turn structure: 4 actions → draw 2 player cards (incl. epidemic)
//     → infect at current rate
//   • Actions: drive, direct flight, charter flight, shuttle flight,
//     build station, treat, share knowledge, discover cure, pass.
//   • Outbreak chaining with per-chain visited set.
//   • Cube supply tracking (24 of each color), 8-outbreak threshold.
//   • Player deck empties → loss; player draws an Epidemic → increase rate,
//     infect bottom card with 3 cubes, reshuffle discard onto top.
//   • 4 cures → win.
//   • Roles: Medic, Scientist, Researcher, Operations Expert, Dispatcher.
//   • Solo rotates between 2–3 roles.
//
// Advanced rules intentionally omitted (noted in howToPlay):
//   • Eradication state (cured + zero cubes worldwide) — we treat
//     "cured" as remove 1 cube as normal; not strictly eradicated removal.
//     Medic still ignores cubes on movement only for cured-color (we do
//     skip placing cubes on Medic's color when cured).
//   • Event cards (Government Grant, Forecast, Resilient Pop, etc.)
//   • Quarantine Specialist / Contingency Planner roles
//   • Operations Expert's flight-by-discard advanced action
//   • Initial hand draws sized by player-count rules — we deal 3 cards each.
//   • Dispatcher's "move pawn to any city with another pawn" without card —
//     simplified to: dispatcher can move another pawn as if they were
//     making the basic Drive/Ferry move from that pawn's city.
//
// All randomness flows through the seed via mulberry32. No module-level state.
// ─────────────────────────────────────────────────────────────────────────────

export type DiseaseColor = "blue" | "yellow" | "black" | "red";
export const COLORS: readonly DiseaseColor[] = ["blue", "yellow", "black", "red"];
export const CUBES_PER_COLOR = 24;
export const HAND_LIMIT = 7;
export const OUTBREAK_LOSS = 8;
export const ACTIONS_PER_TURN = 4;
export const INITIAL_HAND_SIZE = 3;
export const INFECTION_RATES = [2, 2, 2, 3, 3, 4, 4] as const;

export type RoleId = "medic" | "scientist" | "researcher" | "ops" | "dispatcher";
export const ROLES: readonly RoleId[] = ["medic", "scientist", "researcher", "ops", "dispatcher"];

export interface RoleInfo {
  id: RoleId;
  label: string;
  blurb: string;
}

export const ROLE_INFO: Record<RoleId, RoleInfo> = {
  medic: { id: "medic", label: "Medic", blurb: "Treat removes all cubes of one color." },
  scientist: { id: "scientist", label: "Scientist", blurb: "Discover a cure with 4 same-color cards." },
  researcher: { id: "researcher", label: "Researcher", blurb: "Share knowledge from your hand at same city." },
  ops: { id: "ops", label: "Operations Expert", blurb: "Build a research station without discarding." },
  dispatcher: { id: "dispatcher", label: "Dispatcher", blurb: "Move other pawns on their turn." },
};

// ─── Map definition ─────────────────────────────────────────────────────────
export interface CityDef {
  id: number;          // 0..47
  name: string;
  color: DiseaseColor;
  x: number;           // 0..1000 layout
  y: number;           // 0..550 layout
}

// 12 cities per color. Coordinates roughly approximate the real map but
// re-scaled to the unit grid we render in SVG.
//
// Ids 0..11 = blue, 12..23 = yellow, 24..35 = black, 36..47 = red.
export const CITIES: readonly CityDef[] = [
  // BLUE — North America / Europe (12)
  { id: 0, name: "San Francisco", color: "blue", x: 90, y: 200 },
  { id: 1, name: "Chicago", color: "blue", x: 215, y: 180 },
  { id: 2, name: "Atlanta", color: "blue", x: 250, y: 230 },
  { id: 3, name: "Montreal", color: "blue", x: 290, y: 165 },
  { id: 4, name: "Washington", color: "blue", x: 305, y: 230 },
  { id: 5, name: "New York", color: "blue", x: 335, y: 185 },
  { id: 6, name: "London", color: "blue", x: 445, y: 145 },
  { id: 7, name: "Madrid", color: "blue", x: 460, y: 215 },
  { id: 8, name: "Paris", color: "blue", x: 495, y: 175 },
  { id: 9, name: "Essen", color: "blue", x: 520, y: 125 },
  { id: 10, name: "Milan", color: "blue", x: 540, y: 175 },
  { id: 11, name: "St. Petersburg", color: "blue", x: 595, y: 110 },

  // YELLOW — South America / Africa (12)
  { id: 12, name: "Los Angeles", color: "yellow", x: 115, y: 260 },
  { id: 13, name: "Mexico City", color: "yellow", x: 200, y: 300 },
  { id: 14, name: "Miami", color: "yellow", x: 285, y: 290 },
  { id: 15, name: "Bogota", color: "yellow", x: 300, y: 360 },
  { id: 16, name: "Lima", color: "yellow", x: 290, y: 425 },
  { id: 17, name: "Santiago", color: "yellow", x: 315, y: 500 },
  { id: 18, name: "Sao Paulo", color: "yellow", x: 395, y: 430 },
  { id: 19, name: "Buenos Aires", color: "yellow", x: 365, y: 480 },
  { id: 20, name: "Lagos", color: "yellow", x: 510, y: 340 },
  { id: 21, name: "Khartoum", color: "yellow", x: 590, y: 320 },
  { id: 22, name: "Kinshasa", color: "yellow", x: 555, y: 395 },
  { id: 23, name: "Johannesburg", color: "yellow", x: 585, y: 460 },

  // BLACK — Asia / Eastern Europe / Middle East (12)
  { id: 24, name: "Algiers", color: "black", x: 510, y: 245 },
  { id: 25, name: "Istanbul", color: "black", x: 580, y: 195 },
  { id: 26, name: "Moscow", color: "black", x: 635, y: 145 },
  { id: 27, name: "Cairo", color: "black", x: 575, y: 260 },
  { id: 28, name: "Baghdad", color: "black", x: 625, y: 215 },
  { id: 29, name: "Tehran", color: "black", x: 675, y: 195 },
  { id: 30, name: "Riyadh", color: "black", x: 625, y: 280 },
  { id: 31, name: "Karachi", color: "black", x: 690, y: 250 },
  { id: 32, name: "Mumbai", color: "black", x: 720, y: 290 },
  { id: 33, name: "Delhi", color: "black", x: 740, y: 225 },
  { id: 34, name: "Chennai", color: "black", x: 755, y: 320 },
  { id: 35, name: "Kolkata", color: "black", x: 780, y: 245 },

  // RED — East Asia / Australia / Pacific (12)
  { id: 36, name: "Beijing", color: "red", x: 820, y: 175 },
  { id: 37, name: "Seoul", color: "red", x: 875, y: 195 },
  { id: 38, name: "Tokyo", color: "red", x: 920, y: 215 },
  { id: 39, name: "Shanghai", color: "red", x: 835, y: 230 },
  { id: 40, name: "Hong Kong", color: "red", x: 825, y: 280 },
  { id: 41, name: "Taipei", color: "red", x: 870, y: 270 },
  { id: 42, name: "Osaka", color: "red", x: 925, y: 255 },
  { id: 43, name: "Bangkok", color: "red", x: 795, y: 305 },
  { id: 44, name: "Ho Chi Minh City", color: "red", x: 830, y: 340 },
  { id: 45, name: "Jakarta", color: "red", x: 820, y: 395 },
  { id: 46, name: "Manila", color: "red", x: 895, y: 320 },
  { id: 47, name: "Sydney", color: "red", x: 920, y: 470 },
];

// Adjacency — symmetric edges. Compact list (each pair listed once).
const RAW_EDGES: ReadonlyArray<readonly [string, string]> = [
  // Blue cluster
  ["San Francisco", "Chicago"], ["San Francisco", "Los Angeles"], ["San Francisco", "Tokyo"], ["San Francisco", "Manila"],
  ["Chicago", "Atlanta"], ["Chicago", "Montreal"], ["Chicago", "Los Angeles"], ["Chicago", "Mexico City"],
  ["Atlanta", "Miami"], ["Atlanta", "Washington"],
  ["Montreal", "New York"], ["Montreal", "Washington"],
  ["Washington", "New York"], ["Washington", "Miami"],
  ["New York", "London"], ["New York", "Madrid"],
  ["London", "Madrid"], ["London", "Paris"], ["London", "Essen"],
  ["Madrid", "Paris"], ["Madrid", "Sao Paulo"], ["Madrid", "Algiers"],
  ["Paris", "Essen"], ["Paris", "Milan"], ["Paris", "Algiers"],
  ["Essen", "Milan"], ["Essen", "St. Petersburg"],
  ["Milan", "Istanbul"],
  ["St. Petersburg", "Istanbul"], ["St. Petersburg", "Moscow"],

  // Yellow cluster
  ["Los Angeles", "Mexico City"], ["Los Angeles", "Sydney"],
  ["Mexico City", "Miami"], ["Mexico City", "Bogota"], ["Mexico City", "Lima"],
  ["Miami", "Bogota"],
  ["Bogota", "Lima"], ["Bogota", "Sao Paulo"], ["Bogota", "Buenos Aires"],
  ["Lima", "Santiago"],
  ["Sao Paulo", "Buenos Aires"], ["Sao Paulo", "Lagos"],
  ["Lagos", "Khartoum"], ["Lagos", "Kinshasa"],
  ["Khartoum", "Cairo"], ["Khartoum", "Kinshasa"], ["Khartoum", "Johannesburg"],
  ["Kinshasa", "Johannesburg"],

  // Black cluster
  ["Algiers", "Istanbul"], ["Algiers", "Cairo"],
  ["Istanbul", "Cairo"], ["Istanbul", "Baghdad"], ["Istanbul", "Moscow"],
  ["Moscow", "Tehran"],
  ["Cairo", "Baghdad"], ["Cairo", "Riyadh"],
  ["Baghdad", "Tehran"], ["Baghdad", "Riyadh"], ["Baghdad", "Karachi"],
  ["Tehran", "Karachi"], ["Tehran", "Delhi"],
  ["Riyadh", "Karachi"],
  ["Karachi", "Mumbai"], ["Karachi", "Delhi"],
  ["Mumbai", "Chennai"], ["Mumbai", "Delhi"],
  ["Delhi", "Chennai"], ["Delhi", "Kolkata"],
  ["Chennai", "Kolkata"], ["Chennai", "Bangkok"], ["Chennai", "Jakarta"],
  ["Kolkata", "Bangkok"], ["Kolkata", "Hong Kong"],

  // Red cluster
  ["Beijing", "Seoul"], ["Beijing", "Shanghai"],
  ["Seoul", "Shanghai"], ["Seoul", "Tokyo"],
  ["Tokyo", "Shanghai"], ["Tokyo", "Osaka"],
  ["Shanghai", "Hong Kong"], ["Shanghai", "Taipei"],
  ["Hong Kong", "Taipei"], ["Hong Kong", "Bangkok"], ["Hong Kong", "Ho Chi Minh City"], ["Hong Kong", "Manila"],
  ["Taipei", "Osaka"], ["Taipei", "Manila"],
  ["Bangkok", "Ho Chi Minh City"], ["Bangkok", "Jakarta"],
  ["Ho Chi Minh City", "Jakarta"], ["Ho Chi Minh City", "Manila"],
  ["Jakarta", "Sydney"],
  ["Manila", "Sydney"],
];

// Resolve name→id, build symmetric adjacency once.
const NAME_TO_ID = new Map<string, number>(CITIES.map((c) => [c.name, c.id]));
export function cityIdByName(name: string): number {
  const id = NAME_TO_ID.get(name);
  if (id === undefined) throw new Error(`Unknown city: ${name}`);
  return id;
}

export const ADJACENCY: readonly (readonly number[])[] = (() => {
  const adj: number[][] = CITIES.map(() => []);
  for (const [a, b] of RAW_EDGES) {
    const ai = NAME_TO_ID.get(a)!;
    const bi = NAME_TO_ID.get(b)!;
    if (!adj[ai]!.includes(bi)) adj[ai]!.push(bi);
    if (!adj[bi]!.includes(ai)) adj[bi]!.push(ai);
  }
  return adj.map((row) => row.slice().sort((x, y) => x - y));
})();

// ─── Cards ──────────────────────────────────────────────────────────────────

// Player cards: 48 city cards + epidemic cards (4 baseline) — simplified, no events.
export type PlayerCard =
  | { kind: "city"; cityId: number }
  | { kind: "epidemic" };

export type InfectionCard = { cityId: number };

// ─── State ──────────────────────────────────────────────────────────────────

export interface PlayerPawn {
  role: RoleId;
  cityId: number;       // current location
  hand: PlayerCard[];   // city cards held
}

export interface PandemicFullSettings {
  difficulty: "Introductory" | "Standard" | "Heroic";
  numRoles: 2 | 3;
}

export interface PandemicFullState {
  settings: PandemicFullSettings;
  cubes: Record<DiseaseColor, number>;   // cubes left in supply per color
  cured: Record<DiseaseColor, boolean>;  // cure discovered
  cityCubes: number[][];                 // [cityId] => [blue,yellow,black,red] counts
  stations: Set<number>;                 // cities with a research station
  pawns: PlayerPawn[];                   // 2 or 3 pawns
  current: number;                       // index of active pawn
  actionsLeft: number;                   // 0..4
  outbreaks: number;                     // 0..8
  infectionRateIdx: number;              // index into INFECTION_RATES
  playerDeck: PlayerCard[];              // draw top = end of array
  playerDiscard: PlayerCard[];
  infectionDeck: InfectionCard[];        // draw top = end of array
  infectionDiscard: InfectionCard[];     // top = end of array
  phase: "action" | "draw" | "infect" | "won" | "lost";
  lastEvent: string;                     // most recent event for status display
  loseReason: string | null;             // populated on loss
  seed: number;                          // rolling seed for stochastic effects
  // UI selection state
  pendingAction: PendingAction | null;
}

// "Pending action" lets the UI ask for follow-up input (e.g. pick a card to
// discard for charter flight, or pick a player to share with).
export type PendingAction =
  | { kind: "directFlight" }
  | { kind: "charterFlight" }
  | { kind: "shareKnowledge" }
  | { kind: "discoverCure"; color: DiseaseColor; needed: number }
  | { kind: "dispatcherMove"; pawnIdx: number }
  | null;

// ─── Actions ────────────────────────────────────────────────────────────────
export type PandemicFullAction =
  | { type: "drive"; toCityId: number }
  | { type: "directFlight"; toCityId: number }   // discard card matching destination
  | { type: "charterFlight"; toCityId: number }  // discard card of current city
  | { type: "shuttleFlight"; toCityId: number }  // both have station
  | { type: "buildStation" }                     // discard current city card (free for ops)
  | { type: "treat"; color: DiseaseColor }
  | { type: "shareKnowledge"; otherPawnIdx: number; cityId: number } // give your city card to other (or take if researcher)
  | { type: "discoverCure"; color: DiseaseColor; cardIds: number[] } // cardIds index into hand of current pawn
  | { type: "pass" }                             // skip remaining actions, go to draw
  | { type: "setPending"; pending: PendingAction }
  | { type: "dispatcherMove"; otherPawnIdx: number; toCityId: number };

// ─── Helpers ────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i]!; a[i] = a[j]!; a[j] = t;
  }
  return a;
}

function nextSeed(seed: number): number {
  // Deterministic rolling seed
  const rng = mulberry32(seed);
  return Math.floor(rng() * 0x7fffffff);
}

function currentInfectionRate(state: PandemicFullState): number {
  const idx = Math.min(state.infectionRateIdx, INFECTION_RATES.length - 1);
  return INFECTION_RATES[idx]!;
}

export function totalCubesInCity(state: PandemicFullState, cityId: number): number {
  const row = state.cityCubes[cityId]!;
  return row[0]! + row[1]! + row[2]! + row[3]!;
}

function colorIdx(c: DiseaseColor): number {
  return c === "blue" ? 0 : c === "yellow" ? 1 : c === "black" ? 2 : 3;
}

// Build all city player cards (48 total, in id order).
function buildCityPlayerCards(): PlayerCard[] {
  return CITIES.map((c) => ({ kind: "city" as const, cityId: c.id }));
}

// Build all infection cards (48 total, in id order).
function buildInfectionCards(): InfectionCard[] {
  return CITIES.map((c) => ({ cityId: c.id }));
}

function numEpidemicCards(diff: PandemicFullSettings["difficulty"]): number {
  if (diff === "Introductory") return 4;
  if (diff === "Heroic") return 6;
  return 5;
}

// Add a cube + handle outbreak chains. Returns updated state (mutates a clone-style fresh
// state via in-place updates on caller-owned cityCubes/cubes/etc.; we deep-clone before).
function placeCubeRecursive(
  state: PandemicFullState,
  cityId: number,
  color: DiseaseColor,
  visited: Set<number>,
): PandemicFullState {
  let s = state;

  // Eradication check (cube prevention only on outbreaks via Medic). If the
  // disease is cured AND any Medic pawn is at this city, suppress placement.
  const ci = colorIdx(color);
  for (const p of s.pawns) {
    if (p.role === "medic" && p.cityId === cityId && s.cured[color]) {
      return s; // medic blocks cube placement on cured color
    }
  }

  // If supply is empty, immediate loss.
  if (s.cubes[color] <= 0) {
    return { ...s, phase: "lost", loseReason: `Cube supply exhausted (${color}).`, lastEvent: `Cube supply exhausted: ${color}.` };
  }

  if (s.cityCubes[cityId]![ci]! < 3) {
    // Normal placement
    const cityCubes = s.cityCubes.map((row) => row.slice());
    cityCubes[cityId]![ci]! = cityCubes[cityId]![ci]! + 1;
    const cubes = { ...s.cubes, [color]: s.cubes[color] - 1 };
    s = { ...s, cityCubes, cubes };
    return s;
  }

  // Outbreak.
  if (visited.has(cityId)) return s; // already outbroke in this chain
  visited.add(cityId);
  let outbreaks = s.outbreaks + 1;
  s = { ...s, outbreaks, lastEvent: `Outbreak in ${CITIES[cityId]!.name}!` };
  if (outbreaks >= OUTBREAK_LOSS) {
    return { ...s, phase: "lost", loseReason: `8 outbreaks reached.` };
  }
  // Each neighbour gets a cube of the same color.
  for (const n of ADJACENCY[cityId]!) {
    s = placeCubeRecursive(s, n, color, visited);
    if (s.phase === "lost") return s;
  }
  return s;
}

function applyInfectionDraw(state: PandemicFullState, count: number): PandemicFullState {
  let s = state;
  for (let i = 0; i < count; i++) {
    if (s.infectionDeck.length === 0) break;
    const deck = s.infectionDeck.slice();
    const card = deck.pop()!;
    const discard = s.infectionDiscard.concat([card]);
    s = { ...s, infectionDeck: deck, infectionDiscard: discard };
    const color = CITIES[card.cityId]!.color;
    s = placeCubeRecursive(s, card.cityId, color, new Set());
    if (s.phase === "lost") return s;
  }
  return s;
}

function applyEpidemic(state: PandemicFullState): PandemicFullState {
  let s = state;
  // 1) Increase infection rate
  s = { ...s, infectionRateIdx: Math.min(s.infectionRateIdx + 1, INFECTION_RATES.length - 1), lastEvent: "EPIDEMIC!" };
  // 2) Infect: draw bottom card of infection deck (front of array since top = end),
  //    place 3 cubes there
  if (s.infectionDeck.length > 0) {
    const deck = s.infectionDeck.slice();
    const card = deck.shift()!;
    s = { ...s, infectionDeck: deck, infectionDiscard: s.infectionDiscard.concat([card]) };
    const color = CITIES[card.cityId]!.color;
    // Place 3 cubes (each may cause outbreak chain — visited set per cube event)
    for (let k = 0; k < 3; k++) {
      s = placeCubeRecursive(s, card.cityId, color, new Set());
      if (s.phase === "lost") return s;
    }
  }
  // 3) Intensify: shuffle infection discard with rng, place on top
  const rng = mulberry32(s.seed);
  const reshuffled = shuffle(s.infectionDiscard, rng);
  s = {
    ...s,
    infectionDeck: s.infectionDeck.concat(reshuffled), // top = end
    infectionDiscard: [],
    seed: nextSeed(s.seed),
  };
  return s;
}

// Distribute epidemics into the deck: split into N piles, insert one epidemic
// in each pile (shuffled), then concat in order. Top = end.
function buildPlayerDeck(rng: () => number, epidemics: number): PlayerCard[] {
  const cityCards = buildCityPlayerCards();
  const shuffled = shuffle(cityCards, rng);
  // Split shuffled into `epidemics` piles as evenly as possible
  const piles: PlayerCard[][] = Array.from({ length: epidemics }, () => []);
  const base = Math.floor(shuffled.length / epidemics);
  const extra = shuffled.length % epidemics;
  let idx = 0;
  for (let p = 0; p < epidemics; p++) {
    const size = base + (p < extra ? 1 : 0);
    piles[p] = shuffled.slice(idx, idx + size);
    idx += size;
  }
  // Insert one epidemic in each pile at random position, then shuffle the pile.
  for (let p = 0; p < epidemics; p++) {
    piles[p]!.push({ kind: "epidemic" });
    piles[p] = shuffle(piles[p]!, rng);
  }
  // Concat: top of deck = first pile drawn last → we want draws to come from
  // a randomly arranged deck; conventional ordering doesn't matter for correctness.
  return piles.flat();
}

// ─── Initial state ──────────────────────────────────────────────────────────

export function initialState(seed: number, settings: PandemicFullSettings): PandemicFullState {
  const rng = mulberry32(seed);

  // Choose roles deterministically from seed
  const roleOrder = shuffle(ROLES.slice(), rng).slice(0, settings.numRoles);

  // All pawns start in Atlanta (default research station city — id 2)
  const startCityId = cityIdByName("Atlanta");

  // Build infection deck (shuffled)
  const infectionDeck = shuffle(buildInfectionCards(), rng);
  // Build player deck without epidemics first to deal starting hands
  const cityCards = shuffle(buildCityPlayerCards(), rng);
  const pawns: PlayerPawn[] = roleOrder.map((role) => ({
    role,
    cityId: startCityId,
    hand: [] as PlayerCard[],
  }));
  // Deal INITIAL_HAND_SIZE each
  let cardIdx = 0;
  for (let h = 0; h < INITIAL_HAND_SIZE; h++) {
    for (const p of pawns) {
      const c = cityCards[cardIdx++];
      if (c) p.hand.push(c);
    }
  }
  const remaining = cityCards.slice(cardIdx);
  // Now rebuild player deck with epidemics distributed across remainder.
  const epidemicCount = numEpidemicCards(settings.difficulty);
  // Shuffle remainder and split into N piles, add epidemic to each pile.
  const piles: PlayerCard[][] = Array.from({ length: epidemicCount }, () => []);
  const base = Math.floor(remaining.length / epidemicCount);
  const extra = remaining.length % epidemicCount;
  let idx = 0;
  for (let p = 0; p < epidemicCount; p++) {
    const size = base + (p < extra ? 1 : 0);
    piles[p] = remaining.slice(idx, idx + size);
    idx += size;
  }
  for (let p = 0; p < epidemicCount; p++) {
    piles[p]!.push({ kind: "epidemic" });
    piles[p] = shuffle(piles[p]!, rng);
  }
  const playerDeck = piles.flat();
  void buildPlayerDeck; // kept exported for tests

  // Initial 9-card infection: draw 3 cards, each gets 3 cubes; next 3 get 2; next 3 get 1.
  // Modeled by drawing from top (end of array).
  const startSeed = Math.floor(rng() * 0x7fffffff);
  let state: PandemicFullState = {
    settings,
    cubes: { blue: CUBES_PER_COLOR, yellow: CUBES_PER_COLOR, black: CUBES_PER_COLOR, red: CUBES_PER_COLOR },
    cured: { blue: false, yellow: false, black: false, red: false },
    cityCubes: CITIES.map(() => [0, 0, 0, 0]),
    stations: new Set([startCityId]),
    pawns,
    current: 0,
    actionsLeft: ACTIONS_PER_TURN,
    outbreaks: 0,
    infectionRateIdx: 0,
    playerDeck,
    playerDiscard: [],
    infectionDeck,
    infectionDiscard: [],
    phase: "action",
    lastEvent: `Game start — roles: ${roleOrder.map((r) => ROLE_INFO[r].label).join(", ")}.`,
    loseReason: null,
    seed: startSeed,
    pendingAction: null,
  };

  // Initial infections: 3 cubes × 3 cities, 2 × 3, 1 × 3 — same outbreak rules
  // do NOT apply on initial seed (board is empty).
  const initialPlan: Array<{ count: number }> = [
    { count: 3 }, { count: 3 }, { count: 3 },
    { count: 2 }, { count: 2 }, { count: 2 },
    { count: 1 }, { count: 1 }, { count: 1 },
  ];
  for (const step of initialPlan) {
    if (state.infectionDeck.length === 0) break;
    const deck = state.infectionDeck.slice();
    const card = deck.pop()!;
    const ci = colorIdx(CITIES[card.cityId]!.color);
    const cityCubes = state.cityCubes.map((row) => row.slice());
    cityCubes[card.cityId]![ci]! = step.count;
    const cubes = { ...state.cubes, [CITIES[card.cityId]!.color]: state.cubes[CITIES[card.cityId]!.color] - step.count };
    state = {
      ...state,
      infectionDeck: deck,
      infectionDiscard: state.infectionDiscard.concat([card]),
      cityCubes,
      cubes,
    };
  }

  return state;
}

// ─── Game logic helpers ─────────────────────────────────────────────────────

function endTurnIfNoActions(state: PandemicFullState): PandemicFullState {
  if (state.actionsLeft > 0) return state;
  // Draw 2 player cards.
  let s: PandemicFullState = { ...state, phase: "draw" };
  s = drawPlayerCards(s, 2);
  if (s.phase === "lost") return s;
  // Infect.
  const rate = currentInfectionRate(s);
  s = { ...s, phase: "infect" };
  s = applyInfectionDraw(s, rate);
  if (s.phase === "lost") return s;
  // Next pawn's turn.
  const next = (state.current + 1) % state.pawns.length;
  return { ...s, current: next, actionsLeft: ACTIONS_PER_TURN, phase: "action", pendingAction: null };
}

function drawPlayerCards(state: PandemicFullState, count: number): PandemicFullState {
  let s = state;
  for (let i = 0; i < count; i++) {
    if (s.playerDeck.length === 0) {
      return { ...s, phase: "lost", loseReason: "Player deck empty." };
    }
    const deck = s.playerDeck.slice();
    const card = deck.pop()!;
    s = { ...s, playerDeck: deck };
    if (card.kind === "epidemic") {
      s = { ...s, playerDiscard: s.playerDiscard.concat([card]) };
      s = applyEpidemic(s);
      if (s.phase === "lost") return s;
    } else {
      const pawn = s.pawns[s.current]!;
      const newPawns = s.pawns.slice();
      newPawns[s.current] = { ...pawn, hand: pawn.hand.concat([card]) };
      s = { ...s, pawns: newPawns };
    }
  }
  return s;
}

function spendAction(state: PandemicFullState): PandemicFullState {
  const s = { ...state, actionsLeft: Math.max(0, state.actionsLeft - 1) };
  return endTurnIfNoActions(s);
}

function discardFromHand(state: PandemicFullState, pawnIdx: number, predicate: (c: PlayerCard) => boolean): PandemicFullState | null {
  const pawn = state.pawns[pawnIdx]!;
  const idx = pawn.hand.findIndex(predicate);
  if (idx < 0) return null;
  const card = pawn.hand[idx]!;
  const newHand = pawn.hand.slice();
  newHand.splice(idx, 1);
  const newPawns = state.pawns.slice();
  newPawns[pawnIdx] = { ...pawn, hand: newHand };
  return { ...state, pawns: newPawns, playerDiscard: state.playerDiscard.concat([card]) };
}

function isAdjacent(a: number, b: number): boolean {
  return ADJACENCY[a]!.includes(b);
}

function winIfAllCured(state: PandemicFullState): PandemicFullState {
  if (state.cured.blue && state.cured.yellow && state.cured.black && state.cured.red) {
    return { ...state, phase: "won", lastEvent: "All 4 cures discovered. Victory!" };
  }
  return state;
}

// ─── Reducer ────────────────────────────────────────────────────────────────

export function reducer(state: PandemicFullState, action: PandemicFullAction): PandemicFullState {
  if (state.phase === "won" || state.phase === "lost") return state;

  // Pending action selection (UI-only state mutation; no action spent)
  if (action.type === "setPending") {
    return { ...state, pendingAction: action.pending };
  }

  if (state.phase !== "action") return state;

  const pawn = state.pawns[state.current]!;

  switch (action.type) {
    case "drive": {
      if (!isAdjacent(pawn.cityId, action.toCityId)) return state;
      if (state.actionsLeft <= 0) return state;
      const newPawns = state.pawns.slice();
      newPawns[state.current] = { ...pawn, cityId: action.toCityId };
      let s: PandemicFullState = { ...state, pawns: newPawns, lastEvent: `${ROLE_INFO[pawn.role].label} drove to ${CITIES[action.toCityId]!.name}.`, pendingAction: null };
      s = autoMedicTreatOnMove(s, state.current);
      return spendAction(s);
    }
    case "directFlight": {
      if (state.actionsLeft <= 0) return state;
      if (pawn.cityId === action.toCityId) return state;
      const next = discardFromHand(state, state.current, (c) => c.kind === "city" && c.cityId === action.toCityId);
      if (!next) return state;
      const newPawns = next.pawns.slice();
      newPawns[state.current] = { ...next.pawns[state.current]!, cityId: action.toCityId };
      let s: PandemicFullState = { ...next, pawns: newPawns, lastEvent: `${ROLE_INFO[pawn.role].label} took a Direct Flight to ${CITIES[action.toCityId]!.name}.`, pendingAction: null };
      s = autoMedicTreatOnMove(s, state.current);
      return spendAction(s);
    }
    case "charterFlight": {
      if (state.actionsLeft <= 0) return state;
      if (pawn.cityId === action.toCityId) return state;
      const next = discardFromHand(state, state.current, (c) => c.kind === "city" && c.cityId === pawn.cityId);
      if (!next) return state;
      const newPawns = next.pawns.slice();
      newPawns[state.current] = { ...next.pawns[state.current]!, cityId: action.toCityId };
      let s: PandemicFullState = { ...next, pawns: newPawns, lastEvent: `${ROLE_INFO[pawn.role].label} chartered to ${CITIES[action.toCityId]!.name}.`, pendingAction: null };
      s = autoMedicTreatOnMove(s, state.current);
      return spendAction(s);
    }
    case "shuttleFlight": {
      if (state.actionsLeft <= 0) return state;
      if (!state.stations.has(pawn.cityId) || !state.stations.has(action.toCityId)) return state;
      if (pawn.cityId === action.toCityId) return state;
      const newPawns = state.pawns.slice();
      newPawns[state.current] = { ...pawn, cityId: action.toCityId };
      let s: PandemicFullState = { ...state, pawns: newPawns, lastEvent: `${ROLE_INFO[pawn.role].label} shuttled to ${CITIES[action.toCityId]!.name}.`, pendingAction: null };
      s = autoMedicTreatOnMove(s, state.current);
      return spendAction(s);
    }
    case "buildStation": {
      if (state.actionsLeft <= 0) return state;
      if (state.stations.has(pawn.cityId)) return state;
      let s = state;
      if (pawn.role !== "ops") {
        // Must discard current city card
        const next = discardFromHand(state, state.current, (c) => c.kind === "city" && c.cityId === pawn.cityId);
        if (!next) return state;
        s = next;
      }
      const stations = new Set(state.stations);
      stations.add(pawn.cityId);
      return spendAction({ ...s, stations, lastEvent: `Station built in ${CITIES[pawn.cityId]!.name}.`, pendingAction: null });
    }
    case "treat": {
      if (state.actionsLeft <= 0) return state;
      const ci = colorIdx(action.color);
      const here = state.cityCubes[pawn.cityId]![ci]!;
      if (here <= 0) return state;
      const cityCubes = state.cityCubes.map((row) => row.slice());
      let removed: number;
      if (pawn.role === "medic" || state.cured[action.color]) {
        removed = here;
      } else {
        removed = 1;
      }
      cityCubes[pawn.cityId]![ci]! = here - removed;
      const cubes = { ...state.cubes, [action.color]: state.cubes[action.color] + removed };
      return spendAction({ ...state, cityCubes, cubes, lastEvent: `Treated ${removed} ${action.color} cube${removed > 1 ? "s" : ""} in ${CITIES[pawn.cityId]!.name}.`, pendingAction: null });
    }
    case "shareKnowledge": {
      if (state.actionsLeft <= 0) return state;
      const other = state.pawns[action.otherPawnIdx];
      if (!other || action.otherPawnIdx === state.current) return state;
      // Standard rule: both must be in same city. Researcher exception: can share ANY card.
      const isResearcher = pawn.role === "researcher" || other.role === "researcher";
      if (pawn.cityId !== other.cityId) return state;
      // The card must match the city, unless either is the researcher giving
      const cardId = action.cityId;
      // Find who has the card
      const giverIdx = pawn.hand.some((c) => c.kind === "city" && c.cityId === cardId) ? state.current
        : other.hand.some((c) => c.kind === "city" && c.cityId === cardId) ? action.otherPawnIdx
        : -1;
      if (giverIdx < 0) return state;
      if (!isResearcher && cardId !== pawn.cityId) return state;
      const receiverIdx = giverIdx === state.current ? action.otherPawnIdx : state.current;
      const giver = state.pawns[giverIdx]!;
      const receiver = state.pawns[receiverIdx]!;
      const newGiverHand = giver.hand.filter((c) => !(c.kind === "city" && c.cityId === cardId));
      const newReceiverHand = receiver.hand.concat([{ kind: "city", cityId: cardId }]);
      const newPawns = state.pawns.slice();
      newPawns[giverIdx] = { ...giver, hand: newGiverHand };
      newPawns[receiverIdx] = { ...receiver, hand: newReceiverHand };
      return spendAction({ ...state, pawns: newPawns, lastEvent: `${ROLE_INFO[giver.role].label} shared ${CITIES[cardId]!.name} with ${ROLE_INFO[receiver.role].label}.`, pendingAction: null });
    }
    case "discoverCure": {
      if (state.actionsLeft <= 0) return state;
      if (!state.stations.has(pawn.cityId)) return state;
      const needed = pawn.role === "scientist" ? 4 : 5;
      if (action.cardIds.length !== needed) return state;
      // Validate all cards exist in hand and match color
      const idsSet = new Set(action.cardIds);
      const cards = pawn.hand.map((c, i) => ({ c, i })).filter(({ i }) => idsSet.has(i));
      if (cards.length !== needed) return state;
      const color = action.color;
      for (const { c } of cards) {
        if (c.kind !== "city") return state;
        if (CITIES[c.cityId]!.color !== color) return state;
      }
      if (state.cured[color]) return state;
      // Discard them
      const remainingHand = pawn.hand.filter((_, i) => !idsSet.has(i));
      const discardedCards = cards.map(({ c }) => c);
      const newPawns = state.pawns.slice();
      newPawns[state.current] = { ...pawn, hand: remainingHand };
      const cured = { ...state.cured, [color]: true };
      let s: PandemicFullState = {
        ...state,
        pawns: newPawns,
        playerDiscard: state.playerDiscard.concat(discardedCards),
        cured,
        lastEvent: `Cure discovered for ${color}!`,
        pendingAction: null,
      };
      s = winIfAllCured(s);
      if (s.phase === "won") return s;
      return spendAction(s);
    }
    case "dispatcherMove": {
      // Only legal when the current pawn is the dispatcher.
      if (pawn.role !== "dispatcher") return state;
      if (state.actionsLeft <= 0) return state;
      const other = state.pawns[action.otherPawnIdx];
      if (!other) return state;
      // Simplified: move the other pawn as a basic Drive (adjacent only).
      if (!isAdjacent(other.cityId, action.toCityId)) return state;
      const newPawns = state.pawns.slice();
      newPawns[action.otherPawnIdx] = { ...other, cityId: action.toCityId };
      let s: PandemicFullState = { ...state, pawns: newPawns, lastEvent: `Dispatcher moved ${ROLE_INFO[other.role].label} to ${CITIES[action.toCityId]!.name}.`, pendingAction: null };
      s = autoMedicTreatOnMove(s, action.otherPawnIdx);
      return spendAction(s);
    }
    case "pass": {
      // Skip remaining actions; jump to draw/infect.
      const s = { ...state, actionsLeft: 0 };
      return endTurnIfNoActions(s);
    }
    default:
      return state;
  }
}

// Medic auto-cleanup: when a Medic enters a city, automatically remove all
// cubes of any cured color from that city.
function autoMedicTreatOnMove(state: PandemicFullState, pawnIdx: number): PandemicFullState {
  const pawn = state.pawns[pawnIdx];
  if (!pawn || pawn.role !== "medic") return state;
  const ci = pawn.cityId;
  const cityCubes = state.cityCubes.map((row) => row.slice());
  const cubes = { ...state.cubes };
  let changed = false;
  for (const color of COLORS) {
    if (!state.cured[color]) continue;
    const idx = colorIdx(color);
    const here = cityCubes[ci]![idx]!;
    if (here > 0) {
      cityCubes[ci]![idx]! = 0;
      cubes[color] = cubes[color] + here;
      changed = true;
    }
  }
  if (!changed) return state;
  return { ...state, cityCubes, cubes };
}

// ─── Terminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: PandemicFullState): { score: number } | null {
  if (state.phase === "won") {
    // Score: base 1000, minus 50 per outbreak, minus 10 per infection rate step.
    const base = 1000;
    const score = Math.max(1, base - state.outbreaks * 50 - state.infectionRateIdx * 25);
    return { score };
  }
  if (state.phase === "lost") {
    return { score: 0 };
  }
  return null;
}

// ─── Convenience selectors (for UI / tests) ─────────────────────────────────

export function isCured(state: PandemicFullState, color: DiseaseColor): boolean {
  return state.cured[color];
}

export function currentPawn(state: PandemicFullState): PlayerPawn {
  return state.pawns[state.current]!;
}

export function infectionRate(state: PandemicFullState): number {
  return currentInfectionRate(state);
}
