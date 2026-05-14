import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =============================================================================
// Pandemic (Solo, Full) — L tier
//
// One human controls 2–4 cooperating roles on the standard 48-city Pandemic map.
// On each role's turn the human spends 4 actions, then draws 2 player cards
// (which may trigger epidemics), then infects per the current rate.
//
// IMPLEMENTED:
//   • 48 cities across 4 colors with full adjacency graph.
//   • Player deck = 48 city cards + 5 event cards + difficulty epidemics
//     (Introductory 4, Standard 5, Heroic 6). Events are simple "skip" filler
//     in solo: holding/discarding them does nothing special (advanced).
//   • Infection deck = 48 cards, drawn at current rate (2/2/2/3/3/4/4).
//   • Initial 9-city infection (3×3, 3×2, 3×1 cubes) at setup.
//   • Each pawn starts at Atlanta (a permanent research station).
//   • 7 actions: move-adjacent, direct-flight (discard dest card), charter-flight
//     (discard current-city card), shuttle-flight (between stations),
//     build-station (discard current-city card; free at Atlanta no-op),
//     treat (remove one cube of chosen color, or all if cured/Medic),
//     share-knowledge (give/take current-city card between two same-city roles
//     — Researcher may share any card from her hand), discover-cure
//     (5 same-color city cards at a station; Scientist needs only 4), pass.
//   • Epidemic step: increase rate, bottom-deck infection placed with 3 cubes,
//     reshuffle infection discard on top.
//   • Outbreak chains with visited-set; 8 outbreaks → loss.
//   • Cube supply (24 per color) — exhausting any → loss.
//   • Player deck empty → loss.
//   • 4 cures discovered → win.
//   • Single-player can swap which role acts (`activate_role`).
//   • Medic auto-clears all cubes when treating.
//   • Scientist cures with 4 same-color cards.
//   • All randomness flows through the mulberry32-seeded RNG.
//
// OMITTED (advanced rules — noted in howToPlay):
//   • Event card *effects* (Government Grant, Forecast, etc.) — events exist
//     as discardable filler but have no playable effect in this version.
//   • Eradication state (cured + zero cubes worldwide). Cured colors can still
//     accumulate cubes here; Medic blocks placement only at her city.
//   • Role variety beyond Medic+Scientist (other pawns are "Generalist" with
//     no special powers — labeled Roles A/B/C/D in UI).
//   • Hand limit discard — players may hold any number of cards; HAND_LIMIT
//     is exported and consulted for UI warning only.
//   • Forecast / Resilient Population / Quarantine Specialist mechanics.
// =============================================================================

export type DiseaseColor = "blue" | "yellow" | "black" | "red";
export const COLORS: readonly DiseaseColor[] = ["blue", "yellow", "black", "red"];
export const CUBES_PER_COLOR = 24;
export const HAND_LIMIT = 7;
export const OUTBREAK_LOSS = 8;
export const ACTIONS_PER_TURN = 4;
export const INITIAL_HAND_SIZE = 4;
export const INFECTION_RATES = [2, 2, 2, 3, 3, 4, 4] as const;

export type RoleId = "medic" | "scientist" | "generalist-a" | "generalist-b";
export interface RoleInfo {
  id: RoleId;
  label: string;
  blurb: string;
}
export const ROLE_INFO: Record<RoleId, RoleInfo> = {
  medic: { id: "medic", label: "Medic", blurb: "Treat removes ALL cubes of one color." },
  scientist: { id: "scientist", label: "Scientist", blurb: "Cure with 4 same-color cards." },
  "generalist-a": { id: "generalist-a", label: "Generalist A", blurb: "Standard turn powers." },
  "generalist-b": { id: "generalist-b", label: "Generalist B", blurb: "Standard turn powers." },
};
export const ROLE_POOL: readonly RoleId[] = ["medic", "scientist", "generalist-a", "generalist-b"];

export interface CityDef {
  id: number;
  name: string;
  color: DiseaseColor;
  x: number;
  y: number;
}

