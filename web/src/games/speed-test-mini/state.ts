import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TRIALS = 10;
export const MIN_DELAY_MS = 600;
export const MAX_DELAY_MS = 2400;

export type Phase = "waiting" | "ready" | "ended";

export interface Target {
  id: number;
  x: number; // 0-1 relative to arena
  y: number; // 0-1 relative to arena
  appearAt: number; // ms timestamp when target became visible
}

export interface SpeedTestState {
  phase: Phase;
  trial: number; // 0-based count of completed trials
  totalTrials: number;
  target: Target | null;
  pendingDelay: number; // delay used for the next target (ms)
  reactionTimes: number[];
  rngSeed: number;
  rngCounter: number;
  nextId: number;
  best: number | null; // best avg ms loaded from storage
}

export type SpeedTestAction =
  | { type: "schedule"; now: number }
  | { type: "appear"; now: number }
  | { type: "click"; now: number }
  | { type: "setBest"; best: number | null };

function pickDelay(seed: number, counter: number): number {
  const rng = mulberry32(seed + counter * 1103515);
  return MIN_DELAY_MS + Math.floor(rng() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function pickPosition(seed: number, counter: number): { x: number; y: number } {
  const rng = mulberry32(seed + counter * 999983);
  // Keep target away from edges
  const margin = 0.1;
  const x = margin + rng() * (1 - 2 * margin);
  const y = margin + rng() * (1 - 2 * margin);
  return { x, y };
}

export function initialState(seed: number): SpeedTestState {
  return {
    phase: "waiting",
    trial: 0,
    totalTrials: TOTAL_TRIALS,
    target: null,
    pendingDelay: pickDelay(seed, 0),
    reactionTimes: [],
    rngSeed: seed,
    rngCounter: 1, // already used counter 0 for the first delay
    nextId: 0,
    best: null,
  };
}

export function reducer(state: SpeedTestState, action: SpeedTestAction): SpeedTestState {
  switch (action.type) {
    case "setBest":
      return { ...state, best: action.best };
    case "schedule": {
      if (state.phase !== "waiting") return state;
      // No-op: schedule action just acknowledges that the timer is running.
      // The component reads pendingDelay and dispatches "appear" when it elapses.
      return state;
    }
    case "appear": {
      if (state.phase !== "waiting") return state;
      if (state.trial >= state.totalTrials) {
        return { ...state, phase: "ended", target: null };
      }
      const pos = pickPosition(state.rngSeed, state.rngCounter);
      const target: Target = {
        id: state.nextId,
        x: pos.x,
        y: pos.y,
        appearAt: action.now,
      };
      return {
        ...state,
        phase: "ready",
        target,
        rngCounter: state.rngCounter + 1,
        nextId: state.nextId + 1,
      };
    }
    case "click": {
      if (state.phase !== "ready" || !state.target) return state;
      const reaction = action.now - state.target.appearAt;
      const newTimes = [...state.reactionTimes, reaction];
      const newTrial = state.trial + 1;
      if (newTrial >= state.totalTrials) {
        return {
          ...state,
          phase: "ended",
          target: null,
          trial: newTrial,
          reactionTimes: newTimes,
        };
      }
      const nextDelay = pickDelay(state.rngSeed, state.rngCounter);
      return {
        ...state,
        phase: "waiting",
        target: null,
        trial: newTrial,
        reactionTimes: newTimes,
        pendingDelay: nextDelay,
        rngCounter: state.rngCounter + 1,
      };
    }
    default:
      return state;
  }
}

export function averageMs(state: SpeedTestState): number {
  if (state.reactionTimes.length === 0) return 0;
  const sum = state.reactionTimes.reduce((a, b) => a + b, 0);
  return Math.round(sum / state.reactionTimes.length);
}

export function calcScore(state: SpeedTestState): number {
  if (state.reactionTimes.length === 0) return 0;
  const avg = averageMs(state);
  if (avg <= 0) return 0;
  // Faster reactions => higher score. 200ms ~ 5000pts, 500ms ~ 2000pts.
  return Math.max(0, Math.round(1_000_000 / avg));
}

export function isTerminal(state: SpeedTestState): { score: number } | null {
  if (state.phase !== "ended") return null;
  return { score: calcScore(state) };
}
