import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/* =========================================================================
 * Clue / Cluedo (Full) — canonical 6-suspect / 6-weapon / 9-room edition.
 *
 * L-tier scope:
 *   - 9 rooms, 6 suspects, 6 weapons (21 cards total)
 *   - Corner secret passages (Kitchen <-> Study, Conservatory <-> Lounge)
 *   - 1 human seat + 2 CPU seats; cards split 7/7/7
 *   - Turn = roll 1d6 (or take a secret passage), move into a room
 *   - Suggestion: pulls suspect+weapon into the room; opponents in turn
 *     order reveal one matching card (human seat shows a chosen one)
 *   - Accusation ends the game (win on match, loss otherwise)
 *   - Detective notebook auto-fills rows for cards we have / are shown
 *
 * Advanced rules intentionally omitted:
 *   - Tile-by-tile pawn movement on the corridor grid (we use a room-
 *     adjacency graph; any room is reachable in one move given a roll
 *     of 6, neighbors with smaller rolls). The room *graph* still rewards
 *     positioning and rolls, and secret passages remain meaningful.
 *   - Forcing other players' suspect pawns into rooms during a suggestion.
 *   - "Master Detective" intrigue cards (out of scope per the spec).
 *   - Re-suggesting the same triple loop avoidance, splitting doors, etc.
 * ========================================================================= */

export const SUSPECTS = [
  "Miss Scarlet",
  "Colonel Mustard",
  "Mrs. White",
  "Mr. Green",
  "Mrs. Peacock",
  "Professor Plum",
] as const;
export type Suspect = (typeof SUSPECTS)[number];

export const WEAPONS = [
  "Candlestick",
  "Knife",
  "Lead Pipe",
  "Revolver",
  "Rope",
  "Wrench",
] as const;
export type Weapon = (typeof WEAPONS)[number];

export const ROOMS = [
  "Kitchen",
  "Ballroom",
  "Conservatory",
  "Dining Room",
  "Lounge",
  "Hall",
  "Study",
  "Library",
  "Billiard Room",
] as const;
export type Room = (typeof ROOMS)[number];

/** Adjacency graph between rooms.
 *  Each room can be reached at a distance equal to the number of edges
 *  traversed; secret passages count as distance 0 (free transit). */
const ROOM_ADJ: Record<Room, Array<{ to: Room; passage?: boolean }>> = {
  Kitchen: [
    { to: "Ballroom" },
    { to: "Dining Room" },
    { to: "Study", passage: true },
  ],
  Ballroom: [
    { to: "Kitchen" },
    { to: "Conservatory" },
    { to: "Billiard Room" },
  ],
  Conservatory: [
    { to: "Ballroom" },
    { to: "Library" },
    { to: "Lounge", passage: true },
  ],
  "Dining Room": [
    { to: "Kitchen" },
    { to: "Lounge" },
    { to: "Hall" },
    { to: "Billiard Room" },
  ],
  Lounge: [
    { to: "Dining Room" },
    { to: "Hall" },
    { to: "Conservatory", passage: true },
  ],
  Hall: [
    { to: "Dining Room" },
    { to: "Lounge" },
    { to: "Study" },
    { to: "Library" },
  ],
  Study: [
    { to: "Hall" },
    { to: "Library" },
    { to: "Kitchen", passage: true },
  ],
  Library: [
    { to: "Conservatory" },
    { to: "Hall" },
    { to: "Study" },
    { to: "Billiard Room" },
  ],
  "Billiard Room": [
    { to: "Ballroom" },
    { to: "Dining Room" },
    { to: "Library" },
  ],
};

export interface SecretPassage { from: Room; to: Room }
export const SECRET_PASSAGES: ReadonlyArray<SecretPassage> = [
  { from: "Kitchen", to: "Study" },
  { from: "Study", to: "Kitchen" },
  { from: "Conservatory", to: "Lounge" },
  { from: "Lounge", to: "Conservatory" },
];

/** All possible reachable rooms from `from` given a die roll (1..6).
 *  We use shortest-edge-distance through the room graph, treating
 *  secret passages as 0-edge "tunnels".  The current room is excluded;
 *  you have to enter a different room.  Adjacent rooms cost 1; second-
 *  hop rooms cost 2; etc.  A roll of 6 can reach the whole graph. */