// 12 cities per color → 48 cities total. Coordinates are 0..1000 × 0..550.
// Ids 0..11 = blue, 12..23 = yellow, 24..35 = black, 36..47 = red.
export const CITIES: readonly CityDef[] = [
  { id: 0,  name: "San Francisco",   color: "blue",   x: 90,  y: 200 },
  { id: 1,  name: "Chicago",         color: "blue",   x: 215, y: 180 },
  { id: 2,  name: "Atlanta",         color: "blue",   x: 250, y: 230 },
  { id: 3,  name: "Montreal",        color: "blue",   x: 290, y: 165 },
  { id: 4,  name: "Washington",      color: "blue",   x: 305, y: 230 },
  { id: 5,  name: "New York",        color: "blue",   x: 335, y: 185 },
  { id: 6,  name: "London",          color: "blue",   x: 445, y: 145 },
  { id: 7,  name: "Madrid",          color: "blue",   x: 460, y: 215 },
  { id: 8,  name: "Paris",           color: "blue",   x: 495, y: 175 },
  { id: 9,  name: "Essen",           color: "blue",   x: 520, y: 125 },
  { id: 10, name: "Milan",           color: "blue",   x: 540, y: 175 },
  { id: 11, name: "St. Petersburg",  color: "blue",   x: 595, y: 110 },

  { id: 12, name: "Los Angeles",     color: "yellow", x: 115, y: 260 },
  { id: 13, name: "Mexico City",     color: "yellow", x: 200, y: 300 },
  { id: 14, name: "Miami",           color: "yellow", x: 285, y: 290 },
  { id: 15, name: "Bogota",          color: "yellow", x: 300, y: 360 },
  { id: 16, name: "Lima",            color: "yellow", x: 290, y: 425 },
  { id: 17, name: "Santiago",        color: "yellow", x: 315, y: 500 },
  { id: 18, name: "Sao Paulo",       color: "yellow", x: 395, y: 430 },
  { id: 19, name: "Buenos Aires",    color: "yellow", x: 365, y: 480 },
  { id: 20, name: "Lagos",           color: "yellow", x: 510, y: 340 },
  { id: 21, name: "Khartoum",        color: "yellow", x: 590, y: 320 },
  { id: 22, name: "Kinshasa",        color: "yellow", x: 555, y: 395 },
  { id: 23, name: "Johannesburg",    color: "yellow", x: 585, y: 460 },

  { id: 24, name: "Algiers",         color: "black",  x: 510, y: 245 },
  { id: 25, name: "Istanbul",        color: "black",  x: 580, y: 195 },
  { id: 26, name: "Moscow",          color: "black",  x: 635, y: 145 },
  { id: 27, name: "Cairo",           color: "black",  x: 575, y: 260 },
  { id: 28, name: "Baghdad",         color: "black",  x: 625, y: 215 },
  { id: 29, name: "Tehran",          color: "black",  x: 675, y: 195 },
  { id: 30, name: "Riyadh",          color: "black",  x: 625, y: 280 },
  { id: 31, name: "Karachi",         color: "black",  x: 690, y: 250 },
  { id: 32, name: "Mumbai",          color: "black",  x: 720, y: 290 },
  { id: 33, name: "Delhi",           color: "black",  x: 740, y: 225 },
  { id: 34, name: "Chennai",         color: "black",  x: 755, y: 320 },
  { id: 35, name: "Kolkata",         color: "black",  x: 780, y: 245 },

  { id: 36, name: "Beijing",         color: "red",    x: 820, y: 175 },
  { id: 37, name: "Seoul",           color: "red",    x: 875, y: 195 },
  { id: 38, name: "Tokyo",           color: "red",    x: 920, y: 215 },
  { id: 39, name: "Shanghai",        color: "red",    x: 835, y: 230 },
  { id: 40, name: "Hong Kong",       color: "red",    x: 825, y: 280 },
  { id: 41, name: "Taipei",          color: "red",    x: 870, y: 270 },
  { id: 42, name: "Osaka",           color: "red",    x: 925, y: 255 },
  { id: 43, name: "Bangkok",         color: "red",    x: 795, y: 305 },
  { id: 44, name: "Ho Chi Minh City",color: "red",    x: 830, y: 340 },
  { id: 45, name: "Jakarta",         color: "red",    x: 820, y: 395 },
  { id: 46, name: "Manila",          color: "red",    x: 895, y: 320 },
  { id: 47, name: "Sydney",          color: "red",    x: 920, y: 470 },
];

