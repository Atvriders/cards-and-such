import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 8;
export const RINGS = [3, 4, 5, 6] as const;

export interface DiceBullseyeSettings { dummy: boolean; }

export interface DiceBullseyeState {
  rngSeed: number;
  round: number;
  rolls: [number, number] | null;
  target: number;
  score: number;
  phase: "aim" | "result" | "done";
  log: string;
  lastDist: number;
}

export type DiceBullseyeAction = { type: "shoot"; target: number } | { type: "next" };

export function initialState(seed: number, _settings: DiceBullseyeSettings): DiceBullseyeState {
  return { rngSeed: seed, round: 1, rolls: null, target: 0, score: 0, phase: "aim", log: "", lastDist: 0 };
}

export function reducer(state: DiceBullseyeState, action: DiceBullseyeAction): DiceBullseyeState {
  if (state.phase === "done") return state;
  if (action.type === "shoot" && state.phase === "aim") {
    const rng = mulberry32(state.rngSeed);
    const r1 = 1 + Math.floor(rng()*6);
    const r2 = 1 + Math.floor(rng()*6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const result = (r1 + r2) / 2; // average
    const dist = Math.abs(result - action.target);
    let pts = 0;
    if (dist < 0.5) pts = 30;
    else if (dist < 1.5) pts = 18;
    else if (dist < 2.5) pts = 8;
    else pts = 2;
    if (r1 === r2) pts += 4;
    return { ...state, rngSeed: nextSeed, rolls: [r1, r2], target: action.target, score: state.score + pts, phase: "result", log: `Shot ${r1}+${r2} (avg ${result.toFixed(1)}) vs target ${action.target}. +${pts}`, lastDist: dist };
  }
  if (action.type === "next" && state.phase === "result") {
    if (state.round >= TOTAL_ROUNDS) return { ...state, phase: "done" };
    return { ...state, round: state.round + 1, rolls: null, phase: "aim", log: "" };
  }
  return state;
}

export function isTerminal(state: DiceBullseyeState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
