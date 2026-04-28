import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const START_STICKS = 21;

export interface NimGameSettings { dummy: boolean; }

export interface NimGameState {
  rngSeed: number;
  sticks: number;
  turn: "P" | "C";
  result: "P" | "C" | null;
  score: number;
  phase: "playing" | "done";
}

export type NimGameAction = { type: "take"; n: number };

export function initialState(seed: number, _settings: NimGameSettings): NimGameState {
  return { rngSeed: seed, sticks: START_STICKS, turn: "P", result: null, score: 0, phase: "playing" };
}

export function reducer(state: NimGameState, action: NimGameAction): NimGameState {
  if (state.phase === "done") return state;
  if (action.type !== "take") return state;
  if (state.turn !== "P") return state;
  const n = Math.max(1, Math.min(3, action.n));
  if (n > state.sticks) return state;
  const after = state.sticks - n;
  if (after === 0) {
    // Player took the last stick -> player loses
    return { ...state, sticks: 0, result: "C", phase: "done", score: 0 };
  }
  // CPU's turn — random 1..3 (capped)
  const rng = mulberry32(state.rngSeed);
  const cpuTake = 1 + Math.floor(rng() * Math.min(3, after));
  const seed2 = Math.floor(rng() * 2 ** 31);
  const after2 = after - cpuTake;
  if (after2 === 0) {
    // CPU took the last stick -> player wins
    return { ...state, rngSeed: seed2, sticks: 0, result: "P", phase: "done", score: 100 };
  }
  return { ...state, rngSeed: seed2, sticks: after2, turn: "P" };
}

export function isTerminal(state: NimGameState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
