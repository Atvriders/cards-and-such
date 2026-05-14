// Aggravation (Full) — the cross-board marble race.
//
// Four players (seat 0 is you, seats 1..3 are CPUs). Each player has 4 marbles
// that begin in the BASE yard. A single six-sided die is rolled each turn.
//   * Roll a 6 to release a marble from BASE onto your START square (and bump
//     any opponent occupying it home). Rolling a 6 grants another roll (max 3
//     in a row to keep things bounded).
//   * Otherwise move one of your on-track marbles forward by the die value.
//   * Landing on an opponent's marble (outer ring) sends it home to BASE.
//   * Your own marble blocks you (cannot land on your own square).
//   * Home column entry: a marble that has gone all the way around peels off
//     onto its 4-square HOME COLUMN. Exact roll to land on home spots; cannot
//     overshoot HOME.
//   * Center SHORTCUT: each player has one SHORTCUT ENTRY square on the outer
//     ring. To enter the shortcut you must roll the EXACT number to land on
//     your shortcut entry (we treat the entry as a permission square — you
//     may choose to dive in or stay on the ring). Once inside, the center
//     cross has 5 squares forming an X; advance along it and exit at any of
//     the OTHER three players' shortcut-exit squares (we use the player
//     opposite by default; once on the center hub you can fork to any open
//     exit when you reach it exactly).
//   * Capture/bump on a shortcut square sends the opponent home, same as ring.
//
// CPU strategy: prefer the farthest-along marble that has a legal move,
// prefer captures of opponent marbles when available, prefer entering the
// shortcut when it advances total progress.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import type { Seat } from "../../platform/game-plugin/types.js";

export const NUM_PLAYERS = 4;
export const NUM_MARBLES = 4;
export const RING_SIZE = 64;          // 16 squares per quadrant
export const HOME_COL_LEN = 4;        // 4 home spots per player
export const QUADRANT = 16;
// Special encoded positions
export const BASE: number = -1;
export const HOME_BASE = 1000;          // HOME_BASE + i → home column index i (0..3)
export const HOME = 2000;               // Reached final home
export const CENTER_BASE = 500;         // CENTER_BASE + i → center cross square i (0..4)
export const CENTER_LEN = 5;

// Outer ring start squares for each player (where a marble appears when leaving BASE).
export const START_RING: readonly number[] = [0, 16, 32, 48];
// Home entry: the ring square just before the home column. From this square +1 → HOME_BASE+0.
// Each player's home entry is at ring position (start - 1) mod RING.
export const HOME_ENTRY: readonly number[] = [63, 15, 31, 47];

// Shortcut ENTRY squares: where a marble may dive into the central cross.
// Standard placement: 4 squares before each player's home entry. Entering
// requires exact-roll landing.
// shortcutEntry[p] is on player p's side of the board, 4 squares past their START.
export const SHORTCUT_ENTRY: readonly number[] = [4, 20, 36, 52];

// Each shortcut ENTRY corresponds to a center-cross "branch" index. We model
// the center as five squares arranged as a + with one hub in the middle. From
// entry by player p, you walk: branch[p].in (2 spaces) → hub → branch[opposite].out
// (2 spaces) → emerge on the ring at the opposite player's shortcut EXIT.
// shortcutExit[p] is opposite player's near-ring point.
export const SHORTCUT_EXIT: readonly number[] = [36, 52, 4, 20];

// Cross map: position along the shortcut for player p who entered:
//   step 0 → CENTER_BASE + 0 (their inbound 1)
//   step 1 → CENTER_BASE + 1 (their inbound 2)
//   step 2 → CENTER_BASE + 2 (hub)
//   step 3 → CENTER_BASE + 3 (opposite outbound 1)
//   step 4 → CENTER_BASE + 4 (opposite outbound 2)
//   step 5 → SHORTCUT_EXIT[p] on the ring
//
// We tag each marble's "centerStep" while it is inside the cross via a
// small parallel structure stored on the state.

export type Phase = "rolling" | "moving" | "done";