export function reachableRooms(from: Room, roll: number): Room[] {
  if (roll <= 0) return [];
  const dist = new Map<Room, number>();
  dist.set(from, 0);
  const queue: Room[] = [from];
  // For secret passages, add the partner room at distance 0 of `from`.
  for (const sp of SECRET_PASSAGES) {
    if (sp.from === from && !dist.has(sp.to)) {
      dist.set(sp.to, 0);
      queue.push(sp.to);
    }
  }
  while (queue.length > 0) {
    const r = queue.shift()!;
    const d = dist.get(r)!;
    if (d >= roll) continue;
    for (const edge of ROOM_ADJ[r]) {
      // Secret-passage edges have already been seeded; treat as distance 0
      // hops only from the *starting* room.
      const stepCost = edge.passage ? 0 : 1;
      const nd = d + stepCost;
      const cur = dist.get(edge.to);
      if (cur === undefined || nd < cur) {
        dist.set(edge.to, nd);
        queue.push(edge.to);
      }
    }
  }
  const out: Room[] = [];
  for (const [r, d] of dist.entries()) {
    if (r === from) continue;
    if (d <= roll) out.push(r);
  }
  return out;
}

/** Direct secret-passage partner room, or null. */
export function passagePartner(from: Room): Room | null {
  for (const sp of SECRET_PASSAGES) if (sp.from === from) return sp.to;
  return null;
}

/* ------------------------------------------------------------------------- */

export type CardKind = "suspect" | "weapon" | "room";
export interface Card { kind: CardKind; value: string }

export interface Suggestion {
  suspect: Suspect;
  weapon: Weapon;
  room: Room;
}

/** Notebook value: U = unknown, X = ruled out, ? = noted by player. */
export type NoteMark = "U" | "X" | "?";

export interface Notebook {
  suspects: Record<Suspect, NoteMark>;
  weapons: Record<Weapon, NoteMark>;
  rooms: Record<Room, NoteMark>;
}

function emptyNotebook(): Notebook {
  const sus = {} as Record<Suspect, NoteMark>;
  for (const s of SUSPECTS) sus[s] = "U";
  const wep = {} as Record<Weapon, NoteMark>;
  for (const w of WEAPONS) wep[w] = "U";
  const rm = {} as Record<Room, NoteMark>;
  for (const r of ROOMS) rm[r] = "U";
  return { suspects: sus, weapons: wep, rooms: rm };
}

/* ------------------------------------------------------------------------- */

export type Phase =
  | "roll"        // current player must roll (or take a passage)
  | "move"        // dice rolled, player must pick a destination room
  | "suggest"     // player is in a room and may make a suggestion
  | "reveal"      // an opponent is revealing a card to the suggester
  | "accuse"      // player may accuse, or end turn
  | "won"
  | "lost";

export interface CpuNotebook {
  /** Cards the CPU has personally seen are listed in `seenCards`.
   *  Cards in its hand are also "seen". */
  seenCards: Card[];
}

export interface ClueFullState {
  seed: number;
  rngState: number;

  envelope: { suspect: Suspect; weapon: Weapon; room: Room };

  /** 3 seats: 0 = human, 1 = CPU "Mustard", 2 = CPU "Plum" */
  hands: [Card[], Card[], Card[]];
  /** Per-CPU memory of cards each has been shown / holds. */
  cpuMemory: [null, CpuNotebook, CpuNotebook];

  /** Each player's pawn position. */
  positions: [Room, Room, Room];

  turn: 0 | 1 | 2;
  phase: Phase;

  /** When phase = "move", how many die-roll steps were available. */
  lastRoll: number;
  /** Reachable rooms after the last roll. */
  movableTo: Room[];

  /** Current suggestion being processed (in phase reveal/accuse). */
  pendingSuggestion: Suggestion | null;
  /** When in "reveal", which seat is being polled (0..2). */
  revealFrom: 0 | 1 | 2 | null;
  /** Cards from revealFrom's hand that match pendingSuggestion;
   *  if revealFrom is the human, they pick which to show. */
  revealOptions: Card[];

  /** Human's notebook. Cards in the hand are auto-marked X. */
  notebook: Notebook;
  /** Each suggestion + result (for the log).
   *  result: null = no one could refute; otherwise the card shown
   *  (visible only to the suggester). For audit/UI we keep the showing
   *  seat as `byPlayer`. */
  log: Array<{
    seat: 0 | 1 | 2;
    suggestion: Suggestion;
    byPlayer: 0 | 1 | 2 | null;
    shownCard: Card | null;
    accusation?: boolean;
  }>;

  winnerSeat: 0 | 1 | 2 | null;
  /** Final score (set when isTerminal returns non-null). */
  finalScore: number | null;
}

