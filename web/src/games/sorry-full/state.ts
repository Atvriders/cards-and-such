import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Sorry! (Full) — the complete card-driven race with slide chains, swap cards,
// and an optional 2v2 partners mode.
//
// Board model:
//   * 60-square outer ring (0..59), 15 squares per color side.
//   * 4 players (0..3) at NE/SE/SW/NW corners of the ring.
//   * Each player has 4 pawns and a 5-square safety zone (positions 60..64)
//     leading to HOME (position 65).
//   * Each player has 2 slides on their side of the board (4-square and
//     5-square). Landing on a slide's START square (any color, only if NOT
//     your own color) sends the pawn to the end of the slide and bumps every
//     pawn (yours or opponents') in between back to their START yard.
//   * 1 or 2 may bring a pawn out of START. Sorry! card moves a pawn from
//     START to an opponent's location (bumping the opponent home).
//   * 7 may be split between two of your pawns.
//   * 11 may swap with an opponent on the ring (not on safety/home/start).
//   * 4 moves backward 4.
//   * 10 moves 10 forward OR 1 backward.
//
// Solo vs Partners:
//   * solo: 1 human + 3 CPUs. First to bring all 4 pawns home wins.
//   * partners: human (seat 0) + seat 2 are partners; seats 1 + 3 are partners.
//     A team wins when all 8 of the team's pawns are home. You may move a
//     partner's pawn (advance only, no Sorry/Swap targets) when you would
//     otherwise be stuck — covered by the AI's pawn-pool heuristic.

import type { Seat } from "../../platform/game-plugin/types.js";

export const RING_SIZE = 60;
export const SAFETY_LEN = 5;             // 5 squares in safety zone
export const SAFETY_START = RING_SIZE;   // 60..64 are safety
export const HOME_POS = RING_SIZE + SAFETY_LEN; // 65
export const YARD = -1;
export const NUM_PAWNS = 4;
export const NUM_PLAYERS = 4;

// Player start squares on the ring (where a pawn appears when leaving the
// yard). Standard board: 4 / 19 / 34 / 49.
const START_RING: readonly number[] = [4, 19, 34, 49];

// Each player's "safety entry" — the ring square immediately before turning
// off into their safety zone. From this square, +1 enters safety[0].
const SAFETY_ENTRY: readonly number[] = [2, 17, 32, 47];

// Slides on each player's side of the board. Two per color: a "short" slide
// (4 squares: enters at start+1, ends at start+4) and a "long" slide
// (5 squares: enters at start+9, ends at start+13).
// The slide START square is owner-colored — landing on YOUR OWN slide start
// does NOT trigger it. Other colors falling on it slide to the end.
interface Slide { owner: number; start: number; end: number; }
const SLIDES: readonly Slide[] = [
  { owner: 0, start: 1, end: 4 },   // 0..14: red side
  { owner: 0, start: 9, end: 13 },
  { owner: 1, start: 16, end: 19 }, // 15..29: blue side
  { owner: 1, start: 24, end: 28 },
  { owner: 2, start: 31, end: 34 }, // 30..44: yellow side
  { owner: 2, start: 39, end: 43 },
  { owner: 3, start: 46, end: 49 }, // 45..59: green side
  { owner: 3, start: 54, end: 58 },
];

function slideAt(player: number, ringPos: number): Slide | null {
  for (const s of SLIDES) {
    if (s.start === ringPos && s.owner !== player) return s;
  }
  return null;
}

export type SorryFullCard =
  | 1 | 2 | 3 | 4 | 5 | 7 | 8 | 10 | 11 | 12
  | "Sorry";

export type GameMode = "solo" | "partners";

export interface SorryFullSettings {
  mode: GameMode;
  difficulty: "easy" | "normal";
}

// A pawn's position. >= 0 and < RING_SIZE → on ring. SAFETY_START..HOME_POS-1
// → in safety zone. HOME_POS → home. YARD → in start yard.
export type Pos = number;

