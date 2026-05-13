// ticket-to-ride-full — Ticket to Ride: USA — 1 human vs 2 CPUs.
//
// Map is a representative subset of the classic USA edition: 30 cities + a
// curated set of routes between them. Routes are single (uncontested) — for L
// complexity we omit the parallel double-routes that exist on the real board.
//
// CPU strategy (two opponents, "Red Limited" and "Blue Limited"):
//   * Each turn, score every claimable route by how much it advances the CPU's
//     longest unfinished ticket (Dijkstra shortest path on the open graph).
//     A route on the shortest path scores its length × 3 + base route value.
//     If the CPU can afford a route on its ticket path, it claims it.
//   * Otherwise it draws 2 train cards: prefers face-up cards that match the
//     color it most needs for its longest pending route, else a face-down.
//   * After the first ticket-completion arc finishes, it draws 3 new tickets
//     (keeps 1+) if it has ≥ 12 trains and at least 2 unfinished routes on its
//     plan are blocked by an opponent. Otherwise keeps grinding.
//
// Game flow:
//   * Setup deals 4 train cards and 3 destination tickets to each of the 3
//     players. Each must keep ≥ 2 (CPUs keep all 3).
//   * Round-robin turns. Options:
//       - Draw 2 train cards: face-up (locomotive face-up = only 1 draw used)
//         or face-down (from the deck).
//       - Claim a route: spend N matching-color cards (locomotives wild) and
//         place N trains. Score per length: 1→1, 2→2, 3→4, 4→7, 5→10, 6→15.
//       - Draw 3 new destination tickets, keep ≥ 1.
//   * Final round triggers when any player drops to ≤ 2 trains: each
//     remaining player (including the trigger) takes one final turn, then
//     scoring: route points + completed tickets - uncompleted tickets +
//     10 longest-continuous-route bonus.
//
// TODO (omitted advanced rules, L tier):
//   - Parallel double routes (gray "second track" on most edges)
//   - "Globetrotter" bonus for most completed tickets
//   - Three locomotives face-up auto-replenish wipe rule
//   - Gray (rainbow) routes that accept any single color (we treat gray as
//     "any single color" — pick from your hand)
//   - The 1910 "big tickets" expansion deck

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ───── Map: Cities and Routes ────────────────────────────────────────────

export interface City {
  name: string;
  x: number;    // 0..1
  y: number;
}

// 30 representative US cities (subset of the classic USA edition map).
export const CITIES: City[] = [
  { name: "Vancouver",       x: 0.05, y: 0.10 },  // 0
  { name: "Seattle",         x: 0.07, y: 0.18 },  // 1
  { name: "Portland",        x: 0.06, y: 0.27 },  // 2
  { name: "San Francisco",   x: 0.05, y: 0.46 },  // 3
  { name: "Los Angeles",     x: 0.10, y: 0.62 },  // 4
  { name: "Phoenix",         x: 0.18, y: 0.62 },  // 5
  { name: "Salt Lake City",  x: 0.22, y: 0.38 },  // 6
  { name: "Helena",          x: 0.27, y: 0.20 },  // 7
  { name: "Calgary",         x: 0.20, y: 0.08 },  // 8
  { name: "Denver",          x: 0.35, y: 0.46 },  // 9
  { name: "Santa Fe",        x: 0.35, y: 0.62 },  // 10
  { name: "El Paso",         x: 0.32, y: 0.74 },  // 11
  { name: "Houston",         x: 0.50, y: 0.80 },  // 12
  { name: "Dallas",          x: 0.48, y: 0.72 },  // 13
  { name: "Oklahoma City",   x: 0.46, y: 0.58 },  // 14
  { name: "Kansas City",     x: 0.50, y: 0.46 },  // 15
  { name: "Omaha",           x: 0.50, y: 0.34 },  // 16
  { name: "Winnipeg",        x: 0.45, y: 0.12 },  // 17
  { name: "Duluth",          x: 0.56, y: 0.22 },  // 18
  { name: "Chicago",         x: 0.62, y: 0.36 },  // 19
  { name: "Saint Louis",     x: 0.60, y: 0.48 },  // 20
  { name: "Little Rock",     x: 0.55, y: 0.62 },  // 21
  { name: "New Orleans",     x: 0.60, y: 0.78 },  // 22
  { name: "Nashville",       x: 0.66, y: 0.55 },  // 23
  { name: "Atlanta",         x: 0.72, y: 0.62 },  // 24
  { name: "Miami",           x: 0.82, y: 0.85 },  // 25
  { name: "Raleigh",         x: 0.80, y: 0.52 },  // 26
  { name: "Washington",      x: 0.85, y: 0.42 },  // 27
  { name: "New York",        x: 0.88, y: 0.30 },  // 28
  { name: "Boston",          x: 0.92, y: 0.22 },  // 29
  { name: "Montreal",        x: 0.82, y: 0.16 },  // 30
  { name: "Toronto",         x: 0.75, y: 0.26 },  // 31
] as const as City[];

export const N_CITIES = CITIES.length;

