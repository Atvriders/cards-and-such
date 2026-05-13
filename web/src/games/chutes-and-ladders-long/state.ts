// Chutes and Ladders (Long Edition) — extended 100 + 10-square bonus track.
// 1 human + 3 CPUs, 4 pawns per player, single d6, pile-up rule at chute heads.
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const MAIN_TRACK_LEN = 100;
export const BONUS_START = 101;
export const HOME = 110;
export const PAWNS_PER_PLAYER = 4;
export const NUM_PLAYERS = 4; // player 0 = human, 1..3 = CPUs

export type SpecialKind = "snake" | "ladder";
export interface Special { type: SpecialKind; to: number }

// Ladders (climb up): src -> dest with dest > src
// Chutes / snakes (slide down): src -> dest with dest < src
export const SPECIALS: Record<number, Special> = {
  // Ladders
  1: { type: "ladder", to: 38 },
  4: { type: "ladder", to: 14 },
  9: { type: "ladder", to: 31 },
  21: { type: "ladder", to: 42 },
  28: { type: "ladder", to: 84 },
  36: { type: "ladder", to: 44 },
  51: { type: "ladder", to: 67 },
  71: { type: "ladder", to: 91 },
  80: { type: "ladder", to: 100 },
  101: { type: "ladder", to: 105 },
  // Chutes
  16: { type: "snake", to: 6 },
  47: { type: "snake", to: 26 },
  49: { type: "snake", to: 11 },
  56: { type: "snake", to: 53 },
  62: { type: "snake", to: 19 },
  64: { type: "snake", to: 60 },
  87: { type: "snake", to: 24 },
  93: { type: "snake", to: 73 },
  95: { type: "snake", to: 75 },
  98: { type: "snake", to: 78 },
  109: { type: "snake", to: 95 },
};

export interface LongSettings { _dummy: boolean }

export interface LongState {
  rngSeed: number;
  /** positions[player][pawnIdx]. 0 = start, HOME = won. */
  positions: number[][];
  /** turn — 0..NUM_PLAYERS-1 */
  turn: number;
  /** Last die roll, or 0 if not rolled yet. */
  die: number;
  phase: "rolling" | "moving" | "done";
  winner: number | null;
  score: number;
  /** Visual: last pawn pushed by pile-up (player, pawnIdx, from, to). */
  lastPush: { player: number; pawnIdx: number; from: number; to: number } | null;
}

export type LongAction =
  | { type: "roll" }
  | { type: "move"; pawnIdx: number }
  | { type: "cpuStep" };

function rollOne(seed: number): { v: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const v = 1 + Math.floor(rng() * 6);
  return { v, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, _s: LongSettings): LongState {
  return {
    rngSeed: seed >>> 0,
    positions: Array.from({ length: NUM_PLAYERS }, () =>
      Array.from({ length: PAWNS_PER_PLAYER }, () => 0)
    ),
    turn: 0,
    die: 0,
    phase: "rolling",
    winner: null,
    score: 0,
    lastPush: null,
  };
}

/** Compute landing square given a raw target (no specials yet). Overshoot of HOME stays in place. */
function clampTarget(raw: number): number | null {
  if (raw > HOME) return null; // overshoot, must roll exact
  return raw;
}

/** Apply a single ladder/chute hop. Returns final landing square. */
function applySpecial(square: number): number {
  const sp = SPECIALS[square];
  if (!sp) return square;
  return sp.to;
}

/**
 * Resolve a pawn move, including pile-up at chute heads.
 * Returns a new positions array and any push event, or null if the move was illegal.
 *
 * Pile-up rule: when an arriving pawn lands on a chute head that has exactly
 * one pawn already there, that existing pawn is shoved down the chute. The
 * arriving pawn occupies the chute head. (If multiple pawns already there,
 * no push — too crowded. If the head is empty, normal chute applies to the
 * arriving pawn.)
 */
function applyMove(
  positions: number[][],
  player: number,
  pawnIdx: number,
  pips: number,
): { next: number[][]; push: LongState["lastPush"] } | null {
  const cur = positions[player]?.[pawnIdx];
  if (cur === undefined) return null;
  if (cur >= HOME) return null; // already home
  const raw = cur + pips;
  const clamped = clampTarget(raw);
  if (clamped === null) return null;

  const target = clamped;
  const sp = SPECIALS[target];

  // Build mutable copy
  const next = positions.map((row) => row.slice());
  let push: LongState["lastPush"] = null;

  if (sp) {
    // Count pawns currently AT the special square (head). Exclude the moving pawn itself.
    let occupants = 0;
    let occupant: { player: number; pawnIdx: number } | null = null;
    for (let pl = 0; pl < next.length; pl++) {
      for (let pi = 0; pi < next[pl]!.length; pi++) {
        if (pl === player && pi === pawnIdx) continue;
        if (next[pl]![pi] === target) {
          occupants++;
          occupant = { player: pl, pawnIdx: pi };
        }
      }
    }
    if (sp.type === "snake" && occupants === 1 && occupant) {
      // Pile-up: shove the existing single occupant down the chute,
      // arriving pawn stays at the head.
      next[occupant.player]![occupant.pawnIdx] = sp.to;
      next[player]![pawnIdx] = target;
      push = { player: occupant.player, pawnIdx: occupant.pawnIdx, from: target, to: sp.to };
    } else {
      // Normal ladder/chute: arriving pawn takes the special.
      next[player]![pawnIdx] = applySpecial(target);
    }
  } else {
    next[player]![pawnIdx] = target;
  }

  return { next, push };
}

export function allHome(pawns: number[]): boolean {
  return pawns.every((p) => p >= HOME);
}

/** A pawn "can avoid backslide" if moving it does NOT land on a chute head (snake). */
function moveWouldBackslide(positions: number[][], player: number, pawnIdx: number, pips: number): boolean {
  const cur = positions[player]?.[pawnIdx];
  if (cur === undefined) return true;
  if (cur >= HOME) return true; // can't move, treated as not-helpful
  const raw = cur + pips;
  if (raw > HOME) return true; // overshoot, illegal
  const sp = SPECIALS[raw];
  if (sp && sp.type === "snake") {
    // Pile-up exception: if exactly one OTHER pawn is at the head, we'd push them, not slide ourselves.
    let occupants = 0;
    for (let pl = 0; pl < positions.length; pl++) {
      for (let pi = 0; pi < positions[pl]!.length; pi++) {
        if (pl === player && pi === pawnIdx) continue;
        if (positions[pl]![pi] === raw) occupants++;
      }
    }
    return occupants !== 1; // backslide unless pile-up saves us
  }
  return false;
}

/** Eligible pawns for a roll. */
export function eligiblePawns(state: LongState, player: number, pips: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < PAWNS_PER_PLAYER; i++) {
    const cur = state.positions[player]![i]!;
    if (cur >= HOME) continue;
    if (cur + pips > HOME) continue; // overshoot illegal
    out.push(i);
  }
  return out;
}