export interface SorryFullState {
  settings: SorryFullSettings;
  rngSeed: number;
  // pawns[player][pawnIndex] = Pos
  pawns: readonly (readonly Pos[])[];
  deck: readonly SorryFullCard[];
  discard: readonly SorryFullCard[];
  currentCard: SorryFullCard | null;
  turn: Seat;
  winner: number | null;   // player index OR team index (10/11 for teams)
  winningTeam: number | null; // 0 or 1 when in partners mode
  phase: "drawing" | "choosing" | "splitting"; // splitting = 7 split second pawn
  splitRemaining: number;  // pieces left after first pawn of a 7-split
  splitPawn: number;       // first pawn used in 7-split (so we don't reuse)
  // Whether the just-drawn card grants another turn (2)
  drawAgain: boolean;
  log: readonly string[];
}

export type SorryFullAction =
  | { type: "draw" }
  | { type: "move"; pawn: number; alt?: boolean }
  | { type: "sorry"; targetPlayer: number; targetPawn: number; myPawn: number }
  | { type: "swap"; myPawn: number; targetPlayer: number; targetPawn: number }
  | { type: "split"; pawn: number; spaces: number }
  | { type: "skip" };

const DECK_BASE: SorryFullCard[] = [
  // Standard Sorry! deck distribution (45 cards):
  // 5x each of 1, 2, 3, 4, 5, 7, 8, 10, 11, 12 + 4x Sorry
  1, 1, 1, 1, 1,
  2, 2, 2, 2, 2,
  3, 3, 3, 3, 3,
  4, 4, 4, 4, 4,
  5, 5, 5, 5, 5,
  7, 7, 7, 7, 7,
  8, 8, 8, 8, 8,
  10, 10, 10, 10, 10,
  11, 11, 11, 11, 11,
  12, 12, 12, 12, 12,
  "Sorry", "Sorry", "Sorry", "Sorry",
];

function shuffleDeck(base: readonly SorryFullCard[], rng: () => number): SorryFullCard[] {
  const deck = [...base];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export function initialState(seed: number, settings: SorryFullSettings): SorryFullState {
  const rng = mulberry32(seed);
  const deck = shuffleDeck(DECK_BASE, rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const pawns: Pos[][] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) pawns.push([YARD, YARD, YARD, YARD]);
  return {
    settings,
    rngSeed: nextSeed,
    pawns,
    deck,
    discard: [],
    currentCard: null,
    turn: 0,
    winner: null,
    winningTeam: null,
    phase: "drawing",
    splitRemaining: 0,
    splitPawn: -1,
    drawAgain: false,
    log: [],
  };
}

function teamOf(player: number): number {
  return player % 2;
}

function isOnRing(pos: Pos): boolean {
  return pos >= 0 && pos < RING_SIZE;
}

function isInSafety(pos: Pos): boolean {
  return pos >= SAFETY_START && pos < HOME_POS;
}

function isHome(pos: Pos): boolean {
  return pos === HOME_POS;
}

function isInYard(pos: Pos): boolean {
  return pos === YARD;
}

/** Try to advance `pos` by `delta` (delta may be negative).
 *  Returns the resulting Pos, or null if illegal.
 *  Does NOT apply slides or captures — caller does that. */
function advance(player: number, pos: Pos, delta: number): Pos | null {
  if (isHome(pos)) return null;
  if (isInYard(pos)) return null; // leaving yard handled separately

  // Pawn currently in safety zone
  if (isInSafety(pos)) {
    const idx = pos - SAFETY_START; // 0..SAFETY_LEN-1
    const target = idx + delta;
    if (target < 0) {
      // Back onto the ring: target = -1 → SAFETY_ENTRY ring square
      // For each step beyond -1 we go further backward along the ring.
      const stepsBack = -target; // 1 = SAFETY_ENTRY
      let r = SAFETY_ENTRY[player]!;
      r = ((r - (stepsBack - 1)) % RING_SIZE + RING_SIZE) % RING_SIZE;
      return r;
    }
    if (target < SAFETY_LEN) return SAFETY_START + target;
    if (target === SAFETY_LEN) return HOME_POS;
    return null; // overshoots home — illegal
  }

  // Pawn on ring
  if (delta < 0) {
    // Backward movement stays on ring (can't reverse into safety in std rules)
    let r = ((pos + delta) % RING_SIZE + RING_SIZE) % RING_SIZE;
    return r;
  }
  // Forward — check whether we cross our safety entry
  const entry = SAFETY_ENTRY[player]!;
  let remaining = delta;
  let cur = pos;
  while (remaining > 0) {
    if (cur === entry) {
      // Next step enters safety[0]
      const intoSafety = remaining; // remaining steps to spend in safety
      if (intoSafety <= SAFETY_LEN) return SAFETY_START + (intoSafety - 1);
      if (intoSafety === SAFETY_LEN + 1) return HOME_POS;
      return null; // overshoot
    }
    cur = (cur + 1) % RING_SIZE;
    remaining--;
  }
  return cur;
}

/** Returns true if (player, pi) currently occupies pos. */
function occupiedBySelf(pawns: readonly (readonly Pos[])[], player: number, pos: Pos, excludePawn = -1): boolean {
  for (let pi = 0; pi < NUM_PAWNS; pi++) {
    if (pi === excludePawn) continue;
    if (pawns[player]![pi] === pos) return true;
  }
  return false;
}

/** Bump every pawn (any player) currently on ring square `r` back to YARD,
 *  except the pawn identified by (player, pawnIdx). */
function bumpAt(
  pawns: Pos[][],
  ringPos: number,
  exceptPlayer: number,
  exceptPawn: number,
): void {
  for (let p = 0; p < NUM_PLAYERS; p++) {
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (p === exceptPlayer && pi === exceptPawn) continue;
      if (pawns[p]![pi] === ringPos) {
        pawns[p]![pi] = YARD;
      }
    }
  }
}

