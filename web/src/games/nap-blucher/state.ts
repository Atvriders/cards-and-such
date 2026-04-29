import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 10;

export interface PubSettings { dummy: boolean; }
export interface PubState {
  rngSeed: number;
  turn: number;
  myScore: number;
  cpuScore: number;
  lastMine: number;
  lastCpu: number;
  phase: "ready" | "thrown" | "done";
}
export type PubAction = { type: "throw" } | { type: "next" };

export function initialState(seed: number, _s: PubSettings): PubState {
  return { rngSeed: seed, turn: 1, myScore: 0, cpuScore: 0, lastMine: 0, lastCpu: 0, phase: "ready" };
}

export function reducer(state: PubState, action: PubAction): PubState {
  if (state.phase === "done") return state;
  if (action.type === "throw" && state.phase === "ready") {
    const rng = mulberry32(state.rngSeed);
    const a = rng();
    const b = rng();
    const next = Math.floor(rng() * 2 ** 31);
    let mine = 0, cpu = 0;
    if (a < 0.10) mine = 15; else if (a < 0.30) mine = 10; else if (a < 0.55) mine = 6; else if (a < 0.80) mine = 3; else mine = 0;
    if (b < 0.10) cpu = 15; else if (b < 0.30) cpu = 10; else if (b < 0.55) cpu = 6; else if (b < 0.80) cpu = 3; else cpu = 0;
    const isLast = state.turn >= TOTAL_TURNS;
    return { ...state, rngSeed: next, myScore: state.myScore + mine, cpuScore: state.cpuScore + cpu, lastMine: mine, lastCpu: cpu, phase: isLast ? "done" : "thrown" };
  }
  if (action.type === "next" && state.phase === "thrown") {
    return { ...state, turn: state.turn + 1, lastMine: 0, lastCpu: 0, phase: "ready" };
  }
  return state;
}

export function isTerminal(s: PubState): { score: number } | null {
  if (s.phase !== "done") return null;
  let bonus = 0;
  if (s.myScore > s.cpuScore) bonus = 100;
  else if (s.myScore === s.cpuScore) bonus = 25;
  return { score: s.myScore + bonus };
}
