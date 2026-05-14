import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Carrom Full — 19 carrom men (9 white + 9 black + 1 red queen) on a square
// board with 4 corner pockets. Human plays White, CPU plays Black.
//
// Physics is simplified to a deterministic per-shot resolution: aim (angle in
// degrees, 0–359) and power (1–10) seed an outcome that may pocket one or
// more pieces. This keeps the rulebook of carrom intact (queen, covering,
// fouls, penalties) without requiring a real billiards solver.

export const BOARD_SIZE = 600; // virtual units (purely numerical, for layout)
export const POCKET_RADIUS = 24;
export const PIECE_RADIUS = 14;

export type PieceColor = "white" | "black" | "queen";
export type Seat = "P" | "C"; // P = human (White), C = CPU (Black)

export interface CarromSettings {
  _dummy: boolean;
}

export interface Piece {
  id: number;
  color: PieceColor;
  x: number;
  y: number;
  pocketed: boolean;
}

export type Phase =
  | "aim"        // human is aiming
  | "resolve"    // shot resolved, brief display state (covered by reducer transition)
  | "cpu"        // CPU is about to take a turn
  | "done";      // game over

export type GameResult = "P" | "C" | null;

export interface CarromState {
  rngSeed: number;
  pieces: Piece[];                // 19 men
  whitePocketed: number;          // count of pocketed white pieces
  blackPocketed: number;          // count of pocketed black pieces
  queenPocketed: boolean;         // currently pocketed and unresolved/covered
  queenHolder: Seat | null;       // who pocketed the queen (still needs cover)
  queenCovered: boolean;          // queen covered and locked-in for queenHolder
  turn: Seat;                     // whose turn
  phase: Phase;
  shotsTaken: number;             // total shot count (safety bound)
  lastShot: ShotResult | null;    // last shot outcome (for UI)
  penalties: { P: number; C: number }; // pieces owed back to board (display)
  result: GameResult;
  score: number;
}

export interface ShotResult {
  by: Seat;
  pocketedIds: number[];
  pocketedQueen: boolean;
  foul: boolean;
  message: string;
}

export type CarromAction =
  | { type: "shoot"; angle: number; power: number } // human shot
  | { type: "cpuShoot" }                             // trigger cpu shot
  | { type: "reset" };

const WHITE_COUNT = 9;
const BLACK_COUNT = 9;

// Build flower pattern: queen at center, ring of 6, ring of 12.
function buildPieces(): Piece[] {
  const pieces: Piece[] = [];
  const cx = BOARD_SIZE / 2;
  const cy = BOARD_SIZE / 2;
  // Queen at center
  pieces.push({ id: 0, color: "queen", x: cx, y: cy, pocketed: false });

  // Inner ring of 6 (alternating white/black)
  const r1 = PIECE_RADIUS * 2 + 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const color: PieceColor = i % 2 === 0 ? "white" : "black";
    pieces.push({
      id: pieces.length,
      color,
      x: cx + Math.cos(a) * r1,
      y: cy + Math.sin(a) * r1,
      pocketed: false,
    });
  }

  // Outer ring of 12 (alternating starting with the opposite of inner alignment)
  const r2 = PIECE_RADIUS * 4 + 6;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const color: PieceColor = i % 2 === 0 ? "black" : "white";
    pieces.push({
      id: pieces.length,
      color,
      x: cx + Math.cos(a) * r2,
      y: cy + Math.sin(a) * r2,
      pocketed: false,
    });
  }

  // Counts inside the rings won't be exactly 9/9 (we have 6 + 12 = 18 + queen).
  // Inner ring: 3 white + 3 black. Outer: 6 white + 6 black. Total: 9 white + 9 black + 1 queen.
  return pieces;
}

export function initialState(seed: number, _settings: CarromSettings): CarromState {
  return {
    rngSeed: seed >>> 0,
    pieces: buildPieces(),
    whitePocketed: 0,
    blackPocketed: 0,
    queenPocketed: false,
    queenHolder: null,
    queenCovered: false,
    turn: "P",
    phase: "aim",
    shotsTaken: 0,
    lastShot: null,
    penalties: { P: 0, C: 0 },
    result: null,
    score: 0,
  };
}

export function isTerminal(state: CarromState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}

function ownColor(seat: Seat): PieceColor {
  return seat === "P" ? "white" : "black";
}

function ownCount(state: CarromState, seat: Seat): number {
  return seat === "P" ? state.whitePocketed : state.blackPocketed;
}

function targetCount(): number {
  return WHITE_COUNT; // both sides have 9
}

