// Ludo (Full) — classic Indian cross-and-circle race.
// 4 colors: 0=Red (you), 1=Blue (CPU), 2=Green (CPU), 3=Yellow (CPU).
// Board: 52 shared main squares + 4×6 home columns.
// Encoding for each pawn position:
//   YARD (-1)                — still in starting yard
//   0..51 (relative)         — on main track (relative to player's entry point)
//   52..57 (relative)        — in own home column (52 = first column square, 57 = home center)
// Conversion: absMain = (ENTRY[player] + rel) % 52   (only valid when 0 <= rel <= 51)
//
// Rules implemented:
// - Roll a single d6.
// - Need a 6 to release a pawn from the yard onto the starting square.
// - Rolling a 6 grants an extra turn (with a 3-in-a-row penalty: lose the third six's turn).
// - Landing on a single opponent token on a non-safe square sends it back to its yard.
// - Safe squares: each player's starting square + the 4 "star" squares at the column entries
//   (8, 21, 34, 47 in absolute coordinates). Pawns on a safe square cannot be captured.
// - Home column squares are private; opponents never enter them, so no capture inside.
// - Home center (rel 57) must be reached by an exact roll — overshoot forbids the move.
// - Win = all 4 own pawns at home center.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TRACK_SIZE = 52;
export const HOME_COL_LEN = 6;       // squares in the home column not including the final center
export const HOME_CENTER = TRACK_SIZE + HOME_COL_LEN - 1; // 57 — exact-landing target
export const YARD = -1;
export const NUM_PAWNS = 4;
export const NUM_PLAYERS = 4;

// Entry square (absolute index on the 52-square loop) for each player.
// Classic layout: Red=0, Blue=13, Green=26, Yellow=39 (13 apart).
export const ENTRY: readonly number[] = [0, 13, 26, 39];

// Safe squares (absolute). The four starts plus the four colored "star" squares
// located 8 steps before each player's home-column entry.
export const SAFE_ABS: ReadonlySet<number> = new Set<number>([
  0, 8, 13, 21, 26, 34, 39, 47,
]);

export interface LudoFullSettings {
  _dummy: boolean;
}

export interface LudoFullState {
  settings: LudoFullSettings;
  rngSeed: number;
  // pawns[player][pawnIdx] — see encoding above.
  pawns: readonly (readonly number[])[];
  die: number;            // last roll (0 = not yet rolled)
  turn: number;           // 0..3
  winner: number | null;  // first player to bring all 4 pawns home
  phase: "rolling" | "moving";
  sixStreak: number;      // consecutive 6s (3 in a row = forfeit turn)
}

export type LudoFullAction =
  | { type: "roll" }
  | { type: "move"; pawn: number };

export function initialState(seed: number, settings: LudoFullSettings): LudoFullState {
  const pawns: number[][] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) pawns.push([YARD, YARD, YARD, YARD]);
  return {
    settings,
    rngSeed: seed >>> 0,
    pawns,
    die: 0,
    turn: 0,
    winner: null,
    phase: "rolling",
    sixStreak: 0,
  };
}

/** Returns the absolute main-track index of a pawn at relative position `rel`,
 *  or `null` if it is in the yard or already in the home column / center. */
export function toAbsMain(player: number, rel: number): number | null {
  if (rel < 0 || rel >= TRACK_SIZE) return null;
  return (ENTRY[player]! + rel) % TRACK_SIZE;
}

export function isSafe(abs: number): boolean {
  return SAFE_ABS.has(abs);
}

export function canMove(
  pawns: readonly (readonly number[])[],
  player: number,
  pawnIdx: number,
  die: number,
): boolean {
  const pos = pawns[player]![pawnIdx]!;
  if (pos === HOME_CENTER) return false;
  if (pos === YARD) return die === 6;
  // Must land on or short of HOME_CENTER exactly.
  return pos + die <= HOME_CENTER;
}

export function hasAnyMove(
  pawns: readonly (readonly number[])[],
  player: number,
  die: number,
): boolean {
  for (let i = 0; i < NUM_PAWNS; i++) {
    if (canMove(pawns, player, i, die)) return true;
  }
  return false;
}

function cloneBoard(pawns: readonly (readonly number[])[]): number[][] {
  return pawns.map((pp) => [...pp]);
}

export function applyMove(
  pawns: readonly (readonly number[])[],
  player: number,
  pawnIdx: number,
  die: number,
): readonly (readonly number[])[] {
  const pos = pawns[player]![pawnIdx]!;
  const newPos = pos === YARD ? 0 : pos + die;
  const board = cloneBoard(pawns);
  board[player]![pawnIdx] = newPos;

  // Capture only happens on the shared main track and only on non-safe squares.
  const abs = toAbsMain(player, newPos);
  if (abs !== null && !isSafe(abs)) {
    for (let opp = 0; opp < NUM_PLAYERS; opp++) {
      if (opp === player) continue;
      for (let op = 0; op < NUM_PAWNS; op++) {
        const oppPos = board[opp]![op]!;
        const oppAbs = toAbsMain(opp, oppPos);
        if (oppAbs === abs) {
          board[opp]![op] = YARD;
        }
      }
    }
  }
  return board;
}

export function checkWinner(pawns: readonly (readonly number[])[]): number | null {
  for (let p = 0; p < NUM_PLAYERS; p++) {
    if (pawns[p]!.every((pos) => pos === HOME_CENTER)) return p;
  }
  return null;
}

// ---- CPU strategy ---------------------------------------------------------

/** Very simple but effective heuristic:
 *   1. If die=6, prefer releasing a pawn from the yard (only if any in yard).
 *   2. Otherwise prefer the move that captures an opponent pawn.
 *   3. Otherwise advance the pawn farthest along the route.
 */
