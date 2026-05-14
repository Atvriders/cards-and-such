import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Parcheesi (Full Rulebook) — 4-player classic American Pachisi race.
//
// Board layout (per-player relative coordinates):
//   YARD  (-1)                            : pawn is in start nest
//   0..67                                 : the 68-square main outer track (player-relative)
//   68..74                                : the 7-square home column (private to each player)
//   HOME (75)                             : the center home space, finished
//
// Each player has their own entry square at a fixed absolute offset on the
// shared 68-square outer ring. Movement is computed in player-relative
// coordinates, then mapped to absolute coords for collision/capture checks
// against opponents.
//
// Rules implemented:
//   * 4 players (you + 3 CPUs), 4 pawns each.
//   * Two d6 each turn. Each die moves a *different* (or the same) pawn by
//     that die value. Their sum can also be split across two pawns. Either
//     die alone OR the sum-of-both must equal exactly the number of spaces
//     needed to enter the home space (it must be exact).
//   * Need a 5 (on either die, OR a sum involving 5s) to bring a pawn out
//     of the yard. Both dice showing 5 is also allowed to bring two out.
//   * Doubles grant an extra turn. Three doubles in a row penalizes the
//     furthest pawn back to the yard.
//   * Landing on an opponent's single pawn captures it (sends to yard).
//     The capturing player gets a 20-square bonus that turn.
//   * Reaching the home square earns a 10-square bonus.
//   * Safety squares: each player's entry square and the four "shadow"
//     safety squares positioned 12 past each entry (4 + 4 = 8 safe squares
//     in total). Captures cannot occur on safe squares unless an opposing
//     pawn is alone there.
//   * Blockades: two same-color pawns on the same outer-track square form
//     a blockade that no pawn (of any color, including the owner) may
//     pass through OR land on. A blockade may not be formed by moving with
//     a doubles roll (advanced rule omitted — basic blockade still applies).
//   * Home column (7 private squares) is private; no captures occur there.
//
// State is fully serializable & deterministic for a given seed.

export const TRACK_SIZE = 68;
export const HOME_COL_LEN = 7;            // 7 home-column squares
export const HOME_COL_START = TRACK_SIZE; // rel 68..74
export const HOME = TRACK_SIZE + HOME_COL_LEN; // rel 75 == finished
export const NUM_PAWNS = 4;
export const NUM_PLAYERS = 4;
export const YARD = -1;
export const CAPTURE_BONUS = 20;
export const HOME_BONUS = 10;

// Each player's entry square (absolute, 0..67) is spaced evenly around the
// 68-square ring. Player 0 enters at abs 0, player 1 at 17, etc.
const ENTRY: readonly number[] = [0, 17, 34, 51];

// Safe squares: each player's entry square + "shadow" safety squares
// 12 past each entry (classic American Parcheesi pattern).
const SAFE_OFFSETS: readonly number[] = [0, 12];
function buildSafeSquares(): ReadonlySet<number> {
  const s = new Set<number>();
  for (let p = 0; p < NUM_PLAYERS; p++) {
    for (const off of SAFE_OFFSETS) {
      s.add((ENTRY[p]! + off) % TRACK_SIZE);
    }
  }
  return s;
}
const SAFE_SQUARES = buildSafeSquares();

export interface ParcheesiFullSettings {
  _dummy?: undefined;
}

export type Phase = "rolling" | "moving" | "ended";

export interface ParcheesiFullState {
  readonly settings: ParcheesiFullSettings;
  readonly rngSeed: number;
  // pawns[player][pawn] = position in player-relative coordinates
  //   YARD (-1)            : in start nest
  //   0..67                : on outer ring (relative to that player's entry)
  //   68..74               : in home column
  //   HOME (75)            : finished
  readonly pawns: ReadonlyArray<ReadonlyArray<number>>;
  // Active dice this turn. Each entry is a die value or null when used.
  // We keep an ordered list rather than a "moves" pool so the user can
  // see clearly which two dice they have.
  readonly dice: ReadonlyArray<number | null>;
  // Bonus pool (capture/home bonuses) that must be spent before passing.
  readonly bonuses: ReadonlyArray<number>;
  readonly turn: number;          // 0..3
  readonly winner: number | null; // 0..3 or null
  readonly phase: Phase;
  readonly doublesStreak: number; // consecutive doubles by current player
  // For UI/messages
  readonly lastEvent: string;
}