// Score helper: human-final win = 100 + bonus, draw = 25, loss = 0.
function finalScore(result: GameResult, queenBy: Seat | null): number {
  if (result === "P") return queenBy === "P" ? 125 : 100;
  if (result === "C") return 0;
  return 25;
}

// Deterministic shot resolution. The aim+power seeds a small RNG that
// selects which pieces get pocketed. The shooter's color is biased to be hit
// based on the shooter's seat; the queen is reachable only when power is
// high. Foul probability scales inversely with power balance.
function resolveShot(state: CarromState, by: Seat, angle: number, power: number, rngSeed: number): {
  pocketedIds: number[];
  pocketedQueen: boolean;
  foul: boolean;
  message: string;
  newSeed: number;
} {
  const rng = mulberry32(rngSeed);
  const newSeed = Math.floor(rng() * 2 ** 31);

  // Normalize inputs (defensive — reducer validates already).
  const a = ((angle % 360) + 360) % 360;
  const p = Math.max(1, Math.min(10, Math.floor(power)));

  // Available pieces (not yet pocketed)
  const live = state.pieces.filter(pp => !pp.pocketed);
  if (live.length === 0) {
    return { pocketedIds: [], pocketedQueen: false, foul: false, message: "No pieces on board.", newSeed };
  }

  const myColor = ownColor(by);
  const oppColor = by === "P" ? "black" : "white";

  // Roll: each piece type has a hit probability scaling with power.
  // - own color: easier to hit with moderate power.
  // - opp color: harder (foul if pocketed alone).
  // - queen: needs power >= 5 (skilled shot).

  // Use angle as a deterministic selector index across available pieces.
  const idxBase = Math.floor((a / 360) * live.length) % live.length;

  // Effective skill: base 0.35 plus 0.06 * power (max 0.95).
  const skill = Math.min(0.95, 0.35 + 0.06 * p);

  const pocketed: Piece[] = [];
  let pocketedQueen = false;

  // Primary target: cycle from idxBase looking for own color.
  let primary: Piece | null = null;
  for (let i = 0; i < live.length; i++) {
    const cand = live[(idxBase + i) % live.length]!;
    if (cand.color === myColor) { primary = cand; break; }
  }
  // If shooter has no own-color left, primary is any piece (likely will foul).
  if (primary === null) primary = live[idxBase % live.length]!;

  // Primary hit?
  if (rng() < skill) {
    pocketed.push(primary);
    if (primary.color === "queen") pocketedQueen = true;
  }

  // Secondary scatter: at higher power, additional pieces may be pocketed.
  if (p >= 4 && rng() < (p - 3) * 0.10) {
    const second = live.find(pp => pp !== primary && pp.color === myColor);
    if (second) pocketed.push(second);
  }

  // Queen attempt: if power >= 5 and queen still on board, chance to pocket.
  const queenLive = live.find(pp => pp.color === "queen");
  if (queenLive && !pocketedQueen && p >= 5 && rng() < (p - 4) * 0.12) {
    pocketed.push(queenLive);
    pocketedQueen = true;
  }

  // Opponent piece accident (foul if it's the only one pocketed, or always counts).
  if (p >= 7 && rng() < 0.18) {
    const opp = live.find(pp => pp.color === oppColor && !pocketed.includes(pp));
    if (opp) pocketed.push(opp);
  }

  // Dedup
  const ids = Array.from(new Set(pocketed.map(pp => pp.id)));

  // Foul detection:
  //   - pocketed only opponent piece(s) and nothing else = foul
  //   - pocketed nothing at all? Not a foul in carrom (just lose turn).
  //   - power 10 carries a 10% striker-pocket foul
  let foul = false;
  let foulReason = "";
  const pocketedColors = ids.map(id => state.pieces.find(pp => pp.id === id)!.color);
  const hasOwn = pocketedColors.some(c => c === myColor);
  const hasOppOnly = pocketedColors.length > 0 && !hasOwn && pocketedColors.some(c => c === oppColor);
  if (hasOppOnly) { foul = true; foulReason = "Pocketed only opponent's piece"; }
  if (!foul && p === 10 && rng() < 0.10) { foul = true; foulReason = "Striker pocketed (over-power)"; }

  let message = "";
  if (ids.length === 0) message = "No piece pocketed.";
  else {
    const names = ids.map(id => {
      const pc = state.pieces.find(pp => pp.id === id)!;
      return pc.color === "queen" ? "queen" : pc.color;
    });
    message = `Pocketed: ${names.join(", ")}`;
  }
  if (foul) message += ` — foul (${foulReason}).`;

  return { pocketedIds: ids, pocketedQueen, foul, message, newSeed };
}

