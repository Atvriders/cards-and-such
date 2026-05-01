// Auto-generated backgammon-family state for hypergammon.
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const POINTS = 24;
export const CHECKERS_PER_SIDE = 3;
export const HIT_ENABLED = true;
export const PIN_ENABLED = false;
export const BLOCK_ONLY = false;
export const THREE_DICE = false;
export const ACEY_DEUCEY = false;
// Starting layout entries are [point0Indexed, count] for player.
const START_LAYOUT: ReadonlyArray<readonly [number, number]> = [[0,3]];

export type Side = "P" | "C";
export interface HyperSettings { dummy: boolean }

export interface HyperState {
  rngSeed: number;
  // pPoints[i] = number of player checkers at point i (0..POINTS-1)
  pPoints: number[];
  cPoints: number[];
  pBar: number; // checkers on bar (hit)
  cBar: number;
  pBorne: number; // borne off
  cBorne: number;
  dice: number[]; // current dice values
  diceLeft: number[]; // remaining dice to play (multiset)
  turn: Side;
  phase: "rolling" | "moving" | "done";
  winner: Side | null;
  score: number;
  // pinned[i]: which side is pinned at point i (only for pin variant)
  pinned: (Side | null)[];
}

export type HyperAction =
  | { type: "roll" }
  | { type: "move"; from: number; pips: number } // from = 0..POINTS-1, or -1 for bar
  | { type: "endTurn" };

function rollOne(seed: number): { v: number; nextSeed: number } {
  const rng = mulberry32(seed);
  const v = 1 + Math.floor(rng() * 6);
  return { v, nextSeed: Math.floor(rng() * 2 ** 31) };
}

function rollDiceMulti(seed: number, count: number): { d: number[]; nextSeed: number } {
  let s = seed;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const r = rollOne(s);
    out.push(r.v);
    s = r.nextSeed;
  }
  return { d: out, nextSeed: s };
}

function expandDice(d: number[]): number[] {
  // Doubles in 2-dice play give 4 plays of that face.
  if (THREE_DICE) return d.slice();
  if (d.length === 2 && d[0] === d[1]) return [d[0]!, d[0]!, d[0]!, d[0]!];
  return d.slice();
}

export function initialState(seed: number, _s: HyperSettings): HyperState {
  const pPoints = Array.from({ length: POINTS }, () => 0);
  const cPoints = Array.from({ length: POINTS }, () => 0);
  for (const [p, n] of START_LAYOUT) {
    pPoints[p] = n;
    // mirror C side: C at POINTS-1-p
    cPoints[POINTS - 1 - p] = n;
  }
  return {
    rngSeed: seed,
    pPoints, cPoints,
    pBar: 0, cBar: 0,
    pBorne: 0, cBorne: 0,
    dice: [], diceLeft: [],
    turn: "P", phase: "rolling", winner: null, score: 0,
    pinned: Array.from({ length: POINTS }, () => null),
  };
}

function pipCount(points: number[], borne: number, bar: number, side: Side): number {
  let total = 0;
  for (let i = 0; i < POINTS; i++) {
    const n = points[i] || 0;
    const dist = side === "P" ? (POINTS - i) : (i + 1);
    total += n * dist;
  }
  // bar checkers count full track
  total += bar * (POINTS + 1);
  // borne off contribute 0 (already home)
  void borne;
  return total;
}

function allInHome(points: number[], side: Side): boolean {
  // Home is the last 6 points relative to side.
  if (side === "P") {
    for (let i = 0; i < POINTS - 6; i++) if ((points[i] || 0) > 0) return false;
    return true;
  } else {
    for (let i = 6; i < POINTS; i++) if ((points[i] || 0) > 0) return false;
    return true;
  }
}

function targetPoint(from: number, pips: number, side: Side): number {
  // Player advances toward POINTS; CPU advances toward -1.
  return side === "P" ? from + pips : from - pips;
}

export function legalMoves(state: HyperState, side: Side): { from: number; pips: number }[] {
  const out: { from: number; pips: number }[] = [];
  const myPoints = side === "P" ? state.pPoints : state.cPoints;
  const oppPoints = side === "P" ? state.cPoints : state.pPoints;
  const myBar = side === "P" ? state.pBar : state.cBar;
  const dice = Array.from(new Set(state.diceLeft));
  for (const pips of dice) {
    // bar entry first
    if (myBar > 0) {
      const entry = side === "P" ? (pips - 1) : (POINTS - pips);
      if (entry >= 0 && entry < POINTS) {
        const opp = oppPoints[entry] || 0;
        if (opp <= 1 || (PIN_ENABLED && opp >= 1)) out.push({ from: -1, pips });
      }
      continue;
    }
    for (let i = 0; i < POINTS; i++) {
      if ((myPoints[i] || 0) === 0) continue;
      if (PIN_ENABLED && state.pinned[i] !== null && state.pinned[i] !== side) continue;
      const t = targetPoint(i, pips, side);
      if (t < 0 || t >= POINTS) {
        // bear off
        if (allInHome(myPoints, side) && myBar === 0) {
          // exact bear-off or overshoot from highest
          const dist = side === "P" ? (POINTS - i) : (i + 1);
          if (dist === pips) out.push({ from: i, pips });
          else if (dist < pips) {
            // overshoot only if no checker further from home
            let hasFurther = false;
            if (side === "P") {
              for (let j = POINTS - 6; j < i; j++) if ((myPoints[j] || 0) > 0) { hasFurther = true; break; }
            } else {
              for (let j = 5; j > i; j--) if ((myPoints[j] || 0) > 0) { hasFurther = true; break; }
            }
            if (!hasFurther) out.push({ from: i, pips });
          }
        }
        continue;
      }
      const opp = oppPoints[t] || 0;
      if (BLOCK_ONLY) {
        if (opp >= 1) continue; // any opponent point blocks
      } else if (PIN_ENABLED) {
        // can land on single opp (pin) or own
        if (opp >= 2) continue;
      } else {
        // standard: blocked by 2+ opponent
        if (opp >= 2) continue;
      }
      out.push({ from: i, pips });
    }
  }
  return out;
}

