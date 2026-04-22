import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Trouble — similar to Ludo but 28-space track, single die (Pop-o-Matic)
// Need 6 to bring pawn out of home base. Land on opponent = send home.
// First to get all 4 home wins.

export const TRACK_SIZE = 28;
export const HOME_POS = 28;
export const YARD = -1;
export const NUM_PAWNS = 4;

const ENTRY: Record<number, number> = { 0: 0, 1: 7, 2: 14, 3: 21 };
const SAFE_ABS = new Set([0, 7, 14, 21]);

export interface TroubleSettings {
  opponents: "1" | "2" | "3";
}

export interface TroubleState {
  settings: TroubleSettings;
  rngSeed: number;
  pawns: readonly (readonly number[])[];
  die: number;
  turn: number;
  numPlayers: number;
  winner: number | null;
  phase: "rolling" | "moving";
}

export type TroubleAction =
  | { type: "roll" }
  | { type: "move"; pawn: number };

function numPlayers(s: TroubleSettings): number {
  return 1 + parseInt(s.opponents);
}

export function initialState(seed: number, settings: TroubleSettings): TroubleState {
  const np = numPlayers(settings);
  const pawns: number[][] = [];
  for (let i = 0; i < np; i++) pawns.push([YARD, YARD, YARD, YARD]);
  return { settings, rngSeed: seed, pawns, die: 0, turn: 0, numPlayers: np, winner: null, phase: "rolling" };
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
  np: number,
): readonly (readonly number[])[] {
  const pos = pawns[player]![pawnIdx]!;
  const newPos = pos === YARD ? 0 : pos + die;
  const newPawns = pawns.map((pp) => [...pp]);
  newPawns[player]![pawnIdx] = newPos;
  if (newPos === HOME_POS) return newPawns;
  const absPos = toAbs(player, newPos);
  if (!isSafe(absPos)) {
    for (let opp = 0; opp < np; opp++) {
      if (opp === player) continue;
      for (let op = 0; op < NUM_PAWNS; op++) {
        const oppPos = newPawns[opp]![op]!;
        if (oppPos === YARD || oppPos === HOME_POS) continue;
        if (toAbs(opp, oppPos) === absPos) newPawns[opp]![op] = YARD;
      }
    }
  }
  return newPawns;
}

function checkWinner(pawns: readonly (readonly number[])[], np: number): number | null {
  for (let p = 0; p < np; p++) {
    if (pawns[p]!.every((pos) => pos === HOME_POS)) return p;
  }
  return null;
}

function botPick(pawns: readonly (readonly number[])[], player: number, die: number): number | null {
  if (die === 6) {
    const y = pawns[player]!.findIndex((p) => p === YARD);
    if (y !== -1) return y;
  }
  let best = -1;
  let bestPos = HOME_POS + 1;
  for (let pi = 0; pi < NUM_PAWNS; pi++) {
    const pos = pawns[player]![pi]!;
    if (!canMove(pawns, player, pi, die)) continue;
    if (pos < bestPos) { bestPos = pos; best = pi; }
  }
  return best === -1 ? null : best;
}

function advanceBots(state: TroubleState): TroubleState {
  let s = state;
  let iter = 0;
  while (s.winner === null && s.turn !== 0 && iter++ < 200) {
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
        s = { ...s, turn: (s.turn + 1) % s.numPlayers, phase: "rolling", die: 0 };
        continue;
      }
      const newPawns = applyMove(s.pawns, s.turn, pi, s.die, s.numPlayers);
      const w = checkWinner(newPawns, s.numPlayers);
      if (w !== null) { s = { ...s, pawns: newPawns, winner: w }; break; }
      const nt = s.die === 6 ? s.turn : (s.turn + 1) % s.numPlayers;
      s = { ...s, pawns: newPawns, turn: nt, phase: "rolling", die: 0 };
    }
  }
  return s;
}

export function reducer(state: TroubleState, action: TroubleAction): TroubleState {
  if (state.winner !== null) return state;

  if (action.type === "roll") {
    if (state.phase !== "rolling" || state.turn !== 0) return state;
    const rng = mulberry32(state.rngSeed);
    const d = Math.floor(rng() * 6) + 1;
    const nextSeed = Math.floor(rng() * 2 ** 31);
    if (!hasAnyMove(state.pawns, 0, d)) {
      const nt = d === 6 ? 0 : (0 + 1) % state.numPlayers;
      const next: TroubleState = { ...state, rngSeed: nextSeed, die: d };
      if (nt !== 0) return advanceBots({ ...next, turn: nt, phase: "rolling" });
      return next;
    }
    return { ...state, rngSeed: nextSeed, die: d, phase: "moving" };
  }

  if (action.type === "move") {
    if (state.phase !== "moving" || state.turn !== 0) return state;
    const { pawn } = action;
    if (!canMove(state.pawns, 0, pawn, state.die)) return state;
    const newPawns = applyMove(state.pawns, 0, pawn, state.die, state.numPlayers);
    const w = checkWinner(newPawns, state.numPlayers);
    if (w !== null) return { ...state, pawns: newPawns, winner: w };
    const nt = state.die === 6 ? 0 : (0 + 1) % state.numPlayers;
    const next: TroubleState = { ...state, pawns: newPawns, turn: nt, phase: "rolling", die: 0 };
    if (nt !== 0) return advanceBots(next);
    return next;
  }

  return state;
}

export function isTerminal(state: TroubleState): { score: number } | null {
  if (state.winner === null) return null;
  return { score: state.winner === 0 ? 100 : 0 };
}