// Apply a shot result to state.
function applyShot(state: CarromState, by: Seat, sr: { pocketedIds: number[]; pocketedQueen: boolean; foul: boolean; message: string; newSeed: number }): CarromState {
  let pieces = state.pieces.map(pp => ({ ...pp }));
  let whitePocketed = state.whitePocketed;
  let blackPocketed = state.blackPocketed;
  let queenPocketed = state.queenPocketed;
  let queenHolder = state.queenHolder;
  let queenCovered = state.queenCovered;
  let penalties = { ...state.penalties };

  let pocketedOwnThisShot = false;
  let pocketedQueenThisShot = false;
  const myColor = ownColor(by);

  for (const id of sr.pocketedIds) {
    const pc = pieces.find(p => p.id === id);
    if (!pc || pc.pocketed) continue;
    pc.pocketed = true;
    if (pc.color === "white") {
      whitePocketed++;
      if (myColor === "white") pocketedOwnThisShot = true;
    } else if (pc.color === "black") {
      blackPocketed++;
      if (myColor === "black") pocketedOwnThisShot = true;
    } else if (pc.color === "queen") {
      queenPocketed = true;
      queenHolder = by;
      pocketedQueenThisShot = true;
    }
  }

  // Queen "covering" rule:
  // If queen was held but not yet covered: covering requires the holder to
  // pocket one of their own pieces in the same shot OR the very next shot.
  // If queen was pocketed AND own-color also pocketed in same shot, it's covered immediately.
  if (pocketedQueenThisShot && pocketedOwnThisShot) {
    queenCovered = true;
  } else if (state.queenHolder === by && !state.queenCovered) {
    // Holder taking their follow-up shot
    if (pocketedOwnThisShot) {
      queenCovered = true;
    } else if (sr.foul || sr.pocketedIds.length === 0) {
      // Failed to cover: queen returns
      const queen = pieces.find(p => p.color === "queen");
      if (queen) {
        queen.pocketed = false;
        // Place queen back at center (board center for simplicity)
        queen.x = BOARD_SIZE / 2;
        queen.y = BOARD_SIZE / 2;
      }
      queenPocketed = false;
      queenHolder = null;
      queenCovered = false;
    }
  }

  // Foul penalty: opponent gets a +1 penalty token (counted toward us — i.e.
  // we owe a piece). In classic carrom one of the fouling player's pocketed
  // pieces is returned. Simulate by un-pocketing one piece of own color if any.
  if (sr.foul) {
    if (myColor === "white" && whitePocketed > 0) {
      const back = pieces.find(p => p.color === "white" && p.pocketed);
      if (back) { back.pocketed = false; whitePocketed--; }
    } else if (myColor === "black" && blackPocketed > 0) {
      const back = pieces.find(p => p.color === "black" && p.pocketed);
      if (back) { back.pocketed = false; blackPocketed--; }
    } else {
      // No piece to return: track penalty owed.
      penalties = { ...penalties, [by]: penalties[by] + 1 };
    }
  }

  // Determine next turn:
  // - In carrom, shooter continues if they pocketed their own color and no foul.
  // - Foul or no own-color pocketed → turn passes.
  let nextTurn: Seat = by === "P" ? "C" : "P";
  if (pocketedOwnThisShot && !sr.foul) nextTurn = by;

  // Win check: must pocket all 9 of own color AND queen covered (for whichever
  // side claimed queen). If the side has no queen claim, they must still pocket
  // the queen as part of finishing? Standard rule: the winner must also have
  // covered the queen (or queen is unclaimed at game end and is awarded to winner).
  let result: GameResult = null;
  if (whitePocketed >= WHITE_COUNT) {
    // White finishes — needs queen covered (or queen still on board → loses)
    // Simplified: white wins if queen has been pocketed-and-covered already, or
    // covers it after white's last piece (advanced rule).
    if (queenCovered || queenHolder === "P") result = "P";
    else if (queenCovered === false && !queenPocketed) result = "P"; // unclaimed queen still allows finish
  }
  if (blackPocketed >= BLACK_COUNT) {
    if (queenCovered || queenHolder === "C") result = "C";
    else if (queenCovered === false && !queenPocketed) result = "C";
  }

  const phase: Phase = result !== null ? "done" : (nextTurn === "P" ? "aim" : "cpu");
  const score = result !== null ? finalScore(result, queenHolder) : state.score;

  const lastShot: ShotResult = {
    by,
    pocketedIds: sr.pocketedIds,
    pocketedQueen: sr.pocketedQueen,
    foul: sr.foul,
    message: sr.message,
  };

  return {
    ...state,
    rngSeed: sr.newSeed,
    pieces,
    whitePocketed,
    blackPocketed,
    queenPocketed,
    queenHolder,
    queenCovered,
    penalties,
    turn: nextTurn,
    phase,
    shotsTaken: state.shotsTaken + 1,
    lastShot,
    result,
    score,
  };
}