const RAW_EDGES: ReadonlyArray<readonly [string, string]> = [
  ["San Francisco","Chicago"],["San Francisco","Los Angeles"],["San Francisco","Tokyo"],["San Francisco","Manila"],
  ["Chicago","Atlanta"],["Chicago","Montreal"],["Chicago","Los Angeles"],["Chicago","Mexico City"],
  ["Atlanta","Miami"],["Atlanta","Washington"],
  ["Montreal","New York"],["Montreal","Washington"],
  ["Washington","New York"],["Washington","Miami"],
  ["New York","London"],["New York","Madrid"],
  ["London","Madrid"],["London","Paris"],["London","Essen"],
  ["Madrid","Paris"],["Madrid","Sao Paulo"],["Madrid","Algiers"],
  ["Paris","Essen"],["Paris","Milan"],["Paris","Algiers"],
  ["Essen","Milan"],["Essen","St. Petersburg"],
  ["Milan","Istanbul"],
  ["St. Petersburg","Istanbul"],["St. Petersburg","Moscow"],
  ["Los Angeles","Mexico City"],["Los Angeles","Sydney"],
  ["Mexico City","Miami"],["Mexico City","Bogota"],["Mexico City","Lima"],
  ["Miami","Bogota"],
  ["Bogota","Lima"],["Bogota","Sao Paulo"],["Bogota","Buenos Aires"],
  ["Lima","Santiago"],
  ["Sao Paulo","Buenos Aires"],["Sao Paulo","Lagos"],
  ["Lagos","Khartoum"],["Lagos","Kinshasa"],
  ["Khartoum","Cairo"],["Khartoum","Kinshasa"],["Khartoum","Johannesburg"],
  ["Kinshasa","Johannesburg"],
  ["Algiers","Istanbul"],["Algiers","Cairo"],
  ["Istanbul","Cairo"],["Istanbul","Baghdad"],["Istanbul","Moscow"],
  ["Moscow","Tehran"],
  ["Cairo","Baghdad"],["Cairo","Riyadh"],
  ["Baghdad","Tehran"],["Baghdad","Riyadh"],["Baghdad","Karachi"],
  ["Tehran","Karachi"],["Tehran","Delhi"],
  ["Riyadh","Karachi"],
  ["Karachi","Mumbai"],["Karachi","Delhi"],
  ["Mumbai","Chennai"],["Mumbai","Delhi"],
  ["Delhi","Chennai"],["Delhi","Kolkata"],
  ["Chennai","Kolkata"],["Chennai","Bangkok"],["Chennai","Jakarta"],
  ["Kolkata","Bangkok"],["Kolkata","Hong Kong"],
  ["Beijing","Seoul"],["Beijing","Shanghai"],
  ["Seoul","Shanghai"],["Seoul","Tokyo"],
  ["Tokyo","Shanghai"],["Tokyo","Osaka"],
  ["Shanghai","Hong Kong"],["Shanghai","Taipei"],
  ["Hong Kong","Taipei"],["Hong Kong","Bangkok"],["Hong Kong","Ho Chi Minh City"],["Hong Kong","Manila"],
  ["Taipei","Osaka"],["Taipei","Manila"],
  ["Bangkok","Ho Chi Minh City"],["Bangkok","Jakarta"],
  ["Ho Chi Minh City","Jakarta"],["Ho Chi Minh City","Manila"],
  ["Jakarta","Sydney"],
  ["Manila","Sydney"],
];

const NAME_TO_ID = new Map<string, number>(CITIES.map((c) => [c.name, c.id]));
export function cityIdByName(name: string): number {
  const id = NAME_TO_ID.get(name);
  if (id === undefined) throw new Error(`Unknown city: ${name}`);
  return id;
}
export const ATLANTA = cityIdByName("Atlanta");

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

export type PlayerCard =
  | { kind: "city"; cityId: number }
  | { kind: "event"; eventId: number }   // events are filler in solo
  | { kind: "epidemic" };

export interface InfectionCard { cityId: number }

export const EVENT_NAMES = [
  "Government Grant",
  "Airlift",
  "Forecast",
  "Resilient Population",
  "One Quiet Night",
] as const;

// ─── Settings ───────────────────────────────────────────────────────────────

export type Difficulty = "introductory" | "standard" | "heroic";
export interface PandemicSoloFullSettings {
  difficulty: Difficulty;
  roleCount: 2 | 3 | 4;
}

export function epidemicsFor(d: Difficulty): number {
  return d === "introductory" ? 4 : d === "heroic" ? 6 : 5;
}

// ─── State ──────────────────────────────────────────────────────────────────

export interface RolePawn {
  role: RoleId;
  cityId: number;
  hand: PlayerCard[];
}

export type Phase = "action" | "draw" | "infect" | "won" | "lost";

