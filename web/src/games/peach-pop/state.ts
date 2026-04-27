import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Peach Pop: peaches drift across the screen in 6 lanes. Click ripe peaches to pop them
// and score points. 30 second timer.

export const TIMER_TICKS = 30;
export const LANES = 6;

export interface PeachPopSettings { dummy: boolean; }

export interface Peach {
  id: number;
  lane: number;     // 0..5
  ticksLeft: number; // remaining ticks before disappearing
}

export interface PeachPopState {
  rngSeed: number;
  peaches: Peach[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}

export type PeachPopAction =
  | { type: "tick" }
  | { type: "pop"; id: number };

export function initialState(seed: number, _settings: PeachPopSettings): PeachPopState {
  return { rngSeed: seed, peaches: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}

export function reducer(state: PeachPopState, action: PeachPopAction): PeachPopState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.peaches.find(p => p.id === action.id);
    if (!target) return state;
    return { ...state, peaches: state.peaches.filter(p => p.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    // age out existing peaches
    const aged = state.peaches.map(p => ({ ...p, ticksLeft: p.ticksLeft - 1 }));
    const surviving = aged.filter(p => p.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    // spawn 1-2 new peaches
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newPeaches: Peach[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newPeaches.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return {
      ...state,
      rngSeed: seed2,
      peaches: [...surviving, ...newPeaches],
      nextId,
      ticksRemaining,
      missed: state.missed + expired,
      phase,
    };
  }
  return state;
}

export function isTerminal(state: PeachPopState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
