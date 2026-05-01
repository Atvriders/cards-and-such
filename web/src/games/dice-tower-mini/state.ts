import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const FLOORS = 10;

export interface DiceTowerMiniSettings { dummy: boolean; }

export interface DiceTowerMiniState {
  rngSeed: number;
  floor: number;
  rolls: [number, number] | null;
  attempts: number;
  score: number;
  phase: "roll" | "result" | "done";
  log: string;
  lastSuccess: boolean;
}

export type DiceTowerMiniAction = { type: "climb" } | { type: "next" };

export function targetFor(floor: number): number {
  return Math.min(11, 3 + floor);
}

export function initialState(seed: number, _settings: DiceTowerMiniSettings): DiceTowerMiniState {
  return { rngSeed: seed, floor: 1, rolls: null, attempts: 0, score: 0, phase: "roll", log: "", lastSuccess: false };
}

export function reducer(state: DiceTowerMiniState, action: DiceTowerMiniAction): DiceTowerMiniState {
  if (state.phase === "done") return state;
  if (action.type === "climb" && state.phase === "roll") {
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng() * 6);
    const r2 = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const sum = r1 + r2;
    const target = targetFor(state.floor);
    const success = sum >= target;
    const attempts = state.attempts + 1;
    let log = "";
    let pts = 0;
    if (success) {
      pts = state.floor * 5 + (sum === 12 ? 8 : 0);
      log = `Floor ${state.floor} clear (${sum} >= ${target})! +${pts}`;
    } else {
      log = `Slipped on floor ${state.floor} (${sum} < ${target}). Attempt ${attempts}/3.`;
    }
    let phase: DiceTowerMiniState["phase"] = "result";
    if (success && state.floor >= FLOORS) {
      phase = "done";
      pts += 60;
      log += ` PINNACLE! +60.`;
    } else if (!success && attempts >= 3) {
      phase = "done";
      log += ` Fell from the tower.`;
    }
    return { ...state, rngSeed: nextSeed, rolls: [r1, r2], attempts, score: state.score + pts, phase, log, lastSuccess: success };
  }
  if (action.type === "next" && state.phase === "result") {
    const next = state.lastSuccess ? state.floor + 1 : state.floor;
    const attempts = state.lastSuccess ? 0 : state.attempts;
    return { ...state, floor: next, attempts, phase: "roll", rolls: null, log: "", lastSuccess: false };
  }
  return state;
}

export function isTerminal(state: DiceTowerMiniState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