/* ------------------------------------------------------------------------- */

export interface ClueFullSettings {
  passages: boolean;
}

export const settings = {
  passages: { kind: "boolean" as const, label: "Secret passages", default: true },
};

export type ClueFullAction =
  | { type: "roll" }
  | { type: "passage" }
  | { type: "move"; to: Room }
  | { type: "suggest"; suspect: Suspect; weapon: Weapon }
  | { type: "reveal"; card: Card }
  | { type: "accuse"; suspect: Suspect; weapon: Weapon; room: Room }
  | { type: "endTurn" }
  | { type: "cpuStep" }
  | { type: "noteToggle"; kind: CardKind; value: string };

/* ------------------------------------------------------------------------- */

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function rngStep(state: ClueFullState): { rng: () => number; nextState: number } {
  const rng = mulberry32(state.rngState);
  // Burn one to mutate "state".
  const v = Math.floor(rng() * 0x7fffffff);
  return { rng: mulberry32(v), nextState: v };
}

export function initialState(seed: number, _s: ClueFullSettings): ClueFullState {
  const rng0 = mulberry32(seed >>> 0);

  // Pick envelope contents.
  const envSuspect = SUSPECTS[Math.floor(rng0() * SUSPECTS.length)]!;
  const envWeapon = WEAPONS[Math.floor(rng0() * WEAPONS.length)]!;
  const envRoom = ROOMS[Math.floor(rng0() * ROOMS.length)]!;

  const remainingSuspects = SUSPECTS.filter((s) => s !== envSuspect).map((v): Card => ({ kind: "suspect", value: v }));
  const remainingWeapons = WEAPONS.filter((w) => w !== envWeapon).map((v): Card => ({ kind: "weapon", value: v }));
  const remainingRooms = ROOMS.filter((r) => r !== envRoom).map((v): Card => ({ kind: "room", value: v }));

  const deck = shuffle([...remainingSuspects, ...remainingWeapons, ...remainingRooms], rng0);
  // 3 players, 18 cards => 6 each.
  const hands: [Card[], Card[], Card[]] = [[], [], []];
  for (let i = 0; i < deck.length; i++) hands[i % 3]!.push(deck[i]!);

  // Starting positions: spread players among entry corners.
  const startRooms: Room[] = ["Hall", "Lounge", "Library"];
  const positions: [Room, Room, Room] = [startRooms[0]!, startRooms[1]!, startRooms[2]!];

  // Seed CPU memories with their own cards.
  const cpu1: CpuNotebook = { seenCards: hands[1]!.slice() };
  const cpu2: CpuNotebook = { seenCards: hands[2]!.slice() };

  // Human notebook: rule out cards we hold.
  const notebook = emptyNotebook();
  for (const c of hands[0]!) {
    if (c.kind === "suspect") notebook.suspects[c.value as Suspect] = "X";
    else if (c.kind === "weapon") notebook.weapons[c.value as Weapon] = "X";
    else notebook.rooms[c.value as Room] = "X";
  }

  // Advance RNG by some steps so future randomness diverges from setup.
  const nextRngState = Math.floor(rng0() * 0x7fffffff);

  return {
    seed,
    rngState: nextRngState,
    envelope: { suspect: envSuspect, weapon: envWeapon, room: envRoom },
    hands,
    cpuMemory: [null, cpu1, cpu2],
    positions,
    turn: 0,
    phase: "roll",
    lastRoll: 0,
    movableTo: [],
    pendingSuggestion: null,
    revealFrom: null,
    revealOptions: [],
    notebook,
    log: [],
    winnerSeat: null,
    finalScore: null,
  };
}

/* ------------------------------------------------------------------------- */

function cardMatches(c: Card, sug: Suggestion): boolean {
  if (c.kind === "suspect" && c.value === sug.suspect) return true;
  if (c.kind === "weapon" && c.value === sug.weapon) return true;
  if (c.kind === "room" && c.value === sug.room) return true;
  return false;
}

function noteShown(nb: Notebook, c: Card): Notebook {
  const out: Notebook = {
    suspects: { ...nb.suspects },
    weapons: { ...nb.weapons },
    rooms: { ...nb.rooms },
  };
  if (c.kind === "suspect") out.suspects[c.value as Suspect] = "X";
  else if (c.kind === "weapon") out.weapons[c.value as Weapon] = "X";
  else out.rooms[c.value as Room] = "X";
  return out;
}

