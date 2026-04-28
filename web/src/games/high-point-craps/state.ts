import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 10;
export const DICE_COUNT = 2;

export interface HighPointCrapsSettings { dummy: boolean; }

export interface HighPointCrapsState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type HighPointCrapsAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: HighPointCrapsSettings): HighPointCrapsState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: HighPointCrapsState, action: HighPointCrapsAction): HighPointCrapsState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const d0 = d[0] ?? 0; const d1 = d[1] ?? 0; const sum = d0 + d1;
    const map: Record<number, number> = {12:50,11:40,10:30,9:25,8:20,7:15,6:10,5:8,4:5,3:3,2:1};
    const pts = map[sum] ?? 0;
    const msg = "Sum " + sum + " +" + pts;
    const isLast = state.round >= TOTAL_ROUNDS;
    return { ...state, rngSeed: seed2, dice: d, score: state.score + pts, lastPts: pts, phase: isLast ? "done" : "result", message: msg };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    return { ...state, round: state.round + 1, dice: [], lastPts: 0, phase: "roll", message: "" };
  }
  return state;
}

export function isTerminal(state: HighPointCrapsState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
