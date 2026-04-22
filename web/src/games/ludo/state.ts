import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Ludo — single die, need 6 to bring pawn out, 56-square track
// Player 0 = human, bots fill remaining seats
// Relative track: 0 = entered, 55 = home entry, 56 = home
export const TRACK_SIZE = 56;
export const HOME_POS = 56;
export const YARD = -1;
export const NUM_PAWNS = 4;

// Each player's entry offset on the shared track
const ENTRY: Record<number, number> = { 0: 0, 1: 14, 2: 28, 3: 42 };

// Safe squares (absolute)
const SAFE_ABS = new Set([0, 8, 14, 22, 28, 36, 42, 50]);

export interface LudoSettings {
  opponents: "1" | "2" | "3";
}

export interface LudoState {
  settings: LudoSettings;
  rngSeed: number;
  pawns: readonly (readonly number[])[];
  die: number; // current roll (0 = not rolled)
  turn: number;
  numPlayers: number;
  winner: number | null;
  phase: "rolling" | "moving";
  sixStreak: number; // count of consecutive 6s (limit 3)
}

export type LudoAction =
  | { type: "roll" }
  | { type: "move"; pawn: number };

function numPlayers(settings: LudoSettings): number {
  return 1 + parseInt(settings.opponents);
}

export function initialState(seed: number, settings: LudoSettings): LudoState {
  const np = numPlayers(settings);
  const pawns: number[][] = [];
  for (let i = 0; i < np; i++) pawns.push([YARD, YARD, YARD, YARD]);
  return {
    settings,
    rngSeed: seed,
    pawns,
    die: 0,
    turn: 0,
    numPlayers: np,
    winner: null,
    phase: "rolling",
    sixStreak: 0,
  };
}

function toAbs(player: number, rel: number): number {
  if (rel === YARD || rel === HOME_POS) return rel;
  return (ENTRY[player]! + rel) % TRACK_SIZE;
}

function isSafe(abs: number): boolean {
  return SAFE_ABS.has(abs);
}

function canMove(pawns: readonly (readonly number[])[], player: number, pawnIdx: number, die: number): boolean {
  const pos = pawns[player]![pawnIdx]!;
  if (pos === HOME_POS) return false;
  if (pos === YARD) return die === 6;
  return pos + die <= HOME_POS;
}

function hasAnyMove(pawns: readonly (readonly number[])[], player: number, die: number): boolean {
  return pawns[player]!.some((_, pi) => canMove(pawns, player, pi, die));
}

function applyMove(
  pawns: readonly (readonly number[])[],
  player: number,
  pawnIdx: number,
  die: number,
  numPlayers: number,
): readonly (readonly number[])[] {
  const pos = pawns[player]![pawnIdx]!;
  const newPos = pos === YARD ? 0 : pos + die;
  const newPawns = pawns.map((pp) => [...pp]);
  newPawns[player]![pawnIdx] = newPos;

  if (newPos === HOME_POS) return newPawns;

  const absPos = toAbs(player, newPos);
  if (!isSafe(absPos)) {
    for (let opp = 0; opp < numPlayers; opp++) {
      if (opp === player) continue;
      for (let op = 0; op < NUM_PAWNS; op++) {
        const oppPos = newPawns[opp]![op]!;
        if (oppPos === YARD || oppPos === HOME_POS) continue;
        if (toAbs(opp, oppPos) === absPos) {
          newPawns[opp]![op] = YARD;
        }
      }
    }
  }
  return newPawns;
}

function checkWinner(pawns: readonly (readonly number[])[], numPlayers: number): number | null {
  for (let p = 0; p < numPlayers; p++) {
    if (pawns[p]!.every((pos) => pos === HOME_POS)) return p;
  }
  return null;
}