export interface PandemicSoloFullState {
  settings: PandemicSoloFullSettings;
  cubes: Record<DiseaseColor, number>;
  cured: Record<DiseaseColor, boolean>;
  cityCubes: number[][];                 // [cityId] => [b,y,k,r] counts
  stations: number[];                    // sorted unique city ids
  pawns: RolePawn[];
  current: number;                       // active pawn index
  actionsLeft: number;
  outbreaks: number;
  infectionRateIdx: number;
  playerDeck: PlayerCard[];              // top of deck = end of array
  playerDiscard: PlayerCard[];
  infectionDeck: InfectionCard[];        // top of deck = end of array
  infectionDiscard: InfectionCard[];
  phase: Phase;
  lastEvent: string;
  loseReason: string | null;
  seed: number;                          // rolling seed
}

// ─── Actions ────────────────────────────────────────────────────────────────

export type PandemicSoloFullAction =
  | { type: "activate_role"; pawnIdx: number }
  | { type: "drive"; toCityId: number }
  | { type: "direct_flight"; toCityId: number }
  | { type: "charter_flight"; toCityId: number }
  | { type: "shuttle_flight"; toCityId: number }
  | { type: "build_station" }
  | { type: "treat"; color: DiseaseColor }
  | { type: "share_knowledge"; cityId: number; giverIdx: number; receiverIdx: number }
  | { type: "discover_cure"; color: DiseaseColor; cardCityIds: number[] }
  | { type: "pass" }
  | { type: "draw_cards" }
  | { type: "infect_cities" };

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
  const rng = mulberry32(seed);
  return Math.floor(rng() * 0x7fffffff);
}

function colorIdx(c: DiseaseColor): number {
  return c === "blue" ? 0 : c === "yellow" ? 1 : c === "black" ? 2 : 3;
}

export function currentRate(state: PandemicSoloFullState): number {
  const idx = Math.min(state.infectionRateIdx, INFECTION_RATES.length - 1);
  return INFECTION_RATES[idx]!;
}

export function totalCubes(state: PandemicSoloFullState, cityId: number): number {
  const r = state.cityCubes[cityId]!;
  return r[0]! + r[1]! + r[2]! + r[3]!;
}

export function curesCount(state: PandemicSoloFullState): number {
  return (state.cured.blue ? 1 : 0) + (state.cured.yellow ? 1 : 0)
       + (state.cured.black ? 1 : 0) + (state.cured.red ? 1 : 0);
}

export function hasStation(state: PandemicSoloFullState, cityId: number): boolean {
  return state.stations.includes(cityId);
}

function buildCityCards(): PlayerCard[] {
  return CITIES.map((c) => ({ kind: "city" as const, cityId: c.id }));
}

function buildEventCards(): PlayerCard[] {
  return EVENT_NAMES.map((_, i) => ({ kind: "event" as const, eventId: i }));
}

function buildInfectionCards(): InfectionCard[] {
  return CITIES.map((c) => ({ cityId: c.id }));
}

function chooseRoles(count: 2 | 3 | 4, rng: () => number): RoleId[] {
  // Always include Medic + Scientist for the implemented powers; fill rest
  // deterministically from the pool.
  const forced: RoleId[] = ["medic", "scientist"];
  if (count === 2) return forced;
  const rest = shuffle(["generalist-a", "generalist-b"] as RoleId[], rng);
  return forced.concat(rest.slice(0, count - 2));
}

// Place a cube and chain outbreaks. Pure: returns updated state object.
function placeCube(
  state: PandemicSoloFullState,
  cityId: number,
  color: DiseaseColor,
  visited: Set<number>,
): PandemicSoloFullState {
  let s = state;

  // Medic at this city blocks cubes of a cured color.
  for (const p of s.pawns) {
    if (p.role === "medic" && p.cityId === cityId && s.cured[color]) {
      return s;
    }
  }

  if (s.cubes[color] <= 0) {
    return {
      ...s,
      phase: "lost",
      loseReason: `Cube supply exhausted (${color}).`,
      lastEvent: `Cube supply exhausted: ${color}.`,
    };
  }

  const ci = colorIdx(color);
  if (s.cityCubes[cityId]![ci]! < 3) {
    const cityCubes = s.cityCubes.map((row) => row.slice());
    cityCubes[cityId]![ci] = cityCubes[cityId]![ci]! + 1;
    const cubes = { ...s.cubes, [color]: s.cubes[color] - 1 };
    return { ...s, cityCubes, cubes };
  }

  // Outbreak.
  if (visited.has(cityId)) return s;
  visited.add(cityId);
  const outbreaks = s.outbreaks + 1;
  s = { ...s, outbreaks, lastEvent: `Outbreak in ${CITIES[cityId]!.name}!` };
  if (outbreaks >= OUTBREAK_LOSS) {
    return { ...s, phase: "lost", loseReason: `8 outbreaks reached.` };
  }
  for (const n of ADJACENCY[cityId]!) {
    s = placeCube(s, n, color, visited);
    if (s.phase === "lost") return s;
  }
  return s;
}