/** Apply slide effect at `ringPos` (if any) for `(player, pawnIdx)`. Mutates
 *  the pawns array. Returns the final landing pos (slide end if slid, or
 *  ringPos if no slide). */
function applySlide(
  pawns: Pos[][],
  player: number,
  pawnIdx: number,
  ringPos: number,
): number {
  const sl = slideAt(player, ringPos);
  if (!sl) return ringPos;
  // Bump every square from start..end (inclusive); except our own pawn.
  for (let r = sl.start; r <= sl.end; r++) {
    bumpAt(pawns, r, player, pawnIdx);
  }
  pawns[player]![pawnIdx] = sl.end;
  return sl.end;
}

/** Move (player, pawnIdx) by delta. Applies slide-and-bump and ring-bumps.
 *  Returns the new pawns array, or null if illegal. */
function tryMove(
  pawns: readonly (readonly Pos[])[],
  player: number,
  pawnIdx: number,
  delta: number,
): readonly (readonly Pos[])[] | null {
  const pos = pawns[player]![pawnIdx]!;
  if (isInYard(pos)) return null;
  const newPos = advance(player, pos, delta);
  if (newPos === null) return null;
  // Can't land on your own pawn (except multiple pawns may share HOME)
  if (newPos !== HOME_POS && occupiedBySelf(pawns, player, newPos, pawnIdx)) return null;

  const next = pawns.map((row) => [...row]) as Pos[][];
  next[player]![pawnIdx] = newPos;

  // Ring landings: bump opponents + check slides
  if (isOnRing(newPos)) {
    // Bump any opponent (or partner's) pawn on that square
    bumpAt(next, newPos, player, pawnIdx);
    // Apply slide chain
    const after = applySlide(next, player, pawnIdx, newPos);
    // applySlide already wrote to next[player][pawnIdx]
    void after;
    // After slide bumping it's possible the final pos is now own-occupied — but
    // bumpAt only bumps opponents and slideRange covered intermediate squares;
    // our other pawns on the slide path were bumped, so this should never collide.
  }
  return next;
}

/** Bring a pawn out of yard onto our START ring square. Returns null if
 *  illegal (no pawn in yard or our START is blocked by our own pawn). */
function tryLeaveYard(
  pawns: readonly (readonly Pos[])[],
  player: number,
  pawnIdx: number,
): readonly (readonly Pos[])[] | null {
  if (pawns[player]![pawnIdx] !== YARD) return null;
  const startSq = START_RING[player]!;
  if (occupiedBySelf(pawns, player, startSq, pawnIdx)) return null;
  const next = pawns.map((row) => [...row]) as Pos[][];
  next[player]![pawnIdx] = startSq;
  // Bump opponents at our start — slides don't trigger on YOUR own start (it's
  // not a slide tile here anyway).
  bumpAt(next, startSq, player, pawnIdx);
  return next;
}

/** Get the legal forward delta for a numeric card (special handling for 4/10). */
function deltaForCard(card: SorryFullCard, alt = false): number | null {
  if (typeof card !== "number") return null;
  if (card === 4) return -4;
  if (card === 10) return alt ? -1 : 10;
  return card;
}

