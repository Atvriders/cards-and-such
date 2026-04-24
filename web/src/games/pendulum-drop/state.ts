// ─── Pendulum Drop ────────────────────────────────────────────────────────────
// A ball swings on a pendulum; tap to release it. It falls into a score cup.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface PendulumDropSettings {
  swings: "5" | "8" | "12";
}

export interface PendulumDropState {
  settings: PendulumDropSettings;
  totalSwings: number;
  swingsUsed: number;
  score: number;
  // Pendulum
  angle: number;   // radians from vertical
  angleVel: number;
  pivotX: number;
  pivotY: number;
  ropeLen: number;
  // Ball
  ballX: number;
  ballY: number;
  // Released ball physics
  released: boolean;
  ballVx: number;
  ballVy: number;
  // Cups (target zones)
  cups: readonly { x: number; pts: number }[];
  lastScore: number | null;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type PendulumDropAction =
  | { type: "tick"; dt: number }
  | { type: "release" };

const GRAVITY = 9.8;
const ROPE_LEN = 0.4;
const PIVOT_X = 0.5;
const PIVOT_Y = 0.1;

function buildCups(seed: number, counter: number): { x: number; pts: number }[] {
  const rng = mulberry32(seed + counter * 4127);
  const shuffleIdx = Math.floor(rng() * 3);
  const cups = [
    { x: 0.2, pts: 10 },
    { x: 0.5, pts: 30 },
    { x: 0.8, pts: 10 },
  ];
  // Randomly place the high-value cup
  const highPts = 50;
  cups[shuffleIdx] = { x: cups[shuffleIdx]!.x, pts: highPts };
  return cups;
}

export function initialState(seed: number, settings: PendulumDropSettings): PendulumDropState {
  const totalSwings = parseInt(settings.swings, 10);
  const cups = buildCups(seed, 0);
  const angle = 0.9; // start swung to the right
  const ballX = PIVOT_X + Math.sin(angle) * ROPE_LEN;
  const ballY = PIVOT_Y + Math.cos(angle) * ROPE_LEN;
  return {
    settings,
    totalSwings,
    swingsUsed: 0,
    score: 0,
    angle,
    angleVel: 0,
    pivotX: PIVOT_X,
    pivotY: PIVOT_Y,
    ropeLen: ROPE_LEN,
    ballX,
    ballY,
    released: false,
    ballVx: 0,
    ballVy: 0,
    cups,
    lastScore: null,
    over: false,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: PendulumDropState, action: PendulumDropAction): PendulumDropState {
  if (state.over) return state;

  switch (action.type) {
    case "tick": {
      const { dt } = action;

      if (!state.released) {
        // Pendulum physics: α = -(g/L) sin(θ)
        const alpha = -(GRAVITY / ROPE_LEN) * Math.sin(state.angle);
        const newVel = state.angleVel + alpha * dt;
        const newAngle = state.angle + newVel * dt;
        const ballX = state.pivotX + Math.sin(newAngle) * state.ropeLen;
        const ballY = state.pivotY + Math.cos(newAngle) * state.ropeLen;
        return { ...state, angle: newAngle, angleVel: newVel, ballX, ballY };
      }

      // Ball free-fall
      let { ballX, ballVx, ballY, ballVy } = state;
      ballVy += GRAVITY * 0.05 * dt;
      ballX += ballVx * dt;
      ballY += ballVy * dt;

      // Check if ball hits cup zone (y ~ 0.85)
      if (ballY >= 0.82) {
        let pts = 0;
        for (const cup of state.cups) {
          if (Math.abs(ballX - cup.x) < 0.08) {
            pts = cup.pts;
            break;
          }
        }
        const counter = state.rngCounter + 1;
        const newSwings = state.swingsUsed + 1;
        const over = newSwings >= state.totalSwings;
        const cups = over ? state.cups : buildCups(state.rngSeed, counter);
        const angle = 0.9;
        const bx = PIVOT_X + Math.sin(angle) * ROPE_LEN;
        const by = PIVOT_Y + Math.cos(angle) * ROPE_LEN;
        return {
          ...state,
          swingsUsed: newSwings,
          score: state.score + pts,
          lastScore: pts,
          released: false,
          angle,
          angleVel: 0,
          ballX: bx,
          ballY: by,
          ballVx: 0,
          ballVy: 0,
          cups,
          over,
          rngCounter: counter,
        };
      }

      return { ...state, ballX, ballY, ballVx, ballVy };
    }

    case "release": {
      if (state.released || state.over) return state;
      // Release with current pendulum velocity
      const speed = state.angleVel * state.ropeLen;
      return {
        ...state,
        released: true,
        ballVx: Math.cos(state.angle) * speed,
        ballVy: Math.sin(state.angle) * speed + 0.05,
        lastScore: null,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: PendulumDropState): { score: number } | null {
  if (!state.over) return null;
  return { score: state.score };
}