// Train card colors. Locomotive is the wildcard.
export const COLORS = ["red", "orange", "yellow", "green", "blue", "white", "pink", "black"] as const;
export type Color = typeof COLORS[number];
export type CardColor = Color | "loco";

// A route between two cities. Length determines train cost and base score.
// Color is the required color; "gray" means "any single color" (use cards of
// one color from your hand, all matching each other).
export interface Route {
  a: number;
  b: number;
  length: number;       // 1..6
  color: Color | "gray";
}

// Curated route network for the 30-city subset.
function r(a: number, b: number, length: number, color: Color | "gray"): Route {
  return { a, b, length, color };
}

export const ROUTES: Route[] = [
  // West coast
  r(0, 1, 1, "gray"),                 // Vancouver - Seattle
  r(0, 8, 3, "gray"),                 // Vancouver - Calgary
  r(1, 2, 1, "gray"),                 // Seattle - Portland
  r(1, 7, 6, "yellow"),               // Seattle - Helena
  r(1, 8, 4, "gray"),                 // Seattle - Calgary
  r(2, 3, 5, "green"),                // Portland - San Francisco
  r(2, 6, 6, "blue"),                 // Portland - Salt Lake City
  r(3, 4, 3, "pink"),                 // SF - LA
  r(3, 6, 5, "orange"),               // SF - SLC
  r(4, 5, 3, "gray"),                 // LA - Phoenix
  r(4, 11, 6, "black"),               // LA - El Paso
  r(5, 9, 5, "white"),                // Phoenix - Denver
  r(5, 10, 3, "gray"),                // Phoenix - Santa Fe
  r(5, 11, 3, "gray"),                // Phoenix - El Paso

  // Mountain and plains
  r(6, 7, 3, "pink"),                 // SLC - Helena
  r(6, 9, 3, "red"),                  // SLC - Denver
  r(7, 8, 4, "gray"),                 // Helena - Calgary
  r(7, 9, 4, "green"),                // Helena - Denver
  r(7, 16, 5, "red"),                 // Helena - Omaha
  r(7, 17, 4, "blue"),                // Helena - Winnipeg
  r(7, 18, 6, "orange"),              // Helena - Duluth
  r(8, 17, 6, "white"),               // Calgary - Winnipeg

  // Texas / SW
  r(9, 10, 2, "gray"),                // Denver - Santa Fe
  r(9, 14, 4, "red"),                 // Denver - Oklahoma City
  r(9, 15, 4, "black"),               // Denver - Kansas City
  r(9, 16, 4, "pink"),                // Denver - Omaha
  r(10, 11, 2, "gray"),               // Santa Fe - El Paso
  r(10, 14, 3, "blue"),               // Santa Fe - Oklahoma City
  r(11, 12, 6, "green"),              // El Paso - Houston
  r(11, 13, 4, "red"),                // El Paso - Dallas
  r(12, 13, 1, "gray"),               // Houston - Dallas
  r(12, 22, 2, "gray"),               // Houston - New Orleans
  r(13, 14, 2, "gray"),               // Dallas - Oklahoma City
  r(13, 21, 2, "gray"),               // Dallas - Little Rock
  r(14, 15, 2, "gray"),               // OKC - Kansas City
  r(14, 21, 2, "gray"),               // OKC - Little Rock

  // Central plains
  r(15, 16, 1, "gray"),               // KC - Omaha
  r(15, 20, 2, "blue"),               // KC - St Louis
  r(16, 18, 2, "gray"),               // Omaha - Duluth
  r(16, 19, 4, "yellow"),             // Omaha - Chicago
  r(17, 18, 4, "black"),              // Winnipeg - Duluth
  r(18, 19, 3, "red"),                // Duluth - Chicago
  r(18, 31, 6, "pink"),               // Duluth - Toronto

  // Midwest / Heartland
  r(19, 20, 2, "green"),              // Chicago - St Louis
  r(19, 31, 4, "white"),              // Chicago - Toronto
  r(19, 27, 4, "blue"),               // Chicago - Washington (Pittsburgh shortcut)
  r(20, 21, 2, "gray"),               // St Louis - Little Rock
  r(20, 23, 2, "gray"),               // St Louis - Nashville
  r(21, 22, 3, "green"),              // Little Rock - New Orleans
  r(21, 23, 3, "white"),              // Little Rock - Nashville
  r(22, 24, 4, "yellow"),             // New Orleans - Atlanta
  r(22, 25, 6, "red"),                // New Orleans - Miami
  r(23, 19, 4, "yellow"),             // Nashville - Chicago (Pittsburgh detour)
  r(23, 24, 1, "gray"),               // Nashville - Atlanta
  r(23, 26, 3, "black"),              // Nashville - Raleigh

  // Southeast
  r(24, 25, 5, "blue"),               // Atlanta - Miami
  r(24, 26, 2, "gray"),               // Atlanta - Raleigh
  r(24, 27, 2, "gray"),               // Atlanta - Washington

  // East coast
  r(25, 26, 5, "pink"),               // Miami - Raleigh (via Charleston shortcut)
  r(26, 27, 2, "gray"),               // Raleigh - Washington
  r(26, 28, 4, "gray"),               // Raleigh - New York
  r(27, 28, 2, "orange"),             // Washington - New York
  r(28, 29, 2, "yellow"),             // New York - Boston
  r(28, 30, 3, "blue"),               // New York - Montreal
  r(28, 31, 3, "blue"),               // New York - Toronto
  r(29, 30, 2, "gray"),               // Boston - Montreal
  r(30, 31, 3, "gray"),               // Montreal - Toronto
];

