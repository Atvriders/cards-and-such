import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Operation (simplified) — 30-second session
// 10 targets appear one at a time. Each target has a 2-second "window" to tap.
// If you tap within the window, you score the operation's value.
// The game tracks elapsed "turns" (each turn = one target attempt).

export interface OperationSettings {
  difficulty: "easy" | "normal" | "hard";
}

export interface OperationTarget {
  name: string;
  bodyPart: string;
  value: number;
  windowMs: number; // ms to tap in time
}

const ALL_TARGETS: OperationTarget[] = [
  { name: "Funny Bone", bodyPart: "elbow", value: 50, windowMs: 3000 },
  { name: "Broken Heart", bodyPart: "chest", value: 100, windowMs: 2500 },
  { name: "Spare Ribs", bodyPart: "torso", value: 75, windowMs: 2500 },
  { name: "Wish Bone", bodyPart: "chest", value: 60, windowMs: 3000 },
  { name: "Wrenched Ankle", bodyPart: "leg", value: 80, windowMs: 2000 },
  { name: "Adam's Apple", bodyPart: "neck", value: 90, windowMs: 2000 },
  { name: "Ankle Bone Connected", bodyPart: "leg", value: 70, windowMs: 2500 },
  { name: "Water on the Knee", bodyPart: "knee", value: 65, windowMs: 2500 },
  { name: "Butterfingers", bodyPart: "hand", value: 55, windowMs: 3000 },
  { name: "Charlie Horse", bodyPart: "thigh", value: 85, windowMs: 2000 },
];

export const TOTAL_OPERATIONS = 10;

export type OperationPhase = "waiting" | "active" | "success" | "miss" | "done";

export interface OperationState {
  settings: OperationSettings;
  rngSeed: number;
  targets: readonly OperationTarget[];
  currentIdx: number; // which target is up (0..9)
  score: number;
  successes: number;
  misses: number;
  phase: OperationPhase;
  // Timing: when "active" started (for display purposes only, actual tap timing simulated by reducer)
  tapTimingMs: number; // simulated reaction time (set when "tap" is dispatched)
  difficultyMultiplier: number;
}

export type OperationAction =
  | { type: "start" }       // begins the current operation
  | { type: "tap"; elapsedMs: number }; // player taps with elapsed ms since activation

function diffMult(d: string): number {
  if (d === "easy") return 1.4;
  if (d === "hard") return 0.6;
  return 1.0;
}

function shuffleTargets(seed: number): { targets: OperationTarget[]; nextSeed: number } {
  const rng = mulberry32(seed);
  const arr = [...ALL_TARGETS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return { targets: arr, nextSeed };
}

export function initialState(seed: number, settings: OperationSettings): OperationState {
  const { targets, nextSeed } = shuffleTargets(seed);
  return {
    settings,
    rngSeed: nextSeed,
    targets,
    currentIdx: 0,
    score: 0,
    successes: 0,
    misses: 0,
    phase: "waiting",
    tapTimingMs: 0,
    difficultyMultiplier: diffMult(settings.difficulty),
  };
}

export function reducer(state: OperationState, action: OperationAction): OperationState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "start": {
      if (state.phase !== "waiting") return state;
      return { ...state, phase: "active" };
    }

    case "tap": {
      if (state.phase !== "active") return state;
      const target = state.targets[state.currentIdx]!;
      const window = target.windowMs * state.difficultyMultiplier;
      const success = action.elapsedMs <= window;
      const points = success ? Math.round(target.value * (1 - action.elapsedMs / window / 2)) : 0;
      const nextIdx = state.currentIdx + 1;
      const done = nextIdx >= TOTAL_OPERATIONS;
      return {
        ...state,
        score: state.score + points,
        successes: state.successes + (success ? 1 : 0),
        misses: state.misses + (success ? 0 : 1),
        currentIdx: done ? state.currentIdx : nextIdx,
        phase: done ? "done" : success ? "success" : "miss",
        tapTimingMs: action.elapsedMs,
      };
    }

    default:
      return state;
  }
}

// Advance past success/miss screen back to waiting
export function advance(state: OperationState): OperationState {
  if (state.phase === "success" || state.phase === "miss") {
    const nextIdx = state.currentIdx + (state.phase === "success" ? 0 : 0); // already incremented
    if (nextIdx >= TOTAL_OPERATIONS) return { ...state, phase: "done" };
    return { ...state, phase: "waiting" };
  }
  return state;
}

export function isTerminal(state: OperationState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: state.score };
}

export { ALL_TARGETS };