function infectOnce(state: PandemicSoloFullState): PandemicSoloFullState {
  if (state.infectionDeck.length === 0) return state;
  const deck = state.infectionDeck.slice();
  const card = deck.pop()!;
  const discard = state.infectionDiscard.concat([card]);
  let s: PandemicSoloFullState = { ...state, infectionDeck: deck, infectionDiscard: discard };
  const color = CITIES[card.cityId]!.color;
  s = placeCube(s, card.cityId, color, new Set());
  return s;
}

function epidemic(state: PandemicSoloFullState): PandemicSoloFullState {
  let s = state;
  s = {
    ...s,
    infectionRateIdx: Math.min(s.infectionRateIdx + 1, INFECTION_RATES.length - 1),
    lastEvent: "EPIDEMIC!",
  };
  // Infect from bottom of infection deck with 3 cubes.
  if (s.infectionDeck.length > 0) {
    const deck = s.infectionDeck.slice();
    const card = deck.shift()!;
    s = { ...s, infectionDeck: deck, infectionDiscard: s.infectionDiscard.concat([card]) };
    const color = CITIES[card.cityId]!.color;
    for (let k = 0; k < 3; k++) {
      s = placeCube(s, card.cityId, color, new Set());
      if (s.phase === "lost") return s;
    }
  }
  // Intensify: shuffle discard, place on top.
  const rng = mulberry32(s.seed);
  const reshuf = shuffle(s.infectionDiscard, rng);
  s = {
    ...s,
    infectionDeck: s.infectionDeck.concat(reshuf),
    infectionDiscard: [],
    seed: nextSeed(s.seed),
  };
  return s;
}

function drawTwo(state: PandemicSoloFullState): PandemicSoloFullState {
  let s = state;
  for (let i = 0; i < 2; i++) {
    if (s.playerDeck.length === 0) {
      return {
        ...s,
        phase: "lost",
        loseReason: "Player deck exhausted.",
        lastEvent: "Player deck empty — outbreak unchecked.",
      };
    }
    const deck = s.playerDeck.slice();
    const card = deck.pop()!;
    if (card.kind === "epidemic") {
      s = { ...s, playerDeck: deck };
      s = epidemic(s);
      if (s.phase === "lost") return s;
    } else {
      // Add to current pawn's hand.
      const pawns = s.pawns.map((p, idx) =>
        idx === s.current ? { ...p, hand: p.hand.concat([card]) } : p,
      );
      s = { ...s, playerDeck: deck, pawns };
    }
  }
  return s;
}

function infectStep(state: PandemicSoloFullState): PandemicSoloFullState {
  let s = state;
  const n = currentRate(s);
  for (let i = 0; i < n; i++) {
    s = infectOnce(s);
    if (s.phase === "lost") return s;
  }
  return s;
}

function endTurn(state: PandemicSoloFullState): PandemicSoloFullState {
  // Draw → infect → next pawn.
  let s: PandemicSoloFullState = { ...state, phase: "draw" };
  s = drawTwo(s);
  if (s.phase === "lost") return s;
  if (curesCount(s) === 4) return { ...s, phase: "won", lastEvent: "All four cures discovered!" };
  s = { ...s, phase: "infect" };
  s = infectStep(s);
  if (s.phase === "lost") return s;
  const nextIdx = (s.current + 1) % s.pawns.length;
  return { ...s, current: nextIdx, actionsLeft: ACTIONS_PER_TURN, phase: "action" };
}

// ─── Initial state ──────────────────────────────────────────────────────────