export const N_ROUTES = ROUTES.length;

// Destination tickets: pairs of cities + reward.
export interface Ticket {
  a: number;
  b: number;
  value: number;
}

function t(aName: string, bName: string, value: number): Ticket {
  const a = CITIES.findIndex(c => c.name === aName);
  const b = CITIES.findIndex(c => c.name === bName);
  if (a < 0 || b < 0) throw new Error(`Unknown city in ticket: ${aName} or ${bName}`);
  return { a, b, value };
}

export const TICKETS: Ticket[] = [
  t("Los Angeles", "New York", 21),
  t("Seattle", "New York", 22),
  t("Vancouver", "Montreal", 20),
  t("Los Angeles", "Miami", 20),
  t("Portland", "Nashville", 17),
  t("San Francisco", "Atlanta", 17),
  t("Seattle", "Los Angeles", 9),
  t("Vancouver", "Santa Fe", 13),
  t("Calgary", "Phoenix", 13),
  t("Helena", "Los Angeles", 8),
  t("Winnipeg", "Houston", 12),
  t("Winnipeg", "Little Rock", 11),
  t("Duluth", "Houston", 8),
  t("Duluth", "El Paso", 10),
  t("Chicago", "New Orleans", 7),
  t("Chicago", "Santa Fe", 9),
  t("Kansas City", "Houston", 5),
  t("Denver", "Pittsburgh".replace("Pittsburgh", "Washington")  /* Washington stand-in */, 11),
  t("Denver", "El Paso", 4),
  t("Dallas", "New York", 11),
  t("Houston", "New York", 12),
  t("Atlanta", "New York", 6),
  t("Miami", "New York", 10),
  t("Boston", "Miami", 12),
  t("Montreal", "Atlanta", 9),
  t("Montreal", "New Orleans", 13),
  t("Toronto", "Miami", 10),
  t("New York", "Atlanta", 6),
  t("San Francisco", "Phoenix", 5),
  t("Saint Louis", "Dallas", 2),
];

export const N_TICKETS = TICKETS.length;

// ───── State ─────────────────────────────────────────────────────────────

export type PlayerId = 0 | 1 | 2;           // 0 = human, 1 = CPU Red, 2 = CPU Blue
export type Phase =
  | "play"        // a player must choose an action
  | "drawing"     // the player has drawn 1 of 2 cards (mid-turn)
  | "ticket"      // the player is choosing which dest tickets to keep
  | "final"       // last-round triggered
  | "done";

export const STARTING_TRAINS = 45;
export const HAND_START = 4;
export const FACE_UP_COUNT = 5;
export const DRAW_PENDING = 2;

export const ROUTE_POINTS = [0, 1, 2, 4, 7, 10, 15] as const;

export interface TicketWithDone extends Ticket {
  done: boolean;
}

export interface PlayerState {
  id: PlayerId;
  trains: number;                          // remaining train pieces
  hand: Record<CardColor, number>;          // counts of each color (+ loco)
  tickets: TicketWithDone[];
  pendingTickets: Ticket[];                 // currently choosing
  pendingMustKeep: number;                  // min to keep (2 at setup, 1 mid-game)
  pendingKept: boolean[];                   // selection for ticket-choice UI
}

export interface TTRState {
  phase: Phase;
  current: PlayerId;
  drawn: number;                            // cards drawn so far this turn (0..2)
  drewLocoFaceUp: boolean;                  // if a face-up loco was taken this draw cycle
  deck: CardColor[];
  discard: CardColor[];
  faceUp: CardColor[];                      // 5 face-up market
  ticketDeck: Ticket[];
  players: PlayerState[];
  routeOwner: (PlayerId | null)[];          // length N_ROUTES
  log: string[];
  finalTrigger: PlayerId | null;            // who first dropped to ≤2 trains
  finalTurnsLeft: number;                   // remaining final turns
  rngState: number;                         // serializable RNG state
  winner: PlayerId | null;
  finalScores: number[];                     // length 3 when phase==done
}

export interface TTRSettings {
  cpuAggression: number;     // 0..2 placeholder for future
}

// ───── Helpers ───────────────────────────────────────────────────────────

function rngNext(state: { rngState: number }): number {
  // Inline mulberry32 step on the saved state — keeps determinism.
  let a = state.rngState >>> 0;
  a = (a + 0x6D2B79F5) >>> 0;
  let s = a;
  s = Math.imul(s ^ (s >>> 15), s | 1);
  s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
  state.rngState = a;
  return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
}

