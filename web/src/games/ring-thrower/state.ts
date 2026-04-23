import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ─── Ring Thrower ─────────────────────────────────────────────────────────────
// Aim + power to throw a ring onto pegs. 10 throws per session.
// Phase sequence: pickAngle → pickPower → throwing → result → (repeat | done)

export interface RingThrowerSettings {}

export interface Peg {
  id: number;
  x: number;
  y: number;
  points: number;
  radius: number;
}

export type Phase = "pickAngle" | "pickPower" | "throwing" | "result" | "done";

export interface RingThrowerState {
  settings: RingThrowerSettings;
  pegs: readonly Peg[];
  angle: number;         // radians; oscillates in pickAngle
  power: number;         // [0,1]; oscillates in pickPower
  aimDir: 1 | -1;
  powerDir: 1 | -1;
  throwsLeft: number;
  score: number;
  phase: Phase;
  ring: { x: number; y: number; vx: number; vy: number } | null;
  lastPoints: number | null;
  over: boolean;
  rngSeed: number;
}

export type RingThrowerAction =
  | { type: "tick"; dt: number }
  | { type: "tap" };

// ─── Constants ────────────────────────────────────────────────────────────────
const THROWER_X = 0.5;
const THROWER_Y = 0.92;
const RING_SPEED_MIN = 0.5;
const RING_SPEED_MAX = 1.4;
const GRAVITY = 0.8;
const ANGLE_SPEED = 1.2;
const POWER_SPEED = 0.85;
const RING_R = 0.028;
const TOTAL_THROWS = 10;

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

function buildPegs(seed: number): { pegs: Peg[]; rngSeed: number } {
  const pegs: Peg[] = [];
  let rngSeed = seed;
  const configs = [
    { points: 10, r: 0.032, count: 1 },
    { points: 5,  r: 0.042, count: 2 },
    { points: 3,  r: 0.052, count: 3 },
    { points: 1,  r: 0.065, count: 4 },
  ];
  let id = 1;
  for (const cfg of configs) {
    for (let i = 0; i < cfg.count; i++) {
      const r1 = rng2(rngSeed);
      rngSeed = r1.next;
      const r2 = rng2(rngSeed);
      rngSeed = r2.next;
      const x = 0.1 + r1.val * 0.8;
      const y = 0.12 + r2.val * 0.55;
      pegs.push({ id: id++, x, y, points: cfg.points, radius: cfg.r });
    }
  }
  return { pegs, rngSeed };
}

export function initialState(seed: number, settings: RingThrowerSettings): RingThrowerState {
  const { pegs, rngSeed } = buildPegs(seed);
  return {
    settings,
    pegs,
    angle: -Math.PI * 0.5,
    power: 0,
    aimDir: 1,
    powerDir: 1,
    throwsLeft: TOTAL_THROWS,
    score: 0,
    phase: "pickAngle",
    ring: null,
    lastPoints: null,
    over: false,
    rngSeed,
  };
}

export function reducer(state: RingThrowerState, action: RingThrowerAction): RingThrowerState {
  if (state.over) return state;

  switch (action.type) {
    case "tap": {
      switch (state.phase) {
        case "pickAngle":
          // Lock angle, move to power picking
          return { ...state, phase: "pickPower", power: 0.01, powerDir: 1 };

        case "pickPower": {
          // Lock power, launch ring
          const speed = RING_SPEED_MIN + state.power * (RING_SPEED_MAX - RING_SPEED_MIN);
          const vx = Math.cos(state.angle) * speed;
          const vy = Math.sin(state.angle) * speed;
          return {
            ...state,
            phase: "throwing",
            throwsLeft: state.throwsLeft - 1,
            ring: { x: THROWER_X, y: THROWER_Y, vx, vy },
            lastPoints: null,
          };
        }

        case "result": {
          if (state.throwsLeft <= 0) {
            return { ...state, phase: "done", over: true };
          }
          return {
            ...state,
            phase: "pickAngle",
            ring: null,
            angle: -Math.PI * 0.5,
            power: 0,
            aimDir: 1,
            powerDir: 1,
          };
        }

        default:
          return state;
      }
    }

    case "tick": {
      const { dt } = action;

      if (state.phase === "pickAngle") {
        let { angle, aimDir } = state;
        angle += aimDir * ANGLE_SPEED * dt;
        if (angle >= -Math.PI * 0.12) { angle = -Math.PI * 0.12; aimDir = -1; }
        if (angle <= -Math.PI * 0.88) { angle = -Math.PI * 0.88; aimDir = 1; }
        return { ...state, angle, aimDir };
      }

      if (state.phase === "pickPower") {
        let { power, powerDir } = state;
        power += powerDir * POWER_SPEED * dt;
        if (power >= 1) { power = 1; powerDir = -1; }
        if (power <= 0) { power = 0; powerDir = 1; }
        return { ...state, power, powerDir };
      }

      if (state.phase === "throwing" && state.ring) {
        let { x, y, vx, vy } = state.ring;
        vy += GRAVITY * dt;
        x += vx * dt;
        y += vy * dt;

        // Check peg collisions
        for (const peg of state.pegs) {
          const dx = x - peg.x;
          const dY = y - peg.y;
          if (Math.sqrt(dx * dx + dY * dY) < peg.radius + RING_R) {
            return {
              ...state,
              ring: { x, y, vx, vy },
              score: state.score + peg.points,
              lastPoints: peg.points,
              phase: "result",
            };
          }
        }

        // Out of bounds → miss
        if (x < -0.1 || x > 1.1 || y < -0.6 || y > 1.05) {
          return { ...state, ring: null, lastPoints: 0, phase: "result" };
        }

        return { ...state, ring: { x, y, vx, vy } };
      }

      return state;
    }

    default:
      return state;
  }
}

export function isTerminal(state: RingThrowerState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}