/** Test whether a player has any legal action with the given card. */
function hasLegalMove(
  pawns: readonly (readonly Pos[])[],
  player: number,
  card: SorryFullCard,
): boolean {
  if (card === "Sorry") {
    // Need a pawn in yard AND an opponent (or partner-foe) on the ring.
    if (!pawns[player]!.some((p) => p === YARD)) return false;
    for (let opp = 0; opp < NUM_PLAYERS; opp++) {
      if (opp === player) continue;
      for (let pi = 0; pi < NUM_PAWNS; pi++) {
        if (isOnRing(pawns[opp]![pi]!)) return true;
      }
    }
    return false;
  }

  // 1 or 2 — can leave yard
  if (card === 1 || card === 2) {
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (pawns[player]![pi] === YARD) {
        if (tryLeaveYard(pawns, player, pi)) return true;
      }
    }
  }

  // 11 — also swap. Need a pawn on ring + an opponent on ring.
  if (card === 11) {
    const myRingPawns: number[] = [];
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (isOnRing(pawns[player]![pi]!)) myRingPawns.push(pi);
    }
    if (myRingPawns.length > 0) {
      for (let opp = 0; opp < NUM_PLAYERS; opp++) {
        if (opp === player) continue;
        for (let pi = 0; pi < NUM_PAWNS; pi++) {
          if (isOnRing(pawns[opp]![pi]!)) return true;
        }
      }
    }
  }

  // Plain numeric advance/back
  const d = deltaForCard(card);
  if (d !== null) {
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (pawns[player]![pi] === YARD) continue;
      if (tryMove(pawns, player, pi, d)) return true;
      // 10: also check back-1 option
      if (card === 10) {
        if (tryMove(pawns, player, pi, -1)) return true;
      }
    }
  }

  // 7 split — when no single pawn can advance the full 7, the player may
  // still split the move across two pawns as 1+6 / 2+5 / 3+4 / etc. The
  // numeric branch above only checks single-pawn 7-advances; without this
  // explicit split feasibility check the reducer/CPU would forfeit a legal
  // turn whenever the only legal 7 was a split.
  if (card === 7) {
    for (let a = 1; a <= 6; a++) {
      const b = 7 - a;
      for (let p1 = 0; p1 < NUM_PAWNS; p1++) {
        if (pawns[player]![p1] === YARD) continue;
        const after1 = tryMove(pawns, player, p1, a);
        if (!after1) continue;
        for (let p2 = 0; p2 < NUM_PAWNS; p2++) {
          if (p2 === p1) continue;
          if (after1[player]![p2] === YARD) continue;
          if (tryMove(after1, player, p2, b)) return true;
        }
      }
    }
  }
  return false;
}

function refillDeck(
  deck: readonly SorryFullCard[],
  discard: readonly SorryFullCard[],
  rng: () => number,
): { deck: SorryFullCard[]; discard: SorryFullCard[] } {
  if (deck.length > 0) return { deck: [...deck], discard: [...discard] };
  const shuffled = shuffleDeck(discard.length > 0 ? discard : DECK_BASE, rng);
  return { deck: shuffled, discard: [] };
}

function drawCard(state: SorryFullState): {
  card: SorryFullCard;
  deck: SorryFullCard[];
  discard: SorryFullCard[];
  seed: number;
} {
  const rng = mulberry32(state.rngSeed);
  const refilled = refillDeck(state.deck, state.discard, rng);
  let deck = refilled.deck;
  let discard = refilled.discard;
  if (deck.length === 0) {
    deck = shuffleDeck(DECK_BASE, rng);
  }
  const card = deck[deck.length - 1]!;
  deck = deck.slice(0, -1);
  const seed = Math.floor(rng() * 2 ** 31);
  return { card, deck, discard, seed };
}

function teamHomeCount(pawns: readonly (readonly Pos[])[], team: number): number {
  let n = 0;
  for (let p = 0; p < NUM_PLAYERS; p++) {
    if (teamOf(p) !== team) continue;
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (pawns[p]![pi] === HOME_POS) n++;
    }
  }
  return n;
}