function shuffleInPlace<T>(arr: T[], rngWrapper: { rngState: number }): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rngNext(rngWrapper) * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

function emptyHand(): Record<CardColor, number> {
  return { red: 0, orange: 0, yellow: 0, green: 0, blue: 0, white: 0, pink: 0, black: 0, loco: 0 };
}

function buildDeck(): CardColor[] {
  // Classic distribution: 12 of each color (96) + 14 locomotives = 110.
  const deck: CardColor[] = [];
  for (const c of COLORS) {
    for (let i = 0; i < 12; i++) deck.push(c);
  }
  for (let i = 0; i < 14; i++) deck.push("loco");
  return deck;
}

function drawCard(s: TTRState): CardColor | null {
  if (s.deck.length === 0) {
    if (s.discard.length === 0) return null;
    s.deck = s.discard;
    s.discard = [];
    shuffleInPlace(s.deck, s);
  }
  return s.deck.pop() ?? null;
}

function refillFaceUp(s: TTRState): void {
  while (s.faceUp.length < FACE_UP_COUNT) {
    const c = drawCard(s);
    if (c === null) break;
    s.faceUp.push(c);
  }
}

export function routePoints(length: number): number {
  if (length < 1) return 0;
  if (length >= ROUTE_POINTS.length) return ROUTE_POINTS[ROUTE_POINTS.length - 1]!;
  return ROUTE_POINTS[length]!;
}

export function canAffordRoute(hand: Record<CardColor, number>, route: Route): { ok: boolean; color?: CardColor } {
  // Returns whether the hand can claim the route, and (for gray routes) which
  // base color was used. Locomotives count as any single color.
  if (route.color === "gray") {
    let best: { ok: boolean; color?: CardColor } = { ok: false };
    for (const c of COLORS) {
      if ((hand[c] ?? 0) + (hand.loco ?? 0) >= route.length) {
        return { ok: true, color: c };
      }
    }
    if ((hand.loco ?? 0) >= route.length) best = { ok: true, color: "loco" };
    return best;
  }
  const have = (hand[route.color] ?? 0) + (hand.loco ?? 0);
  return { ok: have >= route.length, color: route.color };
}

export function spendForRoute(hand: Record<CardColor, number>, route: Route, useColor: CardColor): boolean {
  // Mutates `hand` to spend cards for a route. Returns false if not enough.
  if (useColor === "loco") {
    if ((hand.loco ?? 0) < route.length) return false;
    hand.loco -= route.length;
    return true;
  }
  const ofColor = hand[useColor] ?? 0;
  const need = route.length;
  const useColored = Math.min(ofColor, need);
  const useLoco = need - useColored;
  if ((hand.loco ?? 0) < useLoco) return false;
  hand[useColor] = ofColor - useColored;
  hand.loco -= useLoco;
  return true;
}

// Adjacency list for the route graph, indexed by route ownership.
export function buildAdj(routes: Route[]): number[][] {
  const adj: number[][] = Array.from({ length: N_CITIES }, () => []);
  for (let i = 0; i < routes.length; i++) {
    const rr = routes[i]!;
    adj[rr.a]!.push(i);
    adj[rr.b]!.push(i);
  }
  return adj;
}

const ROUTE_ADJ = buildAdj(ROUTES);

// BFS: is city A connected to city B using only routes owned by `player`?
export function isTicketConnected(routeOwner: (PlayerId | null)[], player: PlayerId, a: number, b: number): boolean {
  if (a === b) return true;
  const seen = new Set<number>();
  seen.add(a);
  const queue: number[] = [a];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const ri of ROUTE_ADJ[cur]!) {
      if (routeOwner[ri] !== player) continue;
      const rr = ROUTES[ri]!;
      const next = rr.a === cur ? rr.b : rr.a;
      if (seen.has(next)) continue;
      if (next === b) return true;
      seen.add(next);
      queue.push(next);
    }
  }
  return false;
}

// Longest continuous route for a player (length of longest simple path on
// their owned edges, summing route lengths). DFS-based — small graph so OK.
export function longestRoute(routeOwner: (PlayerId | null)[], player: PlayerId): number {
  const ownedEdges: { idx: number; a: number; b: number; len: number }[] = [];
  for (let i = 0; i < ROUTES.length; i++) {
    if (routeOwner[i] === player) {
      const rr = ROUTES[i]!;
      ownedEdges.push({ idx: i, a: rr.a, b: rr.b, len: rr.length });
    }
  }
  if (ownedEdges.length === 0) return 0;

  const cityAdj: Map<number, { edgeIdx: number; to: number; len: number }[]> = new Map();
  for (const e of ownedEdges) {
    if (!cityAdj.has(e.a)) cityAdj.set(e.a, []);
    if (!cityAdj.has(e.b)) cityAdj.set(e.b, []);
    cityAdj.get(e.a)!.push({ edgeIdx: e.idx, to: e.b, len: e.len });
    cityAdj.get(e.b)!.push({ edgeIdx: e.idx, to: e.a, len: e.len });
  }

  let best = 0;
  const visited = new Set<number>();
  function dfs(city: number, acc: number): void {
    if (acc > best) best = acc;
    const edges = cityAdj.get(city) ?? [];
    for (const e of edges) {
      if (visited.has(e.edgeIdx)) continue;
      visited.add(e.edgeIdx);
      dfs(e.to, acc + e.len);
      visited.delete(e.edgeIdx);
    }
  }
  for (const startCity of cityAdj.keys()) {
    dfs(startCity, 0);
  }
  return best;
}

