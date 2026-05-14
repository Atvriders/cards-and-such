import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Trouble (Full 4-Pawn) — Pop-O-Matic race for 4 players (you + 3 CPUs).
// Each player has 4 pegs starting in their home base (yard). Roll a 6 to
// enter onto the shared track from your color's start square. Continue
// clockwise around a 28-square shared track, then turn onto your color's
// home stretch (4 lane squares) and finally to the finish (home base of
// peg destinations). Win by getting all 4 pegs to the finish.
//
// Rules implemented:
//   * Pop-o-matic die (1-6), need 6 to leave start
//   * Roll a 6 -> bonus turn (no extra bonus after capture; standard rule)
//   * Landing on opponent's peg on the shared track sends them back to yard
//   * Cannot land on own peg (same color block) on shared track or stretch
//   * Start squares are safe — you cannot be captured on your own start
//   * Home stretch is private (each color has its own lane), no captures
//   * Exact roll required to land on finish; over-roll forfeits the move
//   * If no legal move exists with the rolled die, turn passes
//   * First to land all 4 pegs in finish wins

export const TRACK_SIZE = 28;
export const STRETCH_LEN = 4;
export const NUM_PAWNS = 4;
export const NUM_PLAYERS = 4;
export const YARD = -1;
// Positions on the shared track use 0..TRACK_SIZE-1.
// Stretch positions use TRACK_SIZE..TRACK_SIZE+STRETCH_LEN-1 (28..31).
// Finish (home) = TRACK_SIZE + STRETCH_LEN = 32.
export const STRETCH_START = TRACK_SIZE; // 28
export const FINISH = TRACK_SIZE + STRETCH_LEN; // 32

// Each player's entry square on the shared track (clockwise).
export const ENTRY: Readonly<Record<number, number>> = { 0: 0, 1: 7, 2: 14, 3: 21 };
// Safe absolute squares — each player's start is safe (no captures here).
export const SAFE_ABS: ReadonlySet<number> = new Set([0, 7, 14, 21]);

export interface TroubleFullSettings {
  _dummy: boolean;
}

export interface TroubleFullState {
  settings: TroubleFullSettings;
  rngSeed: number;
  // Per-player array of 4 peg positions.
  //  YARD (-1)        = in home base / yard
  //  0..27            = on shared track, RELATIVE to player's own entry square
  //                     (so the same relative number means a different absolute
  //                      square per player). Use posToAbs() to get the absolute.
  //  28..31           = in the home stretch (private), 28 is the entry to the stretch
  //  32 (FINISH)      = peg is home, done.
  pawns: readonly (readonly number[])[];
  die: number;
  turn: number;
  numPlayers: number;
  winner: number | null;
  // Optional finish ranking — first to finish is rank 0, then 1, 2, 3.
  finishOrder: readonly number[];
  phase: "rolling" | "moving";
}

export type TroubleFullAction =
  | { type: "roll" }
  | { type: "move"; pawn: number }
  | { type: "pass" };

// Convert a player's relative track position to an absolute track square.
export function posToAbs(player: number, rel: number): number {
  return (ENTRY[player]! + rel) % TRACK_SIZE;
}

export function isOnTrack(pos: number): boolean {
  return pos >= 0 && pos < STRETCH_START;
}

export function isInStretch(pos: number): boolean {
  return pos >= STRETCH_START && pos < FINISH;
}

export function isFinished(pos: number): boolean {
  return pos === FINISH;
}

// Internal: would this peg occupying `pos` (with player `player`) be blocked
// by a same-color peg already at the target? Same-color blocking applies
// everywhere except the yard and finish (multiple pegs can share finish).
function hasOwnPawnAt(
  pawns: readonly (readonly number[])[],
  player: number,
  target: number,
): boolean {
  if (target === YARD || target === FINISH) return false;
  return pawns[player]!.some((p, idx) => p === target && idx !== -1);
}

export function canMove(
  pawns: readonly (readonly number[])[],
  player: number,
  pawnIdx: number,
  die: number,
): boolean {
  const pos = pawns[player]![pawnIdx]!;
  if (pos === FINISH) return false;
  // From yard: need a 6 and the entry square (rel 0) must not be blocked by own peg.
  if (pos === YARD) {
    if (die !== 6) return false;
    return !hasOwnPawnAt(pawns, player, 0);
  }
  const target = pos + die;
  if (target > FINISH) return false; // exact roll required to land on finish
  if (hasOwnPawnAt(pawns, player, target)) return false;
  return true;
}

