// ─── Crokinole (Full Tournament) ─────────────────────────────────────────
// Flick discs from the rim toward the center 20-hole. Opponent discs can be
// knocked out. Pegs in the 15-point ring deflect any disc that hits them.
// Standard "touch opponent" rule applies when an opponent has a disc on the
// board. First to 100 across rounds wins.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ── Board geometry (state-space units) ──────────────────────────────────
export const BOARD_RADIUS = 200;        // outer rim radius
export const RING_OUTER = 150;          // outer ring (5 pts) inner edge of the 5-pt zone is 150… 200
export const RING_MIDDLE = 100;         // 10-pt ring boundary
export const RING_INNER = 50;           // 15-pt ring boundary
export const HOLE_RADIUS = 12;          // 20-pt center hole
export const PEG_RADIUS = 4;
export const PEG_RING_RADIUS = 50;      // 8 pegs around 15-point ring
export const DISC_RADIUS = 9;
export const FRICTION = 0.985;          // per-tick velocity decay
export const STOP_THRESHOLD = 0.05;     // velocity below which a disc stops
export const MAX_SPEED = 18;            // cap launch speed
export const TICK_DT = 1;               // sim runs in arbitrary units

export type Owner = 0 | 1; // 0 = human, 1 = CPU

export interface Disc {
  id: number;
  owner: Owner;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;       // false if removed (off-board) or holed
  holed: boolean;       // captured by 20-point hole
  touchedOpp: boolean;  // tracks whether this shot has touched an opponent disc
}

export interface Peg {
  x: number;
  y: number;
}

export type Phase = "aim" | "sim" | "round-end" | "done";

export interface CrokinoleSettings {
  discsPerPlayer: "6" | "12";
  target: "60" | "100";
}

export interface CrokinoleState {
  settings: CrokinoleSettings;
  pegs: readonly Peg[];
  discs: readonly Disc[];
  // Whose turn to shoot. Alternates per shot.
  turn: Owner;
  // How many discs each player has left to shoot this round.
  remaining: [number, number];
  // Cumulative score across rounds.
  score: [number, number];
  // Round counter (1-based for display, 0-based internally before first round)
  round: number;
  // Discs shot in current round (in order). The first shooter alternates each round.
  firstShooter: Owner;
  phase: Phase;
  nextDiscId: number;
  // For reporting: most recent round's scoreboard
  lastRoundScore: [number, number];
  // The last shot's launch info (for UI replay/feedback)
  lastShot: { owner: Owner; success: boolean; reason: string } | null;
  // RNG
  rngSeed: number;
  rngCounter: number;
}

export type CrokinoleAction =
  | { type: "shoot"; angle: number; power: number; from?: { x: number; y: number } }
  | { type: "tick" }
  | { type: "next-round" }
  | { type: "reset" };

// ── Helpers ─────────────────────────────────────────────────────────────
function buildPegs(): Peg[] {
  const pegs: Peg[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    pegs.push({ x: Math.cos(a) * PEG_RING_RADIUS, y: Math.sin(a) * PEG_RING_RADIUS });
  }
  return pegs;
}

export function initialState(seed: number, settings: CrokinoleSettings): CrokinoleState {
  return {
    settings,
    pegs: buildPegs(),
    discs: [],
    turn: 0,
    remaining: [parseInt(settings.discsPerPlayer, 10), parseInt(settings.discsPerPlayer, 10)],
    score: [0, 0],
    round: 1,
    firstShooter: 0,
    phase: "aim",
    nextDiscId: 1,
    lastRoundScore: [0, 0],
    lastShot: null,
    rngSeed: seed,
    rngCounter: 0,
  };
}

// Determine whether an owner currently has at least one alive (non-holed,
// on-board) disc on the playing surface.
export function opponentHasDiscs(state: CrokinoleState, opp: Owner): boolean {
  return state.discs.some(d => d.owner === opp && d.alive && !d.holed);
}