export interface AggravationFullSettings {
  _dummy: boolean;
}

export interface Marble {
  pos: number;       // BASE, ring (0..RING_SIZE-1), CENTER_BASE+step, HOME_BASE+slot, or HOME
  centerOwner: number; // when on center cross, the player whose entry was used (for exit routing)
  centerStep: number;  // 0..4 along the cross path
}

export interface AggravationFullState {
  settings: AggravationFullSettings;
  rngSeed: number;
  marbles: readonly (readonly Marble[])[]; // [player][marbleIdx]
  turn: Seat;
  phase: Phase;
  die: number | null;     // last rolled die (1..6)
  consecutiveSixes: number;
  winner: number | null;
  lastEvent: string;
  log: readonly string[];
}

export type AggravationFullAction =
  | { type: "roll" }
  | { type: "move"; marbleIdx: number; useShortcut?: boolean }
  | { type: "endTurn" };

export const LABELS: readonly string[] = ["You", "Bot 1", "Bot 2", "Bot 3"];
export const COLORS: readonly string[] = ["red", "blue", "green", "yellow"];

// ---- helpers ----

function rollDie(seed: number): { v: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const v = 1 + Math.floor(rng() * 6);
  return { v, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function freshMarble(): Marble {
  return { pos: BASE, centerOwner: -1, centerStep: -1 };
}

export function isBase(pos: number): boolean { return pos === BASE; }
export function isRing(pos: number): boolean { return pos >= 0 && pos < RING_SIZE; }
export function isCenter(pos: number): boolean { return pos >= CENTER_BASE && pos < CENTER_BASE + CENTER_LEN; }
export function isHomeCol(pos: number): boolean { return pos >= HOME_BASE && pos < HOME_BASE + HOME_COL_LEN; }
export function isHomed(pos: number): boolean { return pos === HOME; }

export function ringDistanceFromStart(player: number, ringPos: number): number {
  // How many ring squares the player has travelled (0..RING_SIZE-1)
  const start = START_RING[player]!;
  return (ringPos - start + RING_SIZE) % RING_SIZE;
}

/** Compute the progress score for a marble — higher = closer to home. Used by
 *  the CPU heuristic and by the "farthest-along" hint.
 *
 *  - BASE: 0
 *  - On ring: 1 + distance travelled from start (1..RING_SIZE)
 *  - On center cross: RING_SIZE + 1 + step
 *  - In home column: RING_SIZE + CENTER_LEN + 1 + slot (so close to MAX)
 *  - HOME: large constant
 */
export function progressOf(player: number, m: Marble): number {
  if (m.pos === BASE) return 0;
  if (m.pos === HOME) return RING_SIZE + CENTER_LEN + HOME_COL_LEN + 10;
  if (isHomeCol(m.pos)) return RING_SIZE + CENTER_LEN + (m.pos - HOME_BASE) + 1;
  if (isCenter(m.pos)) return RING_SIZE + (m.centerStep) + 1;
  // ring
  return 1 + ringDistanceFromStart(player, m.pos);
}

/** Helper: is (player, idx) already occupying this exact pos (excluding excl)?  */
function selfOccupies(
  marbles: readonly (readonly Marble[])[],
  player: number,
  pos: number,
  excl = -1,
): boolean {
  if (pos === HOME) return false; // multiple marbles may share HOME
  for (let i = 0; i < NUM_MARBLES; i++) {
    if (i === excl) continue;
    if (marbles[player]![i]!.pos === pos) return true;
  }
  return false;
}

/** Find any opponent marble at a ring/center position. Returns [opp, idx] or null. */
function opponentAt(
  marbles: readonly (readonly Marble[])[],
  player: number,
  pos: number,
): { opp: number; idx: number } | null {
  if (pos === HOME) return null;
  for (let p = 0; p < NUM_PLAYERS; p++) {
    if (p === player) continue;
    for (let i = 0; i < NUM_MARBLES; i++) {
      if (marbles[p]![i]!.pos === pos) return { opp: p, idx: i };
    }
  }
  return null;
}

/** Send a marble back to BASE. */
function sendHome(marbles: Marble[][], p: number, idx: number): void {
  marbles[p]![idx] = freshMarble();
}

function deepClone(marbles: readonly (readonly Marble[])[]): Marble[][] {
  return marbles.map(row => row.map(m => ({ ...m })));
}

/** Plan the result of moving (player, idx) by `pips`. Returns the result
 *  marbles array on success (mutated copy), or null if illegal.
 *  `useShortcut` only matters when we'd land on our SHORTCUT_ENTRY: false →
 *  stay on ring, true → enter the cross at step 0.
 */
export function tryMove(
  marbles: readonly (readonly Marble[])[],
  player: number,
  idx: number,
  pips: number,
  useShortcut = false,
): Marble[][] | null {
  if (pips < 1) return null;
  const m = marbles[player]![idx]!;

  // From BASE — only on a 6, lands on START_RING. Cannot land on own start.
  if (m.pos === BASE) {
    if (pips !== 6) return null;
    const startSq = START_RING[player]!;
    if (selfOccupies(marbles, player, startSq, idx)) return null;
    const next = deepClone(marbles);
    next[player]![idx] = { pos: startSq, centerOwner: -1, centerStep: -1 };
    // Bump any opponent at start
    const opp = opponentAt(next, player, startSq);
    if (opp) sendHome(next, opp.opp, opp.idx);
    return next;
  }

  if (m.pos === HOME) return null;

  if (isHomeCol(m.pos)) {
    const slot = m.pos - HOME_BASE;
    const targetSlot = slot + pips;
    if (targetSlot === HOME_COL_LEN) {
      // Lands on HOME exactly
      const next = deepClone(marbles);
      next[player]![idx] = { pos: HOME, centerOwner: -1, centerStep: -1 };
      return next;
    }
    if (targetSlot < HOME_COL_LEN) {
      const newPos = HOME_BASE + targetSlot;
      if (selfOccupies(marbles, player, newPos, idx)) return null;
      const next = deepClone(marbles);
      next[player]![idx] = { pos: newPos, centerOwner: -1, centerStep: -1 };
      return next;
    }
    return null; // overshoot
  }

  if (isCenter(m.pos)) {
    const startStep = m.centerStep;
    const owner = m.centerOwner;
    let remaining = pips;
    let step = startStep;
    while (remaining > 0) {
      step += 1;
      remaining -= 1;
      if (step >= CENTER_LEN) {
        // Exited the cross: pop out at SHORTCUT_EXIT[owner], with remaining
        // pips still to be applied as ring forward movement.
        const exitSq = SHORTCUT_EXIT[owner]!;
        if (remaining === 0) {
          if (selfOccupies(marbles, player, exitSq, idx)) return null;
          const next = deepClone(marbles);
          next[player]![idx] = { pos: exitSq, centerOwner: -1, centerStep: -1 };
          const opp = opponentAt(next, player, exitSq);
          if (opp) sendHome(next, opp.opp, opp.idx);
          return next;
        }
        // Walk remaining steps along the ring from exitSq.
        return walkRing(marbles, player, idx, exitSq, remaining, false);
      }
    }
    // Still inside cross
    const newPos = CENTER_BASE + step;
    if (selfOccupies(marbles, player, newPos, idx)) return null;
    const next = deepClone(marbles);
    next[player]![idx] = { pos: newPos, centerOwner: owner, centerStep: step };
    // Bump opponent
    const opp = opponentAt(next, player, newPos);
    if (opp) sendHome(next, opp.opp, opp.idx);
    return next;
  }

  // On the ring
  if (isRing(m.pos)) {
    return walkRing(marbles, player, idx, m.pos, pips, useShortcut);
  }

  return null;
}

/** Walk forward from a ring square by `pips`, possibly entering home column
 *  or (if requested) the shortcut. Returns new marbles array or null. */
function walkRing(
  marbles: readonly (readonly Marble[])[],
  player: number,
  idx: number,
  fromRing: number,
  pips: number,
  useShortcut: boolean,
): Marble[][] | null {
  if (pips <= 0) return null;
  const homeEntry = HOME_ENTRY[player]!;
  const shortcutEntry = SHORTCUT_ENTRY[player]!;

  let cur = fromRing;
  let remaining = pips;

  // We progress one square at a time so we can correctly intercept the home
  // entry and the shortcut entry (exact landing).
  while (remaining > 0) {
    // If the marble is currently sitting on HOME_ENTRY and is about to step
    // off, it should enter the home column instead of advancing to start+0.
    if (cur === homeEntry) {
      // Step into home column: home slot 0 after 1 pip, etc.
      const targetSlot = remaining - 1;
      if (targetSlot === HOME_COL_LEN) {
        // exactly HOME
        const next = deepClone(marbles);
        next[player]![idx] = { pos: HOME, centerOwner: -1, centerStep: -1 };
        return next;
      }
      if (targetSlot < HOME_COL_LEN) {
        const newPos = HOME_BASE + targetSlot;
        if (selfOccupies(marbles, player, newPos, idx)) return null;
        const next = deepClone(marbles);
        next[player]![idx] = { pos: newPos, centerOwner: -1, centerStep: -1 };
        return next;
      }
      return null; // overshoot
    }
    // Advance one ring step
    cur = (cur + 1) % RING_SIZE;
    remaining -= 1;
  }

  // We finished `pips` steps. Final cur is the landing ring square.
  // EXACT-LANDING on our own SHORTCUT_ENTRY allows entry into the cross.
  if (cur === shortcutEntry && useShortcut) {
    const newPos = CENTER_BASE + 0;
    if (selfOccupies(marbles, player, newPos, idx)) return null;
    const next = deepClone(marbles);
    next[player]![idx] = { pos: newPos, centerOwner: player, centerStep: 0 };
    const opp = opponentAt(next, player, newPos);
    if (opp) sendHome(next, opp.opp, opp.idx);
    return next;
  }

  // Otherwise land on ring square `cur`.
  if (selfOccupies(marbles, player, cur, idx)) return null;
  const next = deepClone(marbles);
  next[player]![idx] = { pos: cur, centerOwner: -1, centerStep: -1 };
  const opp = opponentAt(next, player, cur);
  if (opp) sendHome(next, opp.opp, opp.idx);
  return next;
}

/** Return the list of legal moves for player with the given die value. */
export interface MoveOption {
  marbleIdx: number;
  useShortcut: boolean;
  resulting: Marble[][];
  captured: boolean;
}

export function legalMoves(
  marbles: readonly (readonly Marble[])[],
  player: number,
  die: number,
): MoveOption[] {
  const opts: MoveOption[] = [];
  for (let i = 0; i < NUM_MARBLES; i++) {
    // Try plain move (no shortcut)
    const a = tryMove(marbles, player, i, die, false);
    if (a) opts.push({ marbleIdx: i, useShortcut: false, resulting: a, captured: wasCapture(marbles, a) });
    // Try shortcut entry (only matters when we'd land on our entry exactly)
    const b = tryMove(marbles, player, i, die, true);
    if (b) {
      // Only include "shortcut entry" if it differs from plain move
      const m = marbles[player]![i]!;
      if (isRing(m.pos)) {
        const cur = m.pos;
        // landing square w/o shortcut and entering shortcut differ when we
        // actually land on our entry exactly.
        const landed = ((cur + die) % RING_SIZE);
        const homeEntry = HOME_ENTRY[player]!;
        // If walk crossed home entry, this is moot — but `tryMove` would have
        // routed home; nothing to add.
        if (landed === SHORTCUT_ENTRY[player]! && !crossesHomeEntry(player, cur, die)) {
          opts.push({ marbleIdx: i, useShortcut: true, resulting: b, captured: wasCapture(marbles, b) });
        }
        void homeEntry;
      }
    }
  }
  return opts;
}

function crossesHomeEntry(player: number, fromRing: number, pips: number): boolean {
  const he = HOME_ENTRY[player]!;
  let cur = fromRing;
  for (let i = 0; i < pips; i++) {
    if (cur === he) return true;
    cur = (cur + 1) % RING_SIZE;
  }
  return false;
}

function wasCapture(before: readonly (readonly Marble[])[], after: readonly (readonly Marble[])[]): boolean {
  // A capture occurred if some non-mover marble went from non-BASE to BASE.
  for (let p = 0; p < NUM_PLAYERS; p++) {
    for (let i = 0; i < NUM_MARBLES; i++) {
      const b = before[p]![i]!;
      const a = after[p]![i]!;
      if (b.pos !== BASE && a.pos === BASE) return true;
    }
  }
  return false;
}

// ---- winner / phase transitions ----

function allHome(marbles: readonly (readonly Marble[])[], player: number): boolean {
  return marbles[player]!.every(m => m.pos === HOME);
}

function checkWinner(state: AggravationFullState): AggravationFullState {
  for (let p = 0; p < NUM_PLAYERS; p++) {
    if (allHome(state.marbles, p)) {
      return { ...state, winner: p, phase: "done" };
    }
  }
  return state;
}

function appendLog(state: AggravationFullState, entry: string): AggravationFullState {
  return { ...state, log: [...state.log, entry].slice(-12), lastEvent: entry };
}

function nextSeat(turn: Seat): Seat {
  return ((turn + 1) % NUM_PLAYERS) as Seat;
}

// ---- CPU strategy ----

function pickBotMove(state: AggravationFullState, player: number, die: number): MoveOption | null {
  const opts = legalMoves(state.marbles, player, die);
  if (opts.length === 0) return null;
  // Score each option:
  //   * +1000 for capture (always prefer)
  //   * +totalProgressAfter (sum of own progressOf)
  //   * +50 bonus for moving the farthest-along marble (per user spec)
  // Tie-break: prefer not entering shortcut unless it captures or homes.

  // Find current farthest marble for the bonus.
  let farthestIdx = -1;
  let farthestProg = -1;
  for (let i = 0; i < NUM_MARBLES; i++) {
    const p = progressOf(player, state.marbles[player]![i]!);
    if (p > farthestProg && p > 0) { farthestProg = p; farthestIdx = i; }
  }

  let best: MoveOption | null = null;
  let bestScore = -Infinity;
  for (const o of opts) {
    let score = 0;
    if (o.captured) score += 1000;
    let totalProg = 0;
    for (let i = 0; i < NUM_MARBLES; i++) totalProg += progressOf(player, o.resulting[player]![i]!);
    score += totalProg;
    if (o.marbleIdx === farthestIdx) score += 50;
    // small penalty for entering shortcut without capture (avoid greedy dives
    // that get bumped). Net positive only when shortcut improves total progress
    // significantly — total progress already captures that, so keep penalty small.
    if (o.useShortcut && !o.captured) score -= 5;
    if (score > bestScore) { bestScore = score; best = o; }
  }
  return best;
}

function runBotTurn(state: AggravationFullState): AggravationFullState {
  let s = state;
  let iter = 0;
  while (s.turn !== 0 && s.phase !== "done" && iter++ < 50) {
    // Roll the die for this bot
    const r = rollDie(s.rngSeed);
    const die = r.v;
    s = { ...s, rngSeed: r.nextSeed, die };
    const pick = pickBotMove(s, s.turn, die);
    if (pick) {
      const captured = pick.captured;
      s = appendLog(s, `${LABELS[s.turn]} rolled ${die}${captured ? " (captured!)" : ""}`);
      s = { ...s, marbles: pick.resulting };
      s = checkWinner(s);
      if (s.phase === "done") return s;
    } else {
      s = appendLog(s, `${LABELS[s.turn]} rolled ${die} (no move)`);
    }
    // Six grants another turn (cap at 3 consecutive)
    const sixesNow = die === 6 ? s.consecutiveSixes + 1 : 0;
    if (die === 6 && sixesNow < 3) {
      s = { ...s, consecutiveSixes: sixesNow };
      continue;
    }
    s = { ...s, consecutiveSixes: 0, turn: nextSeat(s.turn), die: null };
  }
  // Bot rotation finished — now player 0's turn (or game ended)
  if (s.phase !== "done" && s.turn === 0) {
    s = { ...s, phase: "rolling", die: null };
  }
  return s;
}

// ---- public API ----

export function initialState(seed: number, settings: AggravationFullSettings): AggravationFullState {
  const marbles: Marble[][] = [];
  for (let p = 0; p < NUM_PLAYERS; p++) {
    const row: Marble[] = [];
    for (let i = 0; i < NUM_MARBLES; i++) row.push(freshMarble());
    marbles.push(row);
  }
  return {
    settings,
    rngSeed: seed >>> 0,
    marbles,
    turn: 0,
    phase: "rolling",
    die: null,
    consecutiveSixes: 0,
    winner: null,
    lastEvent: "",
    log: [],
  };
}

export function reducer(state: AggravationFullState, action: AggravationFullAction): AggravationFullState {
  if (state.phase === "done") return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.turn !== 0) return state;
    const r = rollDie(state.rngSeed);
    const die = r.v;
    let s: AggravationFullState = { ...state, rngSeed: r.nextSeed, die, phase: "moving" };
    const moves = legalMoves(s.marbles, 0, die);
    s = appendLog(s, `You rolled ${die}`);
    if (moves.length === 0) {
      // No legal move — automatic end of turn.
      const sixesNow = die === 6 ? s.consecutiveSixes + 1 : 0;
      if (die === 6 && sixesNow < 3) {
        // Still your turn (a 6 grants another roll even with no move)
        return { ...s, consecutiveSixes: sixesNow, phase: "rolling", die: null };
      }
      return runBotTurn({ ...s, consecutiveSixes: 0, turn: nextSeat(s.turn), die: null, phase: "rolling" });
    }
    return s;
  }

  if (action.type === "move") {
    if (state.phase !== "moving" || state.turn !== 0 || state.die === null) return state;
    const die = state.die;
    const result = tryMove(state.marbles, 0, action.marbleIdx, die, action.useShortcut === true);
    if (!result) return state;
    const captured = wasCapture(state.marbles, result);
    let s: AggravationFullState = { ...state, marbles: result };
    if (captured) s = appendLog(s, `You captured an opponent!`);
    s = checkWinner(s);
    if (s.phase === "done") return s;
    const sixesNow = die === 6 ? s.consecutiveSixes + 1 : 0;
    if (die === 6 && sixesNow < 3) {
      return { ...s, consecutiveSixes: sixesNow, phase: "rolling", die: null };
    }
    return runBotTurn({ ...s, consecutiveSixes: 0, turn: nextSeat(s.turn), die: null, phase: "rolling" });
  }

  if (action.type === "endTurn") {
    if (state.turn !== 0) return state;
    return runBotTurn({ ...state, consecutiveSixes: 0, turn: nextSeat(state.turn), die: null, phase: "rolling" });
  }

  return state;
}

export function isTerminal(state: AggravationFullState): { score: number } | null {
  if (state.winner === null) return null;
  if (state.winner === 0) {
    // Score: 100 base + bonus for each opponent marble not yet home (more
    // dominating wins score higher, max ~100 + 12*10 = 220).
    let opponentRemaining = 0;
    for (let p = 1; p < NUM_PLAYERS; p++) {
      for (let i = 0; i < NUM_MARBLES; i++) {
        if (state.marbles[p]![i]!.pos !== HOME) opponentRemaining += 1;
      }
    }
    return { score: 100 + opponentRemaining * 10 };
  }
  return { score: 0 };
}

// Re-export internals for tests
export const _internals = {
  rollDie, walkRing, opponentAt, crossesHomeEntry, wasCapture, pickBotMove,
  selfOccupies, sendHome, runBotTurn, checkWinner, nextSeat,
};
