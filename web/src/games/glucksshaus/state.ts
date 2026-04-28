import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_ROUNDS = 12;
export const DICE_COUNT = 2;

export interface GlucksshausSettings { dummy: boolean; }

export interface GlucksshausState {
  rngSeed: number;
  round: number;
  dice: number[];
  score: number;
  lastPts: number;
  phase: "roll" | "result" | "done";
  message: string;
}

export type GlucksshausAction = { type: "roll" } | { type: "next" };

export function initialState(seed: number, _settings: GlucksshausSettings): GlucksshausState {
  return { rngSeed: seed, round: 1, dice: [], score: 0, lastPts: 0, phase: "roll", message: "" };
}

export function reducer(state: GlucksshausState, action: GlucksshausAction): GlucksshausState {
  if (state.phase === "done") return state;
  if (action.type === "roll") {
    if (state.phase !== "roll") return state;
    const rng = mulberry32(state.rngSeed);
    const d: number[] = [];
    for (let i = 0; i < DICE_COUNT; i++) d.push(1 + Math.floor(rng() * 6));
    const seed2 = Math.floor(rng() * 2 ** 31);
    const d0 = d[0] ?? 0; const d1 = d[1] ?? 0; const sum = d0 + d1;
    const map: Record<number, number> = {2:25,12:25,3:20,11:20,4:15,10:15,5:10,9:10,6:5,8:5,7:0};
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

export function isTerminal(state: GlucksshausState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