export function initialState(seed: number, settings: PandemicSoloFullSettings): PandemicSoloFullState {
  const rng = mulberry32(seed);

  const roles = chooseRoles(settings.roleCount, rng);

  // Build infection deck (shuffled). Top = end.
  const infectionDeck = shuffle(buildInfectionCards(), rng);

  // Build base player card pool (city + events).
  const baseCards = buildCityCards().concat(buildEventCards());
  const shuffledBase = shuffle(baseCards, rng);

  // Deal initial hands.
  const pawns: RolePawn[] = roles.map((role) => ({ role, cityId: ATLANTA, hand: [] }));
  let idx = 0;
  for (let h = 0; h < INITIAL_HAND_SIZE; h++) {
    for (const p of pawns) {
      const c = shuffledBase[idx++];
      if (c) p.hand.push(c);
    }
  }

  const remaining = shuffledBase.slice(idx);

  // Distribute epidemics across remaining piles.
  const ec = epidemicsFor(settings.difficulty);
  const piles: PlayerCard[][] = Array.from({ length: ec }, () => []);
  const base = Math.floor(remaining.length / ec);
  const extra = remaining.length % ec;
  let p2 = 0;
  for (let p = 0; p < ec; p++) {
    const size = base + (p < extra ? 1 : 0);
    piles[p] = remaining.slice(p2, p2 + size);
    p2 += size;
  }
  for (let p = 0; p < ec; p++) {
    piles[p]!.push({ kind: "epidemic" });
    piles[p] = shuffle(piles[p]!, rng);
  }
  const playerDeck = piles.flat();

  let state: PandemicSoloFullState = {
    settings,
    cubes: { blue: CUBES_PER_COLOR, yellow: CUBES_PER_COLOR, black: CUBES_PER_COLOR, red: CUBES_PER_COLOR },
    cured: { blue: false, yellow: false, black: false, red: false },
    cityCubes: CITIES.map(() => [0, 0, 0, 0]),
    stations: [ATLANTA],
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
    lastEvent: "Outbreak imminent — get to work.",
    loseReason: null,
    seed: Math.floor(rng() * 0x7fffffff),
  };

  // Initial 9-card infection: 3 cards with 3 cubes, 3 with 2, 3 with 1.
  for (let group = 0; group < 3; group++) {
    const cubesThis = 3 - group;
    for (let i = 0; i < 3; i++) {
      if (state.infectionDeck.length === 0) break;
      const deck = state.infectionDeck.slice();
      const card = deck.pop()!;
      const discard = state.infectionDiscard.concat([card]);
      state = { ...state, infectionDeck: deck, infectionDiscard: discard };
      const color = CITIES[card.cityId]!.color;
      for (let k = 0; k < cubesThis; k++) {
        state = placeCube(state, card.cityId, color, new Set());
        if (state.phase === "lost") return state;
      }
    }
  }

  return state;
}

// ─── Reducer ────────────────────────────────────────────────────────────────

function discardFromHand(p: RolePawn, predicate: (c: PlayerCard) => boolean): { pawn: RolePawn; card: PlayerCard | null } {
  const i = p.hand.findIndex(predicate);
  if (i < 0) return { pawn: p, card: null };
  const newHand = p.hand.slice();
  const [card] = newHand.splice(i, 1);
  return { pawn: { ...p, hand: newHand }, card: card ?? null };
}

function consumeAction(state: PandemicSoloFullState): PandemicSoloFullState {
  const next = state.actionsLeft - 1;
  if (next <= 0) {
    return endTurn({ ...state, actionsLeft: 0 });
  }
  return { ...state, actionsLeft: next };
}