export function hasAnyMove(
  pawns: readonly (readonly number[])[],
  player: number,
  die: number,
): boolean {
  for (let pi = 0; pi < NUM_PAWNS; pi++) {
    if (canMove(pawns, player, pi, die)) return true;
  }
  return false;
}

function applyMove(
  pawns: readonly (readonly number[])[],
  player: number,
  pawnIdx: number,
  die: number,
  np: number,
): readonly (readonly number[])[] {
  const pos = pawns[player]![pawnIdx]!;
  const target = pos === YARD ? 0 : pos + die;
  const next = pawns.map((row) => [...row]);
  next[player]![pawnIdx] = target;
  // Capture only on the shared track and only when target is not a safe square.
  if (isOnTrack(target)) {
    const targetAbs = posToAbs(player, target);
    if (!SAFE_ABS.has(targetAbs)) {
      for (let opp = 0; opp < np; opp++) {
        if (opp === player) continue;
        for (let op = 0; op < NUM_PAWNS; op++) {
          const oppPos = next[opp]![op]!;
          if (!isOnTrack(oppPos)) continue;
          if (posToAbs(opp, oppPos) === targetAbs) {
            next[opp]![op] = YARD;
          }
        }
      }
    }
  }
  return next;
}

function recomputeFinishOrder(
  prev: readonly number[],
  pawns: readonly (readonly number[])[],
  np: number,
): readonly number[] {
  const updated = [...prev];
  for (let p = 0; p < np; p++) {
    if (updated.includes(p)) continue;
    if (pawns[p]!.every((pos) => pos === FINISH)) updated.push(p);
  }
  return updated;
}

export function checkWinner(
  pawns: readonly (readonly number[])[],
  np: number,
): number | null {
  for (let p = 0; p < np; p++) {
    if (pawns[p]!.every((pos) => pos === FINISH)) return p;
  }
  return np > 0 ? null : null;
}

export function initialState(seed: number, settings: TroubleFullSettings): TroubleFullState {
  const pawns: number[][] = [];
  for (let i = 0; i < NUM_PLAYERS; i++) pawns.push([YARD, YARD, YARD, YARD]);
  return {
    settings,
    rngSeed: (seed >>> 0) || 1,
    pawns,
    die: 0,
    turn: 0,
    numPlayers: NUM_PLAYERS,
    winner: null,
    finishOrder: [],
    phase: "rolling",
  };
}

// Simple-but-reasonable bot:
//   1. If die is 6 and a yard peg can enter, bring it out (great priority).
//   2. Otherwise prefer a move that captures an opponent on the track.
//   3. Otherwise prefer the most-advanced legal peg (push the leader home).
//   4. Otherwise fallback to any legal peg.
function botPick(
  pawns: readonly (readonly number[])[],
  player: number,
  die: number,
): number | null {
  const legal: number[] = [];
  for (let pi = 0; pi < NUM_PAWNS; pi++) {
    if (canMove(pawns, player, pi, die)) legal.push(pi);
  }
  if (legal.length === 0) return null;
  if (die === 6) {
    const yardPi = legal.find((pi) => pawns[player]![pi] === YARD);
    if (yardPi !== undefined) return yardPi;
  }
  // Try to find a capture.
  for (const pi of legal) {
    const pos = pawns[player]![pi]!;
    const target = pos === YARD ? 0 : pos + die;
    if (!isOnTrack(target)) continue;
    const absT = posToAbs(player, target);
    if (SAFE_ABS.has(absT)) continue;
    for (let opp = 0; opp < pawns.length; opp++) {
      if (opp === player) continue;
      for (let op = 0; op < NUM_PAWNS; op++) {
        const oppPos = pawns[opp]![op]!;
        if (!isOnTrack(oppPos)) continue;
        if (posToAbs(opp, oppPos) === absT) return pi;
      }
    }
  }
  // Prefer the most-advanced legal peg.
  let best = legal[0]!;
  let bestPos = pawns[player]![best]!;
  for (const pi of legal) {
    const pos = pawns[player]![pi]!;
    // Treat YARD as -1, so the highest pos wins (closest to finish).
    if (pos > bestPos) { best = pi; bestPos = pos; }
  }
  return best;
}

