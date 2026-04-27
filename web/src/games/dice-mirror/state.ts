import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;

export interface DiceMirrorSettings { dummy: boolean; }

export interface DiceMirrorState {
  rngSeed: number;
  round: number;
  dice: [number, number] | null;
  score: number;
  phase: "rolling" | "result" | "done";
  lastPts: number;
}

export type DiceMirrorAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: DiceMirrorSettings): DiceMirrorState {
  return { rngSeed: seed, round: 1, dice: null, score: 0, phase: "rolling", lastPts: 0 };
}

export function reducer(state: DiceMirrorState, action: DiceMirrorAction): DiceMirrorState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "rolling") return state;
    const rng = mulberry32(state.rngSeed);
    const a = 1 + Math.floor(rng() * 6);
    const b = 1 + Math.floor(rng() * 6);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = a === b ? a * 10 : 0;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: nextSeed, dice: [a, b], score: state.score + pts, phase: isLast ? "done" : "result", lastPts: pts };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: null, phase: "rolling", lastPts: 0 };
  }
  return state;
}

export function isTerminal(state: DiceMirrorState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
