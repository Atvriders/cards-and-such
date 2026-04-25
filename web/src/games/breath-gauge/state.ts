import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface BreathGaugeSettings {
  target: "50" | "75" | "90";
}

// Player holds a button to fill the gauge, tries to release at the target zone
export interface BreathGaugeState {
  settings: BreathGaugeSettings;
  rngSeed: number;
  targetPercent: number;   // 50, 75, or 90
  targetLow: number;       // target zone lower bound
  targetHigh: number;      // target zone upper bound
  rounds: number;
  totalRounds: number;
  holding: boolean;
  fillPercent: number;    // 0–100 as integer
  releasePercent: number | null; // where player released
  score: number;
  roundScores: number[];
  roundResult: "hit" | "miss" | null;
  gameOver: boolean;
}

export type BreathGaugeAction =
  | { type: "pressDown" }
  | { type: "release"; fillPercent: number }
  | { type: "tick"; fillPercent: number }
  | { type: "next" };

function zoneBounds(target: number): { low: number; high: number } {
  const half = target <= 50 ? 8 : target <= 75 ? 6 : 5;
  return { low: target - half, high: target + half };
}

export function initialState(seed: number, settings: BreathGaugeSettings): BreathGaugeState {
  const _rng = mulberry32(seed >>> 0); // use seed
  const target = parseInt(settings.target, 10);
  const { low, high } = zoneBounds(target);
  return {
    settings,
    rngSeed: seed >>> 0,
    targetPercent: target,
    targetLow: low,
    targetHigh: high,
    rounds: 0,
    totalRounds: 5,
    holding: false,
    fillPercent: 0,
    releasePercent: null,
    score: 0,
    roundScores: [],
    roundResult: null,
    gameOver: false,
  };
}

function roundScore(releasePercent: number, low: number, high: number, target: number): number {
  if (releasePercent >= low && releasePercent <= high) {
    // In zone: closer to center = more points
    const dist = Math.abs(releasePercent - target);
    return Math.max(50, 200 - dist * 20);
  }
  return 0;
}

export function reducer(state: BreathGaugeState, action: BreathGaugeAction): BreathGaugeState {
  if (state.gameOver) return state;

  if (action.type === "pressDown") {
    if (state.roundResult !== null) return state; // wait for next
    return { ...state, holding: true, fillPercent: 0 };
  }

  if (action.type === "tick") {
    if (!state.holding || state.roundResult !== null) return state;
    return { ...state, fillPercent: Math.min(100, action.fillPercent) };
  }

  if (action.type === "release") {
    if (!state.holding || state.roundResult !== null) return state;
    const fill = Math.min(100, action.fillPercent);
    const hit = fill >= state.targetLow && fill <= state.targetHigh;
    const pts = roundScore(fill, state.targetLow, state.targetHigh, state.targetPercent);
    const roundResult = hit ? "hit" : "miss";
    return {
      ...state,
      holding: false,
      fillPercent: fill,
      releasePercent: fill,
      roundResult,
      score: state.score + pts,
      roundScores: [...state.roundScores, pts],
    };
  }

  if (action.type === "next") {
    if (state.roundResult === null) return state;
    const rounds = state.rounds + 1;
    const gameOver = rounds >= state.totalRounds;
    return {
      ...state,
      rounds,
      holding: false,
      fillPercent: 0,
      releasePercent: null,
      roundResult: null,
      gameOver,
    };
  }

  return state;
}

export function isTerminal(state: BreathGaugeState): { score: number } | null {
  if (!state.gameOver) return null;
  return { score: state.score };
}