// Ring/hole scoring for a single resting disc position.
function discRingValue(d: Disc): number {
  if (d.holed) return 20;
  const r = Math.hypot(d.x, d.y);
  if (r > BOARD_RADIUS) return 0;        // off-board (shouldn't be alive)
  if (r <= RING_INNER) return 15;
  if (r <= RING_MIDDLE) return 10;
  if (r <= RING_OUTER) return 5;
  return 0;
}

// Score a round per Crokinole rule: each player tallies their own discs'
// ring values (plus 20 per holed disc) but opponent discs subtract from your
// own ring contributions. We implement the standard simplification:
//   raw[p] = sum(ringValue for own discs)
//   net[p] = max(0, raw[p] - raw[1-p])  → no, actual Crokinole uses
// the difference of totals as a single number; here we award gross points
// per player but the opponent's gross is subtracted out so the per-player
// score is min 0.
function scoreRound(state: CrokinoleState): [number, number] {
  let p0 = 0, p1 = 0;
  for (const d of state.discs) {
    if (!d.alive && !d.holed) continue;
    const v = discRingValue(d);
    if (d.owner === 0) p0 += v;
    else p1 += v;
  }
  // Net positive only to the player with the higher gross.
  const diff = p0 - p1;
  if (diff > 0) return [diff, 0];
  if (diff < 0) return [0, -diff];
  return [0, 0];
}

// Apply per-tick physics: linear motion + friction + disc/disc + disc/peg
// collisions + boundary check (off-board removal) + holed-check.
function stepPhysics(state: CrokinoleState): CrokinoleState {
  const discs = state.discs.map(d => ({ ...d }));

  // 1. Integrate
  for (const d of discs) {
    if (!d.alive) continue;
    d.x += d.vx * TICK_DT;
    d.y += d.vy * TICK_DT;
    d.vx *= FRICTION;
    d.vy *= FRICTION;
  }

  // 2. Peg collisions (pegs are fixed; elastic reflection)
  for (const d of discs) {
    if (!d.alive) continue;
    for (const peg of state.pegs) {
      const dx = d.x - peg.x;
      const dy = d.y - peg.y;
      const dist = Math.hypot(dx, dy);
      const min = DISC_RADIUS + PEG_RADIUS;
      if (dist < min && dist > 0.0001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const vDotN = d.vx * nx + d.vy * ny;
        if (vDotN < 0) {
          d.vx -= 2 * vDotN * nx;
          d.vy -= 2 * vDotN * ny;
        }
        // Push out of peg
        d.x = peg.x + nx * (min + 0.01);
        d.y = peg.y + ny * (min + 0.01);
      }
    }
  }

  // 3. Disc/disc collisions (elastic, equal mass)
  for (let i = 0; i < discs.length; i++) {
    const a = discs[i]!;
    if (!a.alive) continue;
    for (let j = i + 1; j < discs.length; j++) {
      const b = discs[j]!;
      if (!b.alive) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const min = DISC_RADIUS * 2;
      if (dist < min && dist > 0.0001) {
        const nx = dx / dist;
        const ny = dy / dist;
        // Separate so they no longer overlap
        const overlap = min - dist;
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;
        // Equal-mass elastic exchange along normal
        const vAn = a.vx * nx + a.vy * ny;
        const vBn = b.vx * nx + b.vy * ny;
        a.vx += (vBn - vAn) * nx;
        a.vy += (vBn - vAn) * ny;
        b.vx += (vAn - vBn) * nx;
        b.vy += (vAn - vBn) * ny;
        // Mark "shot has touched opponent" for whichever was the moving shot
        if (a.owner !== b.owner) {
          a.touchedOpp = true;
          b.touchedOpp = true;
        }
      }
    }
  }

  // 4. Boundary + hole + stopping check
  for (const d of discs) {
    if (!d.alive) continue;
    const r = Math.hypot(d.x, d.y);
    if (r <= HOLE_RADIUS) {
      d.holed = true;
      d.alive = false;
      d.vx = 0; d.vy = 0;
      continue;
    }
    if (r > BOARD_RADIUS) {
      d.alive = false;
      d.vx = 0; d.vy = 0;
      continue;
    }
    // Stop if very slow
    if (Math.hypot(d.vx, d.vy) < STOP_THRESHOLD) {
      d.vx = 0; d.vy = 0;
    }
  }

  return { ...state, discs };
}

