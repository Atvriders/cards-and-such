// ─── Axe Throw ───────────────────────────────────────────────────────────────
// Time your throw — axe spins in flight, must hit log face-on (blade first).

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AxeThrowSettings {
  rounds: "5" | "7" | "10";
}

export interface AxeThrowState {
  settings: AxeThrowSettings;
  totalRounds: number;
  round: number;
  score: number;
  // Throw timing bar: pendulum swings left-right
  swingPhase: number;  // [0, 2π]
  swingSpeed: number;
  throwing: boolean;
  // Axe flight
  axeX: number;  // [0,1]
  axeY: number;  // [0,1]
  axeVx: number;
  axeVy: number;
  axeAngle: number;  // rotation radians
  axeSpinRate: number;
  landed: boolean;
  lastScore: number | null;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type AxeThrowAction =
  | { type: "tick"; dt: number }
  | { type: "throw" }
  | { type: "nextRound" };

const LOG_X = 0.85;
const LOG_Y = 0.5;
const LOG_RADIUS = 0.12;

function genRound(seed: number, counter: number): { swingSpeed: number } {
  const rng = mulberry32(seed + counter * 31337);
  return { swingSpeed: 1.5 + rng() * 1.5 };
}

export function initialState(seed: number, settings: AxeThrowSettings): AxeThrowState {
  const totalRounds = parseInt(settings.rounds, 10);
  const { swingSpeed } = genRound(seed, 0);
  return {
    settings,
    totalRounds,
    round: 1,
    score: 0,
    swingPhase: 0,
    swingSpeed,
    throwing: false,
    axeX: 0.1,
    axeY: 0.5,
    axeVx: 0,
    axeVy: 0,
    axeAngle: 0,
    axeSpinRate: 0,
    landed: false,
    lastScore: null,
    over: false,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: AxeThrowState, action: AxeThrowAction): AxeThrowState {
  if (state.over) return state;

  switch (action.type) {
    case "tick": {
      const { dt } = action;
      if (state.landed) return state;

      if (!state.throwing) {
        // Swing pendulum
        const newPhase = (state.swingPhase + state.swingSpeed * dt) % (Math.PI * 2);
        return { ...state, swingPhase: newPhase };
      }

      // Axe in flight
      let { axeX, axeY, axeVx, axeVy, axeAngle } = state;
      axeX += axeVx * dt;
      axeY += axeVy * dt;
      axeVy += 0.1 * dt; // mild gravity
      axeAngle += state.axeSpinRate * dt;

      // Check log hit
      const dx = axeX - LOG_X;
      const dy = axeY - LOG_Y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < LOG_RADIUS + 0.04 || axeX > 1.0) {
        // Check blade angle: axe blade should be roughly pointing at log (angle ~0 = horizontal right)
        const normalizedAngle = ((axeAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const stickAngle = Math.min(normalizedAngle, Math.PI * 2 - normalizedAngle);
        const stuck = dist < LOG_RADIUS + 0.04 && stickAngle < 0.5;
        const precision = stuck ? Math.max(0, 1 - dist / LOG_RADIUS) : 0;
        const pts = stuck ? Math.round(20 + precision * 80) : 0;

        const newRound = state.round + 1;
        const over = newRound > state.totalRounds;
        const counter = state.rngCounter + 1;
        const { swingSpeed } = genRound(state.rngSeed, counter);
        return {
          ...state,
          axeX,
          axeY,
          axeAngle,
          landed: true,
          lastScore: pts,
          score: state.score + pts,
          round: over ? state.totalRounds : newRound,
          over,
          throwing: false,
          swingPhase: 0,
          swingSpeed: over ? state.swingSpeed : swingSpeed,
          rngCounter: counter,
        };
      }

      return { ...state, axeX, axeY, axeVx, axeVy, axeAngle };
    }

    case "throw": {
      if (state.throwing || state.landed || state.over) return state;
      // Swing value [-1,1] from phase
      const swingVal = Math.sin(state.swingPhase);
      const speed = 0.6;
      return {
        ...state,
        throwing: true,
        landed: false,
        axeX: 0.1,
        axeY: 0.5 + swingVal * 0.2,
        axeVx: speed,
        axeVy: swingVal * 0.1,
        axeSpinRate: Math.PI * 2.5,
        lastScore: null,
      };
    }

    case "nextRound": {
      if (!state.landed) return state;
      return { ...state, landed: false, axeX: 0.1, axeY: 0.5, axeVx: 0, axeVy: 0, axeAngle: 0 };
    }

    default:
      return state;
  }
}

export function isTerminal(state: AxeThrowState): { score: number } | null {
  if (!state.over) return null;
  return { score: state.score };
}