// Compute score for one player.
export function scorePlayer(state: TTRState, pid: PlayerId): {
  routePts: number;
  ticketPts: number;
  ticketPenalty: number;
  longestBonus: number;
  total: number;
} {
  let routePts = 0;
  for (let i = 0; i < state.routeOwner.length; i++) {
    if (state.routeOwner[i] === pid) {
      routePts += routePoints(ROUTES[i]!.length);
    }
  }
  let ticketPts = 0;
  let ticketPenalty = 0;
  const player = state.players[pid]!;
  for (const tk of player.tickets) {
    const done = isTicketConnected(state.routeOwner, pid, tk.a, tk.b);
    if (done) ticketPts += tk.value;
    else ticketPenalty += tk.value;
  }
  // Longest-route bonus: +10 to the player with longest. If tied, all tied
  // players receive +10 (classic rule).
  const lengths: number[] = state.players.map(p => longestRoute(state.routeOwner, p.id));
  const maxLen = Math.max(...lengths);
  const longestBonus = (maxLen > 0 && lengths[pid] === maxLen) ? 10 : 0;
  const total = routePts + ticketPts - ticketPenalty + longestBonus;
  return { routePts, ticketPts, ticketPenalty, longestBonus, total };
}

// ───── Initial state ─────────────────────────────────────────────────────

export function initialState(seed: number, _settings: TTRSettings): TTRState {
  const wrap = { rngState: (seed >>> 0) || 1 };

  // Build and shuffle decks deterministically
  const deck = buildDeck();
  shuffleInPlace(deck, wrap);
  const ticketDeck = [...TICKETS];
  shuffleInPlace(ticketDeck, wrap);

  const state: TTRState = {
    phase: "ticket",   // setup choose-tickets
    current: 0,
    drawn: 0,
    drewLocoFaceUp: false,
    deck,
    discard: [],
    faceUp: [],
    ticketDeck,
    players: [0, 1, 2].map((i): PlayerState => ({
      id: i as PlayerId,
      trains: STARTING_TRAINS,
      hand: emptyHand(),
      tickets: [],
      pendingTickets: [],
      pendingMustKeep: 2,
      pendingKept: [],
    })),
    routeOwner: new Array(N_ROUTES).fill(null),
    log: [],
    finalTrigger: null,
    finalTurnsLeft: 0,
    rngState: wrap.rngState,
    winner: null,
    finalScores: [],
  };

  // Deal 4 cards to each player
  for (let p = 0; p < 3; p++) {
    for (let i = 0; i < HAND_START; i++) {
      const c = drawCard(state);
      if (c !== null) state.players[p]!.hand[c] = (state.players[p]!.hand[c] ?? 0) + 1;
    }
  }

  // Deal 3 destination tickets to each player. Human picks (≥2). CPUs keep all 3.
  for (let p = 0; p < 3; p++) {
    const pend: Ticket[] = [];
    for (let i = 0; i < 3; i++) {
      const tk = state.ticketDeck.pop();
      if (tk) pend.push(tk);
    }
    if (p === 0) {
      state.players[p]!.pendingTickets = pend;
      state.players[p]!.pendingMustKeep = 2;
      state.players[p]!.pendingKept = pend.map(() => true);
    } else {
      // CPU keeps all 3
      state.players[p]!.tickets = pend.map(t => ({ ...t, done: false }));
    }
  }

  // Face-up market
  refillFaceUp(state);

  return state;
}

// ───── CPU strategy helpers ──────────────────────────────────────────────

// Dijkstra on the unclaimed-or-CPU-owned graph: find shortest length path
// (in route lengths) from a -> b, returning list of route indices on the
// shortest path. Routes owned by other players cannot be used.
export function shortestRoutePath(
  routeOwner: (PlayerId | null)[],
  player: PlayerId,
  a: number,
  b: number,
): number[] | null {
  const dist: number[] = new Array(N_CITIES).fill(Infinity);
  const prevEdge: number[] = new Array(N_CITIES).fill(-1);
  dist[a] = 0;
  // simple O(V^2) since V is small
  const visited = new Set<number>();
  while (visited.size < N_CITIES) {
    let u = -1;
    let best = Infinity;
    for (let i = 0; i < N_CITIES; i++) {
      if (visited.has(i)) continue;
      if (dist[i]! < best) {
        best = dist[i]!;
        u = i;
      }
    }
    if (u === -1) break;
    if (u === b) break;
    visited.add(u);
    for (const ri of ROUTE_ADJ[u]!) {
      const owner = routeOwner[ri];
      if (owner !== null && owner !== player) continue;
      const rr = ROUTES[ri]!;
      const v = rr.a === u ? rr.b : rr.a;
      const alt = dist[u]! + rr.length;
      if (alt < dist[v]!) {
        dist[v] = alt;
        prevEdge[v] = ri;
      }
    }
  }
  if (dist[b] === Infinity) return null;
  // Reconstruct via prevEdge
  const path: number[] = [];
  let cur = b;
  while (cur !== a) {
    const ei = prevEdge[cur];
    if (ei === undefined || ei < 0) return null;
    path.push(ei);
    const rr = ROUTES[ei]!;
    cur = rr.a === cur ? rr.b : rr.a;
  }
  return path;
}

