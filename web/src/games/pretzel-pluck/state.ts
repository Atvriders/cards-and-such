import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Pretzel Pluck: pretzels move along a conveyor in 6 lanes. Click to pluck. 30s timer.

export const TIMER_TICKS = 30;
export const LANES = 6;

export interface PretzelPluckSettings { dummy: boolean; }

export interface Pretzel {
  id: number;
  lane: number;
  ticksLeft: number;
}

export interface PretzelPluckState {
  rngSeed: number;
  pretzels: Pretzel[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}

export type PretzelPluckAction =
  | { type: "tick" }
  | { type: "pop"; id: number };

export function initialState(seed: number, _settings: PretzelPluckSettings): PretzelPluckState {
  return { rngSeed: seed, pretzels: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}

export function reducer(state: PretzelPluckState, action: PretzelPluckAction): PretzelPluckState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.pretzels.find(p => p.id === action.id);
    if (!target) return state;
    return { ...state, pretzels: state.pretzels.filter(p => p.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.pretzels.map(p => ({ ...p, ticksLeft: p.ticksLeft - 1 }));
    const surviving = aged.filter(p => p.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newPretzels: Pretzel[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newPretzels.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, pretzels: [...surviving, ...newPretzels], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}

export function isTerminal(state: PretzelPluckState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
