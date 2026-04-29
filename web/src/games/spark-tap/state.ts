import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Spark Tap: simple 30-second clicker.
export const TIMER_TICKS = 30;
export const LANES = 6;

export interface SparkTapSettings { dummy: boolean; }

export interface SparkTapTarget {
  id: number;
  lane: number;
  ticksLeft: number;
}

export interface SparkTapState {
  rngSeed: number;
  targets: SparkTapTarget[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}

export type SparkTapAction =
  | { type: "tick" }
  | { type: "pop"; id: number };

export function initialState(seed: number, _settings: SparkTapSettings): SparkTapState {
  return { rngSeed: seed, targets: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}

export function reducer(state: SparkTapState, action: SparkTapAction): SparkTapState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.targets.find(p => p.id === action.id);
    if (!target) return state;
    return { ...state, targets: state.targets.filter(p => p.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.targets.map(p => ({ ...p, ticksLeft: p.ticksLeft - 1 }));
    const surviving = aged.filter(p => p.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newTargets: SparkTapTarget[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newTargets.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return {
      ...state,
      rngSeed: seed2,
      targets: [...surviving, ...newTargets],
      nextId,
      ticksRemaining,
      missed: state.missed + expired,
      phase,
    };
  }
  return state;
}

export function isTerminal(state: SparkTapState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
