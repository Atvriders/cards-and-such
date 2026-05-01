// Auto-generated race-game state for frustration-pop.
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TRACK_LEN = 28;
export const PAWNS_PER_SIDE = 4;
export const SINGLE_DIE = true;
export const MUST_ROLL_6 = false;

export type SpecialKind = "safe" | "slide" | "snake" | "ladder" | "hub";
export interface Special { type: SpecialKind; to?: number }
export const SPECIALS: Record<number, Special> = {7: {type:"safe"},14: {type:"safe"},21: {type:"safe"}};

export type Side = "P" | "C";
export interface FrustrationSettings { dummy: boolean }

export interface FrustrationState {
  rngSeed: number;
  pPos: number[]; // pawn positions: 0 = start (off-board for must-roll-6), TRACK_LEN = home
  cPos: number[];
  dice: number[];
  diceLeft: number[];
  turn: Side;
  phase: "rolling" | "moving" | "done";
  winner: Side | null;
  score: number;
  lastBumped: Side | null; // visual feedback for capture
}

export type FrustrationAction =
  | { type: "roll" }
  | { type: "move"; pawnIdx: number; pips: number }
  | { type: "endTurn" };

function rollOne(seed: number): { v: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const v = 1 + Math.floor(rng() * 6);
  return { v, nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, _s: FrustrationSettings): FrustrationState {
  return {
    rngSeed: seed,
    pPos: Array.from({ length: PAWNS_PER_SIDE }, () => MUST_ROLL_6 ? -1 : 0),
    cPos: Array.from({ length: PAWNS_PER_SIDE }, () => MUST_ROLL_6 ? -1 : 0),
    dice: [], diceLeft: [],
    turn: "P", phase: "rolling", winner: null, score: 0,
    lastBumped: null,
  };
}

function applySpecials(pos: number): number {
  const sp = SPECIALS[pos];
  if (!sp) return pos;
  if (sp.type === "snake" || sp.type === "ladder" || sp.type === "slide" || sp.type === "hub") {
    return sp.to ?? pos;
  }
  return pos;
}

function tryMovePawn(positions: number[], idx: number, pips: number): number[] | null {
  if (idx < 0 || idx >= positions.length) return null;
  const cur = positions[idx]!;
  if (cur >= TRACK_LEN) return null; // already home
  if (cur === -1) {
    // Off-board, need 6 to enter
    if (!MUST_ROLL_6 || pips !== 6) return null;
    const out = positions.slice();
    out[idx] = 1;
    return out;
  }
  const target = cur + pips;
  if (target > TRACK_LEN) return null; // overshoot — must land exactly
  const final = applySpecials(target);
  const out = positions.slice();
  out[idx] = Math.min(TRACK_LEN, final);
  return out;
}

function bumpOpponent(side: Side, position: number, oppPos: number[]): { next: number[]; bumped: boolean } {
  if (position <= 0 || position >= TRACK_LEN) return { next: oppPos, bumped: false };
  // Safe square check
  const sp = SPECIALS[position];
  if (sp && sp.type === "safe") return { next: oppPos, bumped: false };
  let bumped = false;
  const next = oppPos.map(p => {
    if (p === position) { bumped = true; return MUST_ROLL_6 ? -1 : 0; }
    return p;
  });
  void side;
  return { next, bumped };
}

function allHome(positions: number[]): boolean {
  return positions.every(p => p >= TRACK_LEN);
}

function pipDistance(positions: number[]): number {
  let total = 0;
  for (const p of positions) total += (TRACK_LEN - Math.max(0, p));
  return total;
}

function checkWin(s: FrustrationState): FrustrationState {
  if (allHome(s.pPos)) {
    const diff = pipDistance(s.cPos) - 0;
    return { ...s, winner: "P", phase: "done", score: 100 + Math.max(0, diff) };
  }
  if (allHome(s.cPos)) {
    return { ...s, winner: "C", phase: "done", score: 0 };
  }
  return s;
}

function cpuTurn(state: FrustrationState): FrustrationState {
  let s = state;
  const r = rollOne(s.rngSeed);
  let dice = [r.v];
  let seed = r.nextSeed;
  if (!SINGLE_DIE) {
    const r2 = rollOne(seed);
    dice.push(r2.v);
    seed = r2.nextSeed;
  }
  s = { ...s, rngSeed: seed, dice };

  // Greedy CPU: prefer pawn furthest from home that can move
  for (const pips of dice) {
    const eligible: number[] = [];
    for (let i = 0; i < s.cPos.length; i++) {
      const trial = tryMovePawn(s.cPos, i, pips);
      if (trial) eligible.push(i);
    }
    if (eligible.length === 0) continue;
    // pick smallest position (furthest from home)
    eligible.sort((a, b) => s.cPos[a]! - s.cPos[b]!);
    const pick = eligible[0]!;
    const moved = tryMovePawn(s.cPos, pick, pips);
    if (moved) {
      const newPos = moved[pick]!;
      const bump = bumpOpponent("C", newPos, s.pPos);
      s = { ...s, cPos: moved, pPos: bump.next, lastBumped: bump.bumped ? "P" : s.lastBumped };
    }
    const w = checkWin(s);
    if (w.phase === "done") return w;
  }

  return { ...s, turn: "P", phase: "rolling", dice: [], diceLeft: [] };
}

export function legalMovesForP(state: FrustrationState): { pawnIdx: number; pips: number }[] {
  const out: { pawnIdx: number; pips: number }[] = [];
  for (const pips of state.diceLeft) {
    for (let i = 0; i < state.pPos.length; i++) {
      const t = tryMovePawn(state.pPos, i, pips);
      if (t) out.push({ pawnIdx: i, pips });
    }
  }
  return out;
}

export function reducer(state: FrustrationState, action: FrustrationAction): FrustrationState {
  if (state.phase === "done") return state;

  if (action.type === "roll" && state.turn === "P" && state.phase === "rolling") {
    const r = rollOne(state.rngSeed);
    let dice = [r.v];
    let seed = r.nextSeed;
    if (!SINGLE_DIE) {
      const r2 = rollOne(seed);
      dice.push(r2.v);
      seed = r2.nextSeed;
    }
    const next: FrustrationState = {
      ...state, rngSeed: seed,
      dice, diceLeft: dice.slice(), phase: "moving"
    };
    const moves = legalMovesForP(next);
    if (moves.length === 0) {
      const cpu = cpuTurn({ ...next, diceLeft: [] });
      return checkWin(cpu);
    }
    return next;
  }

  if (action.type === "move" && state.turn === "P" && state.phase === "moving") {
    const dieIdx = state.diceLeft.indexOf(action.pips);
    if (dieIdx === -1) return state;
    const moved = tryMovePawn(state.pPos, action.pawnIdx, action.pips);
    if (!moved) return state;
    const newPos = moved[action.pawnIdx]!;
    const bump = bumpOpponent("P", newPos, state.cPos);
    const remaining = state.diceLeft.slice();
    remaining.splice(dieIdx, 1);
    let next: FrustrationState = {
      ...state, pPos: moved, cPos: bump.next, diceLeft: remaining,
      lastBumped: bump.bumped ? "C" : state.lastBumped,
    };
    const won = checkWin(next);
    if (won.phase === "done") return won;
    const moves = legalMovesForP(won);
    if (won.diceLeft.length === 0 || moves.length === 0) {
      const cpu = cpuTurn({ ...won, diceLeft: [] });
      return checkWin(cpu);
    }
    return won;
  }

  if (action.type === "endTurn" && state.turn === "P") {
    const cpu = cpuTurn({ ...state, diceLeft: [] });
    return checkWin(cpu);
  }

  return state;
}

export function isTerminal(state: FrustrationState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