/** Choose what the player at seat `seat` will reveal for `sug`.
 *  Returns null if nothing matches. */
function pickReveal(state: ClueFullState, seat: 0 | 1 | 2, sug: Suggestion, rng: () => number): Card | null {
  const matches = state.hands[seat]!.filter((c) => cardMatches(c, sug));
  if (matches.length === 0) return null;
  // For deterministic but variable behavior, use rng.
  const idx = Math.floor(rng() * matches.length);
  return matches[idx] ?? null;
}

/** Find next seat (in 1..2 around the suggester at `suggester`)
 *  that holds a matching card, starting from `from`. */
function findNextReveal(
  state: ClueFullState,
  suggester: 0 | 1 | 2,
  sug: Suggestion,
  from: 0 | 1 | 2,
): { seat: 0 | 1 | 2; cards: Card[] } | null {
  for (let i = 0; i < 3; i++) {
    const seat = ((from + i) % 3) as 0 | 1 | 2;
    if (seat === suggester) continue;
    const matches = state.hands[seat]!.filter((c) => cardMatches(c, sug));
    if (matches.length > 0) return { seat, cards: matches };
  }
  return null;
}

/* ------------------------------------------------------------------------- */
/* CPU heuristics                                                            */
/* ------------------------------------------------------------------------- */

interface CpuPlan {
  destination: Room;
  suggestion: Suggestion;
}

/** CPU's view of which suspects/weapons/rooms are still candidates
 *  (i.e., not known via cards in hand or shown). */
function cpuCandidates(state: ClueFullState, seat: 1 | 2): {
  suspects: Suspect[];
  weapons: Weapon[];
  rooms: Room[];
} {
  const seen = state.cpuMemory[seat]!.seenCards;
  const seenSusp = new Set(seen.filter((c) => c.kind === "suspect").map((c) => c.value));
  const seenWep = new Set(seen.filter((c) => c.kind === "weapon").map((c) => c.value));
  const seenRm = new Set(seen.filter((c) => c.kind === "room").map((c) => c.value));
  return {
    suspects: SUSPECTS.filter((s) => !seenSusp.has(s)),
    weapons: WEAPONS.filter((w) => !seenWep.has(w)),
    rooms: ROOMS.filter((r) => !seenRm.has(r)),
  };
}

function pickCpuPlan(state: ClueFullState, seat: 1 | 2, roll: number, rng: () => number): CpuPlan {
  const cand = cpuCandidates(state, seat);
  const here = state.positions[seat];
  let dests = reachableRooms(here, roll);
  // Prefer rooms still in the candidate set.
  const candDests = dests.filter((r) => cand.rooms.includes(r));
  if (candDests.length > 0) dests = candDests;
  // Fall back to staying-in-room if we're already in a candidate room.
  const destination =
    dests.length > 0
      ? dests[Math.floor(rng() * dests.length)]!
      : here;
  const suspect =
    cand.suspects[Math.floor(rng() * Math.max(1, cand.suspects.length))] ??
    SUSPECTS[0]!;
  const weapon =
    cand.weapons[Math.floor(rng() * Math.max(1, cand.weapons.length))] ??
    WEAPONS[0]!;
  return { destination, suggestion: { suspect, weapon, room: destination } };
}

/** Does the CPU at `seat` think it has narrowed the envelope to one
 *  of each category? */
function cpuReadyToAccuse(state: ClueFullState, seat: 1 | 2): Suggestion | null {
  const cand = cpuCandidates(state, seat);
  if (cand.suspects.length === 1 && cand.weapons.length === 1 && cand.rooms.length === 1) {
    return { suspect: cand.suspects[0]!, weapon: cand.weapons[0]!, room: cand.rooms[0]! };
  }
  return null;
}

/* ------------------------------------------------------------------------- */
/* Reducer                                                                   */
/* ------------------------------------------------------------------------- */

function rollOneDie(state: ClueFullState): { state: ClueFullState; value: number } {
  const { rng, nextState } = rngStep(state);
  const value = 1 + Math.floor(rng() * 6);
  return { state: { ...state, rngState: nextState }, value };
}

function startTurn(state: ClueFullState): ClueFullState {
  // Going into a fresh "roll" phase for the new player.
  return {
    ...state,
    phase: "roll",
    lastRoll: 0,
    movableTo: [],
    pendingSuggestion: null,
    revealFrom: null,
    revealOptions: [],
  };
}

