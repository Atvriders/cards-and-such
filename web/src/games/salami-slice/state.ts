import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Salami Slice: 30-second slicer. Click salamis to slice them.

export const TIMER_TICKS = 30;
export const LANES = 6;

export interface SalamiSliceSettings { dummy: boolean; }

export interface Salami {
  id: number;
  lane: number;
  ticksLeft: number;
}

export interface SalamiSliceState {
  rngSeed: number;
  salamis: Salami[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}

export type SalamiSliceAction =
  | { type: "tick" }
  | { type: "pop"; id: number };

export function initialState(seed: number, _settings: SalamiSliceSettings): SalamiSliceState {
  return { rngSeed: seed, salamis: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}

export function reducer(state: SalamiSliceState, action: SalamiSliceAction): SalamiSliceState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.salamis.find(p => p.id === action.id);
    if (!target) return state;
    return { ...state, salamis: state.salamis.filter(p => p.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.salamis.map(p => ({ ...p, ticksLeft: p.ticksLeft - 1 }));
    const surviving = aged.filter(p => p.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newSalamis: Salami[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newSalamis.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, salamis: [...surviving, ...newSalamis], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}

export function isTerminal(state: SalamiSliceState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