export function reducer(state: PandemicSoloFullState, action: PandemicSoloFullAction): PandemicSoloFullState {
  if (state.phase === "won" || state.phase === "lost") return state;

  switch (action.type) {
    case "activate_role": {
      if (state.phase !== "action") return state;
      if (action.pawnIdx < 0 || action.pawnIdx >= state.pawns.length) return state;
      if (action.pawnIdx === state.current) return state;
      // Solo: swap which role currently acts; remaining actions transfer.
      return { ...state, current: action.pawnIdx, lastEvent: `Switched control to ${ROLE_INFO[state.pawns[action.pawnIdx]!.role].label}.` };
    }

    case "drive": {
      if (state.phase !== "action") return state;
      const pawn = state.pawns[state.current]!;
      if (!ADJACENCY[pawn.cityId]!.includes(action.toCityId)) return state;
      const pawns = state.pawns.map((p, i) => i === state.current ? { ...p, cityId: action.toCityId } : p);
      let s: PandemicSoloFullState = { ...state, pawns, lastEvent: `Drove to ${CITIES[action.toCityId]!.name}.` };
      s = maybeMedicAutoClear(s);
      return consumeAction(s);
    }

    case "direct_flight": {
      if (state.phase !== "action") return state;
      const pawn = state.pawns[state.current]!;
      if (action.toCityId === pawn.cityId) return state;
      const { pawn: newPawn, card } = discardFromHand(pawn, (c) => c.kind === "city" && c.cityId === action.toCityId);
      if (!card) return state;
      const movedPawn = { ...newPawn, cityId: action.toCityId };
      const pawns = state.pawns.map((p, i) => i === state.current ? movedPawn : p);
      const playerDiscard = state.playerDiscard.concat([card]);
      let s: PandemicSoloFullState = { ...state, pawns, playerDiscard, lastEvent: `Direct flight to ${CITIES[action.toCityId]!.name}.` };
      s = maybeMedicAutoClear(s);
      return consumeAction(s);
    }

    case "charter_flight": {
      if (state.phase !== "action") return state;
      const pawn = state.pawns[state.current]!;
      if (action.toCityId === pawn.cityId) return state;
      const { pawn: newPawn, card } = discardFromHand(pawn, (c) => c.kind === "city" && c.cityId === pawn.cityId);
      if (!card) return state;
      const movedPawn = { ...newPawn, cityId: action.toCityId };
      const pawns = state.pawns.map((p, i) => i === state.current ? movedPawn : p);
      const playerDiscard = state.playerDiscard.concat([card]);
      let s: PandemicSoloFullState = { ...state, pawns, playerDiscard, lastEvent: `Charter to ${CITIES[action.toCityId]!.name}.` };
      s = maybeMedicAutoClear(s);
      return consumeAction(s);
    }

    case "shuttle_flight": {
      if (state.phase !== "action") return state;
      const pawn = state.pawns[state.current]!;
      if (action.toCityId === pawn.cityId) return state;
      if (!hasStation(state, pawn.cityId) || !hasStation(state, action.toCityId)) return state;
      const pawns = state.pawns.map((p, i) => i === state.current ? { ...p, cityId: action.toCityId } : p);
      let s: PandemicSoloFullState = { ...state, pawns, lastEvent: `Shuttle to ${CITIES[action.toCityId]!.name}.` };
      s = maybeMedicAutoClear(s);
      return consumeAction(s);
    }

    case "build_station": {
      if (state.phase !== "action") return state;
      const pawn = state.pawns[state.current]!;
      if (hasStation(state, pawn.cityId)) return state;
      const { pawn: newPawn, card } = discardFromHand(pawn, (c) => c.kind === "city" && c.cityId === pawn.cityId);
      if (!card) return state;
      const pawns = state.pawns.map((p, i) => i === state.current ? newPawn : p);
      const stations = state.stations.concat([pawn.cityId]).sort((a, b) => a - b);
      const playerDiscard = state.playerDiscard.concat([card]);
      const s: PandemicSoloFullState = { ...state, pawns, stations, playerDiscard, lastEvent: `Built station in ${CITIES[pawn.cityId]!.name}.` };
      return consumeAction(s);
    }

    case "treat": {
      if (state.phase !== "action") return state;
      const pawn = state.pawns[state.current]!;
      const ci = colorIdx(action.color);
      const here = state.cityCubes[pawn.cityId]!;
      if (here[ci]! <= 0) return state;
      const isMedic = pawn.role === "medic";
      const isCured = state.cured[action.color];
      const removed = (isMedic || isCured) ? here[ci]! : 1;
      const cityCubes = state.cityCubes.map((row) => row.slice());
      cityCubes[pawn.cityId]![ci] = here[ci]! - removed;
      const cubes = { ...state.cubes, [action.color]: state.cubes[action.color] + removed };
      const s: PandemicSoloFullState = {
        ...state,
        cityCubes,
        cubes,
        lastEvent: `Treated ${removed}× ${action.color} in ${CITIES[pawn.cityId]!.name}.`,
      };
      return consumeAction(s);
    }

    case "share_knowledge": {
      if (state.phase !== "action") return state;
      const giver = state.pawns[action.giverIdx];
      const receiver = state.pawns[action.receiverIdx];
      if (!giver || !receiver) return state;
      if (giver === receiver) return state;
      if (giver.cityId !== receiver.cityId) return state;
      if (giver.cityId !== action.cityId && receiver.cityId !== action.cityId) return state;
      // One of the involved pawns must be at action.cityId == giver.cityId.
      // Card must equal city where they currently stand.
      if (giver.cityId !== action.cityId) return state;
      // The active pawn must be one of giver/receiver.
      if (state.current !== action.giverIdx && state.current !== action.receiverIdx) return state;
      const gi = giver.hand.findIndex((c) => c.kind === "city" && c.cityId === action.cityId);
      if (gi < 0) return state;
      const newGiverHand = giver.hand.slice();
      const [card] = newGiverHand.splice(gi, 1);
      if (!card) return state;
      const newReceiverHand = receiver.hand.concat([card]);
      const pawns = state.pawns.map((p, i) => {
        if (i === action.giverIdx) return { ...p, hand: newGiverHand };
        if (i === action.receiverIdx) return { ...p, hand: newReceiverHand };
        return p;
      });
      const s: PandemicSoloFullState = {
        ...state,
        pawns,
        lastEvent: `${ROLE_INFO[giver.role].label} → ${ROLE_INFO[receiver.role].label}: ${CITIES[action.cityId]!.name}.`,
      };
      return consumeAction(s);
    }

    case "discover_cure": {
      if (state.phase !== "action") return state;
      const pawn = state.pawns[state.current]!;
      if (!hasStation(state, pawn.cityId)) return state;
      if (state.cured[action.color]) return state;
      const need = pawn.role === "scientist" ? 4 : 5;
      if (action.cardCityIds.length !== need) return state;
      // Validate cards: all must be city cards, of the right color, in the hand.
      const handCopy = pawn.hand.slice();
      const taken: number[] = [];
      for (const cid of action.cardCityIds) {
        if (CITIES[cid]?.color !== action.color) return state;
        const idx = handCopy.findIndex((c) => c.kind === "city" && c.cityId === cid);
        if (idx < 0) return state;
        taken.push(idx);
        handCopy.splice(idx, 1);
      }
      const newHand = handCopy;
      const usedCards: PlayerCard[] = action.cardCityIds.map((cid) => ({ kind: "city", cityId: cid }));
      const pawns = state.pawns.map((p, i) => i === state.current ? { ...p, hand: newHand } : p);
      const cured = { ...state.cured, [action.color]: true };
      const playerDiscard = state.playerDiscard.concat(usedCards);
      let s: PandemicSoloFullState = {
        ...state,
        pawns,
        cured,
        playerDiscard,
        lastEvent: `Cure discovered: ${action.color}!`,
      };
      // Cured + Medic at any city auto-removes all cubes of that color there.
      s = maybeMedicAutoClear(s);
      if (curesCount(s) === 4) {
        return { ...s, phase: "won" };
      }
      return consumeAction(s);
    }

    case "pass": {
      if (state.phase !== "action") return state;
      return endTurn({ ...state, actionsLeft: 0 });
    }

    case "draw_cards": {
      // Allow explicit advance — useful for tests/debug. No-op outside action phase.
      if (state.phase !== "action") return state;
      return endTurn({ ...state, actionsLeft: 0 });
    }

    case "infect_cities": {
      if (state.phase !== "action") return state;
      return endTurn({ ...state, actionsLeft: 0 });
    }
  }
}