function pickCpuColorWanted(state: TTRState, pid: PlayerId): CardColor | null {
  // Identify the player's most pressing route on a pending ticket. Return the
  // color most useful to claim it.
  const p = state.players[pid]!;
  for (const tk of p.tickets) {
    if (tk.done) continue;
    const path = shortestRoutePath(state.routeOwner, pid, tk.a, tk.b);
    if (!path) continue;
    // Find first un-owned route on the path and pick its color.
    for (const ri of path) {
      if (state.routeOwner[ri] !== null) continue;
      const rr = ROUTES[ri]!;
      if (rr.color === "gray") {
        // Pick whichever color we already have most of (or a random one).
        let best: CardColor | null = null;
        let bestCount = -1;
        for (const c of COLORS) {
          if ((p.hand[c] ?? 0) > bestCount) {
            bestCount = p.hand[c] ?? 0;
            best = c;
          }
        }
        return best ?? "red";
      }
      return rr.color;
    }
  }
  return null;
}

function cpuPickClaimableRoute(state: TTRState, pid: PlayerId): { routeIdx: number; useColor: CardColor } | null {
  const p = state.players[pid]!;
  // Build set of route indices that are on any unfinished ticket's shortest path.
  const pathRoutes = new Set<number>();
  for (const tk of p.tickets) {
    if (tk.done) continue;
    const path = shortestRoutePath(state.routeOwner, pid, tk.a, tk.b);
    if (path) for (const ri of path) pathRoutes.add(ri);
  }

  // Score every claimable route: prefer ticket-path routes, then length.
  let best: { routeIdx: number; useColor: CardColor; score: number } | null = null;
  for (let ri = 0; ri < ROUTES.length; ri++) {
    if (state.routeOwner[ri] !== null) continue;
    const rr = ROUTES[ri]!;
    if (rr.length > p.trains) continue;
    const aff = canAffordRoute(p.hand, rr);
    if (!aff.ok || !aff.color) continue;
    let score = routePoints(rr.length);
    if (pathRoutes.has(ri)) score += rr.length * 3 + 5;
    if (best === null || score > best.score) {
      best = { routeIdx: ri, useColor: aff.color, score };
    }
  }
  return best ? { routeIdx: best.routeIdx, useColor: best.useColor } : null;
}

// ───── Actions ───────────────────────────────────────────────────────────

export type TTRAction =
  | { type: "toggleKeepTicket"; idx: number }
  | { type: "commitTickets" }
  | { type: "drawFaceUp"; idx: number }
  | { type: "drawDeck" }
  | { type: "claimRoute"; routeIdx: number; useColor: CardColor }
  | { type: "requestTickets" }
  | { type: "cpu" };

function cloneState(s: TTRState): TTRState {
  return {
    ...s,
    deck: [...s.deck],
    discard: [...s.discard],
    faceUp: [...s.faceUp],
    ticketDeck: [...s.ticketDeck],
    players: s.players.map(p => ({
      ...p,
      hand: { ...p.hand },
      tickets: p.tickets.map(t => ({ ...t })),
      pendingTickets: [...p.pendingTickets],
      pendingKept: [...p.pendingKept],
    })),
    routeOwner: [...s.routeOwner],
    log: [...s.log],
    finalScores: [...s.finalScores],
  };
}

function advanceTurn(s: TTRState): void {
  // Move to the next player. Check for final round.
  s.drawn = 0;
  s.drewLocoFaceUp = false;

  if (s.finalTrigger !== null) {
    s.finalTurnsLeft -= 1;
    if (s.finalTurnsLeft <= 0) {
      // End game: compute final scores.
      s.finalScores = s.players.map(p => scorePlayer(s, p.id).total);
      let bestPid: PlayerId = 0;
      let bestScore = -Infinity;
      for (let i = 0; i < 3; i++) {
        if (s.finalScores[i]! > bestScore) {
          bestScore = s.finalScores[i]!;
          bestPid = i as PlayerId;
        }
      }
      s.winner = bestPid;
      s.phase = "done";
      return;
    }
  }

  s.current = ((s.current + 1) % 3) as PlayerId;
  s.phase = "play";
}

function checkFinalTrigger(s: TTRState, pid: PlayerId): void {
  if (s.finalTrigger === null && s.players[pid]!.trains <= 2) {
    s.finalTrigger = pid;
    // Each of the other players gets one more turn, plus the trigger gets no
    // more — but classic rule: every player including the trigger plays their
    // current turn out then EACH remaining player takes ONE more turn. We
    // model it as: from this point on, total turns left = 3 - 0 = 3 (each
    // player including trigger had this turn count, then we set 2 more).
    s.finalTurnsLeft = 3; // current turn ends + 2 more, total of 3 includes this advance
  }
}

