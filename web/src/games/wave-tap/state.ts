import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Wave Tap: simple 30-second clicker.
export const TIMER_TICKS = 30;
export const LANES = 6;

export interface WaveTapSettings { dummy: boolean; }

export interface WaveTapTarget {
  id: number;
  lane: number;
  ticksLeft: number;
}

export interface WaveTapState {
  rngSeed: number;
  targets: WaveTapTarget[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}

export type WaveTapAction =
  | { type: "tick" }
  | { type: "pop"; id: number };

export function initialState(seed: number, _settings: WaveTapSettings): WaveTapState {
  return { rngSeed: seed, targets: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}

export function reducer(state: WaveTapState, action: WaveTapAction): WaveTapState {
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
    const newTargets: WaveTapTarget[] = [];
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

export function isTerminal(state: WaveTapState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
