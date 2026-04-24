// ─── Cannon Shot ─────────────────────────────────────────────────────────────
// Aim and fire a cannonball at a target. Euler integration, drag, gravity.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CannonShotSettings {
  rounds: "5" | "7" | "10";
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

export interface CannonShotState {
  settings: CannonShotSettings;
  angle: number;       // degrees, 0-90
  power: number;       // 10-100
  targetX: number;     // normalized [0,1]
  targetY: number;     // normalized
  targetRadius: number;
  projectile: Projectile | null;
  round: number;
  totalRounds: number;
  score: number;
  lastHit: boolean | null;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type CannonShotAction =
  | { type: "setAngle"; angle: number }
  | { type: "setPower"; power: number }
  | { type: "fire" }
  | { type: "tick"; dt: number };

const GRAVITY = 0.45; // units/sec^2
const DRAG = 0.01;

function nextTarget(seed: number, counter: number): { tx: number; ty: number; tr: number } {
  const rng = mulberry32(seed + counter * 999983);
  return {
    tx: 0.45 + rng() * 0.45,
    ty: 0.3 + rng() * 0.4,
    tr: 0.04 + rng() * 0.04,
  };
}

export function initialState(seed: number, settings: CannonShotSettings): CannonShotState {
  const totalRounds = parseInt(settings.rounds, 10);
  const { tx, ty, tr } = nextTarget(seed, 0);
  return {
    settings,
    angle: 45,
    power: 60,
    targetX: tx,
    targetY: ty,
    targetRadius: tr,
    projectile: null,
    round: 1,
    totalRounds,
    score: 0,
    lastHit: null,
    over: false,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: CannonShotState, action: CannonShotAction): CannonShotState {
  if (state.over) return state;

  switch (action.type) {
    case "setAngle":
      if (state.projectile) return state;
      return { ...state, angle: Math.max(0, Math.min(90, action.angle)) };

    case "setPower":
      if (state.projectile) return state;
      return { ...state, power: Math.max(10, Math.min(100, action.power)) };

    case "fire": {
      if (state.projectile) return state;
      const rad = (state.angle * Math.PI) / 180;
      const speed = state.power * 0.006;
      return {
        ...state,
        projectile: {
          x: 0.05,
          y: 0.75,
          vx: Math.cos(rad) * speed,
          vy: -Math.sin(rad) * speed,
          active: true,
        },
        lastHit: null,
      };
    }

    case "tick": {
      if (!state.projectile || !state.projectile.active) return state;
      const { dt } = action;
      let { x, y, vx, vy } = state.projectile;

      // Euler + drag
      vx -= vx * DRAG * dt;
      vy -= vy * DRAG * dt;
      vy += GRAVITY * dt;
      x += vx * dt;
      y += vy * dt;

      // Off screen or hit ground
      if (x > 1.1 || y > 0.85 || x < 0) {
        // Miss - next round
        const newRound = state.round + 1;
        const over = newRound > state.totalRounds;
        const counter = state.rngCounter + 1;
        const { tx, ty, tr } = nextTarget(state.rngSeed, counter);
        return {
          ...state,
          projectile: null,
          lastHit: false,
          round: over ? state.totalRounds : newRound,
          over,
          ...(over ? {} : { targetX: tx, targetY: ty, targetRadius: tr }),
          rngCounter: counter,
        };
      }

      // Check target hit
      const dx = x - state.targetX;
      const dy = y - state.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < state.targetRadius) {
        const precision = Math.max(0, 1 - dist / state.targetRadius);
        const pts = Math.round(50 + precision * 50);
        const newRound = state.round + 1;
        const over = newRound > state.totalRounds;
        const counter = state.rngCounter + 1;
        const { tx, ty, tr } = nextTarget(state.rngSeed, counter);
        return {
          ...state,
          projectile: null,
          lastHit: true,
          score: state.score + pts,
          round: over ? state.totalRounds : newRound,
          over,
          ...(over ? {} : { targetX: tx, targetY: ty, targetRadius: tr }),
          rngCounter: counter,
        };
      }

      return { ...state, projectile: { x, y, vx, vy, active: true } };
    }

    default:
      return state;
  }
}

export function isTerminal(state: CannonShotState): { score: number } | null {
  if (!state.over) return null;
  return { score: state.score };
}