function advanceBots(state: TroubleFullState): TroubleFullState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 400) {
    if (s.phase === "rolling") {
      const rng = mulberry32(s.rngSeed);
      const d = Math.floor(rng() * 6) + 1;
      const nextSeed = Math.floor(rng() * 2 ** 31);
      if (!hasAnyMove(s.pawns, s.turn, d)) {
        const nt = d === 6 ? s.turn : (s.turn + 1) % s.numPlayers;
        s = { ...s, rngSeed: nextSeed, die: d, turn: nt, phase: "rolling" };
        continue;
      }
      s = { ...s, rngSeed: nextSeed, die: d, phase: "moving" };
    } else {
      const pi = botPick(s.pawns, s.turn, s.die);
      if (pi === null) {
        const nt = (s.turn + 1) % s.numPlayers;
        s = { ...s, turn: nt, phase: "rolling", die: 0 };
        continue;
      }
      const newPawns = applyMove(s.pawns, s.turn, pi, s.die, s.numPlayers);
      const order = recomputeFinishOrder(s.finishOrder, newPawns, s.numPlayers);
      const w = checkWinner(newPawns, s.numPlayers);
      if (w !== null) {
        s = { ...s, pawns: newPawns, winner: w, finishOrder: order };
        break;
      }
      const nt = s.die === 6 ? s.turn : (s.turn + 1) % s.numPlayers;
      s = { ...s, pawns: newPawns, turn: nt, phase: "rolling", die: 0, finishOrder: order };
    }
  }
  return s;
}

export function reducer(state: TroubleFullState, action: TroubleFullAction): TroubleFullState {
  if (state.winner !== null) return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.turn !== 0) return state;
    const rng = mulberry32(state.rngSeed);
    const d = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    if (!hasAnyMove(state.pawns, 0, d)) {
      // No legal move — turn auto-passes unless we rolled a 6 (still bonus turn).
      const nt = d === 6 ? 0 : 1 % state.numPlayers;
      const base: TroubleFullState = { ...state, rngSeed: nextSeed, die: d };
      if (nt !== 0) return advanceBots({ ...base, turn: nt, phase: "rolling" });
      return { ...base, phase: "rolling" };
    }
    return { ...state, rngSeed: nextSeed, die: d, phase: "moving" };
  }

  if (action.type === "move") {
    if (state.phase !== "moving" || state.turn !== 0) return state;
    const { pawn } = action;
    if (typeof pawn !== "number" || pawn < 0 || pawn >= NUM_PAWNS) return state;
    if (!canMove(state.pawns, 0, pawn, state.die)) return state;
    const newPawns = applyMove(state.pawns, 0, pawn, state.die, state.numPlayers);
    const order = recomputeFinishOrder(state.finishOrder, newPawns, state.numPlayers);
    const w = checkWinner(newPawns, state.numPlayers);
    if (w !== null) {
      return { ...state, pawns: newPawns, winner: w, finishOrder: order };
    }
    const nt = state.die === 6 ? 0 : (0 + 1) % state.numPlayers;
    const next: TroubleFullState = {
      ...state,
      pawns: newPawns,
      turn: nt,
      phase: "rolling",
      die: 0,
      finishOrder: order,
    };
    if (nt !== 0) return advanceBots(next);
    return next;
  }

  if (action.type === "pass") {
    // Safety valve: if for some reason the player is stuck in moving with no
    // legal move, allow them to pass. (Should not normally happen since roll
    // auto-passes turn when no move exists.)
    if (state.phase !== "moving" || state.turn !== 0) return state;
    if (hasAnyMove(state.pawns, 0, state.die)) return state;
    const nt = state.die === 6 ? 0 : (0 + 1) % state.numPlayers;
    const next: TroubleFullState = { ...state, turn: nt, phase: "rolling", die: 0 };
    if (nt !== 0) return advanceBots(next);
    return next;
  }

  return state;
}

// Score = 10 - rank for the human (so winner gets 10, last gets 7).
// If the human never finished, score is based on pegs home minus pegs in yard
// (small positive for partial progress, never negative). Loss = 0 if the human
// has 0 pegs home.
export function isTerminal(state: TroubleFullState): { score: number } | null {
  if (state.winner === null) return null;
  const humanRank = state.finishOrder.indexOf(0);
  if (humanRank !== -1) {
    return { score: 10 - humanRank };
  }
  const human = state.pawns[0]!;
  const pegsHome = human.filter((p) => p === FINISH).length;
  const pegsInYard = human.filter((p) => p === YARD).length;
  // Partial-credit consolation, capped at 3.
  const partial = Math.max(0, pegsHome - Math.max(0, pegsInYard - 2));
  return { score: Math.min(3, partial) };
}