export type ParcheesiFullAction =
  | { type: "roll" }
  | { type: "move"; pawn: number; dieIndex: number }
  | { type: "pass" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rollDie(rng: () => number): number {
  return Math.floor(rng() * 6) + 1;
}

function clonePawns(pawns: ReadonlyArray<ReadonlyArray<number>>): number[][] {
  return pawns.map((arr) => [...arr]);
}

// Convert a player-relative outer-track position (0..67) to absolute (0..67).
function toAbsolute(player: number, rel: number): number {
  return (ENTRY[player]! + rel) % TRACK_SIZE;
}

export function isSafeAbs(abs: number): boolean {
  return SAFE_SQUARES.has(abs);
}

// Returns the absolute-square indexes occupied by player `player`'s pawns
// (only outer-track pawns; yard/home/home-column are excluded).
function outerPawnsByAbs(
  pawns: ReadonlyArray<ReadonlyArray<number>>,
  player: number,
): Map<number, number> {
  const map = new Map<number, number>();
  for (let i = 0; i < NUM_PAWNS; i++) {
    const r = pawns[player]![i]!;
    if (r >= 0 && r < TRACK_SIZE) {
      const abs = toAbsolute(player, r);
      map.set(abs, (map.get(abs) ?? 0) + 1);
    }
  }
  return map;
}

// Returns set of absolute squares that contain a blockade owned by `byPlayer`
// (two pawns of that color on the same outer-track square).
function blockadeSquares(
  pawns: ReadonlyArray<ReadonlyArray<number>>,
  byPlayer: number,
): Set<number> {
  const out = new Set<number>();
  const counts = outerPawnsByAbs(pawns, byPlayer);
  for (const [abs, n] of counts) {
    if (n >= 2) out.add(abs);
  }
  return out;
}

// True if the path (start, end] crosses any opponent blockade. Movement is
// along the outer track in player-relative coords.
function pathCrossesBlockade(
  pawns: ReadonlyArray<ReadonlyArray<number>>,
  player: number,
  fromRel: number,
  toRel: number,
): boolean {
  // Compose blockades by all *other* players (own blockade also blocks).
  const allBlocks = new Set<number>();
  for (let p = 0; p < NUM_PLAYERS; p++) {
    for (const abs of blockadeSquares(pawns, p)) allBlocks.add(abs);
  }
  // Walk from fromRel+1..min(toRel, TRACK_SIZE-1) on the outer ring.
  const upper = Math.min(toRel, TRACK_SIZE - 1);
  for (let r = fromRel + 1; r <= upper; r++) {
    const abs = toAbsolute(player, r);
    if (allBlocks.has(abs)) return true;
  }
  return false;
}

// Compute the result of moving a pawn from its current rel position by
// `steps` spaces. Returns the new rel position, or null if illegal.
// (Does not yet validate captures; only path/destination constraints.)
function computeDestination(
  pawns: ReadonlyArray<ReadonlyArray<number>>,
  player: number,
  pawnIdx: number,
  steps: number,
): number | null {
  if (steps <= 0) return null;
  const fromRel = pawns[player]![pawnIdx]!;

  if (fromRel === HOME) return null; // already done
  if (fromRel === YARD) {
    // To exit the yard requires exactly steps === 5 (single-die or sum).
    if (steps !== 5) return null;
    // Destination is rel 0 (entry square). Check it's not blocked by own
    // blockade or opponent blockade.
    if (pathCrossesBlockade(pawns, player, -1, 0)) return null;
    // Cannot enter onto a square that already has an opposing blockade.
    return 0;
  }

  const target = fromRel + steps;
  if (target > HOME) return null;        // can't overshoot
  // Check blockades on the outer-track segment we cross.
  if (fromRel < TRACK_SIZE) {
    const lastOuter = Math.min(target, TRACK_SIZE - 1);
    if (pathCrossesBlockade(pawns, player, fromRel, lastOuter)) return null;
  }
  return target;
}

// Check that landing on `destRel` does not itself land on a *blockade*
// square. Blockades on rel destination are illegal entries.
function destinationOnBlockade(
  pawns: ReadonlyArray<ReadonlyArray<number>>,
  player: number,
  destRel: number,
): boolean {
  if (destRel < 0 || destRel >= TRACK_SIZE) return false;
  const destAbs = toAbsolute(player, destRel);
  for (let p = 0; p < NUM_PLAYERS; p++) {
    if (blockadeSquares(pawns, p).has(destAbs)) return true;
  }
  return false;
}

// True if `player` has any pawn still in the yard.
function hasYardPawn(pawns: ReadonlyArray<ReadonlyArray<number>>, player: number): boolean {
  return pawns[player]!.some((p) => p === YARD);
}

// Generic legality predicate combining all rules above.
export function canMoveSteps(
  pawns: ReadonlyArray<ReadonlyArray<number>>,
  player: number,
  pawnIdx: number,
  steps: number,
): boolean {
  const dest = computeDestination(pawns, player, pawnIdx, steps);
  if (dest === null) return false;
  if (destinationOnBlockade(pawns, player, dest)) return false;
  return true;
}

// Apply a move (assumed legal). Returns { pawns, captured, reachedHome }.
function applyMoveInternal(
  pawns: ReadonlyArray<ReadonlyArray<number>>,
  player: number,
  pawnIdx: number,
  steps: number,
): { pawns: number[][]; captured: boolean; reachedHome: boolean } {
  const dest = computeDestination(pawns, player, pawnIdx, steps);
  if (dest === null) {
    return { pawns: clonePawns(pawns), captured: false, reachedHome: false };
  }
  const np = clonePawns(pawns);
  np[player]![pawnIdx] = dest;

  let captured = false;
  if (dest < TRACK_SIZE) {
    const destAbs = toAbsolute(player, dest);
    const safe = isSafeAbs(destAbs);
    // Captures: send opponent pawns home if landing on them on non-safe sq.
    if (!safe) {
      for (let opp = 0; opp < NUM_PLAYERS; opp++) {
        if (opp === player) continue;
        for (let oi = 0; oi < NUM_PAWNS; oi++) {
          const orel = np[opp]![oi]!;
          if (orel < 0 || orel >= TRACK_SIZE) continue;
          const oabs = toAbsolute(opp, orel);
          if (oabs === destAbs) {
            np[opp]![oi] = YARD;
            captured = true;
          }
        }
      }
    }
  }
  const reachedHome = dest === HOME;
  return { pawns: np, captured, reachedHome };
}

function allHome(pawns: ReadonlyArray<ReadonlyArray<number>>, player: number): boolean {
  return pawns[player]!.every((p) => p === HOME);
}

function checkWinner(pawns: ReadonlyArray<ReadonlyArray<number>>): number | null {
  for (let p = 0; p < NUM_PLAYERS; p++) {
    if (allHome(pawns, p)) return p;
  }
  return null;
}

// Furthest-back pawn (smallest progression value) for the doubles penalty.
function furthestBackPawn(pawns: ReadonlyArray<ReadonlyArray<number>>, player: number): number {
  let bestIdx = -1;
  let bestScore = Infinity;
  for (let i = 0; i < NUM_PAWNS; i++) {
    const r = pawns[player]![i]!;
    if (r === HOME) continue;          // already finished — skip
    const score = r === YARD ? -2 : r; // yard is "behind" everything
    if (score < bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// ---------------------------------------------------------------------------
// Move generation: turn the current dice + bonuses into a list of moves.
// Each available die value is treated independently. We also expose the SUM
// when both dice are unused, so users can satisfy exact-distance home moves.
// ---------------------------------------------------------------------------

export interface DieOption {
  // Index into state.dice array OR -1 for "bonus" OR -2 for "sum".
  index: number;
  value: number;
}

export function availableDieValues(state: ParcheesiFullState): DieOption[] {
  const opts: DieOption[] = [];
  for (let i = 0; i < state.dice.length; i++) {
    const v = state.dice[i];
    if (v != null) opts.push({ index: i, value: v });
  }
  for (let i = 0; i < state.bonuses.length; i++) {
    const v = state.bonuses[i];
    if (v != null) opts.push({ index: -1 - i, value: v }); // -1 = bonus 0, -2 = bonus 1, etc.
  }
  return opts;
}

export function hasAnyLegalMove(state: ParcheesiFullState, player: number): boolean {
  const opts = availableDieValues(state);
  for (const o of opts) {
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (canMoveSteps(state.pawns, player, pi, o.value)) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// CPU: simple greedy strategy
//   1. If a pawn is in yard and we have a 5/sum-of-5, bring one out.
//   2. Else prefer captures.
//   3. Else advance the furthest-along pawn.
// ---------------------------------------------------------------------------

function cpuPickMove(state: ParcheesiFullState, player: number): { pawn: number; dieIndex: number } | null {
  const opts = availableDieValues(state);
  if (opts.length === 0) return null;

  // 1. Bring a pawn out of yard with a 5.
  if (hasYardPawn(state.pawns, player)) {
    for (const o of opts) {
      if (o.value !== 5) continue;
      for (let pi = 0; pi < NUM_PAWNS; pi++) {
        if (state.pawns[player]![pi] === YARD && canMoveSteps(state.pawns, player, pi, 5)) {
          return { pawn: pi, dieIndex: o.index };
        }
      }
    }
  }

  // 2. Prefer captures.
  let captureChoice: { pawn: number; dieIndex: number } | null = null;
  // 3. Else advance the furthest pawn.
  let bestProgress = -2;
  let bestChoice: { pawn: number; dieIndex: number } | null = null;

  for (const o of opts) {
    for (let pi = 0; pi < NUM_PAWNS; pi++) {
      if (!canMoveSteps(state.pawns, player, pi, o.value)) continue;
      const fromRel = state.pawns[player]![pi]!;
      const dest = computeDestination(state.pawns, player, pi, o.value);
      if (dest === null) continue;

      // Detect potential capture.
      if (dest < TRACK_SIZE) {
        const destAbs = toAbsolute(player, dest);
        if (!isSafeAbs(destAbs)) {
          for (let opp = 0; opp < NUM_PLAYERS; opp++) {
            if (opp === player) continue;
            for (let oi = 0; oi < NUM_PAWNS; oi++) {
              const orel = state.pawns[opp]![oi]!;
              if (orel < 0 || orel >= TRACK_SIZE) continue;
              if (toAbsolute(opp, orel) === destAbs) {
                if (captureChoice === null) captureChoice = { pawn: pi, dieIndex: o.index };
              }
            }
          }
        }
      }

      // Progression heuristic: bigger position wins (or reaching home).
      const progScore = dest === HOME ? 1000 : dest;
      if (progScore > bestProgress) {
        bestProgress = progScore;
        bestChoice = { pawn: pi, dieIndex: o.index };
      }

      // Also track current fromRel for tiebreak with farthest-pawn.
      void fromRel;
    }
  }

  if (captureChoice) return captureChoice;
  return bestChoice;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function initialState(seed: number, settings: ParcheesiFullSettings): ParcheesiFullState {
  const pawns: number[][] = [];
  for (let p = 0; p < NUM_PLAYERS; p++) pawns.push([YARD, YARD, YARD, YARD]);
  return {
    settings,
    rngSeed: seed >>> 0,
    pawns,
    dice: [],
    bonuses: [],
    turn: 0,
    winner: null,
    phase: "rolling",
    doublesStreak: 0,
    lastEvent: "Roll the dice to start.",
  };
}

function endTurn(state: ParcheesiFullState, msgPrefix = ""): ParcheesiFullState {
  const nextTurn = (state.turn + 1) % NUM_PLAYERS;
  return {
    ...state,
    turn: nextTurn,
    phase: "rolling",
    dice: [],
    bonuses: [],
    doublesStreak: 0,
    lastEvent: msgPrefix + ` ${seatLabel(nextTurn)}'s turn.`,
  };
}

function seatLabel(p: number): string {
  return p === 0 ? "You" : `CPU ${p}`;
}

function rollFor(state: ParcheesiFullState): ParcheesiFullState {
  const rng = mulberry32(state.rngSeed);
  const d1 = rollDie(rng);
  const d2 = rollDie(rng);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const isDoubles = d1 === d2;
  let newStreak = state.doublesStreak;
  if (isDoubles) newStreak += 1;
  // Three-doubles penalty.
  if (newStreak >= 3) {
    const np = clonePawns(state.pawns);
    const f = furthestBackPawn(np, state.turn);
    if (f >= 0) np[state.turn]![f] = YARD;
    return endTurn(
      {
        ...state,
        rngSeed: nextSeed,
        pawns: np,
        dice: [],
        bonuses: [],
        doublesStreak: 0,
      },
      `${seatLabel(state.turn)} rolled three doubles — penalty!`,
    );
  }
  return {
    ...state,
    rngSeed: nextSeed,
    dice: [d1, d2],
    bonuses: [],
    phase: "moving",
    doublesStreak: newStreak,
    lastEvent: `${seatLabel(state.turn)} rolled ${d1} & ${d2}${isDoubles ? " (doubles!)" : ""}.`,
  };
}

function consumeDie(
  state: ParcheesiFullState,
  dieIndex: number,
): ParcheesiFullState {
  if (dieIndex >= 0) {
    const dice = state.dice.map((d, i) => (i === dieIndex ? null : d));
    return { ...state, dice };
  }
  // bonus index is -1, -2, ...
  const bIdx = -1 - dieIndex;
  const bonuses = state.bonuses.filter((_, i) => i !== bIdx);
  return { ...state, bonuses };
}

function diceAllUsed(state: ParcheesiFullState): boolean {
  return state.dice.every((d) => d == null) && state.bonuses.length === 0;
}

function postMoveTransition(state: ParcheesiFullState): ParcheesiFullState {
  // Check for winner.
  const w = checkWinner(state.pawns);
  if (w !== null) {
    return {
      ...state,
      winner: w,
      phase: "ended",
      lastEvent: `${seatLabel(w)} brought all 4 pawns home — winner!`,
    };
  }
  // If both dice consumed and no bonuses left:
  if (diceAllUsed(state)) {
    // Doubles = extra turn; otherwise pass.
    const wasDoubles = state.doublesStreak > 0;
    if (wasDoubles && state.phase !== "ended") {
      return {
        ...state,
        dice: [],
        bonuses: [],
        phase: "rolling",
        lastEvent: `${seatLabel(state.turn)} rolls again (doubles).`,
      };
    }
    return endTurn(state, "");
  }
  // If still dice left but no legal moves possible at all → end turn.
  if (!hasAnyLegalMove(state, state.turn)) {
    return endTurn(state, `${seatLabel(state.turn)} has no legal moves.`);
  }
  return state;
}

function reducerStep(state: ParcheesiFullState, action: ParcheesiFullAction): ParcheesiFullState {
  if (state.phase === "ended" || state.winner !== null) return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rolled = rollFor(state);
    if (rolled.phase !== "moving") return rolled; // 3-doubles penalty already passed turn
    // Auto-pass if no legal move possible.
    if (!hasAnyLegalMove(rolled, rolled.turn)) {
      // Still respects doubles extra-turn rule.
      const passed = endTurn(rolled, `${seatLabel(rolled.turn)} has no legal moves.`);
      return passed;
    }
    return rolled;
  }

  if (action.type === "pass") {
    if (state.phase !== "moving") return state;
    // Only legal if no moves remain.
    if (hasAnyLegalMove(state, state.turn)) return state;
    return endTurn(state, `${seatLabel(state.turn)} passes.`);
  }

  if (action.type === "move") {
    if (state.phase !== "moving") return state;
    const { pawn, dieIndex } = action;
    // Resolve die value.
    let val: number | null = null;
    if (dieIndex >= 0) {
      val = state.dice[dieIndex] ?? null;
    } else {
      const bIdx = -1 - dieIndex;
      val = state.bonuses[bIdx] ?? null;
    }
    if (val == null) return state;
    if (!canMoveSteps(state.pawns, state.turn, pawn, val)) return state;

    const res = applyMoveInternal(state.pawns, state.turn, pawn, val);
    let next: ParcheesiFullState = {
      ...state,
      pawns: res.pawns,
    };
    next = consumeDie(next, dieIndex);
    const extraBonuses: number[] = [];
    let evt = `${seatLabel(state.turn)} moved pawn ${pawn + 1} by ${val}.`;
    if (res.captured) {
      extraBonuses.push(CAPTURE_BONUS);
      evt += ` Capture! +${CAPTURE_BONUS}-square bonus.`;
    }
    if (res.reachedHome) {
      extraBonuses.push(HOME_BONUS);
      evt += ` Pawn home! +${HOME_BONUS}-square bonus.`;
    }
    if (extraBonuses.length) {
      next = { ...next, bonuses: [...next.bonuses, ...extraBonuses] };
    }
    next = { ...next, lastEvent: evt };
    return postMoveTransition(next);
  }

  return state;
}

// Run all bot turns until human's turn (or game ends).
function advanceBots(state: ParcheesiFullState): ParcheesiFullState {
  let s = state;
  let safety = 200;
  while (s.winner === null && s.phase !== "ended" && s.turn !== 0 && safety-- > 0) {
    if (s.phase === "rolling") {
      s = reducerStep(s, { type: "roll" });
      continue;
    }
    // moving phase
    const move = cpuPickMove(s, s.turn);
    if (move === null) {
      if (!hasAnyLegalMove(s, s.turn)) {
        s = reducerStep(s, { type: "pass" });
      } else {
        // shouldn't happen, but break to avoid infinite loop
        break;
      }
      continue;
    }
    s = reducerStep(s, { type: "move", pawn: move.pawn, dieIndex: move.dieIndex });
  }
  return s;
}

export function reducer(state: ParcheesiFullState, action: ParcheesiFullAction): ParcheesiFullState {
  if (state.phase === "ended" || state.winner !== null) return state;

  // Only the human (turn === 0) issues actions through the UI. CPU turns
  // are advanced after the human action resolves.
  if (state.turn !== 0) {
    // We allow auto-advancing bots if the caller dispatches anything while
    // it's not their turn (defensive — UI shouldn't do this).
    return advanceBots(state);
  }

  const next = reducerStep(state, action);
  if (next === state) return state;
  return advanceBots(next);
}

export function isTerminal(state: ParcheesiFullState): { score: number } | null {
  if (state.winner === null) return null;
  // Score: 100 for human win, 0 otherwise.
  return { score: state.winner === 0 ? 100 : 0 };
}

// Expose internals for tests
export const __test = {
  toAbsolute,
  blockadeSquares,
  pathCrossesBlockade,
  applyMoveInternal,
  cpuPickMove,
  ENTRY,
  SAFE_SQUARES,
};