function nextTurn(state: ClueFullState): ClueFullState {
  const t = ((state.turn + 1) % 3) as 0 | 1 | 2;
  return startTurn({ ...state, turn: t });
}

export function reducer(state: ClueFullState, action: ClueFullAction): ClueFullState {
  if (state.phase === "won" || state.phase === "lost") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "roll") return state;
      const { state: s1, value } = rollOneDie(state);
      const dests = reachableRooms(state.positions[state.turn], value);
      return { ...s1, phase: "move", lastRoll: value, movableTo: dests };
    }
    case "passage": {
      if (state.phase !== "roll") return state;
      const partner = passagePartner(state.positions[state.turn]);
      if (!partner) return state;
      const positions = state.positions.slice() as [Room, Room, Room];
      positions[state.turn] = partner;
      return { ...state, positions, phase: "suggest", lastRoll: 0, movableTo: [] };
    }
    case "move": {
      if (state.phase !== "move") return state;
      if (!state.movableTo.includes(action.to)) return state;
      const positions = state.positions.slice() as [Room, Room, Room];
      positions[state.turn] = action.to;
      return { ...state, positions, phase: "suggest", movableTo: [] };
    }
    case "suggest": {
      if (state.phase !== "suggest") return state;
      const room = state.positions[state.turn];
      const sug: Suggestion = { suspect: action.suspect, weapon: action.weapon, room };

      // Find first opponent (clockwise) who can refute.
      const start = ((state.turn + 1) % 3) as 0 | 1 | 2;
      const next = findNextReveal(state, state.turn, sug, start);
      if (!next) {
        // No one refutes. Log it and move to accuse phase.
        const log = state.log.concat({
          seat: state.turn,
          suggestion: sug,
          byPlayer: null,
          shownCard: null,
        });
        return {
          ...state,
          phase: "accuse",
          pendingSuggestion: sug,
          revealFrom: null,
          revealOptions: [],
          log,
        };
      }

      if (next.seat === 0) {
        // Human picks which to reveal.
        return {
          ...state,
          phase: "reveal",
          pendingSuggestion: sug,
          revealFrom: 0,
          revealOptions: next.cards,
        };
      }

      // CPU auto-reveals one (deterministic via RNG).
      const { rng, nextState } = rngStep(state);
      const card = pickReveal(state, next.seat, sug, rng)!;
      let notebook = state.notebook;
      let cpuMem = state.cpuMemory;
      if (state.turn === 0) {
        notebook = noteShown(state.notebook, card);
      } else {
        // Suggester is CPU; record card in *that* CPU's memory.
        cpuMem = state.cpuMemory.slice() as typeof state.cpuMemory;
        const mem = state.cpuMemory[state.turn]!;
        cpuMem[state.turn] = {
          seenCards: mem.seenCards.concat([card]),
        };
      }
      const log = state.log.concat({
        seat: state.turn,
        suggestion: sug,
        byPlayer: next.seat,
        // Only the suggester actually sees the card; we store it
        // here purely for replay/UX. The DOM never reveals it
        // unless the suggester was the human.
        shownCard: card,
      });
      return {
        ...state,
        rngState: nextState,
        phase: "accuse",
        pendingSuggestion: sug,
        revealFrom: null,
        revealOptions: [],
        notebook,
        cpuMemory: cpuMem,
        log,
      };
    }
    case "reveal": {
      if (state.phase !== "reveal") return state;
      if (state.revealFrom === null) return state;
      if (!state.revealOptions.some((c) => c.kind === action.card.kind && c.value === action.card.value)) return state;
      // The human is revealing a card to a CPU suggester.
      const suggester = state.turn;
      let cpuMem = state.cpuMemory;
      if (suggester !== 0) {
        cpuMem = state.cpuMemory.slice() as typeof state.cpuMemory;
        const mem = state.cpuMemory[suggester]!;
        cpuMem[suggester] = {
          seenCards: mem.seenCards.concat([action.card]),
        };
      }
      const log = state.log.slice();
      // Replace the last log entry if it was the suggestion we're handling,
      // else append a new one.
      log.push({
        seat: suggester,
        suggestion: state.pendingSuggestion!,
        byPlayer: state.revealFrom,
        shownCard: action.card,
      });
      return {
        ...state,
        phase: "accuse",
        revealFrom: null,
        revealOptions: [],
        cpuMemory: cpuMem,
        log,
      };
    }
    case "accuse": {
      // Accusations may be made at any point during your own turn (before
      // or after moving / suggesting), so we allow any non-terminal phase.
      if (state.phase === "reveal") return state;
      const sug: Suggestion = { suspect: action.suspect, weapon: action.weapon, room: action.room };
      const correct =
        sug.suspect === state.envelope.suspect &&
        sug.weapon === state.envelope.weapon &&
        sug.room === state.envelope.room;
      const log = state.log.concat({
        seat: state.turn,
        suggestion: sug,
        byPlayer: null,
        shownCard: null,
        accusation: true,
      });
      if (correct) {
        const winSeat = state.turn;
        const finalScore = winSeat === 0 ? Math.max(10, 100 - state.log.length * 3) : 0;
        return {
          ...state,
          phase: winSeat === 0 ? "won" : "lost",
          winnerSeat: winSeat,
          finalScore,
          log,
        };
      }
      // Wrong accusation: in real Clue the player is eliminated. We
      // simplify and end the game (loss for the human; CPUs realistically
      // won't accuse incorrectly given their tracker, but we guard).
      return {
        ...state,
        phase: state.turn === 0 ? "lost" : "lost",
        winnerSeat: null,
        finalScore: 0,
        log,
      };
    }
    case "endTurn": {
      if (state.phase !== "accuse" && state.phase !== "suggest") return state;
      return nextTurn(state);
    }
    case "cpuStep": {
      // Advance the current CPU turn by one micro-step (for animated UIs).
      if (state.turn === 0) return state;
      return advanceCpuOneStep(state);
    }
    case "noteToggle": {
      const out: Notebook = {
        suspects: { ...state.notebook.suspects },
        weapons: { ...state.notebook.weapons },
        rooms: { ...state.notebook.rooms },
      };
      const cycle = (m: NoteMark): NoteMark => (m === "U" ? "X" : m === "X" ? "?" : "U");
      if (action.kind === "suspect") out.suspects[action.value as Suspect] = cycle(out.suspects[action.value as Suspect]);
      else if (action.kind === "weapon") out.weapons[action.value as Weapon] = cycle(out.weapons[action.value as Weapon]);
      else out.rooms[action.value as Room] = cycle(out.rooms[action.value as Room]);
      return { ...state, notebook: out };
    }
  }
  return state;
}

