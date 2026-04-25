import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface LongJumpSettings {
  attempts: "3" | "6";
}

export interface JumpAttempt {
  speed: number;   // 0..1 sprint buildup
  angle: number;   // 0..1 takeoff angle (ideal ~0.45)
  timing: number;  // 0..1 board hit (ideal = 1.0 = at the board)
  distance: number;
  foul: boolean;
}

export interface LongJumpState {
  settings: LongJumpSettings;
  rngSeed: number;
  totalAttempts: number;
  attemptIndex: number;
  attempts: JumpAttempt[];
  speed: number;
  angle: number;
  timing: number;
  phase: "run" | "result" | "done";
  lastResult: string;
  bestDistance: number;
}

export type LongJumpAction =
  | { type: "set-speed"; value: number }
  | { type: "set-angle"; value: number }
  | { type: "set-timing"; value: number }
  | { type: "jump" }
  | { type: "next" };

function nextSeed(seed: number): number {
  return (mulberry32(seed)() * 2 ** 31) >>> 0;
}

function jumpDistance(speed: number, angle: number, timing: number, seed: number): { distance: number; foul: boolean } {
  const rng = mulberry32(seed);
  // Foul if board timing > 0.95 (over the board)
  const foul = timing > 0.95;
  if (foul) return { distance: 0, foul: true };
  // Physics: distance maximized at angle=0.45, speed=1, timing=1
  const speedFactor = speed;
  const angleFactor = 1 - Math.abs(angle - 0.45) / 0.45;
  const timingFactor = timing; // more board = more distance
  const noise = (rng() - 0.5) * 0.5;
  const distance = Math.max(0, 5.5 + (speedFactor * 3.5 + angleFactor * 2 + timingFactor * 1.5 + noise));
  return { distance: Math.round(distance * 100) / 100, foul: false };
}

export function initialState(seed: number, settings: LongJumpSettings): LongJumpState {
  return {
    settings,
    rngSeed: seed >>> 0,
    totalAttempts: parseInt(settings.attempts, 10),
    attemptIndex: 0,
    attempts: [],
    speed: 0.75,
    angle: 0.45,
    timing: 0.8,
    phase: "run",
    lastResult: "",
    bestDistance: 0,
  };
}

export function reducer(state: LongJumpState, action: LongJumpAction): LongJumpState {
  if (state.phase === "done") return state;

  if (action.type === "set-speed" && state.phase === "run") {
    return { ...state, speed: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-angle" && state.phase === "run") {
    return { ...state, angle: Math.min(1, Math.max(0, action.value)) };
  }
  if (action.type === "set-timing" && state.phase === "run") {
    return { ...state, timing: Math.min(1, Math.max(0, action.value)) };
  }

  if (action.type === "jump" && state.phase === "run") {
    const seed1 = state.rngSeed;
    const seed2 = nextSeed(seed1);
    const { distance, foul } = jumpDistance(state.speed, state.angle, state.timing, seed1);
    const attempt: JumpAttempt = { speed: state.speed, angle: state.angle, timing: state.timing, distance, foul };
    const newAttempts = [...state.attempts, attempt];
    const newBest = foul ? state.bestDistance : Math.max(state.bestDistance, distance);
    const newIndex = state.attemptIndex + 1;
    const done = newIndex >= state.totalAttempts;
    const msg = foul ? "FOUL! Over the board!" : `${distance.toFixed(2)} m`;

    return {
      ...state,
      rngSeed: seed2,
      attempts: newAttempts,
      bestDistance: newBest,
      attemptIndex: newIndex,
      lastResult: msg,
      phase: done ? "done" : "result",
    };
  }

  if (action.type === "next" && state.phase === "result") {
    return { ...state, phase: "run" };
  }

  return state;
}

export function isTerminal(state: LongJumpState): { score: number } | null {
  if (state.phase !== "done") return null;
  // World record ~8.95m, score 1000 = 8.5m+
  const score = Math.round(Math.min(1000, (state.bestDistance / 8.5) * 1000));
  return { score };
}