export function reducer(state: TTRState, action: TTRAction): TTRState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "toggleKeepTicket": {
      if (state.phase !== "ticket") return state;
      const p = state.players[state.current]!;
      if (action.idx < 0 || action.idx >= p.pendingTickets.length) return state;
      const next = cloneState(state);
      const np = next.players[state.current]!;
      np.pendingKept[action.idx] = !np.pendingKept[action.idx];
      return next;
    }

    case "commitTickets": {
      if (state.phase !== "ticket") return state;
      const p = state.players[state.current]!;
      const kept = p.pendingKept.filter(Boolean).length;
      if (kept < p.pendingMustKeep) return state;
      const next = cloneState(state);
      const np = next.players[state.current]!;
      // Move kept into tickets, discard the rest to the bottom of ticketDeck
      const keep: TicketWithDone[] = [];
      const discard: Ticket[] = [];
      np.pendingTickets.forEach((tk, i) => {
        if (np.pendingKept[i]) keep.push({ ...tk, done: false });
        else discard.push(tk);
      });
      np.tickets = [...np.tickets, ...keep];
      np.pendingTickets = [];
      np.pendingKept = [];
      next.ticketDeck = [...discard, ...next.ticketDeck];
      // After setup, all 3 players need to commit. But CPUs auto-keep all 3
      // in initialState, so only the human (current=0) lives in `ticket`
      // phase at game start. Mid-game ticket draws also resolve here.
      next.phase = "play";
      // Mid-game: end this player's turn (drawing tickets is a full turn).
      // Setup: just begin play with current = 0.
      if (state.current === 0 && next.players[0]!.tickets.length === keep.length) {
        // Game just started: this was setup. Player 0 begins.
        next.current = 0;
        next.phase = "play";
      } else {
        advanceTurn(next);
      }
      return next;
    }

    case "drawFaceUp": {
      if (state.phase !== "play" && state.phase !== "drawing" && state.phase !== "final") return state;
      if (action.idx < 0 || action.idx >= state.faceUp.length) return state;
      const card = state.faceUp[action.idx]!;
      // Locomotive face-up: counts as 2 draws — illegal as second draw.
      if (card === "loco" && state.drawn === 1) return state;
      const next = cloneState(state);
      const np = next.players[next.current]!;
      np.hand[card] = (np.hand[card] ?? 0) + 1;
      // Replace from deck
      const replacement = drawCard(next);
      if (replacement !== null) {
        next.faceUp[action.idx] = replacement;
      } else {
        next.faceUp.splice(action.idx, 1);
      }
      refillFaceUp(next);

      if (card === "loco") {
        // Face-up loco counts as 2 draws — turn ends immediately.
        next.log.push(`${pidName(next.current)} drew a locomotive`);
        advanceTurn(next);
      } else {
        next.drawn += 1;
        next.log.push(`${pidName(next.current)} drew a ${card} card`);
        if (next.drawn >= 2) advanceTurn(next);
        else next.phase = "drawing";
      }
      return next;
    }

    case "drawDeck": {
      if (state.phase !== "play" && state.phase !== "drawing" && state.phase !== "final") return state;
      const next = cloneState(state);
      const card = drawCard(next);
      if (card === null) return state;
      const np = next.players[next.current]!;
      np.hand[card] = (np.hand[card] ?? 0) + 1;
      next.drawn += 1;
      next.log.push(`${pidName(next.current)} drew from the deck`);
      if (next.drawn >= 2) advanceTurn(next);
      else next.phase = "drawing";
      return next;
    }

    case "claimRoute": {
      if (state.phase !== "play" && state.phase !== "final") return state;
      const ri = action.routeIdx;
      if (ri < 0 || ri >= ROUTES.length) return state;
      if (state.routeOwner[ri] !== null) return state;
      const rr = ROUTES[ri]!;
      const p = state.players[state.current]!;
      if (p.trains < rr.length) return state;
      // Validate hand
      const aff = canAffordRoute(p.hand, rr);
      if (!aff.ok) return state;
      // For non-gray routes, useColor must match (or loco).
      if (rr.color !== "gray" && action.useColor !== rr.color && action.useColor !== "loco") return state;
      const next = cloneState(state);
      const np = next.players[next.current]!;
      const spent = spendForRoute(np.hand, rr, action.useColor);
      if (!spent) return state;
      // Move spent cards to discard
      // (We approximate: we know how many of each were spent by diffing — but
      //  for the deck size to stay correct we push the colored amount.)
      const usedColored = (p.hand[action.useColor] ?? 0) - (np.hand[action.useColor] ?? 0);
      const usedLoco = (p.hand.loco ?? 0) - (np.hand.loco ?? 0);
      for (let i = 0; i < usedColored; i++) next.discard.push(action.useColor as CardColor);
      for (let i = 0; i < usedLoco; i++) next.discard.push("loco");

      np.trains -= rr.length;
      next.routeOwner[ri] = next.current;

      // Mark ticket completion
      for (const tk of np.tickets) {
        if (!tk.done && isTicketConnected(next.routeOwner, next.current, tk.a, tk.b)) {
          tk.done = true;
        }
      }

      next.log.push(`${pidName(next.current)} claimed ${CITIES[rr.a]!.name} - ${CITIES[rr.b]!.name} (${rr.length})`);

      checkFinalTrigger(next, next.current);
      advanceTurn(next);
      return next;
    }

    case "requestTickets": {
      if (state.phase !== "play") return state;
      const next = cloneState(state);
      const np = next.players[next.current]!;
      const pend: Ticket[] = [];
      for (let i = 0; i < 3; i++) {
        const tk = next.ticketDeck.pop();
        if (tk) pend.push(tk);
      }
      if (pend.length === 0) return state;
      if (next.current === 0) {
        np.pendingTickets = pend;
        np.pendingMustKeep = 1;
        np.pendingKept = pend.map(() => true);
        next.phase = "ticket";
        return next;
      }
      // CPU: keep all of them
      np.tickets = [...np.tickets, ...pend.map(t => ({ ...t, done: false }))];
      next.log.push(`${pidName(next.current)} drew destination tickets`);
      advanceTurn(next);
      return next;
    }

    case "cpu": {
      if (state.phase !== "play" || state.current === 0) return state;
      const pid = state.current;
      const next = cloneState(state);
      const p = next.players[pid]!;

      // 1) Try to claim best route on ticket path
      const claim = cpuPickClaimableRoute(next, pid);
      if (claim) {
        const rr = ROUTES[claim.routeIdx]!;
        const before = { ...p.hand };
        spendForRoute(p.hand, rr, claim.useColor);
        const usedColored = (before[claim.useColor] ?? 0) - (p.hand[claim.useColor] ?? 0);
        const usedLoco = (before.loco ?? 0) - (p.hand.loco ?? 0);
        for (let i = 0; i < usedColored; i++) next.discard.push(claim.useColor as CardColor);
        for (let i = 0; i < usedLoco; i++) next.discard.push("loco");
        p.trains -= rr.length;
        next.routeOwner[claim.routeIdx] = pid;
        for (const tk of p.tickets) {
          if (!tk.done && isTicketConnected(next.routeOwner, pid, tk.a, tk.b)) tk.done = true;
        }
        next.log.push(`${pidName(pid)} claimed ${CITIES[rr.a]!.name} - ${CITIES[rr.b]!.name} (${rr.length})`);
        checkFinalTrigger(next, pid);
        advanceTurn(next);
        return next;
      }

      // 2) Draw 2 cards: prefer face-up matching wanted color
      const wanted = pickCpuColorWanted(next, pid);
      for (let draw = 0; draw < 2; draw++) {
        let drewLoco = false;
        let pickedFaceUpIdx = -1;
        if (wanted) {
          // Locomotives only allowed on first draw (turn ends).
          for (let i = 0; i < next.faceUp.length; i++) {
            const c = next.faceUp[i]!;
            if (c === "loco" && draw === 0) {
              pickedFaceUpIdx = i;
              drewLoco = true;
              break;
            }
          }
          if (pickedFaceUpIdx === -1) {
            for (let i = 0; i < next.faceUp.length; i++) {
              if (next.faceUp[i] === wanted) {
                pickedFaceUpIdx = i;
                break;
              }
            }
          }
        }
        if (pickedFaceUpIdx >= 0) {
          const c = next.faceUp[pickedFaceUpIdx]!;
          p.hand[c] = (p.hand[c] ?? 0) + 1;
          const repl = drawCard(next);
          if (repl !== null) next.faceUp[pickedFaceUpIdx] = repl;
          else next.faceUp.splice(pickedFaceUpIdx, 1);
          refillFaceUp(next);
          if (drewLoco) {
            next.log.push(`${pidName(pid)} drew a locomotive`);
            break;
          }
        } else {
          const c = drawCard(next);
          if (c === null) break;
          p.hand[c] = (p.hand[c] ?? 0) + 1;
        }
      }
      next.log.push(`${pidName(pid)} drew cards`);
      advanceTurn(next);
      return next;
    }
  }
  return state;
}

function pidName(pid: PlayerId): string {
  return pid === 0 ? "You" : pid === 1 ? "Red CPU" : "Blue CPU";
}

// ───── isTerminal ────────────────────────────────────────────────────────

export function isTerminal(state: TTRState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Score = human's final score, floored at 0 for the leaderboard.
  const humanScore = state.finalScores[0] ?? 0;
  // Only return a positive score on a win.
  if (state.winner === 0) return { score: Math.max(0, humanScore) };
  return { score: 0 };
}

// Helper for tests
export function totalCards(hand: Record<CardColor, number>): number {
  let n = 0;
  for (const k of Object.keys(hand) as CardColor[]) n += hand[k] ?? 0;
  return n;
}
