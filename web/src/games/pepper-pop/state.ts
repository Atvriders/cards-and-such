import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TIMER_TICKS = 30;
export const LANES = 6;

export interface PepperPopSettings { dummy: boolean; }
export interface PepperPopItem { id: number; lane: number; ticksLeft: number; }
export interface PepperPopState {
  rngSeed: number;
  items: PepperPopItem[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}
export type PepperPopAction = { type: "tick" } | { type: "pop"; id: number };

export function initialState(seed: number, _settings: PepperPopSettings): PepperPopState {
  return { rngSeed: seed, items: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}

export function reducer(state: PepperPopState, action: PepperPopAction): PepperPopState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.items.find(c => c.id === action.id);
    if (!target) return state;
    return { ...state, items: state.items.filter(c => c.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.items.map(c => ({ ...c, ticksLeft: c.ticksLeft - 1 }));
    const surviving = aged.filter(c => c.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newOnes: PepperPopItem[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newOnes.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, items: [...surviving, ...newOnes], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}

export function isTerminal(state: PepperPopState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
