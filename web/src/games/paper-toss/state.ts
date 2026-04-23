import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Paper Toss — arcade throw game.
// Player sets angle and power sliders then throws.
// Wind drift (randomized per throw) affects trajectory.
// 10 throws per session. Score based on accuracy.

export const TOTAL_THROWS = 10;

export interface PaperTossSettings { dummy: boolean }

// Basket is always at (0,0). Paper starts at (0, -1) (bottom center).
// Angle in degrees: 90 = straight up, 45 = up-right, etc.
// Power 1-100.
// Wind: -50 to +50 (positive = rightward drift)

export interface Throw {
  angle: number;    // degrees
  power: number;   // 1-100
  wind: number;    // randomized drift
  hit: boolean;
  offset: number;  // how far from center (lower = better)
}

export interface PaperTossState {
  settings: PaperTossSettings;
  rngSeed: number;
  winds: readonly number[];    // pre-generated wind per throw
  throwIndex: number;
  angle: number;               // current slider values
  power: number;
  throws: readonly Throw[];
  score: number;
  phase: "aiming" | "thrown" | "done";
}

export type PaperTossAction =
  | { type: "setAngle"; value: number }
  | { type: "setPower"; value: number }
  | { type: "throw" }
  | { type: "next" }
  | { type: "newGame" };

function computeThrow(angle: number, power: number, wind: number): { hit: boolean; offset: number } {
  // Simulate a simple parabolic arc.
  // Ideal: angle=90, power=60 → lands at (0,0) with no wind.
  // Horizontal offset from center:
  //   x = (power/60 - 1) * 10                (deviation from ideal power)
  //     + (90 - angle) * 0.3                  (angle deviation)
  //     + wind * 0.2                           (wind drift)
  const xOffset = (power / 60 - 1) * 12 + (90 - angle) * 0.4 + wind * 0.25;
  const offset = Math.abs(xOffset);
  const hit = offset < 8; // within basket radius
  return { hit, offset };
}

function computeScore(throws: readonly Throw[]): number {
  return throws.reduce((s, t) => {
    if (!t.hit) return s;
    // 10 pts for perfect, minus distance
    return s + Math.max(1, Math.round(10 - t.offset));
  }, 0);
}

export function initialState(seed: number, settings: PaperTossSettings): PaperTossState {
  const rng = mulberry32(seed);
  const winds = Array.from({ length: TOTAL_THROWS }, () => (rng() - 0.5) * 100);
  return {
    settings,
    rngSeed: seed,
    winds,
    throwIndex: 0,
    angle: 90,
    power: 60,
    throws: [],
    score: 0,
    phase: "aiming",
  };
}

export function reducer(state: PaperTossState, action: PaperTossAction): PaperTossState {
  if (action.type === "newGame") return initialState(state.rngSeed + 1, state.settings);

  if (action.type === "setAngle" && state.phase === "aiming") {
    return { ...state, angle: Math.max(30, Math.min(150, action.value)) };
  }

  if (action.type === "setPower" && state.phase === "aiming") {
    return { ...state, power: Math.max(1, Math.min(100, action.value)) };
  }

  if (action.type === "throw" && state.phase === "aiming") {
    const wind = state.winds[state.throwIndex] ?? 0;
    const { hit, offset } = computeThrow(state.angle, state.power, wind);
    const newThrow: Throw = { angle: state.angle, power: state.power, wind, hit, offset };
    const newThrows = [...state.throws, newThrow];
    const newScore = computeScore(newThrows);
    const done = state.throwIndex + 1 >= TOTAL_THROWS;
    return {
      ...state,
      throws: newThrows,
      score: newScore,
      phase: done ? "done" : "thrown",
    };
  }

  if (action.type === "next" && state.phase === "thrown") {
    return {
      ...state,
      throwIndex: state.throwIndex + 1,
      phase: "aiming",
    };
  }

  return state;
}

export function isTerminal(state: PaperTossState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}