/** Run all of a CPU's turn at once (driven from the UI via cpuStep). */
export function advanceCpuOneStep(state: ClueFullState): ClueFullState {
  if (state.turn === 0) return state;
  const seat = state.turn as 1 | 2;

  // If CPU is ready to accuse, do it.
  const acc = cpuReadyToAccuse(state, seat);
  if (acc && state.phase !== "reveal") {
    return reducer(state, { type: "accuse", ...acc });
  }

  switch (state.phase) {
    case "roll": {
      // Try secret passage if available and the partner room is still a candidate.
      const partner = passagePartner(state.positions[seat]);
      const cand = cpuCandidates(state, seat);
      if (partner && cand.rooms.includes(partner)) {
        return reducer(state, { type: "passage" });
      }
      return reducer(state, { type: "roll" });
    }
    case "move": {
      const { rng } = rngStep(state);
      const plan = pickCpuPlan(state, seat, state.lastRoll, rng);
      const target = state.movableTo.includes(plan.destination)
        ? plan.destination
        : (state.movableTo[0] ?? state.positions[seat]);
      if (target === state.positions[seat]) {
        // No moves at all (shouldn't happen on a normal graph); skip.
        return reducer(state, { type: "endTurn" });
      }
      return reducer(state, { type: "move", to: target });
    }
    case "suggest": {
      const { rng } = rngStep(state);
      const plan = pickCpuPlan(state, seat, 0, rng);
      return reducer(state, {
        type: "suggest",
        suspect: plan.suggestion.suspect,
        weapon: plan.suggestion.weapon,
      });
    }
    case "reveal": {
      // CPUs decline to wait — the human is reveal-source, so this state
      // is owned by the human UI.  No-op.
      return state;
    }
    case "accuse": {
      return reducer(state, { type: "endTurn" });
    }
    default:
      return state;
  }
}

/* ------------------------------------------------------------------------- */

export function isTerminal(state: ClueFullState): { score: number } | null {
  if (state.phase === "won") return { score: state.finalScore ?? 100 };
  if (state.phase === "lost") return { score: 0 };
  return null;
}

/** Helper for tests: deterministically construct an end-game state. */
export function _forceAccuse(state: ClueFullState, sug: Suggestion): ClueFullState {
  return reducer(state, { type: "accuse", ...sug });
}