/**
 * The forced-move rule: if every eligible pawn would backslide,
 * the player MUST move the leading pawn (highest position among eligible).
 * Returns null if no eligible pawns at all (skip turn).
 */
export function legalChoices(state: LongState, player: number, pips: number): number[] {
  const eligible = eligiblePawns(state, player, pips);
  if (eligible.length === 0) return [];
  const nonBackslide = eligible.filter((i) => !moveWouldBackslide(state.positions, player, i, pips));
  if (nonBackslide.length > 0) return eligible; // any eligible is fine
  // Forced: only the leading pawn
  const leader = eligible.reduce((best, i) =>
    state.positions[player]![i]! > state.positions[player]![best]! ? i : best,
  eligible[0]!);
  return [leader];
}

function checkWin(state: LongState): LongState {
  for (let p = 0; p < NUM_PLAYERS; p++) {
    if (allHome(state.positions[p]!)) {
      const score = p === 0
        ? 100 + 50 * state.positions[0]!.filter((x) => x >= HOME).length
        : 0;
      return { ...state, phase: "done", winner: p, score };
    }
  }
  return state;
}

function advanceTurn(state: LongState): LongState {
  return {
    ...state,
    turn: (state.turn + 1) % NUM_PLAYERS,
    die: 0,
    phase: "rolling",
  };
}

/** CPU heuristic: among legal choices, advance the laggiest pawn (smallest position). */
export function cpuPickPawn(state: LongState, player: number, pips: number): number | null {
  const choices = legalChoices(state, player, pips);
  if (choices.length === 0) return null;
  // Laggiest = smallest current position
  let best = choices[0]!;
  for (const c of choices) {
    if (state.positions[player]![c]! < state.positions[player]![best]!) best = c;
  }
  return best;
}

export function reducer(state: LongState, action: LongAction): LongState {
  if (state.phase === "done") return state;

  if (action.type === "roll" && state.phase === "rolling") {
    const r = rollOne(state.rngSeed);
    const pips = r.v;
    const player = state.turn;
    const choices = legalChoices(state, player, pips);

    if (choices.length === 0) {
      // No eligible pawns — skip turn entirely.
      return advanceTurn({ ...state, rngSeed: r.nextSeed, die: pips, lastPush: null });
    }

    const intermediate: LongState = {
      ...state,
      rngSeed: r.nextSeed,
      die: pips,
      phase: "moving",
      lastPush: null,
    };

    // If it's a CPU, auto-pick laggiest.
    if (player !== 0) {
      const pick = cpuPickPawn(intermediate, player, pips);
      if (pick === null) return advanceTurn(intermediate);
      const applied = applyMove(intermediate.positions, player, pick, pips);
      if (!applied) return advanceTurn(intermediate);
      const moved: LongState = { ...intermediate, positions: applied.next, lastPush: applied.push };
      const won = checkWin(moved);
      if (won.phase === "done") return won;
      return advanceTurn(moved);
    }

    // Human: if only one legal choice, allow them to still click it (don't auto-play).
    return intermediate;
  }

  if (action.type === "move" && state.phase === "moving" && state.turn === 0) {
    const pips = state.die;
    const choices = legalChoices(state, 0, pips);
    if (!choices.includes(action.pawnIdx)) return state;
    const applied = applyMove(state.positions, 0, action.pawnIdx, pips);
    if (!applied) return state;
    const moved: LongState = { ...state, positions: applied.next, lastPush: applied.push };
    const won = checkWin(moved);
    if (won.phase === "done") return won;
    return advanceTurn(moved);
  }

  // cpuStep: explicit driver to let UI animate CPU turns one at a time.
  // It rolls and resolves a single CPU turn.
  if (action.type === "cpuStep" && state.phase === "rolling" && state.turn !== 0) {
    return reducer(state, { type: "roll" });
  }

  return state;
}

export function isTerminal(state: LongState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
