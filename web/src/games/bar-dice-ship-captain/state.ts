import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_TURNS = 10;
export const MAX_THROW = 20;

export interface ShipCaptainCrewSettings { dummy: boolean; }
export interface ShipCaptainCrewState {
  rngSeed: number;
  turn: number;
  score: number;
  lastPts: number;
  lastRoll: number;
  phase: "ready" | "thrown" | "done";
}
export type ShipCaptainCrewAction = { type: "throw" } | { type: "next" };

export function initialState(seed: number, _s: ShipCaptainCrewSettings): ShipCaptainCrewState {
  return { rngSeed: seed, turn: 1, score: 0, lastPts: 0, lastRoll: 0, phase: "ready" };
}

export function reducer(state: ShipCaptainCrewState, action: ShipCaptainCrewAction): ShipCaptainCrewState {
  if (state.phase === "done") return state;
  if (action.type === "throw" && state.phase === "ready") {
    const rng = mulberry32(state.rngSeed);
    const a = rng(), b = rng(), c = rng();
    const next = Math.floor(rng() * 2 ** 31);
    const aim = (a + b + c) / 3;
    let pts = 0;
    if (aim < 0.05) pts = MAX_THROW;
    else if (aim < 0.2) pts = Math.floor(MAX_THROW * 0.7);
    else if (aim < 0.5) pts = Math.floor(MAX_THROW * 0.4);
    else if (aim < 0.8) pts = Math.floor(MAX_THROW * 0.2);
    else pts = 0;
    const isLast = state.turn >= TOTAL_TURNS;
    return { ...state, rngSeed: next, score: state.score + pts, lastPts: pts, lastRoll: Math.floor(aim * 100), phase: isLast ? "done" : "thrown" };
  }
  if (action.type === "next" && state.phase === "thrown") {
    return { ...state, turn: state.turn + 1, lastPts: 0, lastRoll: 0, phase: "ready" };
  }
  return state;
}

export function isTerminal(s: ShipCaptainCrewState): { score: number } | null { return s.phase === "done" ? { score: s.score } : null; }
