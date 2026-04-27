import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Radish Rush: 25-second clicker. Click radishes before they sprout away.

export const TIMER_TICKS = 25;
export const LANES = 6;

export interface RadishRushSettings { dummy: boolean; }

export interface Radish {
  id: number;
  lane: number;
  ticksLeft: number;
}

export interface RadishRushState {
  rngSeed: number;
  radishes: Radish[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}

export type RadishRushAction =
  | { type: "tick" }
  | { type: "pop"; id: number };

export function initialState(seed: number, _settings: RadishRushSettings): RadishRushState {
  return { rngSeed: seed, radishes: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}

export function reducer(state: RadishRushState, action: RadishRushAction): RadishRushState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.radishes.find(r => r.id === action.id);
    if (!target) return state;
    return { ...state, radishes: state.radishes.filter(r => r.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.radishes.map(r => ({ ...r, ticksLeft: r.ticksLeft - 1 }));
    const surviving = aged.filter(r => r.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newRadishes: Radish[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newRadishes.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, radishes: [...surviving, ...newRadishes], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}

export function isTerminal(state: RadishRushState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
