import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Bottle Spin: spin a bottle and stop it in the target zone for points.

export interface BottleSpinSettings {
  rounds: "5" | "10" | "15";
}

export interface BottleSpinState {
  settings: BottleSpinSettings;
  rngSeed: number;
  angle: number;         // current bottle angle 0-360
  angularVelocity: number; // degrees/sec
  spinning: boolean;
  targetStart: number;   // target zone start angle
  targetWidth: number;   // target zone width in degrees
  round: number;
  maxRounds: number;
  score: number;
  lastResult: "hit" | "miss" | null;
  over: boolean;
}

export type BottleSpinAction =
  | { type: "spin" }
  | { type: "stop" }
  | { type: "tick"; dt: number }
  | { type: "next" };

const INITIAL_SPEED = 720; // degrees/sec
const FRICTION = 0.97;
const STOP_THRESHOLD = 15;
const TARGET_WIDTH_EASY = 80;
const TARGET_WIDTH_MEDIUM = 50;
const TARGET_WIDTH_HARD = 30;

function getTargetWidth(difficulty: string): number {
  if (difficulty === "easy") return TARGET_WIDTH_EASY;
  if (difficulty === "hard") return TARGET_WIDTH_HARD;
  return TARGET_WIDTH_MEDIUM;
}

function rng2(seed: number): { val: number; next: number } {
  const r = mulberry32(seed);
  const val = r();
  const next = Math.floor(r() * 2 ** 31);
  return { val, next };
}

function generateTarget(seed: number): { targetStart: number; nextSeed: number } {
  const r = rng2(seed);
  return { targetStart: r.val * 360, nextSeed: r.next };
}

export function initialState(seed: number, settings: BottleSpinSettings): BottleSpinState {
  const maxRounds = parseInt(settings.rounds, 10);
  const { targetStart, nextSeed } = generateTarget(seed);
  const targetWidth = TARGET_WIDTH_MEDIUM; // default, difficulty from settings not available here
  return {
    settings,
    rngSeed: nextSeed,
    angle: 0,
    angularVelocity: 0,
    spinning: false,
    targetStart,
    targetWidth,
    round: 1,
    maxRounds,
    score: 0,
    lastResult: null,
    over: false,
  };
}

function angleInZone(angle: number, start: number, width: number): boolean {
  const end = (start + width) % 360;
  const a = ((angle % 360) + 360) % 360;
  if (start <= end) return a >= start && a <= end;
  return a >= start || a <= end;
}

export function reducer(state: BottleSpinState, action: BottleSpinAction): BottleSpinState {
  if (state.over) return state;

  switch (action.type) {
    case "spin": {
      if (state.spinning || state.lastResult !== null) return state;
      // Add slight random variance to spin speed
      const r = rng2(state.rngSeed);
      const speed = INITIAL_SPEED * (0.85 + r.val * 0.3);
      return { ...state, spinning: true, angularVelocity: speed, rngSeed: r.next, lastResult: null };
    }

    case "stop": {
      if (!state.spinning) return state;
      // Instant stop
      const a = ((state.angle % 360) + 360) % 360;
      const tw = getTargetWidth(state.settings.rounds); // using rounds as proxy... use fixed medium
      const hit = angleInZone(a, state.targetStart, state.targetWidth);
      const pointsEarned = hit ? 100 : 0;
      return {
        ...state,
        spinning: false,
        angularVelocity: 0,
        score: state.score + pointsEarned,
        lastResult: hit ? "hit" : "miss",
      };
    }

    case "next": {
      if (state.lastResult === null) return state;
      if (state.round >= state.maxRounds) return { ...state, over: true };
      const { targetStart, nextSeed } = generateTarget(state.rngSeed);
      return {
        ...state,
        rngSeed: nextSeed,
        round: state.round + 1,
        targetStart,
        angle: 0,
        angularVelocity: 0,
        spinning: false,
        lastResult: null,
      };
    }

    case "tick": {
      if (!state.spinning) return state;
      const { dt } = action;
      const newAv = state.angularVelocity * Math.pow(FRICTION, dt * 60);
      const newAngle = state.angle + state.angularVelocity * dt;

      if (newAv < STOP_THRESHOLD) {
        // Auto-stop
        const a = ((newAngle % 360) + 360) % 360;
        const hit = angleInZone(a, state.targetStart, state.targetWidth);
        const pointsEarned = hit ? 100 : 0;
        return {
          ...state,
          angle: newAngle,
          angularVelocity: 0,
          spinning: false,
          score: state.score + pointsEarned,
          lastResult: hit ? "hit" : "miss",
        };
      }

      return { ...state, angle: newAngle, angularVelocity: newAv };
    }

    default:
      return state;
  }
}

export function isTerminal(state: BottleSpinState): { score: number } | null {
  if (state.over) return { score: state.score };
  return null;
}

export { FRICTION, STOP_THRESHOLD };
