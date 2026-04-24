// ─── Skee Ball ───────────────────────────────────────────────────────────────
// Roll a ball up the lane; it flies off the ramp and lands in a ring for points.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface SkeeBallSettings {
  balls: "5" | "9" | "12";
}

export interface SkeeBallState {
  settings: SkeeBallSettings;
  totalBalls: number;
  ballsThrown: number;
  score: number;
  // Throw input: swipe speed [-1,1] — power bar swings
  powerPhase: number;   // oscillates
  powerSpeed: number;
  // Ball flight (simple parabola parameterized)
  ballInFlight: boolean;
  ballT: number;    // t from 0 to 1 along flight path
  launchPower: number;
  launchLane: number;   // [-1,1] lateral offset
  landX: number;   // where ball lands
  landY: number;   // distance in lane
  lastRing: number | null;  // ring index hit (0=outer, 4=bull)
  lastScore: number | null;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type SkeeBallAction =
  | { type: "tick"; dt: number }
  | { type: "setLane"; lane: number }
  | { type: "throw" };

const RING_SCORES = [10, 20, 40, 60, 100];
const RING_RADII = [1.0, 0.75, 0.5, 0.3, 0.12];

function ringFromDist(dist: number): number | null {
  for (let i = 0; i < RING_RADII.length; i++) {
    if (dist <= RING_RADII[i]!) return i;
  }
  return null;
}

function addNoise(seed: number, counter: number): { nx: number; ny: number } {
  const rng = mulberry32(seed + counter * 54321);
  return {
    nx: (rng() - 0.5) * 0.15,
    ny: (rng() - 0.5) * 0.1,
  };
}

export function initialState(seed: number, settings: SkeeBallSettings): SkeeBallState {
  const totalBalls = parseInt(settings.balls, 10);
  const rng = mulberry32(seed);
  return {
    settings,
    totalBalls,
    ballsThrown: 0,
    score: 0,
    powerPhase: 0,
    powerSpeed: 1.8 + rng() * 1.0,
    ballInFlight: false,
    ballT: 0,
    launchPower: 0.5,
    launchLane: 0,
    landX: 0,
    landY: 0,
    lastRing: null,
    lastScore: null,
    over: false,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: SkeeBallState, action: SkeeBallAction): SkeeBallState {
  if (state.over) return state;

  switch (action.type) {
    case "setLane":
      if (state.ballInFlight) return state;
      return { ...state, launchLane: Math.max(-1, Math.min(1, action.lane)) };

    case "tick": {
      const { dt } = action;
      if (!state.ballInFlight) {
        // Oscillate power bar
        const newPhase = (state.powerPhase + state.powerSpeed * dt) % (Math.PI * 2);
        const power = (Math.sin(newPhase) + 1) / 2; // [0,1]
        return { ...state, powerPhase: newPhase, launchPower: power };
      }
      // Ball in flight
      const newT = state.ballT + dt * 1.2;
      if (newT >= 1) {
        // Land
        const { nx, ny } = addNoise(state.rngSeed, state.rngCounter);
        const finalX = state.landX + nx;
        const finalY = state.landY + ny;
        const dist = Math.sqrt(finalX * finalX + finalY * finalY);
        const ring = ringFromDist(dist);
        const pts = ring !== null ? RING_SCORES[ring]! : 0;
        const newThrown = state.ballsThrown + 1;
        const over = newThrown >= state.totalBalls;
        const rng = mulberry32(state.rngSeed + state.rngCounter * 31337);
        const newSpeed = 1.8 + rng() * 1.0;
        return {
          ...state,
          ballInFlight: false,
          ballT: 0,
          lastRing: ring ?? -1,
          lastScore: pts,
          score: state.score + pts,
          ballsThrown: newThrown,
          over,
          powerPhase: 0,
          powerSpeed: over ? state.powerSpeed : newSpeed,
          rngCounter: state.rngCounter + 1,
        };
      }
      return { ...state, ballT: newT };
    }

    case "throw": {
      if (state.ballInFlight || state.ballsThrown >= state.totalBalls) return state;
      // landX based on launchLane; landY based on launchPower
      // Perfect power (0.85) = center, too high/low = miss
      const powerDiff = state.launchPower - 0.75;
      const landY = powerDiff * 1.5; // maps power deviation to vertical offset
      const landX = state.launchLane * 0.8;
      return {
        ...state,
        ballInFlight: true,
        ballT: 0,
        landX,
        landY,
        lastScore: null,
        lastRing: null,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: SkeeBallState): { score: number } | null {
  if (!state.over) return null;
  return { score: state.score };
}