// Bot heuristic: prioritize bringing pawns out (die=6), else advance most-behind pawn
function botPick(pawns: readonly (readonly number[])[], player: number, die: number): number | null {
  if (die === 6) {
    // Bring out a yard pawn if possible
    const yardPawn = pawns[player]!.findIndex((p) => p === YARD);
    if (yardPawn !== -1) return yardPawn;
  }
  // Advance the pawn farthest back (smallest non-yard, non-home position)
  let best = -1;
  let bestPos = HOME_POS + 1;
  for (let pi = 0; pi < NUM_PAWNS; pi++) {
    const pos = pawns[player]![pi]!;
    if (!canMove(pawns, player, pi, die)) continue;
    if (pos < bestPos) {
      bestPos = pos;
      best = pi;
    }
  }
  return best === -1 ? null : best;
}

function advanceBots(state: LudoState): LudoState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 200) {
    if (s.phase === "rolling") {
      const rng = mulberry32(s.rngSeed);
      const d = Math.floor(rng() * 6) + 1;
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const streak = d === 6 ? s.sixStreak + 1 : 0;
      if (streak >= 3) {
        // 3 consecutive 6s: lose turn
        const nextTurn = (s.turn + 1) % s.numPlayers;
        s = { ...s, rngSeed: nextSeed, turn: nextTurn, sixStreak: 0, die: 0, phase: "rolling" };
        continue;
      }
      if (!hasAnyMove(s.pawns, s.turn, d)) {
        const nextTurn = d === 6 ? s.turn : (s.turn + 1) % s.numPlayers;
        s = { ...s, rngSeed: nextSeed, die: d, turn: nextTurn, sixStreak: streak, phase: "rolling" };
        continue;
      }
      s = { ...s, rngSeed: nextSeed, die: d, sixStreak: streak, phase: "moving" };
    } else {
      const pawnIdx = botPick(s.pawns, s.turn, s.die);
      if (pawnIdx === null) {
        const nextTurn = (s.turn + 1) % s.numPlayers;
        s = { ...s, turn: nextTurn, phase: "rolling", die: 0 };
        continue;
      }
      const newPawns = applyMove(s.pawns, s.turn, pawnIdx, s.die, s.numPlayers);
      const w = checkWinner(newPawns, s.numPlayers);
      if (w !== null) { s = { ...s, pawns: newPawns, winner: w }; break; }
      // Roll 6 = extra turn
      const nextTurn = s.die === 6 ? s.turn : (s.turn + 1) % s.numPlayers;
      s = { ...s, pawns: newPawns, turn: nextTurn, phase: "rolling", die: 0 };
    }
  }
  return s;
}

export function reducer(state: LudoState, action: LudoAction): LudoState {
  if (state.winner !== null) return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.turn !== 0) return state;
    const rng = mulberry32(state.rngSeed);
    const d = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const streak = d === 6 ? state.sixStreak + 1 : 0;
    if (streak >= 3) {
      const nextTurn = (0 + 1) % state.numPlayers;
      const next: LudoState = { ...state, rngSeed: nextSeed, turn: nextTurn, sixStreak: 0, die: 0, phase: "rolling" };
      return advanceBots(next);
    }
    if (!hasAnyMove(state.pawns, 0, d)) {
      const nextTurn = d === 6 ? 0 : (0 + 1) % state.numPlayers;
      let next: LudoState = { ...state, rngSeed: nextSeed, die: d, sixStreak: streak };
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
    if (!canMove(state.pawns, 0, pawn, state.die)) return state;
    const newPawns = applyMove(state.pawns, 0, pawn, state.die, state.numPlayers);
    const w = checkWinner(newPawns, state.numPlayers);
    if (w !== null) return { ...state, pawns: newPawns, winner: w };
    const nextTurn = state.die === 6 ? 0 : (0 + 1) % state.numPlayers;
    const next: LudoState = { ...state, pawns: newPawns, turn: nextTurn, phase: "rolling", die: 0 };
    if (nextTurn !== 0) return advanceBots(next);
    return next;
  }

  return state;
}

export function isTerminal(state: LudoState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
