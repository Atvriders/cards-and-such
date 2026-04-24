// ─── Dart Throw ──────────────────────────────────────────────────────────────
// Swipe/drag mechanic → dart flies to board. Score by ring zone.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface DartThrowSettings {
  darts: "3" | "6" | "9";
}

export interface DartThrowState {
  settings: DartThrowSettings;
  totalDarts: number;
  dartsThrown: number;
  score: number;
  // Throw controls
  throwX: number;  // normalized [-1,1] horizontal deviation
  throwY: number;  // normalized [-1,1] vertical deviation
  released: boolean;
  lastHit: { x: number; y: number; pts: number } | null;
  over: boolean;
  rngSeed: number;
  rngCounter: number;
}

export type DartThrowAction =
  | { type: "aim"; dx: number; dy: number }
  | { type: "throw" };

function scorePoint(x: number, y: number): number {
  const dist = Math.sqrt(x * x + y * y);
  // dist in [0,1]: 0=bull (50pts), ring zones
  if (dist <= 0.05) return 50;
  if (dist <= 0.10) return 25;
  if (dist <= 0.25) return 20;
  if (dist <= 0.40) return 15;
  if (dist <= 0.55) return 10;
  if (dist <= 0.70) return 5;
  if (dist <= 0.85) return 3;
  if (dist <= 1.00) return 1;
  return 0;
}

function addNoise(seed: number, counter: number, x: number, y: number): { nx: number; ny: number } {
  const rng = mulberry32(seed + counter * 19937);
  const noise = 0.08;
  return {
    nx: x + (rng() - 0.5) * noise,
    ny: y + (rng() - 0.5) * noise,
  };
}

export function initialState(seed: number, settings: DartThrowSettings): DartThrowState {
  const totalDarts = parseInt(settings.darts, 10);
  return {
    settings,
    totalDarts,
    dartsThrown: 0,
    score: 0,
    throwX: 0,
    throwY: 0,
    released: false,
    lastHit: null,
    over: false,
    rngSeed: seed,
    rngCounter: 0,
  };
}

export function reducer(state: DartThrowState, action: DartThrowAction): DartThrowState {
  if (state.over) return state;

  switch (action.type) {
    case "aim":
      return { ...state, throwX: Math.max(-1, Math.min(1, action.dx)), throwY: Math.max(-1, Math.min(1, action.dy)) };

    case "throw": {
      const counter = state.rngCounter + 1;
      const { nx, ny } = addNoise(state.rngSeed, counter, state.throwX, state.throwY);
      const clampedX = Math.max(-1, Math.min(1, nx));
      const clampedY = Math.max(-1, Math.min(1, ny));
      const pts = scorePoint(clampedX, clampedY);
      const newThrown = state.dartsThrown + 1;
      const over = newThrown >= state.totalDarts;
      return {
        ...state,
        dartsThrown: newThrown,
        score: state.score + pts,
        lastHit: { x: clampedX, y: clampedY, pts },
        throwX: 0,
        throwY: 0,
        over,
        rngCounter: counter,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: DartThrowState): { score: number } | null {
  if (!state.over) return null;
  return { score: state.score };
}
