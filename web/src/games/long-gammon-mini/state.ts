import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TRACK = 20;
export const CHECKERS = 12;

export interface RaceSettings { dummy: boolean }
export type Side = "P" | "C";

export interface RaceState {
  rngSeed: number;
  pPositions: number[];
  cPositions: number[];
  dice: [number, number];
  diceUsed: [boolean, boolean];
  turn: Side;
  winner: Side | null;
  phase: "rolling" | "moving" | "done";
  score: number;
}

export type RaceAction =
  | { type: "roll" }
  | { type: "move"; checkerIdx: number; die: 0 | 1 | 2 }
  | { type: "endTurn" };

function rollDice(seed: number): { d: [number, number]; nextSeed: number } {
  const rng = mulberry32(seed);
  const d1 = Math.floor(rng() * 6) + 1;
  const d2 = Math.floor(rng() * 6) + 1;
  return { d: [d1, d2] as [number, number], nextSeed: Math.floor(rng() * 2 ** 31) };
}

export function initialState(seed: number, _s: RaceSettings): RaceState {
  return {
    rngSeed: seed,
    pPositions: Array.from({ length: CHECKERS }, () => 0),
    cPositions: Array.from({ length: CHECKERS }, () => 0),
    dice: [0, 0],
    diceUsed: [true, true],
    turn: "P",
    winner: null,
    phase: "rolling",
    score: 0,
  };
}

function pipDistance(positions: number[]): number {
  let total = 0;
  for (const p of positions) total += (TRACK - p);
  return total;
}

function allBorneOff(positions: number[]): boolean {
  return positions.every((p) => p >= TRACK);
}

function moveChecker(positions: number[], idx: number, pips: number): number[] | null {
  if (idx < 0 || idx >= positions.length) return null;
  const cur = positions[idx]!;
  if (cur >= TRACK) return null;
  const np = Math.min(TRACK, cur + pips);
  const out = positions.slice();
  out[idx] = np;
  return out;
}

function cpuTurn(state: RaceState): RaceState {
  let s = { ...state };
  const roll = rollDice(s.rngSeed);
  s.rngSeed = roll.nextSeed;
  s.dice = roll.d;
  s.diceUsed = [false, false];
  for (let dIdx = 0; dIdx < 2; dIdx++) {
    const die = s.dice[dIdx]!;
    const rng = mulberry32(s.rngSeed);
    const eligible: number[] = [];
    for (let i = 0; i < s.cPositions.length; i++) if (s.cPositions[i]! < TRACK) eligible.push(i);
    if (eligible.length === 0) break;
    const pick = eligible[Math.floor(rng() * eligible.length)]!;
    s.rngSeed = Math.floor(rng() * 2 ** 31);
    const np = moveChecker(s.cPositions, pick, die);
    if (np) s.cPositions = np;
  }
  s.diceUsed = [true, true];
  if (allBorneOff(s.cPositions)) {
    s.winner = "C";
    s.phase = "done";
    const diff = pipDistance(s.pPositions) - pipDistance(s.cPositions);
    s.score = Math.max(0, -diff);
    return s;
  }
  s.turn = "P";
  s.phase = "rolling";
  return s;
}

export function reducer(state: RaceState, action: RaceAction): RaceState {
  if (state.phase === "done") return state;

  if (action.type === "roll" && state.turn === "P" && state.phase === "rolling") {
    const r = rollDice(state.rngSeed);
    return { ...state, rngSeed: r.nextSeed, dice: r.d, diceUsed: [false, false], phase: "moving" };
  }

  if (action.type === "move" && state.turn === "P" && state.phase === "moving") {
    const dieIdx = action.die;
    let pips = 0;
    let usedFlags = state.diceUsed.slice() as [boolean, boolean];
    if (dieIdx === 0 && !usedFlags[0]) { pips = state.dice[0]; usedFlags[0] = true; }
    else if (dieIdx === 1 && !usedFlags[1]) { pips = state.dice[1]; usedFlags[1] = true; }
    else if (dieIdx === 2 && !usedFlags[0] && !usedFlags[1]) {
      pips = state.dice[0] + state.dice[1];
      usedFlags = [true, true];
    } else return state;

    const np = moveChecker(state.pPositions, action.checkerIdx, pips);
    if (!np) return state;
    let s: RaceState = { ...state, pPositions: np, diceUsed: usedFlags };
    if (allBorneOff(s.pPositions)) {
      const diff = pipDistance(s.cPositions) - pipDistance(s.pPositions);
      return { ...s, winner: "P", phase: "done", score: 100 + Math.max(0, diff) };
    }
    if (usedFlags[0] && usedFlags[1]) {
      s = { ...s, turn: "C", phase: "rolling" };
      s = cpuTurn(s);
    }
    return s;
  }

  if (action.type === "endTurn" && state.turn === "P") {
    let s: RaceState = { ...state, turn: "C", phase: "rolling", diceUsed: [true, true] };
    s = cpuTurn(s);
    return s;
  }

  return state;
}

export function isTerminal(state: RaceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
