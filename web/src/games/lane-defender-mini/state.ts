import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Lane Defender Mini: 30s clicker. Click moving targets to score.

export const TIMER_TICKS = 30;
export const LANES = 6;

export interface LaneDefenderMiniSettings { dummy: boolean; }

export interface LaneDefenderMiniTarget {
  id: number;
  lane: number;
  ticksLeft: number;
}

export interface LaneDefenderMiniState {
  rngSeed: number;
  targets: LaneDefenderMiniTarget[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  hits: number;
  misses: number;
  phase: "playing" | "done";
}

export type LaneDefenderMiniAction =
  | { type: "tick" }
  | { type: "hit"; id: number };

export function initialState(seed: number, _settings: LaneDefenderMiniSettings): LaneDefenderMiniState {
  return { rngSeed: seed, targets: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, hits: 0, misses: 0, phase: "playing" };
}

export function reducer(state: LaneDefenderMiniState, action: LaneDefenderMiniAction): LaneDefenderMiniState {
  if (state.phase === "done") return state;
  if (action.type === "hit") {
    const t = state.targets.find(p => p.id === action.id);
    if (!t) return state;
    return { ...state, targets: state.targets.filter(p => p.id !== action.id), score: state.score + 10, hits: state.hits + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.targets.map(p => ({ ...p, ticksLeft: p.ticksLeft - 1 }));
    const surviving = aged.filter(p => p.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newTargets: LaneDefenderMiniTarget[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newTargets.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, targets: [...surviving, ...newTargets], nextId, ticksRemaining, misses: state.misses + expired, phase };
  }
  return state;
}

export function isTerminal(state: LaneDefenderMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