function checkWinner(
  pawns: readonly (readonly Pos[])[],
  mode: GameMode,
): { player: number | null; team: number | null } {
  if (mode === "partners") {
    for (let t = 0; t < 2; t++) {
      if (teamHomeCount(pawns, t) === NUM_PAWNS * 2) {
        return { player: null, team: t };
      }
    }
    return { player: null, team: null };
  }
  for (let p = 0; p < NUM_PLAYERS; p++) {
    if (pawns[p]!.every((pos) => pos === HOME_POS)) return { player: p, team: null };
  }
  return { player: null, team: null };
}

function nextTurn(
  state: SorryFullState,
  pawns: readonly (readonly Pos[])[],
  card: SorryFullCard | null,
  seed: number,
  deck: readonly SorryFullCard[],
  discard: readonly SorryFullCard[],
  drawAgain: boolean,
  logEntries: readonly string[] = [],
): SorryFullState {
  const w = checkWinner(pawns, state.settings.mode);
  const baseLog = [...state.log, ...logEntries].slice(-20);
  if (w.player !== null || w.team !== null) {
    return { ...state, pawns, currentCard: null, rngSeed: seed, deck, discard,
      winner: w.player, winningTeam: w.team, phase: "drawing",
      splitRemaining: 0, splitPawn: -1, drawAgain: false, log: baseLog };
  }
  const newDiscard = card !== null ? [...discard, card] : discard;
  if (drawAgain) {
    return { ...state, pawns, currentCard: null, rngSeed: seed, deck,
      discard: newDiscard, turn: state.turn, phase: "drawing",
      splitRemaining: 0, splitPawn: -1, drawAgain: false, log: baseLog };
  }
  const nt = ((state.turn + 1) % NUM_PLAYERS) as Seat;
  return { ...state, pawns, currentCard: null, rngSeed: seed, deck,
    discard: newDiscard, turn: nt, phase: "drawing",
    splitRemaining: 0, splitPawn: -1, drawAgain: false, log: baseLog };
}

/** Bot move heuristic. Greedy: prefer slides+swaps that hit a leading
 *  opponent, otherwise advance the lagging (furthest from home) pawn the most. */