function applyMove(state: HyperState, side: Side, from: number, pips: number): HyperState | null {
  const next: HyperState = {
    ...state,
    pPoints: state.pPoints.slice(),
    cPoints: state.cPoints.slice(),
    pinned: state.pinned.slice(),
    diceLeft: state.diceLeft.slice(),
  };
  const myPoints = side === "P" ? next.pPoints : next.cPoints;
  const oppPoints = side === "P" ? next.cPoints : next.pPoints;
  const dieIdx = next.diceLeft.indexOf(pips);
  if (dieIdx === -1) return null;
  next.diceLeft.splice(dieIdx, 1);

  if (from === -1) {
    // bar entry
    if (side === "P") next.pBar -= 1; else next.cBar -= 1;
    const entry = side === "P" ? (pips - 1) : (POINTS - pips);
    if (entry < 0 || entry >= POINTS) return null;
    const opp = oppPoints[entry] || 0;
    if (HIT_ENABLED && opp === 1) {
      oppPoints[entry] = 0;
      if (side === "P") next.cBar += 1; else next.pBar += 1;
    }
    myPoints[entry] = (myPoints[entry] || 0) + 1;
    return next;
  }

  if ((myPoints[from] || 0) === 0) return null;
  const t = targetPoint(from, pips, side);
  if (t < 0 || t >= POINTS) {
    // bear off
    if (!allInHome(myPoints, side)) return null;
    myPoints[from] -= 1;
    if (side === "P") next.pBorne += 1; else next.cBorne += 1;
    return next;
  }
  const opp = oppPoints[t] || 0;
  if (BLOCK_ONLY && opp >= 1) return null;
  if (!BLOCK_ONLY && opp >= 2) return null;
  myPoints[from] -= 1;
  if (HIT_ENABLED && opp === 1) {
    oppPoints[t] = 0;
    if (side === "P") next.cBar += 1; else next.pBar += 1;
  }
  if (PIN_ENABLED && opp === 1) {
    // pin opponent — don't remove, just stack our own atop
    next.pinned[t] = side === "P" ? "C" : "P"; // pinned side
  } else if (PIN_ENABLED && opp === 0) {
    next.pinned[t] = null;
  }
  myPoints[t] = (myPoints[t] || 0) + 1;
  return next;
}

function checkWin(s: HyperState): HyperState {
  if (s.pBorne >= CHECKERS_PER_SIDE) {
    const diff = pipCount(s.cPoints, s.cBorne, s.cBar, "C") - pipCount(s.pPoints, s.pBorne, s.pBar, "P");
    return { ...s, winner: "P", phase: "done", score: 100 + Math.max(0, diff) };
  }
  if (s.cBorne >= CHECKERS_PER_SIDE) {
    return { ...s, winner: "C", phase: "done", score: 0 };
  }
  return s;
}

function cpuTurn(state: HyperState): HyperState {
  let s = state;
  const diceCount = THREE_DICE ? 3 : 2;
  const r = rollDiceMulti(s.rngSeed, diceCount);
  s = { ...s, rngSeed: r.nextSeed, dice: r.d, diceLeft: expandDice(r.d) };
  // Greedy: just apply legal moves until none
  let guard = 0;
  while (s.diceLeft.length > 0 && guard < 30) {
    guard++;
    const moves = legalMoves(s, "C");
    if (moves.length === 0) break;
    // pick first legal
    const rng = mulberry32(s.rngSeed);
    const pick = moves[Math.floor(rng() * moves.length)]!;
    s = { ...s, rngSeed: Math.floor(rng() * 2 ** 31) };
    const applied = applyMove(s, "C", pick.from, pick.pips);
    if (!applied) break;
    s = applied;
    const w = checkWin(s);
    if (w.phase === "done") return w;
  }
  return { ...s, turn: "P", phase: "rolling", dice: [], diceLeft: [] };
}

export function reducer(state: HyperState, action: HyperAction): HyperState {
  if (state.phase === "done") return state;

  if (action.type === "roll" && state.turn === "P" && state.phase === "rolling") {
    const diceCount = THREE_DICE ? 3 : 2;
    const r = rollDiceMulti(state.rngSeed, diceCount);
    const next: HyperState = { ...state, rngSeed: r.nextSeed, dice: r.d, diceLeft: expandDice(r.d), phase: "moving" };
    // if no legal moves, end immediately
    const moves = legalMoves(next, "P");
    if (moves.length === 0) {
      const cpu = cpuTurn({ ...next, diceLeft: [] });
      return checkWin(cpu);
    }
    return next;
  }

  if (action.type === "move" && state.turn === "P" && state.phase === "moving") {
    const applied = applyMove(state, "P", action.from, action.pips);
    if (!applied) return state;
    const won = checkWin(applied);
    if (won.phase === "done") return won;
    // if all dice played or no legal moves left, end turn
    const moves = legalMoves(won, "P");
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

export function isTerminal(state: HyperState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