// Check whether every disc is at rest.
function allAtRest(state: CrokinoleState): boolean {
  return state.discs.every(d => !d.alive || (d.vx === 0 && d.vy === 0));
}

// Resolve the just-finished shot. Applies the "must touch opponent" rule:
// if the shooter had to touch an opponent and didn't, remove the shooter's
// in-play disc(s) from this shot (last placed) plus discs the shot displaced
// — simplified: remove the shooter's newest disc and revert any opponent
// disc that this shot knocked off (skipped here for simplicity).
function resolveShot(state: CrokinoleState, shooter: Owner, hadOpp: boolean): CrokinoleState {
  let discs = state.discs.map(d => ({ ...d }));
  let success = true;
  let reason = "OK";

  if (hadOpp) {
    // Find the shooter's most recently launched disc (highest id among shooter's discs that we tracked this shot).
    // Simpler: it's the LAST disc in the array that belongs to shooter and was launched this shot. We use id ordering.
    const myDiscs = discs.filter(d => d.owner === shooter);
    if (myDiscs.length > 0) {
      const last = myDiscs.reduce((a, b) => (a.id > b.id ? a : b));
      if (!last.touchedOpp && (last.alive || last.holed)) {
        // Penalty: remove this shot's disc from board.
        last.alive = false;
        last.holed = false;
        last.vx = 0; last.vy = 0;
        // Sentinel position off-board
        last.x = 9999; last.y = 9999;
        success = false;
        reason = "Did not touch opponent — disc removed";
      }
    }
  }

  // Clear per-shot flags
  for (const d of discs) d.touchedOpp = false;

  return {
    ...state,
    discs,
    lastShot: { owner: shooter, success, reason },
  };
}

// Advance to next shooter or round-end.
function advanceTurn(state: CrokinoleState): CrokinoleState {
  const next = (state.turn === 0 ? 1 : 0) as Owner;
  const remaining: [number, number] = [...state.remaining];
  // The shooter already used one disc when "shoot" was dispatched.
  const total = remaining[0] + remaining[1];
  if (total <= 0) {
    // Round complete
    const round = scoreRound(state);
    const newScore: [number, number] = [state.score[0] + round[0], state.score[1] + round[1]];
    const target = parseInt(state.settings.target, 10);
    const won = newScore[0] >= target || newScore[1] >= target;
    return {
      ...state,
      remaining,
      score: newScore,
      lastRoundScore: round,
      phase: won ? "done" : "round-end",
    };
  }
  // If one side is out of discs, force the other to keep shooting.
  let nextTurn: Owner = next;
  if (remaining[nextTurn] === 0) {
    nextTurn = (1 - nextTurn) as Owner;
  }
  return { ...state, turn: nextTurn, phase: "aim", remaining };
}