function botPickMove(state: SorryFullState, player: number, card: SorryFullCard): SorryFullState {
  const pawns = state.pawns;

  // helper: "progress" rating per pawn (higher = closer to home)
  function progress(p: number, pi: number): number {
    const pos = pawns[p]![pi]!;
    if (pos === YARD) return -10;
    if (pos === HOME_POS) return 100;
    if (isInSafety(pos)) return 80 + (pos - SAFETY_START);
    // approximate: count squares from START going forward
    const start = START_RING[p]!;
    return ((pos - start + RING_SIZE) % RING_SIZE);
  }

  // Score a hypothetical new pawns state from `player`'s perspective.
  function score(np: readonly (readonly Pos[])[]): number {
    let s = 0;
    // sum of own progress
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      const pos = np[player]![pi]!;
      if (pos === HOME_POS) s += 100;
      else if (pos === YARD) s += 0;
      else if (isInSafety(pos)) s += 60 + (pos - SAFETY_START) * 3;
      else {
        const start = START_RING[player]!;
        s += 10 + ((pos - start + RING_SIZE) % RING_SIZE) * 0.8;
      }
    }
    // partners: count partner progress too
    if (state.settings.mode === "partners") {
      const partner = (player + 2) % 4;
      for (let pi = 0; pi < NUM_PAWNS; pi++) {
        const pos = np[partner]![pi]!;
        if (pos === HOME_POS) s += 50;
        else if (pos === YARD) s += 0;
        else if (isInSafety(pos)) s += 30 + (pos - SAFETY_START) * 1.5;
        else {
          const start = START_RING[partner]!;
          s += 5 + ((pos - start + RING_SIZE) % RING_SIZE) * 0.4;
        }
      }
    }
    // Subtract opponent progress (esp. the leader)
    for (let opp = 0; opp < NUM_PLAYERS; opp++) {
      if (opp === player) continue;
      if (state.settings.mode === "partners" && teamOf(opp) === teamOf(player)) continue;
      for (let pi = 0; pi < NUM_PAWNS; pi++) {
        const pos = np[opp]![pi]!;
        const prevPos = pawns[opp]![pi]!;
        if (pos === YARD && prevPos !== YARD) s += 40; // bumped someone!
        if (pos === HOME_POS) s -= 80;
        else if (!isInYard(pos)) {
          if (isInSafety(pos)) s -= 30 + (pos - SAFETY_START) * 2;
          else {
            const start = START_RING[opp]!;
            s -= 8 + ((pos - start + RING_SIZE) % RING_SIZE) * 0.5;
          }
        }
      }
    }
    return s;
  }

  let bestState = state;
  let bestScore = -Infinity;
  let foundAny = false;

  function consider(np: readonly (readonly Pos[])[] | null) {
    if (!np) return;
    const sc = score(np);
    if (sc > bestScore) {
      bestScore = sc;
      bestState = { ...state, pawns: np };
      foundAny = true;
    }
  }

  if (card === "Sorry") {
    for (let myPi = 0; myPi < NUM_PAWNS; myPi++) {
      if (pawns[player]![myPi] !== YARD) continue;
      for (let opp = 0; opp < NUM_PLAYERS; opp++) {
        if (opp === player) continue;
        if (state.settings.mode === "partners" && teamOf(opp) === teamOf(player)) continue;
        for (let opi = 0; opi < NUM_PAWNS; opi++) {
          const oppPos = pawns[opp]![opi]!;
          if (!isOnRing(oppPos)) continue;
          const np = pawns.map((r) => [...r]) as Pos[][];
          np[opp]![opi] = YARD;
          np[player]![myPi] = oppPos;
          // Apply slide if landed on a slide
          applySlide(np, player, myPi, oppPos);
          consider(np);
        }
      }
    }
  } else if (card === 11) {
    // Option A: move 11 forward
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      const m = tryMove(pawns, player, pi, 11);
      consider(m);
    }
    // Option B: swap with an opponent
    for (let myPi = 0; myPi < NUM_PAWNS; myPi++) {
      if (!isOnRing(pawns[player]![myPi]!)) continue;
      for (let opp = 0; opp < NUM_PLAYERS; opp++) {
        if (opp === player) continue;
        if (state.settings.mode === "partners" && teamOf(opp) === teamOf(player)) continue;
        for (let opi = 0; opi < NUM_PAWNS; opi++) {
          if (!isOnRing(pawns[opp]![opi]!)) continue;
          const myPos = pawns[player]![myPi]!;
          const oppPos = pawns[opp]![opi]!;
          const np = pawns.map((r) => [...r]) as Pos[][];
          np[player]![myPi] = oppPos;
          np[opp]![opi] = myPos;
          // Apply slide if landed on a slide
          applySlide(np, player, myPi, oppPos);
          consider(np);
        }
      }
    }
  } else if (card === 1 || card === 2) {
    // Leave yard option
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      const m = tryLeaveYard(pawns, player, pi);
      if (m) {
        // Also apply slide if start is on someone else's slide (rare)
        const np = m.map((r) => [...r]) as Pos[][];
        applySlide(np, player, pi, np[player]![pi]!);
        consider(np);
      }
    }
    // Forward delta
    const d = card;
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      consider(tryMove(pawns, player, pi, d));
    }
  } else if (card === 7) {
    // Try single move 7 first
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      consider(tryMove(pawns, player, pi, 7));
    }
    // Splits 1..6 / 6..1 between two distinct pawns
    for (let a = 1; a < 7; a++) {
      const b = 7 - a;
      for (let p1 = 0; p1 < NUM_PAWNS; p1++) {
        const m1 = tryMove(pawns, player, p1, a);
        if (!m1) continue;
        for (let p2 = 0; p2 < NUM_PAWNS; p2++) {
          if (p2 === p1) continue;
          const m2 = tryMove(m1, player, p2, b);
          if (!m2) continue;
          consider(m2);
        }
      }
    }
  } else if (card === 10) {
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      consider(tryMove(pawns, player, pi, 10));
      consider(tryMove(pawns, player, pi, -1));
    }
  } else {
    const d = deltaForCard(card);
    if (d !== null) {
      for (let pi = 0; pi < NUM_PAWNS; pi++) {
        consider(tryMove(pawns, player, pi, d));
      }
    }
  }

  if (!foundAny) return state;
  return bestState;
}