// Whenever a Medic-pawn enters or stays in a city with a cured color, remove
// all cubes of that color there (and again at any other Medic city for safety).
function maybeMedicAutoClear(state: PandemicSoloFullState): PandemicSoloFullState {
  let s = state;
  for (const p of s.pawns) {
    if (p.role !== "medic") continue;
    const here = s.cityCubes[p.cityId]!;
    for (const color of COLORS) {
      if (!s.cured[color]) continue;
      const ci = colorIdx(color);
      const n = here[ci]!;
      if (n > 0) {
        const cityCubes = s.cityCubes.map((row) => row.slice());
        cityCubes[p.cityId]![ci] = 0;
        const cubes = { ...s.cubes, [color]: s.cubes[color] + n };
        s = { ...s, cityCubes, cubes };
      }
    }
  }
  return s;
}

// ─── Terminal ───────────────────────────────────────────────────────────────

export function isTerminal(state: PandemicSoloFullState): { score: number } | null {
  if (state.phase === "won") {
    // Score: base 1000 + 100 per remaining player card + 50 per remaining cube
    // - 100 per outbreak. Always positive on win.
    const cubeTotal = state.cubes.blue + state.cubes.yellow + state.cubes.black + state.cubes.red;
    const score = Math.max(
      1,
      1000 + state.playerDeck.length * 100 + cubeTotal * 5 - state.outbreaks * 50,
    );
    return { score };
  }
  if (state.phase === "lost") return { score: 0 };
  return null;
}