// Pick CPU strategy: aim at the closest unblocked own-color piece toward
// nearest pocket. We translate that to (angle, power).
function pickCpuShot(state: CarromState, rngSeed: number): { angle: number; power: number; newSeed: number } {
  const rng = mulberry32(rngSeed);
  const newSeed = Math.floor(rng() * 2 ** 31);

  const myBlacks = state.pieces.filter(p => p.color === "black" && !p.pocketed);
  if (myBlacks.length === 0) {
    // Only queen left? Just take a shot.
    return { angle: Math.floor(rng() * 360), power: 5, newSeed };
  }

  // CPU "position" is bottom edge midpoint (CPU side).
  const cx = BOARD_SIZE / 2;
  const cy = BOARD_SIZE - 40;

  // Pockets
  const pockets = [
    { x: POCKET_RADIUS, y: POCKET_RADIUS },
    { x: BOARD_SIZE - POCKET_RADIUS, y: POCKET_RADIUS },
    { x: POCKET_RADIUS, y: BOARD_SIZE - POCKET_RADIUS },
    { x: BOARD_SIZE - POCKET_RADIUS, y: BOARD_SIZE - POCKET_RADIUS },
  ];

  // For each black piece, compute its distance to nearest pocket.
  let best = myBlacks[0]!;
  let bestScore = Infinity;
  for (const pp of myBlacks) {
    let nearest = Infinity;
    for (const pk of pockets) {
      const d = Math.hypot(pp.x - pk.x, pp.y - pk.y);
      if (d < nearest) nearest = d;
    }
    const dFromCpu = Math.hypot(pp.x - cx, pp.y - cy);
    const score = nearest + dFromCpu * 0.5;
    if (score < bestScore) { bestScore = score; best = pp; }
  }

  // Aim from CPU toward best piece.
  const dx = best.x - cx;
  const dy = best.y - cy;
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const angle = ((Math.round(ang) % 360) + 360) % 360;

  // Power: scaled to distance, with some randomness for variety
  const dist = Math.hypot(dx, dy);
  const p = Math.max(3, Math.min(9, Math.round(3 + (dist / BOARD_SIZE) * 7 + rng() * 1.5)));

  return { angle, power: p, newSeed };
}

export function reducer(state: CarromState, action: CarromAction): CarromState {
  if (action.type === "reset") {
    return initialState(state.rngSeed, { _dummy: false });
  }

  if (state.phase === "done") return state;

  if (action.type === "shoot") {
    if (state.turn !== "P" || state.phase !== "aim") return state;
    const angle = Number.isFinite(action.angle) ? action.angle : 0;
    const power = Number.isFinite(action.power) ? action.power : 5;
    if (power < 1 || power > 10) return state;
    const sr = resolveShot(state, "P", angle, power, state.rngSeed);
    return applyShot(state, "P", sr);
  }

  if (action.type === "cpuShoot") {
    if (state.turn !== "C" || state.phase !== "cpu") return state;
    const pick = pickCpuShot(state, state.rngSeed);
    const sr = resolveShot({ ...state, rngSeed: pick.newSeed }, "C", pick.angle, pick.power, pick.newSeed);
    return applyShot({ ...state, rngSeed: pick.newSeed }, "C", sr);
  }

  return state;
}

// Public helper for tests / UI: list pockets in canonical order.
export function pockets(): { x: number; y: number }[] {
  return [
    { x: POCKET_RADIUS, y: POCKET_RADIUS },
    { x: BOARD_SIZE - POCKET_RADIUS, y: POCKET_RADIUS },
    { x: POCKET_RADIUS, y: BOARD_SIZE - POCKET_RADIUS },
    { x: BOARD_SIZE - POCKET_RADIUS, y: BOARD_SIZE - POCKET_RADIUS },
  ];
}

// Exported for tests
export const _internal = { resolveShot, applyShot, pickCpuShot };

// TODO: advanced rules omitted
//  - Real billiards physics (kept as deterministic per-shot resolution).
//  - Striker placement freedom on the baseline.
//  - "Due" pieces (when a player is owed multiple penalty pieces).
//  - 25-point or 8-board match formats (we play a single board).
//  - Striker double-touch and "thumb shots" (back-hand) — deemed equivalent here.