function botPick(
  pawns: readonly (readonly number[])[],
  player: number,
  die: number,
): number | null {
  const legal: number[] = [];
  for (let i = 0; i < NUM_PAWNS; i++) {
    if (canMove(pawns, player, i, die)) legal.push(i);
  }
  if (legal.length === 0) return null;

  if (die === 6) {
    const yarder = legal.find((i) => pawns[player]![i] === YARD);
    if (yarder !== undefined) return yarder;
  }

  // Look for a capture move.
  for (const idx of legal) {
    const pos = pawns[player]![idx]!;
    if (pos === YARD) continue;
    const newPos = pos + die;
    const abs = toAbsMain(player, newPos);
    if (abs === null || isSafe(abs)) continue;
    for (let opp = 0; opp < NUM_PLAYERS; opp++) {
      if (opp === player) continue;
      for (let op = 0; op < NUM_PAWNS; op++) {
        const oppAbs = toAbsMain(opp, pawns[opp]![op]!);
        if (oppAbs === abs) return idx;
      }
    }
  }

  // Advance the farthest-along legal pawn (highest relative position).
  let best = legal[0]!;
  let bestPos = -2;
  for (const idx of legal) {
    const pos = pawns[player]![idx]!;
    const sortKey = pos === YARD ? -1 : pos;
    if (sortKey > bestPos) { bestPos = sortKey; best = idx; }
  }
  return best;
}

function rollDie(seed: number): { d: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const d = Math.floor(rng() * 6) + 1;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { d, nextSeed };
}

function advanceBots(state: LudoFullState): LudoFullState {
  let s = state;
  // Bounded loop guards against pathological infinite turns.
  for (let iter = 0; iter < 400 && s.winner === null && s.turn !== 0; iter++) {
    if (s.phase === "rolling") {
      const { d, nextSeed } = rollDie(s.rngSeed);
      const streak = d === 6 ? s.sixStreak + 1 : 0;
      if (streak >= 3) {
        // Three sixes in a row — forfeit turn, reset streak.
        const nextTurn = (s.turn + 1) % NUM_PLAYERS;
        s = { ...s, rngSeed: nextSeed, turn: nextTurn, sixStreak: 0, die: 0, phase: "rolling" };
        continue;
      }
      if (!hasAnyMove(s.pawns, s.turn, d)) {
        const nextTurn = d === 6 ? s.turn : (s.turn + 1) % NUM_PLAYERS;
        s = { ...s, rngSeed: nextSeed, die: d, sixStreak: streak, turn: nextTurn, phase: "rolling" };
        continue;
      }
      s = { ...s, rngSeed: nextSeed, die: d, sixStreak: streak, phase: "moving" };
    } else {
      const pick = botPick(s.pawns, s.turn, s.die);
      if (pick === null) {
        const nextTurn = (s.turn + 1) % NUM_PLAYERS;
        s = { ...s, turn: nextTurn, phase: "rolling", die: 0, sixStreak: 0 };
        continue;
      }
      const newPawns = applyMove(s.pawns, s.turn, pick, s.die);
      const w = checkWinner(newPawns);
      if (w !== null) { s = { ...s, pawns: newPawns, winner: w }; break; }
      const extra = s.die === 6;
      const nextTurn = extra ? s.turn : (s.turn + 1) % NUM_PLAYERS;
      s = {
        ...s,
        pawns: newPawns,
        turn: nextTurn,
        phase: "rolling",
        die: 0,
        sixStreak: extra ? s.sixStreak : 0,
      };
    }
  }
  return s;
}

export function reducer(state: LudoFullState, action: LudoFullAction): LudoFullState {
  if (state.winner !== null) return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.turn !== 0) return state;
    const { d, nextSeed } = rollDie(state.rngSeed);
    const streak = d === 6 ? state.sixStreak + 1 : 0;

    if (streak >= 3) {
      // Three sixes — turn forfeit.
      const nextTurn = 1 % NUM_PLAYERS;
      const next: LudoFullState = {
        ...state, rngSeed: nextSeed, turn: nextTurn,
        sixStreak: 0, die: 0, phase: "rolling",
      };
      return advanceBots(next);
    }

    if (!hasAnyMove(state.pawns, 0, d)) {
      const nextTurn = d === 6 ? 0 : 1 % NUM_PLAYERS;
      let next: LudoFullState = {
        ...state, rngSeed: nextSeed, die: d, sixStreak: streak,
      };
      if (nextTurn !== 0) {
        next = { ...next, turn: nextTurn, phase: "rolling", die: 0 };
        return advanceBots(next);
      }
      return next;
    }

    return { ...state, rngSeed: nextSeed, die: d, sixStreak: streak, phase: "moving" };
  }

  if (action.type === "move") {
    if (state.phase !== "moving" || state.turn !== 0) return state;
    const { pawn } = action;
    if (pawn < 0 || pawn >= NUM_PAWNS) return state;
    if (!canMove(state.pawns, 0, pawn, state.die)) return state;
    const newPawns = applyMove(state.pawns, 0, pawn, state.die);
    const w = checkWinner(newPawns);
    if (w !== null) return { ...state, pawns: newPawns, winner: w };
    const extra = state.die === 6;
    const nextTurn = extra ? 0 : 1 % NUM_PLAYERS;
    const next: LudoFullState = {
      ...state,
      pawns: newPawns,
      turn: nextTurn,
      phase: "rolling",
      die: 0,
      sixStreak: extra ? state.sixStreak : 0,
    };
    if (nextTurn !== 0) return advanceBots(next);
    return next;
  }

  return state;
}

export function isTerminal(state: LudoFullState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