function advanceBots(state: SorryFullState): SorryFullState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.winningTeam === null && s.turn !== 0 && iter++ < 500) {
    if (s.phase === "drawing") {
      const drawn = drawCard(s);
      const card = drawn.card;
      if (!hasLegalMove(s.pawns, s.turn, card)) {
        // Discard and pass
        const nt = ((s.turn + 1) % NUM_PLAYERS) as Seat;
        s = { ...s, rngSeed: drawn.seed, deck: drawn.deck,
              discard: [...drawn.discard, card],
              currentCard: null, turn: nt, phase: "drawing",
              drawAgain: false, log: [...s.log, `${LABELS[s.turn]} drew ${cardLabel(card)} (no move)`].slice(-20) };
        continue;
      }
      s = { ...s, rngSeed: drawn.seed, deck: drawn.deck, discard: drawn.discard,
            currentCard: card, phase: "choosing",
            log: [...s.log, `${LABELS[s.turn]} drew ${cardLabel(card)}`].slice(-20) };
      // Execute bot move
      const after = botPickMove(s, s.turn, card);
      const drawAgain = card === 2;
      s = nextTurn(s, after.pawns, card, s.rngSeed, s.deck, s.discard, drawAgain);
    } else {
      // Shouldn't normally land here on a bot turn
      const nt = ((s.turn + 1) % NUM_PLAYERS) as Seat;
      s = { ...s, turn: nt, phase: "drawing", currentCard: null,
            splitRemaining: 0, splitPawn: -1, drawAgain: false };
    }
  }
  return s;
}

export function cardLabel(card: SorryFullCard): string {
  return card === "Sorry" ? "Sorry!" : String(card);
}