export function reducer(state: CrokinoleState, action: CrokinoleAction): CrokinoleState {
  if (state.phase === "done") {
    if (action.type === "reset") return initialState(state.rngSeed, state.settings);
    return state;
  }

  switch (action.type) {
    case "shoot": {
      if (state.phase !== "aim") return state;
      if (state.remaining[state.turn] <= 0) return state;
      const shooter = state.turn;
      const hadOpp = opponentHasDiscs(state, (1 - shooter) as Owner);

      // Launch from rim — caller may pass an exact origin (drag start) or we
      // pick a default based on shooter side.
      const angle = action.angle;
      const power = Math.max(0, Math.min(1, action.power));
      const speed = power * MAX_SPEED;

      const origin = action.from ?? {
        x: 0,
        y: shooter === 0 ? BOARD_RADIUS - DISC_RADIUS - 2 : -(BOARD_RADIUS - DISC_RADIUS - 2),
      };

      const newDisc: Disc = {
        id: state.nextDiscId,
        owner: shooter,
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alive: true,
        holed: false,
        touchedOpp: false,
      };

      const remaining: [number, number] = [...state.remaining];
      remaining[shooter] = remaining[shooter] - 1;

      return {
        ...state,
        discs: [...state.discs, newDisc],
        nextDiscId: state.nextDiscId + 1,
        remaining,
        phase: "sim",
        // tag the shot info so tick→resolve knows who shot & whether they had to touch opp
        lastShot: { owner: shooter, success: true, reason: hadOpp ? "pending-touch" : "free" },
      };
    }

    case "tick": {
      if (state.phase !== "sim") return state;
      let next = stepPhysics(state);
      if (allAtRest(next)) {
        const shooter = state.lastShot ? state.lastShot.owner : state.turn;
        const hadOpp = state.lastShot?.reason === "pending-touch";
        next = resolveShot(next, shooter, hadOpp);
        // After resolving, advance turn / round
        next = advanceTurn(next);
      }
      return next;
    }

    case "next-round": {
      if (state.phase !== "round-end") return state;
      const target = parseInt(state.settings.target, 10);
      if (state.score[0] >= target || state.score[1] >= target) {
        return { ...state, phase: "done" };
      }
      const perPlayer = parseInt(state.settings.discsPerPlayer, 10);
      const firstShooter = (1 - state.firstShooter) as Owner;
      return {
        ...state,
        discs: [],
        remaining: [perPlayer, perPlayer],
        turn: firstShooter,
        firstShooter,
        round: state.round + 1,
        phase: "aim",
        lastShot: null,
      };
    }

    case "reset":
      return initialState(state.rngSeed, state.settings);

    default:
      return state;
  }
}

export function isTerminal(state: CrokinoleState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Player 0 (human) score returned. Loss = 0.
  if (state.score[0] > state.score[1]) return { score: state.score[0] };
  return { score: 0 };
}

// CPU strategy: simple aim at the nearest opponent disc (must-touch case) or
// straight at the hole otherwise. Returns {angle, power, from}.
export function cpuPlan(state: CrokinoleState): { angle: number; power: number; from: { x: number; y: number } } {
  const shooter: Owner = 1;
  const origin = { x: 0, y: -(BOARD_RADIUS - DISC_RADIUS - 2) };
  const hadOpp = opponentHasDiscs(state, 0);

  if (hadOpp) {
    // Aim at nearest live opponent disc.
    const opps = state.discs.filter(d => d.owner === 0 && d.alive && !d.holed);
    let best: Disc | null = null;
    let bestDist = Infinity;
    for (const o of opps) {
      const dx = o.x - origin.x;
      const dy = o.y - origin.y;
      const d = Math.hypot(dx, dy);
      if (d < bestDist) { bestDist = d; best = o; }
    }
    if (best) {
      const angle = Math.atan2(best.y - origin.y, best.x - origin.x);
      // Power scales with distance.
      const power = Math.min(1, 0.5 + bestDist / (BOARD_RADIUS * 2.2));
      const rng = mulberry32(state.rngSeed + state.rngCounter * 4099 + 17);
      const jitter = (rng() - 0.5) * 0.08; // small aim noise
      return { angle: angle + jitter, power, from: origin };
    }
  }

  // No must-touch — aim at center (the hole), modest power.
  const angle = Math.atan2(0 - origin.y, 0 - origin.x);
  const rng = mulberry32(state.rngSeed + state.rngCounter * 4099 + 23);
  const jitter = (rng() - 0.5) * 0.06;
  // Try to thread through pegs — power tuned to ~0.55–0.7
  return { angle: angle + jitter, power: 0.62, from: origin };
}
