// ─── Archery Target ──────────────────────────────────────────────────────────
// Pull back a bow, release an arrow with moving wind. Simple arc + wind drift.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface ArcheryTargetSettings {
  arrows: "5" | "10" | "15";
}

export interface ArcheryTargetState {
  settings: ArcheryTargetSettings;
  totalArrows: number;
  arrowsShot: number;
  score: number;
  // Aim: x/y in [-1,1] relative to target center
  aimX: number;
  aimY: number;
  windX: number;   // drift per tick
  windY: number;
  drawPower: number; // 0-100 (wobble amplitude)
  wobblePhase: number;
  arrowInFlight: boolean;
  lastScore: number | null;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type ArcheryTargetAction =
  | { type: "startDraw" }
  | { type: "release" }
  | { type: "tick"; dt: number };

const WOBBLE_SPEED = 3.0; // rad/sec
const WOBBLE_AMP = 0.25;

function genWind(seed: number, counter: number): { wx: number; wy: number } {
  const rng = mulberry32(seed + counter * 7919);
  return {
    wx: (rng() - 0.5) * 0.6,
    wy: (rng() - 0.5) * 0.3,
  };
}

export function initialState(seed: number, settings: ArcheryTargetSettings): ArcheryTargetState {
  const totalArrows = parseInt(settings.arrows, 10);
  const { wx, wy } = genWind(seed, 0);
  return {
    settings,
    totalArrows,
    arrowsShot: 0,
    score: 0,
    aimX: 0,
    aimY: 0,
    windX: wx,
    windY: wy,
    drawPower: 0,
    wobblePhase: 0,
    arrowInFlight: false,
    lastScore: null,
    over: false,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: ArcheryTargetState, action: ArcheryTargetAction): ArcheryTargetState {
  if (state.over) return state;

  switch (action.type) {
    case "startDraw": {
      if (state.arrowInFlight) return state;
      return { ...state, drawPower: 0, wobblePhase: 0 };
    }

    case "tick": {
      const { dt } = action;
      if (state.arrowInFlight) return state;

      // Build up draw power and wobble
      const newPower = Math.min(100, state.drawPower + 50 * dt);
      const newPhase = state.wobblePhase + WOBBLE_SPEED * dt;
      // Aim drifts with wobble
      const wobble = WOBBLE_AMP * Math.sin(newPhase) * (newPower / 100);
      const aimX = Math.sin(newPhase * 0.7) * wobble;
      const aimY = Math.cos(newPhase * 1.1) * wobble * 0.8;
      return { ...state, drawPower: newPower, wobblePhase: newPhase, aimX, aimY };
    }

    case "release": {
      if (state.arrowInFlight) return state;
      // Apply wind drift
      const finalX = state.aimX + state.windX * (1 - state.drawPower / 120);
      const finalY = state.aimY + state.windY * (1 - state.drawPower / 120);
      const dist = Math.sqrt(finalX * finalX + finalY * finalY);
      // Score: 10 rings = 10,9,8,7,6,5,4,3,2,1
      const ringDist = dist; // 0=bullseye, 1=edge
      let pts = 0;
      if (dist <= 1.0) {
        pts = Math.ceil(10 * (1 - Math.min(dist, 0.99)));
        pts = Math.max(1, Math.min(10, pts));
      }
      const counter = state.rngCounter + 1;
      const newShot = state.arrowsShot + 1;
      const over = newShot >= state.totalArrows;
      const { wx, wy } = genWind(state.rngSeed, counter);
      void ringDist;
      return {
        ...state,
        arrowsShot: newShot,
        score: state.score + pts,
        lastScore: pts,
        drawPower: 0,
        wobblePhase: 0,
        aimX: 0,
        aimY: 0,
        windX: over ? state.windX : wx,
        windY: over ? state.windY : wy,
        over,
        rngCounter: counter,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: ArcheryTargetState): { score: number } | null {
  if (!state.over) return null;
  return { score: state.score };
}