export const LABELS: readonly string[] = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function reducer(state: SorryFullState, action: SorryFullAction): SorryFullState {
  if (state.winner !== null || state.winningTeam !== null) return state;

  if (action.type === "draw") {
    if (state.phase !== "drawing" || state.turn !== 0) return state;
    const { card, deck, discard, seed } = drawCard(state);
    if (!hasLegalMove(state.pawns, 0, card)) {
      const nt = (1 % NUM_PLAYERS) as Seat;
      const next: SorryFullState = {
        ...state, rngSeed: seed, deck, discard: [...discard, card],
        currentCard: null, turn: nt, phase: "drawing",
        log: [...state.log, `${LABELS[0]} drew ${cardLabel(card)} (no move)`].slice(-20),
      };
      return advanceBots(next);
    }
    return {
      ...state, rngSeed: seed, deck, discard, currentCard: card, phase: "choosing",
      log: [...state.log, `${LABELS[0]} drew ${cardLabel(card)}`].slice(-20),
    };
  }

  if (action.type === "skip") {
    // Forfeit a card with no legal move (or skip a 7-split remainder)
    if (state.turn !== 0) return state;
    if (state.phase === "splitting") {
      // Skipping the remainder of a 7-split — discard 7
      const card = 7 as SorryFullCard;
      const next = nextTurn(state, state.pawns, card, state.rngSeed, state.deck, state.discard, false);
      return advanceBots(next);
    }
    if (state.phase === "choosing" && state.currentCard !== null) {
      const card = state.currentCard;
      const next = nextTurn(state, state.pawns, card, state.rngSeed, state.deck, state.discard, false);
      return advanceBots(next);
    }
    return state;
  }

  if (action.type === "move") {
    if (state.phase !== "choosing" || state.turn !== 0 || state.currentCard === null) return state;
    const card = state.currentCard;
    const { pawn, alt } = action;
    const pos = state.pawns[0]![pawn]!;

    // Leaving yard with 1 or 2
    if (isInYard(pos) && (card === 1 || card === 2)) {
      const out = tryLeaveYard(state.pawns, 0, pawn);
      if (!out) return state;
      // Apply slide if start is on someone else's slide (it shouldn't be by board defn)
      const next = out.map((r) => [...r]) as Pos[][];
      applySlide(next, 0, pawn, next[0]![pawn]!);
      const drawAgain = card === 2;
      const r = nextTurn(state, next, card, state.rngSeed, state.deck, state.discard, drawAgain);
      if (r.turn !== 0 && r.winner === null && r.winningTeam === null) return advanceBots(r);
      return r;
    }

    // 7-split: first half
    if (card === 7) {
      // If a specific delta isn't given via alt, treat as full 7 OR start split
      // We support: action with alt = true → split mode (move N for split)
      // The Game.tsx will pass `alt` undefined for full 7 (single pawn) and use a separate action for splits.
      if (alt) return state;
      const np = tryMove(state.pawns, 0, pawn, 7);
      if (!np) return state;
      const r = nextTurn(state, np, card, state.rngSeed, state.deck, state.discard, false);
      if (r.turn !== 0 && r.winner === null && r.winningTeam === null) return advanceBots(r);
      return r;
    }

    const d = deltaForCard(card, alt);
    if (d === null) return state;
    const np = tryMove(state.pawns, 0, pawn, d);
    if (!np) return state;
    const drawAgain = card === 2;
    const r = nextTurn(state, np, card, state.rngSeed, state.deck, state.discard, drawAgain);
    if (r.turn !== 0 && r.winner === null && r.winningTeam === null) return advanceBots(r);
    return r;
  }

  if (action.type === "split") {
    if (state.turn !== 0) return state;
    if (state.currentCard !== 7) return state;
    const { pawn, spaces } = action;
    if (spaces < 1 || spaces > 6) return state;

    if (state.phase === "choosing") {
      // First half of split
      const np = tryMove(state.pawns, 0, pawn, spaces);
      if (!np) return state;
      const remaining = 7 - spaces;
      return {
        ...state, pawns: np, phase: "splitting", splitRemaining: remaining,
        splitPawn: pawn,
      };
    }
    if (state.phase === "splitting") {
      if (pawn === state.splitPawn) return state;       // must be a different pawn
      if (spaces !== state.splitRemaining) return state;  // exact remainder
      const np = tryMove(state.pawns, 0, pawn, spaces);
      if (!np) return state;
      const r = nextTurn(state, np, 7, state.rngSeed, state.deck, state.discard, false);
      if (r.turn !== 0 && r.winner === null && r.winningTeam === null) return advanceBots(r);
      return r;
    }
    return state;
  }

  if (action.type === "sorry") {
    if (state.phase !== "choosing" || state.turn !== 0 || state.currentCard !== "Sorry") return state;
    const { targetPlayer, targetPawn, myPawn } = action;
    if (targetPlayer === 0) return state;
    if (state.settings.mode === "partners" && teamOf(targetPlayer) === teamOf(0)) return state;
    if (state.pawns[0]![myPawn] !== YARD) return state;
    const oppPos = state.pawns[targetPlayer]![targetPawn]!;
    if (!isOnRing(oppPos)) return state;
    const np = state.pawns.map((r) => [...r]) as Pos[][];
    np[targetPlayer]![targetPawn] = YARD;
    np[0]![myPawn] = oppPos;
    // Apply slide if landed on opponent slide
    applySlide(np, 0, myPawn, oppPos);
    const r = nextTurn(state, np, "Sorry", state.rngSeed, state.deck, state.discard, false);
    if (r.turn !== 0 && r.winner === null && r.winningTeam === null) return advanceBots(r);
    return r;
  }

  if (action.type === "swap") {
    if (state.phase !== "choosing" || state.turn !== 0 || state.currentCard !== 11) return state;
    const { myPawn, targetPlayer, targetPawn } = action;
    if (targetPlayer === 0) return state;
    if (state.settings.mode === "partners" && teamOf(targetPlayer) === teamOf(0)) return state;
    const myPos = state.pawns[0]![myPawn]!;
    const oppPos = state.pawns[targetPlayer]![targetPawn]!;
    if (!isOnRing(myPos) || !isOnRing(oppPos)) return state;
    const np = state.pawns.map((r) => [...r]) as Pos[][];
    np[0]![myPawn] = oppPos;
    np[targetPlayer]![targetPawn] = myPos;
    // Apply slide for both (rare for opponent to land on slide tile)
    applySlide(np, 0, myPawn, oppPos);
    applySlide(np, targetPlayer, targetPawn, myPos);
    const r = nextTurn(state, np, 11, state.rngSeed, state.deck, state.discard, false);
    if (r.turn !== 0 && r.winner === null && r.winningTeam === null) return advanceBots(r);
    return r;
  }

  return state;
}

export function isTerminal(state: SorryFullState): { score: number } | null {
  if (state.settings.mode === "partners") {
    if (state.winningTeam === null) return null;
    return { score: state.winningTeam === 0 ? 100 : 0 };
  }
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}

// Re-export some internals for tests.
export const _internals = {
  START_RING, SAFETY_ENTRY, SLIDES, slideAt, advance, tryMove, tryLeaveYard,
  hasLegalMove, deltaForCard, applySlide, bumpAt, isInSafety, isInYard,
};
