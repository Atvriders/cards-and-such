import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Mole Pop: Moles pop up one at a time in random holes. Click the active mole before it disappears.

export interface MolePopSettings { moles: "10" | "20"; }

export interface MolePopState {
  activeMole: number;   // 0-5 (hole index), -1 = none
  visibleFor: number;   // ticks mole remains visible
  ticksRemaining: number;
  hits: number;
  misses: number;
  round: number;
  maxRounds: number;
  score: number;
  phase: "waiting" | "active" | "gameover";
  rngSeed: number;
}

export type MolePopAction = { type: "whack"; hole: number } | { type: "tick" };

export function initialState(seed: number, settings: MolePopSettings): MolePopState {
  const rng = mulberry32(seed);
  const activeMole = Math.floor(rng() * 6);
  const visible = 8 + Math.floor(rng() * 8);
  return { activeMole, visibleFor: visible, ticksRemaining: visible, hits: 0, misses: 0, round: 1, maxRounds: parseInt(settings.moles, 10), score: 0, phase: "active", rngSeed: Math.floor(rng() * 2 ** 31) };
}

export function reducer(state: MolePopState, action: MolePopAction): MolePopState {
  if (state.phase === "gameover") return state;
  if (action.type === "whack") {
    if (state.phase !== "active" || action.hole !== state.activeMole) {
      return { ...state, misses: state.misses + 1 };
    }
    const pts = 10 + Math.floor(state.ticksRemaining * 3);
    const newRound = state.round + 1;
    if (newRound > state.maxRounds) {
      return { ...state, hits: state.hits + 1, score: state.score + pts, round: newRound, phase: "gameover" };
    }
    const rng = mulberry32(state.rngSeed);
    const activeMole = Math.floor(rng() * 6);
    const visible = 6 + Math.floor(rng() * 10);
    return { ...state, hits: state.hits + 1, score: state.score + pts, round: newRound, activeMole, visibleFor: visible, ticksRemaining: visible, phase: "active", rngSeed: Math.floor(rng() * 2 ** 31) };
  }
  if (action.type === "tick") {
    if (state.phase !== "active") return state;
    const remaining = state.ticksRemaining - 1;
    if (remaining <= 0) {
      const newRound = state.round + 1;
      if (newRound > state.maxRounds) return { ...state, phase: "gameover", misses: state.misses + 1 };
      const rng = mulberry32(state.rngSeed);
      const activeMole = Math.floor(rng() * 6);
      const visible = 6 + Math.floor(rng() * 10);
      return { ...state, round: newRound, misses: state.misses + 1, activeMole, visibleFor: visible, ticksRemaining: visible, phase: "active", rngSeed: Math.floor(rng() * 2 ** 31) };
    }
    return { ...state, ticksRemaining: remaining };
  }
  return state;
}

export function isTerminal(state: MolePopState): { score: number } | null {
  return state.phase === "gameover" ? { score: state.score } : null;
}
