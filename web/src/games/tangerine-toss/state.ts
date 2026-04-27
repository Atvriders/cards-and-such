import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Tangerine Toss: 30-second clicker. Click tangerines to "toss" them into the bin.

export const TIMER_TICKS = 30;
export const LANES = 6;

export interface TangerineTossSettings { dummy: boolean; }

export interface Tangerine {
  id: number;
  lane: number;
  ticksLeft: number;
}

export interface TangerineTossState {
  rngSeed: number;
  tangerines: Tangerine[];
  nextId: number;
  ticksRemaining: number;
  score: number;
  popped: number;
  missed: number;
  phase: "playing" | "done";
}

export type TangerineTossAction =
  | { type: "tick" }
  | { type: "pop"; id: number };

export function initialState(seed: number, _settings: TangerineTossSettings): TangerineTossState {
  return { rngSeed: seed, tangerines: [], nextId: 1, ticksRemaining: TIMER_TICKS, score: 0, popped: 0, missed: 0, phase: "playing" };
}

export function reducer(state: TangerineTossState, action: TangerineTossAction): TangerineTossState {
  if (state.phase === "done") return state;
  if (action.type === "pop") {
    const target = state.tangerines.find(p => p.id === action.id);
    if (!target) return state;
    return { ...state, tangerines: state.tangerines.filter(p => p.id !== action.id), score: state.score + 10, popped: state.popped + 1 };
  }
  if (action.type === "tick") {
    const rng = mulberry32(state.rngSeed);
    const seed2 = Math.floor(rng() * 2 ** 31);
    const aged = state.tangerines.map(p => ({ ...p, ticksLeft: p.ticksLeft - 1 }));
    const surviving = aged.filter(p => p.ticksLeft > 0);
    const expired = aged.length - surviving.length;
    const spawnCount = 1 + Math.floor(rng() * 2);
    let nextId = state.nextId;
    const newTangerines: Tangerine[] = [];
    for (let i = 0; i < spawnCount; i++) {
      newTangerines.push({ id: nextId++, lane: Math.floor(rng() * LANES), ticksLeft: 3 + Math.floor(rng() * 3) });
    }
    const ticksRemaining = state.ticksRemaining - 1;
    const phase = ticksRemaining <= 0 ? "done" : "playing";
    return { ...state, rngSeed: seed2, tangerines: [...surviving, ...newTangerines], nextId, ticksRemaining, missed: state.missed + expired, phase };
  }
  return state;
}

export function isTerminal(state: TangerineTossState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
